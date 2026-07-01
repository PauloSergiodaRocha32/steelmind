import { getFeatureFlags } from "@/lib/config/feature-flags";
import { generateGuardrailQuoteV2 } from "@/domains/quoting/services/guardrail-quote-engine-v2";
import type { UploadedFileMeta } from "@/types/budget";

interface RunQuoteEngineV2ShadowInput {
  title: string;
  notes: string;
  files: UploadedFileMeta[];
  legacyTotal: number;
  requestedBy: string;
}

export interface QuoteEngineV2ShadowResult {
  v2Total: number;
  legacyTotal: number;
  deltaAmount: number;
  deltaPercent: number;
  confidence: number;
  warningCount: number;
}

export function runQuoteEngineV2Shadow(
  input: RunQuoteEngineV2ShadowInput,
): QuoteEngineV2ShadowResult | null {
  const flags = getFeatureFlags();
  if (!flags.quoteEngineV2ShadowMode) return null;

  const v2 = generateGuardrailQuoteV2({
    title: input.title,
    notes: input.notes,
  });

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

  console.info(
    "[quote-engine-v2-shadow]",
    JSON.stringify({
      requestedBy: input.requestedBy,
      title: input.title,
      files: input.files.map((file) => file.name),
      result: shadowResult,
      constructiveSystem: `${v2.constructiveSystemId}@${v2.constructiveSystemVersion}`,
      evaluatedAt: new Date().toISOString(),
    }),
  );

  return shadowResult;
}
