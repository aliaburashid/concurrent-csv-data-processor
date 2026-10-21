export type Role = 'Director' | 'Manager' | 'Employee';
export const ROLES: Role[] = ['Director', 'Manager', 'Employee'];
export type Page = 'overview' | 'employees' | 'analysis' | 'simulator' | 'workflow' | 'about';
export type Currency = 'neutral' | 'USD' | 'BHD' | 'EUR' | 'GBP';

export interface Employee {
  id: number;
  name: string;
  salary: number;
  joinedDate: string;
  role: Role;
  projectCompletion: number;
  updatedSalary: number;
  increase: number;
  increasePercent: number;
  eligible: boolean;
}

export interface Dataset {
  employees: Employee[];
  source: 'snapshot' | 'import';
  originalFile: string;
  updatedFile: string;
  loadedAt: string;
}
