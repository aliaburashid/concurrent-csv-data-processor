import Papa from 'papaparse';
import { isValidDate } from './salary';
import { ROLES, type Employee, type Role } from './types';

const MAX_ROWS = 50000;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

function parse(text: string, columns: string[], label: string): Record<string, string>[] {
  if (new Blob([text]).size > MAX_FILE_BYTES)
    throw new Error(`${label}: file exceeds the 10 MB limit.`);
  const result = Papa.parse<Record<string, string>>(text.replace(/^\uFEFF/, ''), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });
  if (result.errors.length)
    throw new Error(
      `${label}: ${result.errors[0].message}${result.errors[0].row !== undefined ? ` (data row ${result.errors[0].row + 1})` : ''}.`,
    );
  if (columns.some((c) => !result.meta.fields?.includes(c)))
    throw new Error(`${label}: required columns are ${columns.join(', ')}.`);
  if (!result.data.length) throw new Error(`${label}: no employee records found.`);
  if (result.data.length > MAX_ROWS)
    throw new Error(`${label}: maximum ${MAX_ROWS.toLocaleString()} records supported.`);
  return result.data;
}

function number(value: string, label: string): number {
  if (!value || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value))
    throw new Error(
      `${label}: enter a valid number without currency symbols or grouping separators.`,
    );
  const n = Number(value);
  if (!Number.isFinite(n) || Math.abs(n) > 1e12)
    throw new Error(`${label}: number must be finite and at most 1 trillion.`);
  return n;
}

function idOf(value: string, label: string) {
  const id = number(value, label);
  if (!Number.isInteger(id) || id < -2147483648 || id > 2147483647)
    throw new Error(`${label}: ID must be a Java-compatible integer.`);
  return id;
}

function nonnegative(value: string, label: string) {
  const n = number(value, label);
  if (n < 0) throw new Error(`${label}: salary cannot be negative.`);
  return n;
}

export function parseEmployeePair(originalText: string, updatedText: string): Employee[] {
  const original = parse(
    originalText,
    ['id', 'name', 'salary', 'joinedDate', 'role', 'projectCompletion'],
    'Original CSV',
  );
  const updated = parse(
    updatedText,
    ['id', 'name', 'originalSalary', 'updatedSalary'],
    'Updated CSV',
  );
  const outputs = new Map<number, { name: string; salary: number; updatedSalary: number }>();
  for (const [index, row] of updated.entries()) {
    const label = `Updated CSV, row ${index + 2}`;
    const id = idOf(row.id, label);
    if (outputs.has(id)) throw new Error(`${label}: duplicate employee ID ${id}.`);
    outputs.set(id, {
      name: row.name,
      salary: nonnegative(row.originalSalary, label),
      updatedSalary: nonnegative(row.updatedSalary, label),
    });
  }
  const seen = new Set<number>();
  const employees = original.map((row, index): Employee => {
    const label = `Original CSV, row ${index + 2}`;
    const id = idOf(row.id, label);
    if (seen.has(id)) throw new Error(`${label}: duplicate employee ID ${id}.`);
    seen.add(id);
    if (!row.name) throw new Error(`${label}: employee name is required.`);
    const salary = nonnegative(row.salary, label);
    if (!isValidDate(row.joinedDate))
      throw new Error(`${label}: joinedDate must be a real date in YYYY-MM-DD format.`);
    const role = ROLES.find((r) => r.toLowerCase() === row.role.toLowerCase()) as Role | undefined;
    if (!role) throw new Error(`${label}: role must be Director, Manager, or Employee.`);
    const projectCompletion = number(row.projectCompletion, label);
    if (projectCompletion < 0 || projectCompletion > 1)
      throw new Error(
        `${label}: projectCompletion must be a fraction between 0 and 1 (0.8 means 80%).`,
      );
    const output = outputs.get(id);
    if (!output)
      throw new Error(
        `Updated CSV: missing employee ID ${id}. Select matching files from the same processing run.`,
      );
    if (
      output.name !== row.name ||
      Math.abs(output.salary - salary) > Math.max(1e-8, salary * 1e-12)
    )
      throw new Error(
        `Employee ${id}: name or original salary differs between files. Select a matching CSV pair.`,
      );
    if (salary === 0 && output.updatedSalary !== 0)
      throw new Error(
        `Employee ${id}: a nonzero updated salary cannot be compared against a zero original salary.`,
      );
    const increase = output.updatedSalary - salary;
    return {
      id,
      name: row.name,
      salary,
      joinedDate: row.joinedDate,
      role,
      projectCompletion,
      updatedSalary: output.updatedSalary,
      increase,
      increasePercent: salary ? (increase / salary) * 100 : 0,
      eligible: projectCompletion >= 0.6,
    };
  });
  if (outputs.size !== employees.length)
    throw new Error('Updated CSV contains employee IDs that are absent from the original CSV.');
  return employees.sort((a, b) => a.id - b.id);
}

export function resultsCSV(employees: Employee[]): string {
  // Spreadsheet formula protection for text cells. Numeric values retain full precision.
  const safeText = (value: string) => (/^[=+\-@\t\r]/.test(value) ? `'${value}` : value);
  return Papa.unparse(
    {
      fields: ['id', 'name', 'originalSalary', 'updatedSalary'],
      data: employees.map((e) => [e.id, safeText(e.name), e.salary, e.updatedSalary]),
    },
    { newline: '\r\n' },
  );
}

export function downloadResults(employees: Employee[]) {
  const url = URL.createObjectURL(
    new Blob(['\uFEFF' + resultsCSV(employees)], { type: 'text/csv;charset=utf-8;' }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'compensation-results.csv';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
