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

// Monthly cost contribution with dual cumulative lines for FY1 and FY2
export interface MonthlyContribution {
  month: string;
  fy1: number;
  fy2: number;
  cumFY1: number; // cumulative sum for FY1, resets each April
  cumFY2: number; // cumulative sum for FY2, resets each April
}

// Side-by-side comparison of a metric between FY1 and FY2 per MC category
export interface MCComparisonData {
  mc: string;
  fy1: number;
  fy2: number;
}

export interface HeatmapCell {
  machine: string;
  month: string;
  value: number | null;
}

export interface DonutSlice {
  name: string;
  value: number;
  percentage: number;
}
