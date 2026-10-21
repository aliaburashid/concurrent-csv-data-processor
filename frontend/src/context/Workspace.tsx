import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Currency, Dataset } from '../lib/types';

interface WorkspaceState {
  dataset: Dataset | null;
  loading: boolean;
  error: string;
  currency: Currency;
  setCurrency: (value: Currency) => void;
  setDataset: (value: Dataset | null) => void;
  restoreSnapshot: () => Promise<void>;
  money: (value: number, compact?: boolean) => string;
}
const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [currency, setCurrency] = useState<Currency>('neutral');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const restoreSnapshot = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { loadSnapshot } = await import('../data/snapshot');
      setDataset(loadSnapshot());
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'The snapshot could not be loaded. Import a CSV pair to continue.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void restoreSnapshot();
  }, [restoreSnapshot]);
  const money = useCallback(
    (value: number, compact = false) =>
      new Intl.NumberFormat('en-US', {
        ...(currency === 'neutral'
          ? { minimumFractionDigits: compact ? 0 : 2, maximumFractionDigits: compact ? 1 : 2 }
          : {
              style: 'currency',
              currency,
              maximumFractionDigits: compact ? 1 : currency === 'BHD' ? 3 : 2,
            }),
        ...(compact ? { notation: 'compact' } : {}),
      }).format(value),
    [currency],
  );
  const value = useMemo(
    () => ({ dataset, loading, error, currency, setCurrency, setDataset, restoreSnapshot, money }),
    [dataset, loading, error, currency, restoreSnapshot, money],
  );
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('WorkspaceProvider is required.');
  return context;
}
