import { listOpportunities } from "@/lib/persistence/commercial-store";
import { listQuotes } from "@/lib/persistence/quotes-store";
import { getStore } from "@/lib/persistence/store";
import type { WorkflowSummary, WorkflowStageStatus } from "@/types/workflow";

export async function buildPlatformWorkflow(): Promise<{
  workflows: WorkflowSummary[];
  stats: {
    opportunities: number;
    quotes: number;
    quotesConfirmed: number;
    pipelineValue: number;
  };
}> {
  const [opportunities, quotes, store] = await Promise.all([
    listOpportunities(),
    listQuotes(),
    getStore(),
  ]);

  const workflows: WorkflowSummary[] = opportunities.slice(0, 6).map((opp) => {
    const quote = opp.quoteId ? quotes.find((q) => q.id === opp.quoteId) : null;
    const bom = opp.codigoProjetoGestio
      ? store.projectBoms.find((b) => b.codigoDoProjeto === opp.codigoProjetoGestio)
      : null;

    const stages: WorkflowStageStatus[] = [
      {
        id: "commercial",
        label: "Comercial",
        status: opp.stage === "won" ? "done" : "active",
        detail: `${opp.cliente} · ${opp.stage}`,
        href: "/opportunities",
      },
      {
        id: "budget",
        label: "Orçamento IA",
        status: quote
          ? quote.status === "confirmed"
            ? "done"
            : "active"
          : opp.stage === "proposal"
            ? "blocked"
            : "idle",
        detail: quote
          ? `R$ ${quote.custos.total.toLocaleString("pt-BR")}`
          : "Aguardando copilot",
        href: "/budget",
      },
      {
        id: "engineering",
        label: "Engenharia",
        status: bom ? "done" : quote?.status === "confirmed" ? "active" : "idle",
        detail: bom
          ? `${bom.items.length} itens BOM`
          : opp.codigoProjetoGestio
            ? `Projeto #${opp.codigoProjetoGestio}`
            : "Sem BOM",
        href: "/engineering",
      },
      {
        id: "purchasing",
        label: "Compras",
        status:
          store.purchaseRequisitions.length > 0 ? "active" : "idle",
        detail: `${store.purchaseRequisitions.length} requisições`,
        href: "/purchasing",
      },
      {
        id: "warehouse",
        label: "Almoxarifado",
        status: store.movementLogs.length > 0 ? "active" : "idle",
        detail: `${store.movementLogs.length} movimentações`,
        href: "/warehouse",
      },
      {
        id: "production",
        label: "Produção",
        status: opp.stage === "won" ? "active" : "idle",
        detail: opp.stage === "won" ? "Em execução" : "Aguardando",
        href: "/production",
      },
    ];

    return {
      titulo: opp.titulo,
      valorTotal: quote?.custos.total ?? opp.valorEstimado,
      stages,
      links: {
        opportunityId: opp.id,
        quoteId: opp.quoteId,
        codigoProjetoGestio: opp.codigoProjetoGestio,
      },
    };
  });

  return {
    workflows,
    stats: {
      opportunities: opportunities.length,
      quotes: quotes.length,
      quotesConfirmed: quotes.filter((q) => q.status === "confirmed").length,
      pipelineValue: opportunities.reduce((a, o) => a + o.valorEstimado, 0),
    },
  };
}
