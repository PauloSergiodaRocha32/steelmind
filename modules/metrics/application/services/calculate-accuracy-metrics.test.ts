import { describe, expect, it } from "vitest";
import { calculateAccuracyMetrics } from "@/modules/metrics";

describe("calculateAccuracyMetrics (metrics module)", () => {
  it("should compute RMSE, MAPE and grouped accuracies", () => {
    const metrics = calculateAccuracyMetrics([
      {
        produto: "guarda-corpo",
        categoria: "inox",
        engineVersion: "v2.0.0",
        status: "passed",
        erroPercentual: 2,
        erroAbsoluto: 20,
      },
      {
        produto: "guarda-corpo",
        categoria: "inox",
        engineVersion: "v2.0.0",
        status: "failed",
        erroPercentual: 12,
        erroAbsoluto: 120,
      },
      {
        produto: "portao",
        categoria: "carbono",
        engineVersion: "v2.1.0",
        status: "passed",
        erroPercentual: 3,
        erroAbsoluto: 30,
      },
    ]);

    expect(metrics.globalAccuracy).toBeCloseTo(66.6667, 4);
    expect(metrics.averageError).toBeCloseTo(56.6667, 4);
    expect(metrics.maxError).toBe(120);
    expect(metrics.minError).toBe(20);
    expect(metrics.rmse).toBeGreaterThan(0);
    expect(metrics.mape).toBeCloseTo(5.6667, 4);
    expect(metrics.byProduct["guarda-corpo"]).toBe(50);
    expect(metrics.byCategory.inox).toBe(50);
    expect(metrics.byVersion["v2.1.0"]).toBe(100);
  });
});
