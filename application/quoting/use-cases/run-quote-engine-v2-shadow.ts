import { getFeatureFlags } from "@/lib/config/feature-flags";
import { generateGuardrailQuoteV2 } from "@/domains/quoting/services/guardrail-quote-engine-v2";
import type { BudgetBreakdown } from "@/modules/shadow";
import {
  FileShadowRunRepository,
  analyzeDifferences,
  recordShadowRun,
} from "@/modules/shadow";
import type { UploadedFileMeta } from "@/types/budget";
import { resolve } from "node:path";

interface RunQuoteEngineV2ShadowInput {
  title: string;
  notes: string;
  files: UploadedFileMeta[];
  legacyTotal: number;
  legacyBreakdown: BudgetBreakdown;
  requestedBy: string;
  constitutionVersion?: string;
  ruleVersion?: string;
  catalogVersion?: string;
  projectType?: string;
  estimator?: string;
}

export interface QuoteEngineV2ShadowResult {
  v2Total: number;
  legacyTotal: number;
  deltaAmount: number;
  deltaPercent: number;
  confidence: number;
  warningCount: number;
}

function v2BreakdownToBudget(v2: ReturnType<typeof generateGuardrailQuoteV2>): BudgetBreakdown {
  const materials = v2.lineItems
    .filter((item) => item.code === "GRCP-MATERIAL")
    .reduce((sum, item) => sum + item.subtotal, 0);
  const labor = v2.lineItems
    .filter((item) => item.code === "GRCP-FABRICACAO")
    .reduce((sum, item) => sum + item.subtotal, 0);
  const painting = v2.lineItems
    .filter((item) => item.code === "GRCP-PINTURA")
    .reduce((sum, item) => sum + item.subtotal, 0);
  const logistics = v2.lineItems
    .filter((item) => item.code === "GRCP-INSTALACAO")
    .reduce((sum, item) => sum + item.subtotal, 0);

  return {
    materiais: Number(materials.toFixed(2)),
    maoDeObra: Number(labor.toFixed(2)),
    consumiveis: 0,
    pintura: Number(painting.toFixed(2)),
    logistica: Number(logistics.toFixed(2)),
    margem: Number(v2.marginValue.amount.toFixed(2)),
    precoFinal: Number(v2.total.amount.toFixed(2)),
  };
}

export async function runQuoteEngineV2Shadow(
  input: RunQuoteEngineV2ShadowInput,
): Promise<QuoteEngineV2ShadowResult | null> {
  const flags = getFeatureFlags();
  if (!flags.quoteEngineV2ShadowMode) return null;
  const start = Date.now();

  const v2 = generateGuardrailQuoteV2({
    title: input.title,
    notes: input.notes,
  });
  const steelMindBudget = v2BreakdownToBudget(v2);
  const differences = analyzeDifferences(input.legacyBreakdown, steelMindBudget);

  const deltaAmount = Number((v2.total.amount - input.legacyTotal).toFixed(2));
  const deltaPercent =
    input.legacyTotal > 0
      ? Number(((deltaAmount / input.legacyTotal) * 100).toFixed(2))
      : 0;

  const shadowResult: QuoteEngineV2ShadowResult = {
    v2Total: v2.total.amount,
    legacyTotal: input.legacyTotal,
    deltaAmount,
    deltaPercent,
    confidence: v2.confidence,
    warningCount: v2.warnings.length,
  };

  const repository = new FileShadowRunRepository(
    resolve(process.cwd(), "data/steelmind/shadow/shadow-runs.json"),
  );

  await recordShadowRun(repository, {
    engineVersion: "quote-engine-v2-shadow",
    constitutionVersion: input.constitutionVersion ?? "1.0",
    ruleVersion: input.ruleVersion ?? "guardrail-rulebook-v1.0.0",
    catalogVersion: input.catalogVersion ?? "unknown",
    estimator: input.estimator ?? "legacy-vs-v2-shadow",
    projectType: input.projectType ?? "guarda-corpo",
    inputSnapshot: {
      title: input.title,
      notes: input.notes,
      files: input.files,
    },
    outputSnapshot: {
      constructiveSystem: `${v2.constructiveSystemId}@${v2.constructiveSystemVersion}`,
      confidence: v2.confidence,
      warnings: v2.warnings,
      differences,
    },
    officialBudget: input.legacyBreakdown,
    steelMindBudget,
    executionTime: Date.now() - start,
    validationStatus: "pending",
  });

  console.info(
    "[quote-engine-v2-shadow]",
    JSON.stringify({
      requestedBy: input.requestedBy,
      title: input.title,
      files: input.files.map((file) => file.name),
      result: shadowResult,
      differences,
      constructiveSystem: `${v2.constructiveSystemId}@${v2.constructiveSystemVersion}`,
      evaluatedAt: new Date().toISOString(),
    }),
  );

  return shadowResult;
}
