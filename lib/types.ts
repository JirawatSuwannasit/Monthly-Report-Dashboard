export interface CostSavingRow {
  DATE: string;
  MONTH: string;
  FY: string;
  MC: string;
  MACHINE_NO: string;
  FACTORY: string;
  HOUR: number;
  CYCLE: string;
  JOB: number;
  COST: number;
  COST_CONTRIBUTION: number;
}

export interface UtilizationRow {
  DATE: string;
  MONTH: string;
  FY: string;
  MC: string;
  MACHINE_NO: string;
  OPERATION_RATE: number; // parsed from "52%" -> 52
}

export interface CSVData {
  costSaving: CostSavingRow[];
  utilization: UtilizationRow[];
  loading: boolean;
  error: string | null;
}

export interface KpiSummary {
  totalCostSaving: number;
  totalJobs: number;
  totalHours: number;
  avgUtilization: number;
}

export interface MonthlyContribution {
  month: string;
  fy1: number;
  fy2: number;
  cumulative: number;
}

export interface MCBarData {
  mc: string;
  value: number;
}

export interface HeatmapCell {
  machine: string;
  month: string;
  value: number | null;
}
