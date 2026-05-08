'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { CostSavingRow, UtilizationRow, CSVData } from './types';

const COST_CSV_URL =
  'https://raw.githubusercontent.com/jirawatsuwannasit/monthly-report-dashboard/main/Cost%20saving%20database.csv';

const UTIL_CSV_URL =
  'https://raw.githubusercontent.com/jirawatsuwannasit/monthly-report-dashboard/main/Machine%20utillize%20database.csv';

function parsePercent(val: string | undefined): number {
  if (!val) return 0;
  return parseFloat(String(val).replace('%', '').trim()) || 0;
}

function parseNum(val: string | undefined): number {
  if (!val || val === 'NA' || val === '') return 0;
  return parseFloat(String(val).replace(/,/g, '')) || 0;
}

export function useCSVData(): CSVData {
  const [state, setState] = useState<CSVData>({
    costSaving: [],
    utilization: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        const [costText, utilText] = await Promise.all([
          fetch(COST_CSV_URL).then((r) => r.text()),
          fetch(UTIL_CSV_URL).then((r) => r.text()),
        ]);

        if (cancelled) return;

        const costResult = Papa.parse<Record<string, string>>(costText, {
          header: true,
          skipEmptyLines: true,
        });

        const utilResult = Papa.parse<Record<string, string>>(utilText, {
          header: true,
          skipEmptyLines: true,
        });

        const costSaving: CostSavingRow[] = costResult.data.map((row) => ({
          DATE: row['DATE'] || '',
          MONTH: (row['MONTH'] || '').trim().toUpperCase(),
          FY: (row['FY'] || '').trim(),
          MC: (row['MC'] || '').trim(),
          MACHINE_NO: (row['MACHINE_NO'] || '').trim(),
          FACTORY: (row['FACTORY'] || '').trim(),
          HOUR: parseNum(row['HOUR']),
          CYCLE: row['CYCLE'] || '',
          JOB: parseNum(row['JOB']),
          COST: parseNum(row['COST']),
          COST_CONTRIBUTION: parseNum(row['COST_CONTRIBUTION']),
        }));

        const utilization: UtilizationRow[] = utilResult.data.map((row) => ({
          DATE: row['DATE'] || '',
          MONTH: (row['MONTH'] || '').trim().toUpperCase(),
          FY: (row['FY'] || '').trim(),
          MC: (row['MC'] || '').trim(),
          MACHINE_NO: (row['MACHINE_NO'] || '').trim(),
          OPERATION_RATE: parsePercent(row['OPERATION_RATE']),
        }));

        if (!cancelled) {
          setState({ costSaving, utilization, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load data',
          }));
        }
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
