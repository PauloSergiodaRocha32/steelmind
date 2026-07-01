import { loadGestioCatalog } from "@/modules/warehouse/application/load-catalog";
import { analyzeQuote, confirmQuote } from "@/lib/budget/ai-engine";
import { createOpportunity, saveOpportunity } from "@/lib/persistence/commercial-store";
import { saveQuote } from "@/lib/persistence/quotes-store";
import {
  logMovement,
  saveProjectBom,
  savePurchaseRequisition,
} from "@/lib/persistence/store";
import { runOrchestrator } from "@/lib/ai/agents/orchestrator";
import { saveAgentReport } from "@/lib/persistence/ai-store";
import type { BomItem } from "@/types/steelmind-store";
import type { CommercialOpportunity } from "@/types/commercial";
import type { SteelQuote } from "@/types/budget";

export const DEMO_PROJECT_CODE = 9001;
export const DEMO_PROJECT_TITLE =
  "Guarda-corpo INOX 304 — Condomínio Vista Verde Campinas";

/** Lista diversificada de materiais para o projeto demo (IDs reais do catálogo Gestio). */
export const DEMO_BOM_CATALOG: Array<{
  idProd: number;
  quantidade: number;
  unidade: string;
  categoria: string;
}> = [
  { idProd: 79, quantidade: 18, unidade: "m", categoria: "INOX 304 — Canaleta" },
  { idProd: 372, quantidade: 24, unidade: "m", categoria: "Cantoneira 2×2×3 mm" },
  { idProd: 374, quantidade: 12, unidade: "m", categoria: "Cantoneira 2.5×2.5×4.75 mm" },
  { idProd: 2245, quantidade: 2, unidade: "kg", categoria: "Arame MIG 0,8 mm" },
  { idProd: 311, quantidade: 5, unidade: "kg", categoria: "Eletrodo E6013 2,5 mm" },
  { idProd: 2223, quantidade: 8, unidade: "un", categoria: "Disco corte 115 mm" },
  { idProd: 2132, quantidade: 6, unidade: "un", categoria: "Dobradiça industrial 10\"" },
  { idProd: 2161, quantidade: 120, unidade: "un", categoria: "Parafuso auto-brocante" },
  { idProd: 2162, quantidade: 80, unidade: "un", categoria: "Parafuso hex 25 mm" },
  { idProd: 313, quantidade: 1.5, unidade: "kg", categoria: "Arame MIG reserva" },
  { idProd: 2224, quantidade: 4, unidade: "un", categoria: "Disco corte 230 mm" },
  { idProd: 2133, quantidade: 4, unidade: "un", categoria: "Dobradiça industrial 3\"" },
];

export interface DemoProjectStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
  href?: string;
}

export interface DemoProjectResult {
  opportunity: CommercialOpportunity;
  quote: SteelQuote;
  bomItemCount: number;
  requisitionId: string;
  movementsLogged: number;
  agentScore: number;
  steps: DemoProjectStep[];
  itemList: Array<{
    idProd: number;
    descricao: string;
    quantidade: number;
    unidade: string;
    categoria: string;
  }>;
}

function resolveBomItems(): BomItem[] {
  const catalog = loadGestioCatalog();
  return DEMO_BOM_CATALOG.map((entry) => {
    const prod = catalog?.produtos.find((p) => p.idProd === entry.idProd);
    return {
      idProd: entry.idProd,
      codigo: prod?.codigoInterno ?? null,
      descricao: prod?.descricaoDoProduto ?? `Produto #${entry.idProd}`,
      material: entry.categoria.split("—")[0]?.trim() ?? "Aço",
      quantidade: entry.quantidade,
      unidade: entry.unidade,
    };
  });
}

export async function runDemoProject(createdBy: string): Promise<DemoProjectResult> {
  const steps: DemoProjectStep[] = [
    { id: "commercial", label: "1. Oportunidade comercial", status: "pending", href: "/opportunities" },
    { id: "budget", label: "2. Orçamento IA + memorial", status: "pending", href: "/budget" },
    { id: "engineering", label: "3. BOM engenharia (12+ itens)", status: "pending", href: "/engineering" },
    { id: "purchasing", label: "4. Requisição de compras", status: "pending", href: "/purchasing" },
    { id: "warehouse", label: "5. Saída almoxarifado", status: "pending", href: "/warehouse" },
    { id: "production", label: "6. Produção — projeto ganho", status: "pending", href: "/production" },
    { id: "agents", label: "7. Scan cloud agentes", status: "pending", href: "/ai" },
  ];

  const setStep = (id: string, patch: Partial<DemoProjectStep>) => {
    const idx = steps.findIndex((s) => s.id === id);
    if (idx >= 0) steps[idx] = { ...steps[idx], ...patch };
  };

  // Step 1 — Commercial
  setStep("commercial", { status: "running" });
  let opp = await createOpportunity({
    titulo: DEMO_PROJECT_TITLE,
    cliente: "Construtora Horizonte Premium",
    contato: "engenharia@horizonte.com.br",
    valorEstimado: 0,
    stage: "lead",
    observacoes:
      "Projeto demo SteelMind — guarda-corpo INOX 304, 45 m lineares, instalação Campinas",
    quoteId: null,
    codigoProjetoGestio: DEMO_PROJECT_CODE,
    createdBy,
  });
  setStep("commercial", { status: "done", detail: `Oportunidade ${opp.id.slice(0, 8)}…` });

  // Step 2 — Budget AI
  setStep("budget", { status: "running" });
  let quote = await analyzeQuote(
    {
      titulo: DEMO_PROJECT_TITLE,
      observacoes:
        "Guarda-corpo INOX 304 AISI, 45 metros lineares, tubo 40x20 e cantoneira 50x50, " +
        "margem 32%, prazo 18 dias, com instalação em Campinas, pintura eletrostática RAL 9003. " +
        "Incluir solda MIG, dobradiças, parafusos e discos de corte.",
      arquivos: [
        { name: "guarda-corpo-vista-verde.dwg", type: "application/acad", size: 245000 },
        { name: "memorial-tecnico.pdf", type: "application/pdf", size: 89000 },
      ],
    },
    createdBy,
  );
  quote = confirmQuote(quote);
  await saveQuote(quote);

  opp = await saveOpportunity({
    ...opp,
    stage: "proposal",
    quoteId: quote.id,
    valorEstimado: quote.custos.total,
    updatedAt: new Date().toISOString(),
  });
  setStep("budget", {
    status: "done",
    detail: `${quote.itens.length} itens · R$ ${quote.custos.total.toLocaleString("pt-BR")}`,
  });

  // Step 3 — Engineering BOM
  setStep("engineering", { status: "running" });
  const bomItems = resolveBomItems();
  await saveProjectBom({
    codigoDoProjeto: DEMO_PROJECT_CODE,
    descricaoDoProjeto: DEMO_PROJECT_TITLE,
    items: bomItems,
    updatedAt: new Date().toISOString(),
  });
  setStep("engineering", { status: "done", detail: `${bomItems.length} materiais no BOM` });

  // Step 4 — Purchasing
  setStep("purchasing", { status: "running" });
  const req = await savePurchaseRequisition({
    descricao: `Req. materiais — ${DEMO_PROJECT_TITLE}`,
    codigoDaFilial: 1,
    codigoDoProjeto: DEMO_PROJECT_CODE,
    status: "pending",
    items: bomItems.slice(0, 8).map((item) => ({
      idProd: item.idProd,
      codigo: item.codigo,
      descricao: item.descricao,
      quantidade: item.quantidade,
      motivo: "Projeto demo — reserva para produção",
    })),
    createdBy,
  });
  setStep("purchasing", { status: "done", detail: `${req.items.length} itens na requisição` });

  // Step 5 — Warehouse movements (local log)
  setStep("warehouse", { status: "running" });
  let movementsLogged = 0;
  for (const item of bomItems.slice(0, 4)) {
    await logMovement({
      tipo: "saida",
      codigoDaFilial: 1,
      idProd: item.idProd,
      codigoInterno: item.codigo,
      quantidade: Math.min(item.quantidade, 10),
      codigoDoProjeto: DEMO_PROJECT_CODE,
      gestioNumero: null,
      observacao: `Saída demo — ${DEMO_PROJECT_TITLE}`,
      createdBy,
    });
    movementsLogged++;
  }
  setStep("warehouse", { status: "done", detail: `${movementsLogged} movimentações registradas` });

  // Step 6 — Production (mark won)
  setStep("production", { status: "running" });
  opp = await saveOpportunity({
    ...opp,
    stage: "won",
    updatedAt: new Date().toISOString(),
  });
  setStep("production", { status: "done", detail: "Oportunidade marcada como Ganho" });

  // Step 7 — Cloud agents
  setStep("agents", { status: "running" });
  const report = await runOrchestrator(createdBy);
  await saveAgentReport(report);
  setStep("agents", { status: "done", detail: `Score ${report.score}/100` });

  const catalog = loadGestioCatalog();
  const itemList = DEMO_BOM_CATALOG.map((entry) => {
    const prod = catalog?.produtos.find((p) => p.idProd === entry.idProd);
    return {
      idProd: entry.idProd,
      descricao: prod?.descricaoDoProduto ?? `Produto #${entry.idProd}`,
      quantidade: entry.quantidade,
      unidade: entry.unidade,
      categoria: entry.categoria,
    };
  });

  return {
    opportunity: opp,
    quote,
    bomItemCount: bomItems.length,
    requisitionId: req.id,
    movementsLogged,
    agentScore: report.score,
    steps,
    itemList,
  };
}
