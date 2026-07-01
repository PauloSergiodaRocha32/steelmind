import type { BudgetBreakdown } from "@/modules/shadow/domain/value-objects/budget-breakdown";

export type ShadowValidationStatus =
  | "pending"
  | "validated"
  | "rejected"
  | "needs_review";

export interface CategoryDifference {
  official: number;
  steelMind: number;
  absoluteError: number;
  percentageError: number;
  accumulatedError: number;
}

export interface DifferenceSnapshot {
  byCategory: Record<keyof BudgetBreakdown, CategoryDifference>;
  absoluteError: number;
  percentageError: number;
  accumulatedError: number;
}

export interface ShadowRun {
  id: string;
  createdAt: string;
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
  differences: DifferenceSnapshot;
  executionTime: number;
  validationStatus: ShadowValidationStatus;
}
