import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadGestioCatalog } from "@/modules/warehouse/application/load-catalog";
import { listQuotes } from "@/lib/persistence/quotes-store";
import { listOpportunities } from "@/lib/persistence/commercial-store";
import { getLatestAgentReport } from "@/lib/persistence/ai-store";
import { getStore, isSupabaseConfigured } from "@/lib/persistence/store";
import { ROLE_PERMISSIONS } from "@/lib/auth/permissions";
import type { SessionUser } from "@/types/auth";

export interface PlatformAIContext {
  user: Pick<SessionUser, "name" | "email" | "role">;
  path: string;
  gestio: {
    synced: boolean;
    produtos: number;
    classificados: number;
    filiais: number;
  } | null;
  counts: {
    opportunities: number;
    quotes: number;
    boms: number;
    requisitions: number;
    movements: number;
  };
  persistence: string;
  supabase: boolean;
  lastAgentRun: {
    score: number;
    status: string;
    finishedAt: string;
  } | null;
  openaiConfigured: boolean;
}

export async function buildPlatformAIContext(
  user: SessionUser,
  path: string,
): Promise<PlatformAIContext> {
  const catalog = loadGestioCatalog();
  const [opportunities, quotes, store, lastReport] = await Promise.all([
    listOpportunities(),
    listQuotes(),
    getStore(),
    getLatestAgentReport(),
  ]);

  return {
    user: { name: user.name, email: user.email, role: user.role },
    path,
    gestio: catalog
      ? {
          synced: true,
          produtos: catalog.stats.totalProdutos,
          classificados: catalog.stats.produtosClassificados,
          filiais: catalog.stats.filiais,
        }
      : null,
    counts: {
      opportunities: opportunities.length,
      quotes: quotes.length,
      boms: store.projectBoms.length,
      requisitions: store.purchaseRequisitions.length,
      movements: store.movementLogs.length,
    },
    persistence: store.backend,
    supabase: isSupabaseConfigured(),
    lastAgentRun: lastReport
      ? {
          score: lastReport.score,
          status: lastReport.status,
          finishedAt: lastReport.finishedAt,
        }
      : null,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
  };
}

export function contextToPrompt(ctx: PlatformAIContext): string {
  return [
    `Usuário: ${ctx.user.name} (${ctx.user.role})`,
    `Página: ${ctx.path}`,
    `Gestio: ${ctx.gestio ? `${ctx.gestio.produtos} produtos, ${ctx.gestio.classificados} classificados` : "NÃO SINCRONIZADO"}`,
    `Pipeline: ${ctx.counts.opportunities} oportunidades, ${ctx.counts.quotes} orçamentos`,
    `Operação: ${ctx.counts.boms} BOMs, ${ctx.counts.requisitions} reqs, ${ctx.counts.movements} movimentações`,
    `Persistência: ${ctx.persistence}${ctx.supabase ? " + Supabase" : ""}`,
    ctx.lastAgentRun
      ? `Último scan agentes: score ${ctx.lastAgentRun.score}/100 (${ctx.lastAgentRun.status})`
      : "Agentes cloud ainda não executados",
    `Permissões do role: ${ROLE_PERMISSIONS[ctx.user.role]?.join(", ")}`,
  ].join("\n");
}

export function readManifestStats() {
  const path = resolve(process.cwd(), "data/gestio/manifest.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8")) as {
    stats?: { totalProdutos?: number; produtosClassificados?: number };
  };
}
