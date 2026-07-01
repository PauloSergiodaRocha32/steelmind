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

function parseLengthMeters(text: string): number | undefined {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(?:m|metros?)/i);
  if (!match?.[1]) return undefined;
  const value = Number(match[1].replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function isNonOperationalMaterial(material: string): boolean {
  return /processo|m[aã]o\s*de\s*obra|servi[cç]o|acabamento/i.test(material);
}

function mapMaterialToV2(material?: string): "inox_304" | "aco_carbono" | undefined {
  if (!material) return undefined;
  if (/inox\s*304|aisi\s*304/i.test(material)) return "inox_304";
  if (/a[cç]o\s*carbono|galvaniz/i.test(material)) return "aco_carbono";
  return undefined;
}

function normalizeReadinessIntent(
  quote: SteelQuote,
  notes: string,
): ReturnType<typeof parseIntent> {
  const parsed = parseIntent(notes);

  const productTexts = [
    quote.titulo,
    quote.memorial?.titulo,
    quote.memorial?.escopo,
    ...(quote.memorial?.especificacoes ?? []),
    ...quote.itens.map((item) => item.descricao),
  ]
    .filter((value): value is string => Boolean(value))
    .join("\n");
  const parsedFromQuote = parseIntent(productTexts);

  if (!parsed.produto) {
    parsed.produto = parsedFromQuote.produto;
  }
  if (!parsed.material) {
    parsed.material =
      parsedFromQuote.material ??
      quote.itens.find((item) => !isNonOperationalMaterial(item.material))?.material;
  }
  if (!parsed.comprimentoMetros) {
    parsed.comprimentoMetros = parseLengthMeters(productTexts);
  }

  return parsed;
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
  const parsedIntent = normalizeReadinessIntent(quote, notes);
  const v2Result = generateGuardrailQuoteV2({
    title: quote.titulo,
    notes,
    lengthMeters: parsedIntent.comprimentoMetros,
    material: mapMaterialToV2(parsedIntent.material),
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
