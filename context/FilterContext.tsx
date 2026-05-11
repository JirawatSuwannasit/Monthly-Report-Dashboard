'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { CostSavingRow, UtilizationRow } from '@/lib/types';
import { uniqueValues } from '@/lib/dataUtils';

interface FilterContextValue {
  fy1: string;
  fy2: string;
  month: string;
  setFY1: (v: string) => void;
  setFY2: (v: string) => void;
  setMonth: (v: string) => void;
  fyOptions: string[];
  monthOptions: string[];
  printMode: boolean;
  setPrintMode: (v: boolean) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

interface FilterProviderProps {
  children: React.ReactNode;
  costRows: CostSavingRow[];
  utilRows: UtilizationRow[];
  allFYs: string[];
}

export function FilterProvider({ children, costRows, utilRows, allFYs }: FilterProviderProps) {
  const [fy1, setFY1] = useState<string>(() => allFYs[allFYs.length - 2] || allFYs[0] || '');
  const [fy2, setFY2] = useState<string>(() => allFYs[allFYs.length - 1] || '');
  const [month, setMonth] = useState<string>('');
  const [printMode, setPrintMode] = useState<boolean>(false);

  const fyOptions = useMemo(() => allFYs, [allFYs]);

  const monthOptions = useMemo(() => {
    const base = ['APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'];
    const available = new Set([
      ...uniqueValues(costRows, 'MONTH'),
      ...uniqueValues(utilRows, 'MONTH'),
    ]);
    return base.filter((m) => available.has(m));
  }, [costRows, utilRows]);

  return (
    <FilterContext.Provider
      value={{ fy1, fy2, month, setFY1, setFY2, setMonth, fyOptions, monthOptions, printMode, setPrintMode }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
