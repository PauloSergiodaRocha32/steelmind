import { describe, expect, it } from "vitest";
import { InMemoryBenchmarkRepository } from "@/modules/calibration/infrastructure/in-memory-benchmark.repository";

describe("InMemoryBenchmarkRepository", () => {
  it("should register, run, compare and summarize benchmark runs", async () => {
    const repository = new InMemoryBenchmarkRepository();

    await repository.registerCase({
      id: "case-1",
      produto: "guarda-corpo",
      categoria: "inox",
      entrada: { base: 1000 },
      resultadoEsperado: 1000,
      engineVersion: "v2.0.0",
    });
    await repository.registerCase({
      id: "case-2",
      produto: "guarda-corpo",
      categoria: "inox",
      entrada: { base: 2000 },
      resultadoEsperado: 2000,
      engineVersion: "v2.0.0",
    });

    const baseRun = await repository.runBenchmark("v2.0.0", (input) => {
      const base = Number(input.base ?? 0);
      return base * 1.08;
    });

    const candidateRun = await repository.runBenchmark("v2.0.0", (input) => {
      const base = Number(input.base ?? 0);
      return base * 1.02;
    });

    const summary = await repository.generateSummary(candidateRun.runId);
    const comparison = await repository.compareResults(
      baseRun.runId,
      candidateRun.runId,
    );

    expect(baseRun.results).toHaveLength(2);
    expect(summary?.totalCases).toBe(2);
    expect(summary?.averageAbsoluteError).toBeGreaterThan(0);
    expect(comparison).not.toBeNull();
    expect(comparison?.deltaErroMedio).toBeLessThan(0);
  });
});
