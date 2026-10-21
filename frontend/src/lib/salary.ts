import type { Employee, Role } from './types';

export const ROLE_RATES: Record<Role, number> = { Director: 0.05, Manager: 0.02, Employee: 0.01 };

export function localISODate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && localISODate(date) === value;
}

// Mirrors Period.between(joinedDate, asOf).getYears() for valid non-future dates.
export function completedYears(joinedDate: string, asOf = localISODate()): number {
  if (!isValidDate(joinedDate) || !isValidDate(asOf))
    throw new Error('Enter a valid calendar date.');
  if (joinedDate > asOf) throw new Error('Joining date cannot be after the calculation date.');
  const [year, month, day] = joinedDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = asOf.split('-').map(Number);
  return endYear - year - (endMonth < month || (endMonth === month && endDay < day) ? 1 : 0);
}

export function simulateSalary(
  salary: number,
  role: Role,
  joinedDate: string,
  completion: number,
  asOf = localISODate(),
) {
  if (!Number.isFinite(salary) || salary < 0 || salary > 1e12)
    throw new Error('Enter a salary between 0 and 1,000,000,000,000.');
  if (!Number.isFinite(completion) || completion < 0 || completion > 1)
    throw new Error('Project completion must be between 0% and 100%.');
  if (!(role in ROLE_RATES)) throw new Error('Choose a supported role.');
  const years = completedYears(joinedDate, asOf);
  const eligible = completion >= 0.6;
  const roleRate = ROLE_RATES[role];
  const serviceRate = years * 0.02;
  const multiplier = completion > 0.8 ? 1.5 : 1;
  const finalRate = eligible ? (roleRate + serviceRate) * multiplier : 0;
  // Match Java double arithmetic; round only for presentation.
  const increase = salary * finalRate;
  return {
    eligible,
    years,
    roleRate,
    serviceRate,
    multiplier,
    finalRate,
    increase,
    updatedSalary: salary + increase,
  };
}

export function summarize(employees: Employee[]) {
  const original = employees.reduce((sum, e) => sum + e.salary, 0);
  const updated = employees.reduce((sum, e) => sum + e.updatedSalary, 0);
  const raised = employees.filter((e) => e.increase > 0).length;
  const eligible = employees.filter((e) => e.eligible).length;
  return {
    count: employees.length,
    original,
    updated,
    increase: updated - original,
    raised,
    unchanged: employees.filter((e) => e.increase === 0).length,
    decreased: employees.filter((e) => e.increase < 0).length,
    eligible,
    ineligible: employees.length - eligible,
    average: employees.length
      ? employees.reduce((sum, e) => sum + e.increasePercent, 0) / employees.length
      : 0,
    payrollPercent: original ? ((updated - original) / original) * 100 : 0,
  };
}

export function roleSummary(employees: Employee[]) {
  return (['Director', 'Manager', 'Employee'] as Role[]).map((role) => {
    const records = employees.filter((e) => e.role === role);
    return { role, ...summarize(records) };
  });
}
