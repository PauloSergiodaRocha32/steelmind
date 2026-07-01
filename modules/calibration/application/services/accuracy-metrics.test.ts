import { describe, expect, it } from "vitest";
import { calculateAccuracyMetrics } from "@/modules/calibration/application/services/accuracy-metrics";
import type { CalibrationCase } from "@/modules/calibration/domain/entities/calibration-case";

describe("calculateAccuracyMetrics", () => {
  it("should compute global, grouped and statistical metrics", () => {
    const cases: CalibrationCase[] = [
      {
        id: "1",
        produto: "guarda-corpo",
        categoria: "inox",
        entrada: {},
        resultadoEsperado: 1000,
        resultadoCalculado: 980,
        erroPercentual: 2,
        erroAbsoluto: 20,
        status: "passed",
        engineVersion: "v2.0.0",
      },
      {
        id: "2",
        produto: "guarda-corpo",
        categoria: "inox",
        entrada: {},
        resultadoEsperado: 1200,
        resultadoCalculado: 1320,
        erroPercentual: 10,
        erroAbsoluto: 120,
        status: "failed",
        engineVersion: "v2.0.0",
      },
      {
        id: "3",
        produto: "portao",
        categoria: "carbono",
        entrada: {},
        resultadoEsperado: 800,
        resultadoCalculado: 780,
        erroPercentual: 2.5,
        erroAbsoluto: 20,
        status: "passed",
        engineVersion: "v2.1.0",
      },
    ];

    const metrics = calculateAccuracyMetrics(cases);

    expect(metrics.globalAccuracy).toBeCloseTo(66.6667, 4);
    expect(metrics.averageError).toBeCloseTo(53.3333, 4);
    expect(metrics.maxError).toBe(120);
    expect(metrics.minError).toBe(20);
    expect(metrics.rmse).toBeGreaterThan(0);
    expect(metrics.mape).toBeCloseTo(4.8333, 4);
    expect(metrics.byProduct["guarda-corpo"]).toBe(50);
    expect(metrics.byCategory.inox).toBe(50);
    expect(metrics.byVersion["v2.1.0"]).toBe(100);
  });
});
