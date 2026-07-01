import type { Money, NormCitation, RuleReference, Unit } from "@/domains/shared/types";

export interface CalculationTrace {
  value: number;
  unit: Unit;
  formula: string;
  rule: RuleReference;
  inputs: Record<string, number>;
  assumptions: string[];
  limitations: string[];
  norms: NormCitation[];
  confidence: number;
  calculatedAt: string;
}

export interface QuoteLineItemV2 {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
  subtotal: number;
  trace: CalculationTrace;
}

export interface QuoteEngineWarnings {
  code: string;
  message: string;
}

export interface GuardrailQuoteInput {
  title: string;
  notes: string;
  lengthMeters?: number;
  heightMeters?: number;
  material?: "inox_304" | "aco_carbono";
  includePainting?: boolean;
  includeInstallation?: boolean;
  marginPercent?: number;
}

export interface GuardrailQuoteResult {
  constructiveSystemId: string;
  constructiveSystemVersion: string;
  confidence: number;
  lineItems: QuoteLineItemV2[];
  subtotal: Money;
  marginPercent: number;
  marginValue: Money;
  total: Money;
  warnings: QuoteEngineWarnings[];
}
