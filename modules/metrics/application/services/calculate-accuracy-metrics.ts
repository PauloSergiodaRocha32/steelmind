import type {
  AccuracyMetrics,
  AccuracySample,
} from "@/modules/metrics/domain/types/accuracy-metrics";

function round(value: number): number {
  return Number(value.toFixed(4));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function accuracyFromSamples(samples: AccuracySample[]): number {
  if (samples.length === 0) return 0;
  const passed = samples.filter((item) => item.status === "passed").length;
  return (passed / samples.length) * 100;
}

function groupedAccuracy<T extends string>(
  samples: AccuracySample[],
  keySelector: (item: AccuracySample) => T,
): Record<T, number> {
  const groups = new Map<T, AccuracySample[]>();

  for (const item of samples) {
    const key = keySelector(item);
    const bucket = groups.get(key) ?? [];
    bucket.push(item);
    groups.set(key, bucket);
  }

  const output = {} as Record<T, number>;
  for (const [key, bucket] of groups.entries()) {
    output[key] = round(accuracyFromSamples(bucket));
  }
  return output;
}

export function calculateAccuracyMetrics(
  samples: AccuracySample[],
): AccuracyMetrics {
  const absoluteErrors = samples.map((item) => Math.abs(item.erroAbsoluto));
  const percentageErrors = samples.map((item) => Math.abs(item.erroPercentual));
  const squares = absoluteErrors.map((value) => value ** 2);

  return {
    globalAccuracy: round(accuracyFromSamples(samples)),
    averageError: round(average(absoluteErrors)),
    maxError: round(Math.max(...absoluteErrors, 0)),
    minError: round(samples.length ? Math.min(...absoluteErrors) : 0),
    rmse: round(Math.sqrt(average(squares))),
    mape: round(average(percentageErrors)),
    byProduct: groupedAccuracy(samples, (item) => item.produto),
    byCategory: groupedAccuracy(samples, (item) => item.categoria),
    byVersion: groupedAccuracy(samples, (item) => item.engineVersion),
  };
}
