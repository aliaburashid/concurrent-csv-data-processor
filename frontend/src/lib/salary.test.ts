import { describe, expect, it } from 'vitest';
import { completedYears, simulateSalary, summarize } from './salary';
import { loadSnapshot } from '../data/snapshot';

describe('Java salary rule parity for valid simulator inputs', () => {
  it.each([
    [0.5999, 50000, 0],
    [0.6, 54000, 0.08],
    [0.8, 54000, 0.08],
    [0.8001, 56000, 0.12],
  ])('completion %s produces salary %s', (completion, salary, rate) => {
    const result = simulateSalary(50000, 'Manager', '2023-10-20', completion, '2026-10-20');
    expect(result.updatedSalary).toBeCloseTo(salary, 8);
    expect(result.finalRate).toBeCloseTo(rate, 10);
  });
  it.each([
    ['Director', 0.05],
    ['Manager', 0.02],
    ['Employee', 0.01],
  ] as const)('applies the %s role rate', (role, rate) => {
    expect(simulateSalary(10000, role, '2026-10-20', 0.8, '2026-10-20').finalRate).toBe(rate);
  });
  it.each([
    ['2023-10-21', '2026-10-20', 2],
    ['2023-10-20', '2026-10-20', 3],
    ['2023-10-19', '2026-10-20', 3],
    ['2020-02-29', '2021-02-28', 0],
    ['2020-02-29', '2021-03-01', 1],
    ['2026-10-20', '2026-10-20', 0],
  ])('completed years from %s to %s = %s', (start, end, years) => {
    expect(completedYears(start, end)).toBe(years);
  });
  it('rejects future joining dates and impossible dates', () => {
    expect(() => completedYears('2026-10-21', '2026-10-20')).toThrow('after');
    expect(() => completedYears('2023-02-29', '2026-10-20')).toThrow('valid');
  });
  it('rejects invalid salary and completion values', () => {
    expect(() => simulateSalary(-1, 'Employee', '2023-01-01', 0.8)).toThrow('salary');
    expect(() => simulateSalary(NaN, 'Employee', '2023-01-01', 0.8)).toThrow('salary');
    expect(() => simulateSalary(1, 'Employee', '2023-01-01', 80)).toThrow('completion');
  });
  it('handles zero salary without inventing a percentage change in records', () => {
    expect(simulateSalary(0, 'Director', '2023-01-01', 1, '2026-10-20').updatedSalary).toBe(0);
  });
});

describe('actual repository CSV financial reconciliation', () => {
  const employees = loadSnapshot().employees;
  it('reconciles all saved totals independently verified from the repository CSV', () => {
    expect(summarize(employees)).toMatchObject({
      count: 30,
      original: 2035000,
      updated: 2271430,
      increase: 236430,
      raised: 21,
      unchanged: 9,
      eligible: 21,
      ineligible: 9,
      average: 11,
    });
    expect(summarize(employees).payrollPercent).toBeCloseTo(11.618181818, 8);
  });
  it('reproduces every saved result for the reference date 2026-10-20', () => {
    for (const e of employees)
      expect(
        simulateSalary(e.salary, e.role, e.joinedDate, e.projectCompletion, '2026-10-20')
          .updatedSalary,
      ).toBeCloseTo(e.updatedSalary, 6);
  });
  it('returns finite zero totals for an empty dataset', () => {
    const result = summarize([]);
    expect(result.average).toBe(0);
    expect(result.payrollPercent).toBe(0);
  });
});
