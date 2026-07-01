export const BUDGET_CATEGORIES = [
  "materiais",
  "maoDeObra",
  "consumiveis",
  "pintura",
  "logistica",
  "margem",
  "precoFinal",
] as const;

export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export type BudgetBreakdown = Record<BudgetCategory, number>;

export const EMPTY_BUDGET_BREAKDOWN: BudgetBreakdown = {
  materiais: 0,
  maoDeObra: 0,
  consumiveis: 0,
  pintura: 0,
  logistica: 0,
  margem: 0,
  precoFinal: 0,
};
