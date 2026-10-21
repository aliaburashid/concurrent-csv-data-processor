import { describe, expect, it } from 'vitest';
import { parseEmployeePair, resultsCSV } from './csv';
import { loadSnapshot } from '../data/snapshot';

const header = 'id,name,salary,joinedDate,role,projectCompletion\n';
const outputHeader = 'id,name,originalSalary,updatedSalary\n';
const original = header + '1,Alice,50000,2023-10-20,Manager,0.8';
const updated = outputHeader + '1,Alice,50000,54000';

describe('paired CSV import', () => {
  it('parses a BOM, CRLF, quoted comma, and case-insensitive role', () => {
    const pair = parseEmployeePair(
      '\uFEFF' + header.replace('\n', '\r\n') + '1,"Alice, A",50000,2023-10-20,manager,0.8\r\n',
      outputHeader + '1,"Alice, A",50000,54000',
    );
    expect(pair[0]).toMatchObject({
      name: 'Alice, A',
      role: 'Manager',
      increase: 4000,
      increasePercent: 8,
      eligible: true,
    });
  });
  it.each([
    [original.replace('salary,', 'wages,'), updated, 'required columns'],
    [header, updated, 'no employee'],
    [original + '\n1,Alice,50000,2023-10-20,Manager,0.8', updated, 'duplicate'],
    [original, updated + '\n1,Alice,50000,54000', 'duplicate'],
    [original, updated.replace('1,Alice', '2,Alice'), 'missing employee'],
    [original, updated.replace('Alice', 'Bob'), 'differs'],
    [original, updated.replace('50000', '40000'), 'differs'],
    [original.replace('0.8', '80'), updated, 'fraction'],
    [original.replace('2023-10-20', '2023-02-29'), updated, 'real date'],
    [original.replace('Manager', 'Doctor'), updated, 'role must'],
    [original.replace('50000', '-50000'), updated, 'negative'],
    [original.replace('50000', 'NaN'), updated, 'valid number'],
    [original, updated + '\n2,Bob,50000,54000', 'absent'],
    [original.replace('1,Alice', '1.5,Alice'), updated, 'integer'],
    [original + ',extra', updated, 'Too many fields'],
  ])('rejects invalid pair %# without returning partial data', (a, b, error) => {
    expect(() => parseEmployeePair(a, b)).toThrow(error);
  });
  it('handles zero salaries and preserves saved decreases', () => {
    expect(
      parseEmployeePair(original.replace('50000', '0'), updated.replace('50000,54000', '0,0'))[0]
        .increasePercent,
    ).toBe(0);
    expect(parseEmployeePair(original, updated.replace('54000', '45000'))[0].increase).toBe(-5000);
  });
  it('rejects an undefined change from zero salary', () => {
    expect(() =>
      parseEmployeePair(original.replace('50000', '0'), updated.replace('50000', '0')),
    ).toThrow('zero original');
  });
  it('preserves output values at full precision on CSV export', () => {
    const result = resultsCSV(loadSnapshot().employees);
    expect(result.split('\r\n')).toHaveLength(31);
    expect(result).toContain('1,Alice,52000,59800');
    expect(result.startsWith('id,name,originalSalary,updatedSalary')).toBe(true);
  });
  it('protects text cells from spreadsheet formula execution', () => {
    expect(resultsCSV([{ ...loadSnapshot().employees[0], name: '=SUM(1+1)' }])).toContain(
      "'=SUM(1+1)",
    );
  });
});
