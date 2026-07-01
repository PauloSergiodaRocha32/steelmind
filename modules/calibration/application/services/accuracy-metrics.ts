import type { CalibrationCase } from "@/modules/calibration/domain/entities/calibration-case";
import {
  calculateAccuracyMetrics as calculateAccuracyMetricsCore,
  type AccuracyMetrics,
} from "@/modules/metrics";

export type { AccuracyMetrics };

export function calculateAccuracyMetrics(cases: CalibrationCase[]): AccuracyMetrics {
  return calculateAccuracyMetricsCore(
    cases.map((item) => ({
      produto: item.produto,
      categoria: item.categoria,
      engineVersion: item.engineVersion,
      status: item.status,
      erroPercentual: item.erroPercentual,
      erroAbsoluto: item.erroAbsoluto,
    })),
  );
}
