'use client';

import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useFilters } from '@/context/FilterContext';
import { computeCostByMCComparison } from '@/lib/dataUtils';
import { CostSavingRow } from '@/lib/types';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CHART_COLORS } from '@/constants/chartColors';
import { SelectDropdown } from '@/components/filters/SelectDropdown';
import { MultiSelect } from '@/components/filters/MultiSelect';
import { PrintPatternDefs, PatternSwatch } from '@/components/ui/PrintPatternDefs';

interface Props {
  costRows: CostSavingRow[];
  loading: boolean;
}

const P_FY1 = 'cs-fy1';
const P_FY2 = 'cs-fy2';

function formatAxisValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export function CostSavingByMC({ costRows, loading }: Props) {
  const { fy1, fy2, month: globalMonth, monthOptions, printMode } = useFilters();

  const [localMonth, setLocalMonth] = useState<string>('');
  const effectiveMonth = localMonth || globalMonth || null;

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
          <p className="text-xs text-slate-400 mt-0.5">FY1 vs FY2 cost contribution comparison</p>
        </div>
        {/* Local filters — independent of other charts */}
        <div className="flex items-end gap-2 flex-wrap">
          <SelectDropdown
            label="Month (local)"
            value={localMonth}
            options={monthOptions}
            onChange={setLocalMonth}
            allLabel={globalMonth || 'All Months'}
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
            <PrintPatternDefs
              fy1Id={P_FY1} fy2Id={P_FY2}
              fy1Color={CHART_COLORS.blue} fy2Color={CHART_COLORS.orange}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mc" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatAxisValue} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => {
                const num = Number(v);
                return num >= 1_000_000
                  ? [`THB ${(num / 1_000_000).toFixed(2)}M`, '']
                  : [`THB ${num.toLocaleString()}`, ''];
              }}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Bar
              dataKey="fy1"
              name={fy1}
              fill={printMode ? `url(#${P_FY1})` : CHART_COLORS.blue}
              stroke={printMode ? 'rgba(0,0,0,0.2)' : 'none'}
              strokeWidth={printMode ? 0.5 : 0}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="fy2"
              name={fy2}
              fill={printMode ? `url(#${P_FY2})` : CHART_COLORS.orange}
              stroke={printMode ? 'rgba(0,0,0,0.2)' : 'none'}
              strokeWidth={printMode ? 0.5 : 0}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend with pattern swatches in print mode */}
      <div className="flex justify-center gap-4 pt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          {printMode
            ? <PatternSwatch variant="fy1" color={CHART_COLORS.blue} size={14} />
            : <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART_COLORS.blue }} />}
          {fy1}
        </span>
        <span className="flex items-center gap-1.5">
          {printMode
            ? <PatternSwatch variant="fy2" color={CHART_COLORS.orange} size={14} />
            : <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART_COLORS.orange }} />}
          {fy2}
        </span>
      </div>
    </div>
  );
}
