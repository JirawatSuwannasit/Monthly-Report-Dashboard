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

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm min-w-[200px]">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-600 text-xs">{entry.name}:</span>
          <span className="font-semibold text-slate-800 ml-auto">
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
  const { fy1, fy2 } = useFilters();

  const data = useMemo(
    () => computeCostContribution(costRows, fy1, fy2),
    [costRows, fy1, fy2]
  );

  if (loading) return <ChartSkeleton />;
  if (!data.length) return <EmptyState />;

  const legendItems = [
    { color: CHART_COLORS.blue, label: `${fy1} (Monthly)`, type: 'bar' },
    { color: CHART_COLORS.orange, label: `${fy2} (Monthly)`, type: 'bar' },
    { color: CHART_COLORS.green, label: `${fy1} Cumulative`, type: 'line' },
    { color: CHART_COLORS.purple, label: `${fy2} Cumulative`, type: 'line' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Cost Contribution</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Monthly bars (left axis) with cumulative lines per FY (right axis)
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          {legendItems.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              {item.type === 'bar' ? (
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ backgroundColor: item.color }}
                />
              ) : (
                <span
                  className="w-5 h-0.5 inline-block rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={formatAxisValue}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatAxisValue}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="left"
              dataKey="fy1"
              name={`${fy1} (Monthly)`}
              fill={CHART_COLORS.blue}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              yAxisId="left"
              dataKey="fy2"
              name={`${fy2} (Monthly)`}
              fill={CHART_COLORS.orange}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumFY1"
              name={`${fy1} Cumulative`}
              stroke={CHART_COLORS.green}
              strokeWidth={2.5}
              dot={{ fill: CHART_COLORS.green, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumFY2"
              name={`${fy2} Cumulative`}
              stroke={CHART_COLORS.purple}
              strokeWidth={2.5}
              strokeDasharray="5 3"
              dot={{ fill: CHART_COLORS.purple, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
