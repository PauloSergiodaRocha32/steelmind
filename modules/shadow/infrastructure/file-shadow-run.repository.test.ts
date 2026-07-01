import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { FileShadowRunRepository } from "@/modules/shadow/infrastructure/file-shadow-run.repository";
import type { ShadowRun } from "@/modules/shadow/domain/entities/shadow-run";

describe("FileShadowRunRepository", () => {
  it("should persist, retrieve and list shadow runs", async () => {
    const dir = await mkdtemp(join(tmpdir(), "shadow-run-test-"));
    const file = join(dir, "shadow-runs.json");
    const repository = new FileShadowRunRepository(file);

    const run: ShadowRun = {
      id: "run-1",
      createdAt: "2026-07-01T00:00:00.000Z",
      engineVersion: "v2.0.0",
      constitutionVersion: "1.0",
      ruleVersion: "guardrail-v1",
      catalogVersion: "catalog-2026-07-01",
      estimator: "shadow",
      projectType: "guarda-corpo",
      inputSnapshot: { comprimento: 10 },
      outputSnapshot: { total: 2200 },
      officialBudget: {
        materiais: 1000,
        maoDeObra: 500,
        consumiveis: 120,
        pintura: 200,
        logistica: 80,
        margem: 300,
        precoFinal: 2200,
      },
      steelMindBudget: {
        materiais: 980,
        maoDeObra: 530,
        consumiveis: 100,
        pintura: 210,
        logistica: 90,
        margem: 330,
        precoFinal: 2240,
      },
      differences: {
        byCategory: {
          materiais: {
            official: 1000,
            steelMind: 980,
            absoluteError: 20,
            percentageError: -2,
            accumulatedError: 20,
          },
          maoDeObra: {
            official: 500,
            steelMind: 530,
            absoluteError: 30,
            percentageError: 6,
            accumulatedError: 50,
          },
          consumiveis: {
            official: 120,
            steelMind: 100,
            absoluteError: 20,
            percentageError: -16.67,
            accumulatedError: 70,
          },
          pintura: {
            official: 200,
            steelMind: 210,
            absoluteError: 10,
            percentageError: 5,
            accumulatedError: 80,
          },
          logistica: {
            official: 80,
            steelMind: 90,
            absoluteError: 10,
            percentageError: 12.5,
            accumulatedError: 90,
          },
          margem: {
            official: 300,
            steelMind: 330,
            absoluteError: 30,
            percentageError: 10,
            accumulatedError: 120,
          },
          precoFinal: {
            official: 2200,
            steelMind: 2240,
            absoluteError: 40,
            percentageError: 1.82,
            accumulatedError: 160,
          },
        },
        absoluteError: 40,
        percentageError: 1.82,
        accumulatedError: 160,
      },
      executionTime: 182,
      validationStatus: "pending",
    };

    await repository.save(run);
    const found = await repository.getById("run-1");
    const list = await repository.list();

    expect(found).not.toBeNull();
    expect(found?.engineVersion).toBe("v2.0.0");
    expect(list).toHaveLength(1);

    await rm(dir, { recursive: true, force: true });
  });
});
