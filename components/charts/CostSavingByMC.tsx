'use client';

import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useFilters } from '@/context/FilterContext';
import { computeCostByMCComparison } from '@/lib/dataUtils';
import { CostSavingRow } from '@/lib/types';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CHART_COLORS } from '@/constants/chartColors';
import { SelectDropdown } from '@/components/filters/SelectDropdown';
import { MultiSelect } from '@/components/filters/MultiSelect';

interface Props {
  costRows: CostSavingRow[];
  loading: boolean;
}

function formatAxisValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export function CostSavingByMC({ costRows, loading }: Props) {
  const { fy1, fy2, month: globalMonth, monthOptions } = useFilters();

  // Local month override — defaults to the global month filter
  const [localMonth, setLocalMonth] = useState<string>('');
  const effectiveMonth = localMonth || globalMonth || null;

  // Local MC multi-select — only affects this chart
  const allMCOptions = useMemo(
    () => Array.from(new Set(costRows.map((r) => r.MC))).filter(Boolean).sort(),
    [costRows]
  );
  const [selectedMCs, setSelectedMCs] = useState<string[]>([]);

  const data = useMemo(
    () => computeCostByMCComparison(costRows, fy1, fy2, effectiveMonth),
    [costRows, fy1, fy2, effectiveMonth]
  );

  const displayData = useMemo(() => {
    if (selectedMCs.length === 0) return data;
    return data.filter((d) => selectedMCs.includes(d.mc));
  }, [data, selectedMCs]);

  if (loading) return <ChartSkeleton />;
  if (!data.length) return <EmptyState />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Cost Saving by M/C Category</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            FY1 vs FY2 cost contribution comparison
          </p>
        </div>
        {/* Local filters — independent of other charts */}
        <div className="flex items-end gap-2 flex-wrap">
          <SelectDropdown
            label="Month (local)"
            value={localMonth}
            options={monthOptions}
            onChange={setLocalMonth}
            allLabel={globalMonth ? globalMonth : 'All Months'}
          />
          <MultiSelect
            label="Category (local)"
            options={allMCOptions}
            selected={selectedMCs}
            onChange={setSelectedMCs}
            placeholder="All Categories"
          />
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="mc"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatAxisValue}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => {
                const num = Number(v);
                return num >= 1_000_000
                  ? [`฿${(num / 1_000_000).toFixed(2)}M`, '']
                  : [`฿${num.toLocaleString()}`, ''];
              }}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value) => <span className="text-slate-600">{value}</span>}
            />
            <Bar
              dataKey="fy1"
              name={fy1}
              fill={CHART_COLORS.blue}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="fy2"
              name={fy2}
              fill={CHART_COLORS.orange}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
