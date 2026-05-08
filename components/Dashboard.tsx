'use client';

import { useMemo } from 'react';
import { useCSVData } from '@/lib/useCSVData';
import { FilterProvider } from '@/context/FilterContext';
import { FilterBar } from '@/components/filters/FilterBar';
import { KpiRow } from '@/components/kpi/KpiRow';
import { CostContributionChart } from '@/components/charts/CostContributionChart';
import { CostSavingByMC } from '@/components/charts/CostSavingByMC';
import { JobByMC } from '@/components/charts/JobByMC';
import { UtilizationHeatmap } from '@/components/charts/UtilizationHeatmap';
import { uniqueValues } from '@/lib/dataUtils';

function ChartCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Dashboard() {
  const { costSaving, utilization, loading, error } = useCSVData();

  const allFYs = useMemo(() => uniqueValues(costSaving, 'FY'), [costSaving]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md border border-red-100 p-8 max-w-md text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Failed to Load Data</h2>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <FilterProvider costRows={costSaving} utilRows={utilization} allFYs={allFYs}>
      <div className="min-h-screen bg-slate-50">
        {/* Top navigation header */}
        <header className="bg-blue-700 text-white px-6 py-4">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Monthly Report Dashboard</h1>
                <p className="text-blue-200 text-xs">Reliability Lab — Cost Saving &amp; Machine Utilization</p>
              </div>
            </div>
            <div className="text-xs text-blue-200">
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                  Loading data...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  {costSaving.length.toLocaleString()} cost records &bull; {utilization.length.toLocaleString()} utilization records
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Global filter bar */}
        <FilterBar />

        {/* Dashboard content */}
        <main className="max-w-screen-2xl mx-auto px-6 py-6 flex flex-col gap-6">
          {/* KPI row */}
          <KpiRow costRows={costSaving} utilRows={utilization} loading={loading} />

          {/* Cost Contribution Chart — full width */}
          <ChartCard className="h-96">
            <CostContributionChart costRows={costSaving} loading={loading} />
          </ChartCard>

          {/* Cost Saving by MC and Jobs by MC side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard className="h-80">
              <CostSavingByMC costRows={costSaving} loading={loading} />
            </ChartCard>
            <ChartCard className="h-80">
              <JobByMC costRows={costSaving} loading={loading} />
            </ChartCard>
          </div>

          {/* Heatmap — full width to accommodate many machines */}
          <ChartCard className="min-h-[400px]">
            <UtilizationHeatmap utilRows={utilization} loading={loading} />
          </ChartCard>
        </main>

        <footer className="py-6 border-t border-slate-200 mt-4">
          <div className="max-w-screen-2xl mx-auto px-6 text-center text-xs text-slate-400">
            Monthly Report Dashboard &mdash; Reliability Lab. Fiscal year starts in April.
          </div>
        </footer>
      </div>
    </FilterProvider>
  );
}
