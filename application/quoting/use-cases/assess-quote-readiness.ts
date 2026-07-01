import { parseIntent } from "@/lib/budget/parse-intent";
import type { SteelQuote } from "@/types/budget";
import type { QuoteReadinessReport } from "@/domains/quoting/types";
import { generateGuardrailQuoteV2 } from "@/domains/quoting/services/guardrail-quote-engine-v2";
import { assessQuoteReadiness } from "@/domains/quoting/services/quote-readiness";

function getReviewDetail(report: QuoteReadinessReport): string {
  if (report.level === "ready") {
    return `Pronto para confirmação (${report.score}/100)`;
  }
  if (report.level === "review_required") {
    return `Revisão recomendada (${report.score}/100)`;
  }
  return `Bloqueado: ${report.blockers.length} pendência(s) crítica(s)`;
}

export function applyReadinessToPipeline(
  quote: SteelQuote,
  readiness: QuoteReadinessReport,
): SteelQuote {
  return {
    ...quote,
    pipeline: quote.pipeline.map((step) =>
      step.id === "review"
        ? {
            ...step,
            status:
              readiness.level === "blocked"
                ? "error"
                : readiness.level === "review_required"
                  ? "running"
                  : "done",
            detail: getReviewDetail(readiness),
          }
        : step,
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function assessQuoteReadinessForQuote(
  quote: SteelQuote,
  notesOverride?: string,
): QuoteReadinessReport {
  const notes = notesOverride ?? quote.observacoes;
  const parsedIntent = parseIntent(notes);
  const v2Result = generateGuardrailQuoteV2({
    title: quote.titulo,
    notes,
    marginPercent: quote.custos.margemPercentual,
    includeInstallation: quote.custos.incluiInstalacao,
    includePainting: quote.custos.incluiPintura,
  });

  return assessQuoteReadiness({
    parsedIntent,
    bomOrigins: quote.itens.map((item) => item.origem),
    memorialScope: quote.memorial?.escopo,
    total: quote.custos.total,
    marginPercent: quote.custos.margemPercentual,
    includeInstallation: quote.custos.incluiInstalacao,
    installLocation: quote.custos.localInstalacao,
    v2Warnings: v2Result.warnings,
    v2Confidence: v2Result.confidence,
  });
}
