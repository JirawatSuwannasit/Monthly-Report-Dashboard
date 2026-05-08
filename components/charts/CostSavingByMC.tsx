'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useFilters } from '@/context/FilterContext';
import { filterCostRows, computeCostByMC } from '@/lib/dataUtils';
import { CostSavingRow } from '@/lib/types';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CHART_COLOR_LIST } from '@/constants/chartColors';

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
  const { fy, month, selectedMCs, selectedMachines } = useFilters();

  const data = useMemo(() => {
    const filtered = filterCostRows(costRows, fy || null, month || null, selectedMCs, selectedMachines);
    return computeCostByMC(filtered);
  }, [costRows, fy, month, selectedMCs, selectedMachines]);

  if (loading) return <ChartSkeleton />;
  if (!data.length) return <EmptyState />;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">Cost Saving by M/C Category</h3>
        <p className="text-xs text-slate-400 mt-0.5">Total cost contribution per machine category</p>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mc" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatAxisValue} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => {
                const num = Number(v);
                return num >= 1_000_000
                  ? [`฿${(num / 1_000_000).toFixed(2)}M`, 'Cost Saving']
                  : [`฿${num.toLocaleString()}`, 'Cost Saving'];
              }}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={CHART_COLOR_LIST[idx % CHART_COLOR_LIST.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
