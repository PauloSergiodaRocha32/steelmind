import {
  BUDGET_CATEGORIES,
  type BudgetBreakdown,
} from "@/modules/shadow/domain/value-objects/budget-breakdown";
import type {
  CategoryDifference,
  DifferenceSnapshot,
} from "@/modules/shadow/domain/entities/shadow-run";

function safePercent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return (numerator / denominator) * 100;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function analyzeDifferences(
  officialBudget: BudgetBreakdown,
  steelMindBudget: BudgetBreakdown,
): DifferenceSnapshot {
  let accumulatedError = 0;
  const byCategory = {} as Record<keyof BudgetBreakdown, CategoryDifference>;

  for (const category of BUDGET_CATEGORIES) {
    const official = officialBudget[category];
    const steelMind = steelMindBudget[category];
    const absoluteError = Math.abs(steelMind - official);
    accumulatedError += absoluteError;

    byCategory[category] = {
      official: round(official),
      steelMind: round(steelMind),
      absoluteError: round(absoluteError),
      percentageError: round(
        safePercent(steelMind - official, official),
      ),
      accumulatedError: round(accumulatedError),
    };
  }

  const finalOfficial = officialBudget.precoFinal;
  const finalSteelMind = steelMindBudget.precoFinal;
  const absoluteError = Math.abs(finalSteelMind - finalOfficial);
  const percentageError = safePercent(finalSteelMind - finalOfficial, finalOfficial);

  return {
    byCategory,
    absoluteError: round(absoluteError),
    percentageError: round(percentageError),
    accumulatedError: round(accumulatedError),
  };
}
