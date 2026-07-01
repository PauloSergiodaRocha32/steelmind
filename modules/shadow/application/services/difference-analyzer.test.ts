import { describe, expect, it } from "vitest";
import { analyzeDifferences } from "@/modules/shadow/application/services/difference-analyzer";

describe("analyzeDifferences", () => {
  it("should calculate category and global differences", () => {
    const official = {
      materiais: 1000,
      maoDeObra: 500,
      consumiveis: 120,
      pintura: 200,
      logistica: 80,
      margem: 300,
      precoFinal: 2200,
    };

    const steelMind = {
      materiais: 980,
      maoDeObra: 530,
      consumiveis: 100,
      pintura: 210,
      logistica: 90,
      margem: 330,
      precoFinal: 2240,
    };

    const result = analyzeDifferences(official, steelMind);

    expect(result.byCategory.materiais.absoluteError).toBe(20);
    expect(result.byCategory.maoDeObra.absoluteError).toBe(30);
    expect(result.byCategory.precoFinal.percentageError).toBeCloseTo(1.82, 2);
    expect(result.absoluteError).toBe(40);
    expect(result.accumulatedError).toBeGreaterThan(0);
  });
});
