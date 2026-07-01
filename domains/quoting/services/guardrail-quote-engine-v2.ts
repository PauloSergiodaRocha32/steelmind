import { GUARDA_CORPO_RULEBOOK_V1 } from "@/domains/knowledge/guardrail/rulebook-v1";
import { roundCurrency } from "@/domains/shared/types";
import type {
  CalculationTrace,
  GuardrailQuoteInput,
  GuardrailQuoteResult,
  QuoteLineItemV2,
} from "@/domains/quoting/types";

function getRule(ruleId: string) {
  const rule = GUARDA_CORPO_RULEBOOK_V1.rules.find((item) => item.id === ruleId);
  if (!rule) {
    throw new Error(`Regra ${ruleId} não encontrada no rulebook de guarda-corpo.`);
  }
  return rule;
}

function parseLengthMeters(notes: string): number | null {
  const metersPattern = /(\d+(?:[.,]\d+)?)\s*(?:m|metros?)/i;
  const match = notes.match(metersPattern);
  if (!match?.[1]) return null;
  return Number(match[1].replace(",", "."));
}

function parseMaterial(notes: string): "inox_304" | "aco_carbono" | null {
  if (/inox\s*304|aisi\s*304/i.test(notes)) return "inox_304";
  if (/a[cç]o\s*carbono/i.test(notes)) return "aco_carbono";
  return null;
}

function buildTrace(
  ruleId: string,
  value: number,
  inputs: Record<string, number>,
  confidence: number,
): CalculationTrace {
  const rule = getRule(ruleId);
  return {
    value: roundCurrency(value),
    unit: "currency_brl",
    formula: rule.formula,
    rule: {
      ruleId: rule.id,
      version: rule.version,
      source: rule.source,
      revisionDate: rule.revisionDate,
    },
    inputs,
    assumptions: rule.assumptions,
    limitations: rule.limitations,
    norms: rule.norms,
    confidence,
    calculatedAt: new Date().toISOString(),
  };
}

export function generateGuardrailQuoteV2(
  input: GuardrailQuoteInput,
): GuardrailQuoteResult {
  const warnings: GuardrailQuoteResult["warnings"] = [];

  const lengthMeters =
    input.lengthMeters ?? parseLengthMeters(input.notes) ?? 12;
  if (!input.lengthMeters && !parseLengthMeters(input.notes)) {
    warnings.push({
      code: "LENGTH_ASSUMED",
      message:
        "Comprimento linear não informado explicitamente; assumido 12m para cálculo preliminar.",
    });
  }

  const heightMeters = input.heightMeters ?? 1.1;
  if (!input.heightMeters) {
    warnings.push({
      code: "HEIGHT_ASSUMED",
      message:
        "Altura não informada explicitamente; assumida 1.1m para guarda-corpo padrão.",
    });
  }

  const material =
    input.material ?? parseMaterial(input.notes) ?? "inox_304";
  if (!input.material && !parseMaterial(input.notes)) {
    warnings.push({
      code: "MATERIAL_ASSUMED",
      message:
        "Material não informado explicitamente; assumido INOX 304 conforme tipologia padrão.",
    });
  }

  const includePainting = input.includePainting ?? !/sem\s+pintura/i.test(input.notes);
  const includeInstallation =
    input.includeInstallation ?? /instala/i.test(input.notes);
  const marginPercent = input.marginPercent ?? 30;

  const materialRule = getRule("GRCP-MAT-001");
  const fabricationRule = getRule("GRCP-FAB-001");
  const paintingRule = getRule("GRCP-PNT-001");
  const installationRule = getRule("GRCP-INS-001");

  const materialFactor =
    material === "inox_304"
      ? materialRule.parameters.materialFactorInox304
      : materialRule.parameters.materialFactorCarbono;
  const materialCost =
    lengthMeters * materialRule.parameters.baseMaterialPerMeter * materialFactor;

  const fabricationHours = lengthMeters * fabricationRule.parameters.fabricationHoursPerMeter;
  const fabricationCost = fabricationHours * fabricationRule.parameters.fabricationHourRate;

  const paintArea = lengthMeters * heightMeters * paintingRule.parameters.paintAreaFactor;
  const paintingCost = includePainting
    ? paintArea * paintingRule.parameters.paintingCostPerM2
    : 0;

  const installationCost = includeInstallation
    ? lengthMeters * installationRule.parameters.installationCostPerMeter +
      installationRule.parameters.mobilizationBase
    : 0;

  const lineItems: QuoteLineItemV2[] = [
    {
      id: crypto.randomUUID(),
      code: "GRCP-MATERIAL",
      description: "Materiais estruturais do guarda-corpo",
      quantity: roundCurrency(lengthMeters),
      unit: "m",
      unitPrice: roundCurrency(materialCost / lengthMeters),
      subtotal: roundCurrency(materialCost),
      trace: buildTrace(
        "GRCP-MAT-001",
        materialCost,
        {
          lengthMeters,
          baseMaterialPerMeter: materialRule.parameters.baseMaterialPerMeter,
          materialFactor,
        },
        0.82,
      ),
    },
    {
      id: crypto.randomUUID(),
      code: "GRCP-FABRICACAO",
      description: "Fabricação e soldagem em oficina",
      quantity: roundCurrency(fabricationHours),
      unit: "h",
      unitPrice: fabricationRule.parameters.fabricationHourRate,
      subtotal: roundCurrency(fabricationCost),
      trace: buildTrace(
        "GRCP-FAB-001",
        fabricationCost,
        {
          lengthMeters,
          fabricationHoursPerMeter: fabricationRule.parameters.fabricationHoursPerMeter,
          fabricationHourRate: fabricationRule.parameters.fabricationHourRate,
        },
        0.8,
      ),
    },
  ];

  if (includePainting) {
    lineItems.push({
      id: crypto.randomUUID(),
      code: "GRCP-PINTURA",
      description: "Pintura industrial",
      quantity: roundCurrency(paintArea),
      unit: "m2",
      unitPrice: paintingRule.parameters.paintingCostPerM2,
      subtotal: roundCurrency(paintingCost),
      trace: buildTrace(
        "GRCP-PNT-001",
        paintingCost,
        {
          lengthMeters,
          heightMeters,
          paintAreaFactor: paintingRule.parameters.paintAreaFactor,
          paintingCostPerM2: paintingRule.parameters.paintingCostPerM2,
        },
        0.75,
      ),
    });
  }

  if (includeInstallation) {
    lineItems.push({
      id: crypto.randomUUID(),
      code: "GRCP-INSTALACAO",
      description: "Montagem em campo",
      quantity: roundCurrency(lengthMeters),
      unit: "m",
      unitPrice: roundCurrency(installationCost / lengthMeters),
      subtotal: roundCurrency(installationCost),
      trace: buildTrace(
        "GRCP-INS-001",
        installationCost,
        {
          lengthMeters,
          installationCostPerMeter: installationRule.parameters.installationCostPerMeter,
          mobilizationBase: installationRule.parameters.mobilizationBase,
        },
        0.74,
      ),
    });
  }

  const subtotal = roundCurrency(lineItems.reduce((sum, item) => sum + item.subtotal, 0));
  const marginValue = roundCurrency(subtotal * (marginPercent / 100));
  const total = roundCurrency(subtotal + marginValue);

  const confidenceBase = 0.78;
  const confidencePenalty = warnings.length * 0.04;
  const confidence = Math.max(0.5, roundCurrency(confidenceBase - confidencePenalty));

  return {
    constructiveSystemId: GUARDA_CORPO_RULEBOOK_V1.constructiveSystemId,
    constructiveSystemVersion: GUARDA_CORPO_RULEBOOK_V1.constructiveSystemVersion,
    confidence,
    lineItems,
    subtotal: { currency: "BRL", amount: subtotal },
    marginPercent,
    marginValue: { currency: "BRL", amount: marginValue },
    total: { currency: "BRL", amount: total },
    warnings,
  };
}
