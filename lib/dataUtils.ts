import { CostSavingRow, UtilizationRow, KpiSummary, MonthlyContribution, MCComparisonData, HeatmapCell } from './types';
import { MONTH_ORDER } from '@/constants/chartColors';

// Filter cost rows by FY and/or month only (MC and machine filters are chart-local)
export function filterCostRows(
  rows: CostSavingRow[],
  fy: string | null,
  month: string | null
): CostSavingRow[] {
  return rows.filter((r) => {
    if (fy && r.FY !== fy) return false;
    if (month && r.MONTH !== month) return false;
    return true;
  });
}

// Filter utilization rows — machines param used by heatmap local filter only
export function filterUtilRows(
  rows: UtilizationRow[],
  fy: string | null,
  month: string | null,
  machines: string[]
): UtilizationRow[] {
  return rows.filter((r) => {
    if (fy && r.FY !== fy) return false;
    if (month && r.MONTH !== month) return false;
    if (machines.length > 0 && !machines.includes(r.MACHINE_NO)) return false;
    return true;
  });
}

export function computeKpis(
  costRows: CostSavingRow[],
  utilRows: UtilizationRow[]
): KpiSummary {
  const totalCostSaving = costRows.reduce((s, r) => s + r.COST_CONTRIBUTION, 0);
  const totalJobs = costRows.reduce((s, r) => s + r.JOB, 0);
  const totalHours = costRows.reduce((s, r) => s + r.HOUR, 0);
  const avgUtilization =
    utilRows.length > 0
      ? utilRows.reduce((s, r) => s + r.OPERATION_RATE, 0) / utilRows.length
      : 0;
  return { totalCostSaving, totalJobs, totalHours, avgUtilization };
}

// Build monthly cost contribution data with dual cumulative lines for FY1 and FY2.
// Cumulative resets naturally because MONTH_ORDER starts at APR and we filter per-FY.
export function computeCostContribution(
  rows: CostSavingRow[],
  fy1: string,
  fy2: string
): MonthlyContribution[] {
  const fy1Rows = rows.filter((r) => r.FY === fy1);
  const fy2Rows = rows.filter((r) => r.FY === fy2);

  const fy1Map: Record<string, number> = {};
  const fy2Map: Record<string, number> = {};

  fy1Rows.forEach((r) => {
    fy1Map[r.MONTH] = (fy1Map[r.MONTH] || 0) + r.COST_CONTRIBUTION;
  });
  fy2Rows.forEach((r) => {
    fy2Map[r.MONTH] = (fy2Map[r.MONTH] || 0) + r.COST_CONTRIBUTION;
  });

  const allMonths = MONTH_ORDER.filter(
    (m) => fy1Map[m] !== undefined || fy2Map[m] !== undefined
  );

  let cumFY1 = 0;
  let cumFY2 = 0;

  return allMonths.map((month) => {
    const fy1Val = fy1Map[month] || 0;
    const fy2Val = fy2Map[month] || 0;
    cumFY1 += fy1Val;
    cumFY2 += fy2Val;
    return { month, fy1: fy1Val, fy2: fy2Val, cumFY1, cumFY2 };
  });
}

// Side-by-side cost contribution comparison between FY1 and FY2 per MC category.
// Optional month param overrides to a single month view (used by local chart filter).
export function computeCostByMCComparison(
  rows: CostSavingRow[],
  fy1: string,
  fy2: string,
  month: string | null
): MCComparisonData[] {
  const filter = (r: CostSavingRow, fy: string) =>
    r.FY === fy && (!month || r.MONTH === month);

  const fy1Rows = rows.filter((r) => filter(r, fy1));
  const fy2Rows = rows.filter((r) => filter(r, fy2));

  const fy1Map: Record<string, number> = {};
  const fy2Map: Record<string, number> = {};

  fy1Rows.forEach((r) => { fy1Map[r.MC] = (fy1Map[r.MC] || 0) + r.COST_CONTRIBUTION; });
  fy2Rows.forEach((r) => { fy2Map[r.MC] = (fy2Map[r.MC] || 0) + r.COST_CONTRIBUTION; });

  const allMCs = Array.from(new Set([...Object.keys(fy1Map), ...Object.keys(fy2Map)])).sort();
  return allMCs.map((mc) => ({ mc, fy1: fy1Map[mc] || 0, fy2: fy2Map[mc] || 0 }));
}

// Side-by-side jobs comparison between FY1 and FY2 per MC category.
export function computeJobsByMCComparison(
  rows: CostSavingRow[],
  fy1: string,
  fy2: string,
  month: string | null
): MCComparisonData[] {
  const filter = (r: CostSavingRow, fy: string) =>
    r.FY === fy && (!month || r.MONTH === month);

  const fy1Rows = rows.filter((r) => filter(r, fy1));
  const fy2Rows = rows.filter((r) => filter(r, fy2));

  const fy1Map: Record<string, number> = {};
  const fy2Map: Record<string, number> = {};

  fy1Rows.forEach((r) => { fy1Map[r.MC] = (fy1Map[r.MC] || 0) + r.JOB; });
  fy2Rows.forEach((r) => { fy2Map[r.MC] = (fy2Map[r.MC] || 0) + r.JOB; });

  const allMCs = Array.from(new Set([...Object.keys(fy1Map), ...Object.keys(fy2Map)])).sort();
  return allMCs.map((mc) => ({ mc, fy1: fy1Map[mc] || 0, fy2: fy2Map[mc] || 0 }));
}

export function computeHeatmap(
  rows: UtilizationRow[],
  machines: string[]
): HeatmapCell[] {
  const machineList =
    machines.length > 0
      ? machines
      : Array.from(new Set(rows.map((r) => r.MACHINE_NO))).sort();

  const months = MONTH_ORDER.filter((m) => rows.some((r) => r.MONTH === m));

  const cells: HeatmapCell[] = [];
  machineList.forEach((machine) => {
    months.forEach((month) => {
      const matching = rows.filter(
        (r) => r.MACHINE_NO === machine && r.MONTH === month
      );
      const value =
        matching.length > 0
          ? matching.reduce((s, r) => s + r.OPERATION_RATE, 0) / matching.length
          : null;
      cells.push({ machine, month, value });
    });
  });

  return cells;
}

export function uniqueValues<T, K extends keyof T>(rows: T[], key: K): string[] {
  return Array.from(new Set(rows.map((r) => String(r[key])))).filter(Boolean).sort();
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `฿${(value / 1_000).toFixed(1)}K`;
  return `฿${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}
