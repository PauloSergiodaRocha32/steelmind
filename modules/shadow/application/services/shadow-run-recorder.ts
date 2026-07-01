import { analyzeDifferences } from "@/modules/shadow/application/services/difference-analyzer";
import type { ShadowRun } from "@/modules/shadow/domain/entities/shadow-run";
import type { BudgetBreakdown } from "@/modules/shadow/domain/value-objects/budget-breakdown";
import type { ShadowRunRepository } from "@/modules/shadow/repository/shadow-run.repository";

export interface RecordShadowRunInput {
  engineVersion: string;
  constitutionVersion: string;
  ruleVersion: string;
  catalogVersion: string;
  estimator: string;
  projectType: string;
  inputSnapshot: Record<string, unknown>;
  outputSnapshot: Record<string, unknown>;
  officialBudget: BudgetBreakdown;
  steelMindBudget: BudgetBreakdown;
  executionTime: number;
  validationStatus?: ShadowRun["validationStatus"];
}

export async function recordShadowRun(
  repository: ShadowRunRepository,
  input: RecordShadowRunInput,
): Promise<ShadowRun> {
  const run: ShadowRun = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    engineVersion: input.engineVersion,
    constitutionVersion: input.constitutionVersion,
    ruleVersion: input.ruleVersion,
    catalogVersion: input.catalogVersion,
    estimator: input.estimator,
    projectType: input.projectType,
    inputSnapshot: input.inputSnapshot,
    outputSnapshot: input.outputSnapshot,
    officialBudget: input.officialBudget,
    steelMindBudget: input.steelMindBudget,
    differences: analyzeDifferences(input.officialBudget, input.steelMindBudget),
    executionTime: input.executionTime,
    validationStatus: input.validationStatus ?? "pending",
  };

  await repository.save(run);
  return run;
}
