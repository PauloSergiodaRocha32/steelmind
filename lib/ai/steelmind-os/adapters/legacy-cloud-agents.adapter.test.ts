import { describe, expect, it } from "vitest";
import { createLegacyCouncilAgents } from "@/lib/ai/steelmind-os/adapters/legacy-cloud-agents.adapter";
import { normalizeAgentRequest } from "@/lib/ai/steelmind-os/protocol";
import type { PlatformAIContext } from "@/lib/ai/context-builder";
import type { SteelQuote } from "@/types/budget";

function buildContext(): PlatformAIContext {
  return {
    user: { name: "Admin", email: "admin@inglesametais.com", role: "admin" },
    path: "/ai",
    gestio: {
      synced: true,
      produtos: 200,
      classificados: 180,
      filiais: 2,
    },
    counts: {
      opportunities: 5,
      quotes: 8,
      boms: 3,
      requisitions: 4,
      movements: 12,
    },
    persistence: "local-json",
    supabase: false,
    lastAgentRun: {
      score: 92,
      status: "pass",
      finishedAt: new Date().toISOString(),
    },
    openaiConfigured: false,
  };
}

function buildQuote(): SteelQuote {
  const now = new Date().toISOString();
  return {
    id: "quote-1",
    titulo: "Guarda-corpo residencial",
    status: "memorial_ready",
    observacoes: "Aco carbono com 10m",
    arquivos: [],
    pipeline: [],
    itens: [
      {
        id: "item-1",
        codigo: null,
        descricao: "Tubo 40x20 mm",
        material: "Aco carbono",
        quantidade: 10,
        unidade: "m",
        precoUnitario: 30,
        subtotal: 300,
        origem: "estimativa",
      },
    ],
    custos: {
      materiais: 300,
      maoDeObra: 100,
      servicos: 0,
      subtotal: 400,
      margemPercentual: 30,
      margemValor: 120,
      total: 520,
      prazoDias: 10,
      incluiInstalacao: false,
      incluiPintura: false,
      localInstalacao: null,
    },
    memorial: {
      titulo: "Guarda-corpo",
      escopo: "Fornecimento e instalacao de guarda-corpo em aco carbono com 10 metros.",
      especificacoes: ["Aco carbono"],
      materiais: [],
      processos: [],
      normas: [],
      prazoEntrega: "10 dias",
      observacoes: "",
      geradoEm: now,
    },
    mensagens: [],
    aiMode: "steelmind",
    createdAt: now,
    updatedAt: now,
    createdBy: null,
  };
}

describe("legacy-cloud-agents.adapter", () => {
  it("uses knowledge engine with protocol payload context", async () => {
    const agents = createLegacyCouncilAgents();
    const knowledge = agents.find((agent) => agent.id === "knowledge");
    expect(knowledge).toBeTruthy();

    const previousKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const request = normalizeAgentRequest({
        requestedBy: "test",
        target: "knowledge",
        capability: "knowledge.execute",
        prompt: "Quero status do pipeline",
        context: {
          references: [{ kind: "constitution", ref: "CONSTITUTION_V2.md#4" }],
          payload: {
            message: "status do pipeline",
            aiContext: buildContext(),
          },
        },
      });

      const response = await knowledge!.execute(request);
      expect(response.status).toBe("approved");
      expect(response.payload).toHaveProperty("content");
      expect(response.payload).toHaveProperty("mode");
    } finally {
      if (previousKey) {
        process.env.OPENAI_API_KEY = previousKey;
      }
    }
  });

  it("uses budget readiness engine when quote payload exists", async () => {
    const agents = createLegacyCouncilAgents();
    const budget = agents.find((agent) => agent.id === "budget");
    expect(budget).toBeTruthy();

    const request = normalizeAgentRequest({
      requestedBy: "test",
      target: "budget",
      capability: "budget.analyze",
      prompt: "Analise prontidao",
      context: {
        references: [{ kind: "adr", ref: "ADR-013" }],
        payload: {
          quote: buildQuote(),
        },
      },
    });

    const response = await budget!.execute(request);
    expect(["approved", "needs_input", "refused"]).toContain(response.status);
    expect(response.payload).toHaveProperty("readiness");
  });
});
