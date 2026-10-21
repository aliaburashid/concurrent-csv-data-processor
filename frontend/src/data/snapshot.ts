import original from './employees.csv?raw';
import updated from './updated_employees.csv?raw';
import { parseEmployeePair } from '../lib/csv';
import type { Dataset } from '../lib/types';

export function loadSnapshot(): Dataset {
  return {
    employees: parseEmployeePair(original, updated),
    source: 'snapshot',
    originalFile: 'employees.csv',
    updatedFile: 'updated_employees.csv',
    loadedAt: new Date().toISOString(),
  };
}
