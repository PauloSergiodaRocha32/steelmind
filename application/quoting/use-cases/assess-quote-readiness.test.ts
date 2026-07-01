import { describe, expect, it } from "vitest";
import type { SteelQuote } from "@/types/budget";
import { assessQuoteReadinessForQuote } from "@/application/quoting/use-cases/assess-quote-readiness";

function buildBaseQuote(): SteelQuote {
  const now = new Date().toISOString();
  return {
    id: "quote-1",
    titulo: "Guarda-corpo residencial",
    status: "memorial_ready",
    observacoes: "",
    arquivos: [],
    pipeline: [],
    itens: [],
    custos: {
      materiais: 1000,
      maoDeObra: 500,
      servicos: 300,
      subtotal: 1800,
      margemPercentual: 30,
      margemValor: 540,
      total: 2340,
      prazoDias: 12,
      incluiInstalacao: false,
      incluiPintura: false,
      localInstalacao: null,
    },
    memorial: null,
    mensagens: [],
    aiMode: "steelmind",
    createdAt: now,
    updatedAt: now,
    createdBy: null,
  };
}

describe("assessQuoteReadinessForQuote", () => {
  it("uses structured quote context when notes are empty", () => {
    const quote = buildBaseQuote();
    quote.itens = [
      {
        id: "item-1",
        codigo: null,
        descricao: "Tubo 40x20 mm — Aço carbono",
        material: "Aço carbono",
        quantidade: 22,
        unidade: "m",
        precoUnitario: 28.5,
        subtotal: 627,
        origem: "estimativa",
      },
      {
        id: "item-2",
        codigo: null,
        descricao: "Montagem Guarda-corpo",
        material: "Mão de obra",
        quantidade: 12,
        unidade: "h",
        precoUnitario: 72,
        subtotal: 864,
        origem: "servico",
      },
    ];
    quote.memorial = {
      titulo: "Guarda-corpo — Aço carbono",
      escopo:
        "Fornecimento de guarda-corpo com 10 m lineares aproximados para área interna.",
      especificacoes: [
        "Material principal: Aço carbono",
        "Comprimento total estimado: 10 m",
      ],
      materiais: [],
      processos: [],
      normas: [],
      prazoEntrega: "12 dias úteis",
      observacoes: "",
      geradoEm: new Date().toISOString(),
    };

    const report = assessQuoteReadinessForQuote(quote);

    expect(report.level).not.toBe("blocked");
    expect(report.blockers.some((check) => check.id === "INPUT_PRODUCT_MISSING")).toBe(false);
    expect(report.blockers.some((check) => check.id === "INPUT_MATERIAL_MISSING")).toBe(false);
    expect(report.blockers.some((check) => check.id === "INPUT_LENGTH_MISSING")).toBe(false);
  });

  it("keeps blocking when critical data is truly missing", () => {
    const quote = buildBaseQuote();
    quote.titulo = "Orçamento sem contexto";
    quote.itens = [
      {
        id: "service-1",
        codigo: null,
        descricao: "Serviço de apoio",
        material: "Serviço",
        quantidade: 1,
        unidade: "vb",
        precoUnitario: 300,
        subtotal: 300,
        origem: "servico",
      },
    ];
    quote.custos = {
      ...quote.custos,
      materiais: 0,
      maoDeObra: 0,
      servicos: 300,
      subtotal: 300,
      margemValor: 90,
      total: 390,
    };

    const report = assessQuoteReadinessForQuote(quote);

    expect(report.level).toBe("blocked");
    expect(report.blockers.some((check) => check.id === "INPUT_PRODUCT_MISSING")).toBe(true);
    expect(report.blockers.some((check) => check.id === "INPUT_MATERIAL_MISSING")).toBe(true);
    expect(report.blockers.some((check) => check.id === "INPUT_LENGTH_MISSING")).toBe(true);
  });
});
