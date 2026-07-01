export type {
  ShadowRun,
  ShadowValidationStatus,
  DifferenceSnapshot,
  CategoryDifference,
} from "@/modules/shadow/domain/entities/shadow-run";
export type {
  BudgetBreakdown,
  BudgetCategory,
} from "@/modules/shadow/domain/value-objects/budget-breakdown";
export { BUDGET_CATEGORIES, EMPTY_BUDGET_BREAKDOWN } from "@/modules/shadow/domain/value-objects/budget-breakdown";
export { analyzeDifferences } from "@/modules/shadow/application/services/difference-analyzer";
export {
  recordShadowRun,
  type RecordShadowRunInput,
} from "@/modules/shadow/application/services/shadow-run-recorder";
export type { ShadowRunRepository } from "@/modules/shadow/repository/shadow-run.repository";
export { FileShadowRunRepository } from "@/modules/shadow/infrastructure/file-shadow-run.repository";
export { MemoryShadowRunRepository } from "@/modules/shadow/infrastructure/memory-shadow-run.repository";
