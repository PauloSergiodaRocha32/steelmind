export interface AccuracySample {
  produto: string;
  categoria: string;
  engineVersion: string;
  status: "pending" | "passed" | "failed" | "needs_review";
  erroPercentual: number;
  erroAbsoluto: number;
}

export interface AccuracyMetrics {
  globalAccuracy: number;
  averageError: number;
  maxError: number;
  minError: number;
  rmse: number;
  mape: number;
  byProduct: Record<string, number>;
  byCategory: Record<string, number>;
  byVersion: Record<string, number>;
}
