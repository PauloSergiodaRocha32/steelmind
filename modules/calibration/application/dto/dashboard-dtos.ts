import type { CalibrationCase } from "@/modules/calibration/domain/entities/calibration-case";
import type { BenchmarkSummary } from "@/modules/calibration/repository/benchmark.repository";
import type { AccuracyMetrics } from "@/modules/calibration/application/services/accuracy-metrics";

export interface CalibrationDashboardDTO {
  totalCases: number;
  pendingCases: number;
  passedCases: number;
  failedCases: number;
  latestCases: CalibrationCase[];
}

export interface BenchmarkDashboardDTO {
  latestRunId: string | null;
  latestRunExecutedAt: string | null;
  summary: BenchmarkSummary | null;
  comparisonNotes: string[];
}

export interface AccuracyDashboardDTO {
  global: Pick<
    AccuracyMetrics,
    "globalAccuracy" | "averageError" | "maxError" | "minError" | "rmse" | "mape"
  >;
  byProduct: AccuracyMetrics["byProduct"];
  byCategory: AccuracyMetrics["byCategory"];
  byVersion: AccuracyMetrics["byVersion"];
}
