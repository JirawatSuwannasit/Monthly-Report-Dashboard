'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useFilters } from '@/context/FilterContext';
import { filterCostRows } from '@/lib/dataUtils';
import { CostSavingRow, DonutSlice } from '@/lib/types';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CHART_COLOR_LIST } from '@/constants/chartColors';
import { SelectDropdown } from '@/components/filters/SelectDropdown';

interface Props {
  costRows: CostSavingRow[];
  loading: boolean;
  groupBy: 'FACTORY' | 'MC';
  title: string;
  subtitle: string;
}

function formatThb(value: number): string {
  if (value >= 1_000_000) return `THB ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `THB ${(value / 1_000).toFixed(1)}K`;
  return `THB ${value.toFixed(0)}`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DonutSlice }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-slate-700 mb-1.5">{d.name}</p>
      <p className="text-slate-600 text-xs">{formatThb(d.value)}</p>
      <p className="text-slate-400 text-xs mt-0.5">{d.percentage.toFixed(1)}% of total</p>
    </div>
  );
}

export function CostDonut({ costRows, loading, groupBy, title, subtitle }: Props) {
  const { fy2, month, fyOptions } = useFilters();

  // Local FY selector — defaults to global FY2
  const [localFY, setLocalFY] = useState<string>('');
  const effectiveFY = localFY || fy2 || null;

  const slices = useMemo((): DonutSlice[] => {
    const filtered = filterCostRows(costRows, effectiveFY, month || null);
    const map: Record<string, number> = {};
    filtered.forEach((r) => {
      const key = (r[groupBy] as string) || 'Unknown';
      map[key] = (map[key] || 0) + r.COST_CONTRIBUTION;
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }));
  }, [costRows, effectiveFY, month, groupBy]);

  if (loading) return <ChartSkeleton />;
  if (!slices.length) return <EmptyState />;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <SelectDropdown
          label="FY (local)"
          value={localFY}
          options={fyOptions}
          onChange={setLocalFY}
          allLabel={fy2 || 'Select FY'}
        />
      </div>

      {/* Donut + scrollable legend side-by-side */}
      <div className="flex-1 flex gap-3 min-h-0">
        <div className="flex-1 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="78%"
                dataKey="value"
                paddingAngle={2}
                label={false}
              >
                {slices.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLOR_LIST[index % CHART_COLOR_LIST.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="w-36 flex flex-col gap-2 py-1 overflow-y-auto pr-1">
          {slices.map((slice, index) => (
            <div key={slice.name} className="flex items-start gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0 mt-0.5"
                style={{ backgroundColor: CHART_COLOR_LIST[index % CHART_COLOR_LIST.length] }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate leading-tight">{slice.name}</p>
                <p className="text-xs text-slate-400">{slice.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
