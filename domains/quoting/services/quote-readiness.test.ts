import { describe, expect, it } from "vitest";
import { assessQuoteReadiness } from "@/domains/quoting/services/quote-readiness";

describe("assessQuoteReadiness", () => {
  it("returns blocked when critical inputs are missing", () => {
    const report = assessQuoteReadiness({
      parsedIntent: {},
      bomOrigins: [],
      memorialScope: "",
      total: 0,
      marginPercent: 0,
      includeInstallation: false,
      installLocation: null,
      v2Warnings: [],
      v2Confidence: 0.55,
    });

    expect(report.level).toBe("blocked");
    expect(report.blockers.length).toBeGreaterThan(0);
    expect(report.score).toBeLessThan(50);
  });

  it("returns review_required when only warnings exist", () => {
    const report = assessQuoteReadiness({
      parsedIntent: {
        produto: "Guarda-corpo",
        material: "INOX 304",
        comprimentoMetros: 12,
      },
      bomOrigins: ["catalogo", "estimativa", "servico"],
      memorialScope: "Escopo preliminar",
      total: 10000,
      marginPercent: 65,
      includeInstallation: true,
      installLocation: null,
      v2Warnings: [
        {
          code: "HEIGHT_ASSUMED",
          message: "Altura assumida em 1.1m",
        },
      ],
      v2Confidence: 0.73,
    });

    expect(report.level).toBe("review_required");
    expect(report.blockers).toHaveLength(0);
    expect(report.checks.some((check) => check.severity === "warning")).toBe(true);
  });

  it("returns ready when quote has no blockers or warnings", () => {
    const report = assessQuoteReadiness({
      parsedIntent: {
        produto: "Guarda-corpo",
        material: "INOX 304",
        comprimentoMetros: 14,
      },
      bomOrigins: ["catalogo", "catalogo", "servico"],
      memorialScope: "Fornecimento e instalação de guarda-corpo em aço inox.",
      total: 28000,
      marginPercent: 28,
      includeInstallation: true,
      installLocation: "Campinas",
      v2Warnings: [],
      v2Confidence: 0.81,
    });

    expect(report.level).toBe("ready");
    expect(report.blockers).toHaveLength(0);
    expect(report.checks).toHaveLength(0);
    expect(report.score).toBe(100);
  });
});
