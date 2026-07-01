import type {
  QuoteEngineWarnings,
  QuoteReadinessCheck,
  QuoteReadinessReport,
} from "@/domains/quoting/types";

export interface ParsedIntentSnapshot {
  produto?: string;
  material?: string;
  comprimentoMetros?: number;
}

export interface QuoteReadinessInput {
  parsedIntent: ParsedIntentSnapshot;
  bomOrigins: Array<"catalogo" | "estimativa" | "servico">;
  memorialScope?: string | null;
  total: number;
  marginPercent: number;
  includeInstallation: boolean;
  installLocation?: string | null;
  v2Warnings: QuoteEngineWarnings[];
  v2Confidence: number;
}

function clampScore(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function dedupeActions(checks: QuoteReadinessCheck[]): string[] {
  const actions = checks.map((check) => check.message);
  return Array.from(new Set(actions));
}

export function assessQuoteReadiness(input: QuoteReadinessInput): QuoteReadinessReport {
  const checks: QuoteReadinessCheck[] = [];

  const pushCheck = (check: QuoteReadinessCheck) => {
    checks.push(check);
  };

  if (!input.parsedIntent.produto) {
    pushCheck({
      id: "INPUT_PRODUCT_MISSING",
      severity: "critical",
      message: "Produto principal não identificado. Informe tipologia (ex.: guarda-corpo, escada).",
      field: "produto",
      source: "input",
    });
  }

  if (!input.parsedIntent.comprimentoMetros) {
    pushCheck({
      id: "INPUT_LENGTH_MISSING",
      severity: "critical",
      message: "Comprimento linear não informado. Defina metragem para evitar sub/super orçamento.",
      field: "comprimentoMetros",
      source: "input",
    });
  }

  if (!input.parsedIntent.material) {
    pushCheck({
      id: "INPUT_MATERIAL_MISSING",
      severity: "critical",
      message: "Material principal não informado. Defina material para reduzir risco de divergência.",
      field: "material",
      source: "input",
    });
  }

  if (input.bomOrigins.length === 0) {
    pushCheck({
      id: "BOM_EMPTY",
      severity: "critical",
      message: "BOM vazia. Inclua materiais e serviços antes da confirmação.",
      field: "itens",
      source: "bom",
    });
  } else {
    const nonService = input.bomOrigins.filter((origin) => origin !== "servico");
    const catalogBased = nonService.filter((origin) => origin === "catalogo");
    const catalogCoverage =
      nonService.length > 0 ? catalogBased.length / nonService.length : 0;

    if (nonService.length > 0 && catalogCoverage < 0.6) {
      pushCheck({
        id: "BOM_LOW_CATALOG_COVERAGE",
        severity: "warning",
        message:
          "Cobertura de catálogo baixa na BOM. Priorize itens com preço rastreável para compras.",
        source: "bom",
      });
    }
  }

  if (!input.memorialScope?.trim()) {
    pushCheck({
      id: "MEMORIAL_SCOPE_MISSING",
      severity: "warning",
      message: "Memorial sem escopo claro. Complete o descritivo técnico antes de enviar ao cliente.",
      field: "memorial.escopo",
      source: "memorial",
    });
  }

  if (input.total <= 0) {
    pushCheck({
      id: "PRICING_TOTAL_INVALID",
      severity: "critical",
      message: "Total inválido (<= 0). Revise custos e itens da composição.",
      field: "custos.total",
      source: "pricing",
    });
  }

  if (input.marginPercent <= 0) {
    pushCheck({
      id: "PRICING_MARGIN_INVALID",
      severity: "critical",
      message: "Margem inválida (<= 0). Defina margem positiva para preservar viabilidade comercial.",
      field: "custos.margemPercentual",
      source: "pricing",
    });
  } else if (input.marginPercent < 5 || input.marginPercent > 60) {
    pushCheck({
      id: "PRICING_MARGIN_OUTLIER",
      severity: "warning",
      message:
        "Margem fora da faixa operacional recomendada (5% a 60%). Revisar antes da confirmação.",
      field: "custos.margemPercentual",
      source: "pricing",
    });
  }

  if (input.includeInstallation && !input.installLocation?.trim()) {
    pushCheck({
      id: "INSTALLATION_LOCATION_MISSING",
      severity: "warning",
      message:
        "Instalação marcada sem local definido. Informe cidade/local para estimar logística com precisão.",
      field: "custos.localInstalacao",
      source: "input",
    });
  }

  for (const warning of input.v2Warnings) {
    pushCheck({
      id: `V2_${warning.code}`,
      severity: "warning",
      message: warning.message,
      source: "rule_engine_v2",
    });
  }

  if (input.v2Confidence < 0.6) {
    pushCheck({
      id: "V2_CONFIDENCE_CRITICAL",
      severity: "critical",
      message:
        "Confiança do motor técnico V2 abaixo do mínimo (0.60). Completar dados obrigatórios antes de confirmar.",
      source: "rule_engine_v2",
    });
  } else if (input.v2Confidence < 0.75) {
    pushCheck({
      id: "V2_CONFIDENCE_LOW",
      severity: "warning",
      message:
        "Confiança do motor técnico V2 abaixo do alvo (0.75). Recomenda-se revisão das premissas.",
      source: "rule_engine_v2",
    });
  }

  const blockers = checks.filter((check) => check.severity === "critical");
  const warnings = checks.filter((check) => check.severity === "warning");
  const infos = checks.filter((check) => check.severity === "info");

  const level: QuoteReadinessReport["level"] =
    blockers.length > 0 ? "blocked" : warnings.length > 0 ? "review_required" : "ready";

  const score = clampScore(100 - blockers.length * 30 - warnings.length * 8 - infos.length * 3);

  return {
    level,
    score,
    checks,
    blockers,
    recommendedActions: dedupeActions(level === "ready" ? [] : checks),
    generatedAt: new Date().toISOString(),
  };
}
