import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CommercialOpportunity } from "@/types/commercial";

const OPPS_PATH = resolve(process.cwd(), "data/steelmind/opportunities.json");

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function ensureDir() {
  const dir = resolve(process.cwd(), "data/steelmind");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readLocal(): CommercialOpportunity[] {
  ensureDir();
  if (!existsSync(OPPS_PATH)) {
    const seed: CommercialOpportunity[] = [
      {
        id: crypto.randomUUID(),
        titulo: "Guarda-corpo condomínio Campinas",
        cliente: "Construtora Horizonte",
        contato: "contato@horizonte.com.br",
        valorEstimado: 18500,
        stage: "proposal",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        titulo: "Estrutura metálica galpão IM Soluções",
        cliente: "Inglesa Metais Soluções",
        valorEstimado: 92000,
        stage: "qualification",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    writeFileSync(OPPS_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(readFileSync(OPPS_PATH, "utf-8")) as CommercialOpportunity[];
}

function writeLocal(opps: CommercialOpportunity[]) {
  ensureDir();
  writeFileSync(OPPS_PATH, JSON.stringify(opps, null, 2));
}

function rowToOpp(row: Record<string, unknown>): CommercialOpportunity {
  return {
    id: String(row.id),
    titulo: String(row.titulo),
    cliente: String(row.cliente),
    contato: row.contato ? String(row.contato) : null,
    valorEstimado: Number(row.valor_estimado ?? 0),
    stage: row.stage as CommercialOpportunity["stage"],
    quoteId: row.quote_id ? String(row.quote_id) : null,
    codigoProjetoGestio: row.codigo_projeto_gestio
      ? Number(row.codigo_projeto_gestio)
      : null,
    observacoes: row.observacoes ? String(row.observacoes) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : null,
  };
}

function oppToRow(opp: CommercialOpportunity) {
  return {
    id: opp.id,
    titulo: opp.titulo,
    cliente: opp.cliente,
    contato: opp.contato,
    valor_estimado: opp.valorEstimado,
    stage: opp.stage,
    quote_id: opp.quoteId ?? null,
    codigo_projeto_gestio: opp.codigoProjetoGestio ?? null,
    observacoes: opp.observacoes,
    created_by: opp.createdBy ?? null,
    created_at: opp.createdAt,
    updated_at: opp.updatedAt,
  };
}

export async function listOpportunities(): Promise<CommercialOpportunity[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("commercial_opportunities")
      .select("*")
      .order("updated_at", { ascending: false });
    return (data ?? []).map(rowToOpp);
  }
  return readLocal();
}

export async function getOpportunity(id: string): Promise<CommercialOpportunity | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("commercial_opportunities")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? rowToOpp(data) : null;
  }
  return readLocal().find((o) => o.id === id) ?? null;
}

export async function saveOpportunity(
  opp: CommercialOpportunity,
): Promise<CommercialOpportunity> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.from("commercial_opportunities").upsert(oppToRow(opp));
    return opp;
  }
  const opps = readLocal();
  const idx = opps.findIndex((o) => o.id === opp.id);
  if (idx >= 0) opps[idx] = opp;
  else opps.unshift(opp);
  writeLocal(opps);
  return opp;
}

export async function createOpportunity(
  input: Omit<CommercialOpportunity, "id" | "createdAt" | "updatedAt">,
): Promise<CommercialOpportunity> {
  const now = new Date().toISOString();
  const opp: CommercialOpportunity = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  return saveOpportunity(opp);
}
