import { CostSavingRow, UtilizationRow, KpiSummary, MonthlyContribution, MCBarData, HeatmapCell } from './types';
import { MONTH_ORDER } from '@/constants/chartColors';

export function filterCostRows(
  rows: CostSavingRow[],
  fy: string | null,
  month: string | null,
  mcs: string[],
  machines: string[]
): CostSavingRow[] {
  return rows.filter((r) => {
    if (fy && r.FY !== fy) return false;
    if (month && r.MONTH !== month) return false;
    if (mcs.length > 0 && !mcs.includes(r.MC)) return false;
    if (machines.length > 0 && !machines.includes(r.MACHINE_NO)) return false;
    return true;
  });
}

export function filterUtilRows(
  rows: UtilizationRow[],
  fy: string | null,
  month: string | null,
  mcs: string[],
  machines: string[]
): UtilizationRow[] {
  return rows.filter((r) => {
    if (fy && r.FY !== fy) return false;
    if (month && r.MONTH !== month) return false;
    if (mcs.length > 0 && !mcs.includes(r.MC)) return false;
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

export function computeCostContribution(
  rows: CostSavingRow[],
  fy1: string,
  fy2: string,
  mcs: string[],
  machines: string[]
): MonthlyContribution[] {
  const applyMachineFilter = (r: CostSavingRow) => {
    if (mcs.length > 0 && !mcs.includes(r.MC)) return false;
    if (machines.length > 0 && !machines.includes(r.MACHINE_NO)) return false;
    return true;
  };

  const fy1Rows = rows.filter((r) => r.FY === fy1 && applyMachineFilter(r));
  const fy2Rows = rows.filter((r) => r.FY === fy2 && applyMachineFilter(r));

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

  let cumulative = 0;
  return allMonths.map((month) => {
    const fy2Val = fy2Map[month] || 0;
    cumulative += fy2Val;
    return {
      month,
      fy1: fy1Map[month] || 0,
      fy2: fy2Val,
      cumulative,
    };
  });
}

export function computeCostByMC(rows: CostSavingRow[]): MCBarData[] {
  const map: Record<string, number> = {};
  rows.forEach((r) => {
    map[r.MC] = (map[r.MC] || 0) + r.COST_CONTRIBUTION;
  });
  return Object.entries(map).map(([mc, value]) => ({ mc, value }));
}

export function computeJobsByMC(rows: CostSavingRow[]): MCBarData[] {
  const map: Record<string, number> = {};
  rows.forEach((r) => {
    map[r.MC] = (map[r.MC] || 0) + r.JOB;
  });
  return Object.entries(map).map(([mc, value]) => ({ mc, value }));
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
