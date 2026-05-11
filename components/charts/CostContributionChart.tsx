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
import { PrintPatternDefs, PatternSwatch } from '@/components/ui/PrintPatternDefs';

interface Props {
  costRows: CostSavingRow[];
  loading: boolean;
}

const P_FY1 = 'cc-fy1';
const P_FY2 = 'cc-fy2';

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
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600 text-xs">{entry.name}:</span>
          <span className="font-semibold text-slate-800 ml-auto">
            {entry.value >= 1_000_000
              ? `THB ${(entry.value / 1_000_000).toFixed(2)}M`
              : `THB ${entry.value.toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// Legend item descriptor — dashed flag drives the swatch rendering
interface LegendItem {
  color: string;
  label: string;
  type: 'bar' | 'line';
  variant: 'fy1' | 'fy2';
  dashed: boolean;
}

export function CostContributionChart({ costRows, loading }: Props) {
  const { fy1, fy2, printMode } = useFilters();

  const data = useMemo(
    () => computeCostContribution(costRows, fy1, fy2),
    [costRows, fy1, fy2]
  );

  if (loading) return <ChartSkeleton />;
  if (!data.length) return <EmptyState />;

  const legendItems: LegendItem[] = [
    { color: CHART_COLORS.blue,   label: `${fy1} (Monthly)`,   type: 'bar',  variant: 'fy1', dashed: false },
    { color: CHART_COLORS.orange, label: `${fy2} (Monthly)`,   type: 'bar',  variant: 'fy2', dashed: false },
    { color: CHART_COLORS.green,  label: `${fy1} Cumulative`,  type: 'line', variant: 'fy1', dashed: false },
    { color: CHART_COLORS.purple, label: `${fy2} Cumulative`,  type: 'line', variant: 'fy2', dashed: true  },
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

        {/* Legend — bar swatches and line swatches (solid vs dashed) */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          {legendItems.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              {item.type === 'bar' ? (
                printMode ? (
                  <PatternSwatch variant={item.variant} color={item.color} size={14} />
                ) : (
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: item.color }} />
                )
              ) : (
                // Line swatch: SVG so we can render dashed accurately
                <svg width="20" height="8" className="inline-block">
                  <line
                    x1="0" y1="4" x2="20" y2="4"
                    stroke={item.color}
                    strokeWidth="2"
                    strokeDasharray={item.dashed ? '5 3' : undefined}
                  />
                </svg>
              )}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 50, left: 30, bottom: 4 }}>
            <PrintPatternDefs
              fy1Id={P_FY1} fy2Id={P_FY2}
              fy1Color={CHART_COLORS.blue} fy2Color={CHART_COLORS.orange}
            />
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
              width={75}
              label={{
                value: 'Cost contribution (THB)',
                angle: -90,
                position: 'insideLeft',
                offset: -15,
                style: { textAnchor: 'middle', fontSize: 10, fill: '#94a3b8' },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatAxisValue}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={75}
              label={{
                value: 'Cumulative (THB)',
                angle: 90,
                position: 'insideRight',
                offset: -15,
                style: { textAnchor: 'middle', fontSize: 10, fill: '#94a3b8' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="left"
              dataKey="fy1"
              name={`${fy1} (Monthly)`}
              fill={printMode ? `url(#${P_FY1})` : CHART_COLORS.blue}
              stroke={printMode ? 'rgba(0,0,0,0.2)' : 'none'}
              strokeWidth={printMode ? 0.5 : 0}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              yAxisId="left"
              dataKey="fy2"
              name={`${fy2} (Monthly)`}
              fill={printMode ? `url(#${P_FY2})` : CHART_COLORS.orange}
              stroke={printMode ? 'rgba(0,0,0,0.2)' : 'none'}
              strokeWidth={printMode ? 0.5 : 0}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            {/* FY1 cumulative — solid line */}
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
            {/* FY2 cumulative — dashed line for visual distinction */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumFY2"
              name={`${fy2} Cumulative`}
              stroke={CHART_COLORS.purple}
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={{ fill: CHART_COLORS.purple, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
