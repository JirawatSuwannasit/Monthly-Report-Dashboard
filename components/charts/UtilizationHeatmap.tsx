'use client';

import { useMemo } from 'react';
import { useFilters } from '@/context/FilterContext';
import { filterUtilRows, computeHeatmap } from '@/lib/dataUtils';
import { UtilizationRow } from '@/lib/types';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { MONTH_ORDER, HEATMAP_LOW, HEATMAP_HIGH, HEATMAP_ZERO } from '@/constants/chartColors';

interface Props {
  utilRows: UtilizationRow[];
  loading: boolean;
}

function interpolateColor(low: string, high: string, t: number): string {
  const hexToRgb = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });
  const lo = hexToRgb(low);
  const hi = hexToRgb(high);
  const r = Math.round(lo.r + (hi.r - lo.r) * t);
  const g = Math.round(lo.g + (hi.g - lo.g) * t);
  const b = Math.round(lo.b + (hi.b - lo.b) * t);
  return `rgb(${r},${g},${b})`;
}

function cellColor(value: number | null): string {
  if (value === null) return HEATMAP_ZERO;
  const t = Math.min(value / 100, 1);
  return interpolateColor(HEATMAP_LOW, HEATMAP_HIGH, t);
}

function textColor(value: number | null): string {
  if (value === null) return '#cbd5e1';
  return value > 50 ? '#ffffff' : '#1e3a5f';
}

export function UtilizationHeatmap({ utilRows, loading }: Props) {
  const { fy, month, selectedMCs, selectedMachines } = useFilters();

  const filtered = useMemo(
    () => filterUtilRows(utilRows, fy || null, null, selectedMCs, selectedMachines),
    [utilRows, fy, selectedMCs, selectedMachines]
  );

  const { cells, machines, months } = useMemo(() => {
    const machineList =
      selectedMachines.length > 0
        ? selectedMachines
        : Array.from(new Set(filtered.map((r) => r.MACHINE_NO))).sort();

    const availableMonths = MONTH_ORDER.filter((m) => filtered.some((r) => r.MONTH === m));
    const displayMonths = month ? availableMonths.filter((m) => m === month) : availableMonths;

    const cells = computeHeatmap(filtered, selectedMachines);
    return { cells, machines: machineList, months: displayMonths };
  }, [filtered, selectedMachines, month]);

  if (loading) return <ChartSkeleton />;
  if (!cells.length || !machines.length) return <EmptyState />;

  const cellMap: Record<string, number | null> = {};
  cells.forEach((c) => {
    cellMap[`${c.machine}__${c.month}`] = c.value;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Machine Utilization Heatmap</h3>
          <p className="text-xs text-slate-400 mt-0.5">Operation rate (%) by machine and month</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Low</span>
          <div className="flex gap-px">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
              <div
                key={t}
                className="w-5 h-4 rounded-sm"
                style={{ backgroundColor: interpolateColor(HEATMAP_LOW, HEATMAP_HIGH, t) }}
              />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          <div className="flex">
            <div className="w-24 shrink-0" />
            {months.map((m) => (
              <div key={m} className="w-14 text-center text-xs font-semibold text-slate-500 pb-2">
                {m}
              </div>
            ))}
          </div>

          {machines.map((machine) => (
            <div key={machine} className="flex items-center mb-1">
              <div className="w-24 shrink-0 text-xs font-medium text-slate-600 truncate pr-2 text-right">
                {machine}
              </div>
              {months.map((m) => {
                const val = cellMap[`${machine}__${m}`] ?? null;
                return (
                  <div
                    key={m}
                    title={val !== null ? `${machine} / ${m}: ${val.toFixed(1)}%` : `${machine} / ${m}: N/A`}
                    className="w-14 h-10 rounded-md mx-0.5 flex items-center justify-center text-xs font-semibold transition-opacity hover:opacity-80 cursor-default"
                    style={{ backgroundColor: cellColor(val), color: textColor(val) }}
                  >
                    {val !== null ? `${val.toFixed(0)}%` : '—'}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
