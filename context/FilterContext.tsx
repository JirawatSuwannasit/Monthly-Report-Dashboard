'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { CostSavingRow, UtilizationRow } from '@/lib/types';
import { uniqueValues } from '@/lib/dataUtils';

interface FilterState {
  fy: string;
  month: string;
  selectedMCs: string[];
  selectedMachines: string[];
  compareFY1: string;
  compareFY2: string;
}

interface FilterContextValue extends FilterState {
  setFY: (v: string) => void;
  setMonth: (v: string) => void;
  setSelectedMCs: (v: string[]) => void;
  setSelectedMachines: (v: string[]) => void;
  setCompareFY1: (v: string) => void;
  setCompareFY2: (v: string) => void;
  fyOptions: string[];
  monthOptions: string[];
  mcOptions: string[];
  machineOptions: string[];
}

const FilterContext = createContext<FilterContextValue | null>(null);

interface FilterProviderProps {
  children: React.ReactNode;
  costRows: CostSavingRow[];
  utilRows: UtilizationRow[];
  allFYs: string[];
}

export function FilterProvider({ children, costRows, utilRows, allFYs }: FilterProviderProps) {
  const [fy, setFY] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [selectedMCs, setSelectedMCs] = useState<string[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [compareFY1, setCompareFY1] = useState<string>('');
  const [compareFY2, setCompareFY2] = useState<string>('');

  const fyOptions = useMemo(() => allFYs, [allFYs]);

  const monthOptions = useMemo(() => {
    const base = ['APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC','JAN','FEB','MAR'];
    const available = new Set([
      ...uniqueValues(costRows, 'MONTH'),
      ...uniqueValues(utilRows, 'MONTH'),
    ]);
    return base.filter((m) => available.has(m));
  }, [costRows, utilRows]);

  const mcOptions = useMemo(
    () => uniqueValues(costRows, 'MC'),
    [costRows]
  );

  const machineOptions = useMemo(() => {
    const fromCost = uniqueValues(costRows, 'MACHINE_NO').filter((m) => m !== 'NA');
    const fromUtil = uniqueValues(utilRows, 'MACHINE_NO');
    return Array.from(new Set([...fromCost, ...fromUtil])).sort();
  }, [costRows, utilRows]);

  return (
    <FilterContext.Provider
      value={{
        fy, month, selectedMCs, selectedMachines, compareFY1, compareFY2,
        setFY, setMonth, setSelectedMCs, setSelectedMachines,
        setCompareFY1, setCompareFY2,
        fyOptions, monthOptions, mcOptions, machineOptions,
      }}
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
