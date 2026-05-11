'use client';

import { useMemo } from 'react';
import { KpiCard } from './KpiCard';
import { useFilters } from '@/context/FilterContext';
import { filterCostRows, filterUtilRows, computeKpis, formatCurrency, formatNumber } from '@/lib/dataUtils';
import { CostSavingRow, UtilizationRow } from '@/lib/types';

interface KpiRowProps {
  costRows: CostSavingRow[];
  utilRows: UtilizationRow[];
  loading: boolean;
}

export function KpiRow({ costRows, utilRows, loading }: KpiRowProps) {
  const { fy2, month } = useFilters();

  const kpis = useMemo(() => {
    // All three metric cards are scoped to FY2 only
    const fy2Cost = filterCostRows(costRows, fy2 || null, month || null);
    const fy2Util = filterUtilRows(utilRows, fy2 || null, month || null, []);
    return computeKpis(fy2Cost, fy2Util);
  }, [costRows, utilRows, fy2, month]);

  // Card title prefix updates live when the FY2 dropdown changes
  const fyLabel = fy2 || 'FY2';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Total Cost Saving"
        value={formatCurrency(kpis.totalCostSaving)}
        subtitle={`${fyLabel} Cost Saving`}
        loading={loading}
        accentColor="bg-blue-50 text-blue-700"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <KpiCard
        title="Total Testing Jobs"
        value={formatNumber(kpis.totalJobs)}
        subtitle={`${fyLabel} Testing Jobs`}
        loading={loading}
        accentColor="bg-orange-50 text-orange-600"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
      />
      <KpiCard
        title="Total Operating Hours"
        value={`${formatNumber(Math.round(kpis.totalHours))} hrs`}
        subtitle={`${fyLabel} Operating Hours`}
        loading={loading}
        accentColor="bg-emerald-50 text-emerald-600"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <KpiCard
        title="Avg Machine Utilization"
        value={`${kpis.avgUtilization.toFixed(1)}%`}
        subtitle={`${fy2 || 'FY2'} utilization rate`}
        loading={loading}
        accentColor="bg-purple-50 text-purple-600"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    </div>
  );
}
