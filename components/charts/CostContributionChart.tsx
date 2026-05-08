'use client';

import { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useFilters } from '@/context/FilterContext';
import { computeCostContribution } from '@/lib/dataUtils';
import { CostSavingRow } from '@/lib/types';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CHART_COLORS } from '@/constants/chartColors';

interface Props {
  costRows: CostSavingRow[];
  loading: boolean;
}

function formatAxisValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-semibold text-slate-800">
            {entry.value >= 1_000_000
              ? `฿${(entry.value / 1_000_000).toFixed(2)}M`
              : `฿${entry.value.toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CostContributionChart({ costRows, loading }: Props) {
  const { compareFY1, compareFY2, selectedMCs, selectedMachines, fyOptions } = useFilters();

  const fy1 = compareFY1 || fyOptions[fyOptions.length - 2] || fyOptions[0] || '';
  const fy2 = compareFY2 || fyOptions[fyOptions.length - 1] || fyOptions[1] || '';

  const data = useMemo(
    () => computeCostContribution(costRows, fy1, fy2, selectedMCs, selectedMachines),
    [costRows, fy1, fy2, selectedMCs, selectedMachines]
  );

  if (loading) return <ChartSkeleton />;
  if (!data.length) return <EmptyState />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Cost Contribution</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monthly comparison with cumulative trend</p>
        </div>
        <div className="flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: CHART_COLORS.blue }} />
            {fy1}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: CHART_COLORS.orange }} />
            {fy2}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: CHART_COLORS.green }} />
            Cumulative ({fy2})
          </span>
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="left"
              tickFormatter={formatAxisValue}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatAxisValue}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar yAxisId="left" dataKey="fy1" name={fy1} fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar yAxisId="left" dataKey="fy2" name={fy2} fill={CHART_COLORS.orange} radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulative"
              name={`Cumulative (${fy2})`}
              stroke={CHART_COLORS.green}
              strokeWidth={2.5}
              dot={{ fill: CHART_COLORS.green, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
