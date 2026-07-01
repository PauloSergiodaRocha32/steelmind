export type Unit =
  | "m"
  | "m2"
  | "kg"
  | "h"
  | "un"
  | "vb"
  | "percent"
  | "currency_brl";

export interface Money {
  currency: "BRL";
  amount: number;
}

export interface NormCitation {
  code: string;
  title: string;
  section?: string;
}

export interface RuleReference {
  ruleId: string;
  version: string;
  source: string;
  revisionDate: string;
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
