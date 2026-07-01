import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SteelQuote } from "@/types/budget";

const QUOTES_PATH = resolve(process.cwd(), "data/steelmind/quotes.json");

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

function readLocalQuotes(): SteelQuote[] {
  ensureDir();
  if (!existsSync(QUOTES_PATH)) {
    writeFileSync(QUOTES_PATH, "[]");
    return [];
  }
  return JSON.parse(readFileSync(QUOTES_PATH, "utf-8")) as SteelQuote[];
}

function writeLocalQuotes(quotes: SteelQuote[]) {
  ensureDir();
  writeFileSync(QUOTES_PATH, JSON.stringify(quotes, null, 2));
}

function rowToQuote(row: Record<string, unknown>): SteelQuote {
  return {
    id: String(row.id),
    titulo: String(row.titulo),
    status: row.status as SteelQuote["status"],
    observacoes: String(row.observacoes ?? ""),
    arquivos: (row.arquivos as SteelQuote["arquivos"]) ?? [],
    pipeline: (row.pipeline as SteelQuote["pipeline"]) ?? [],
    itens: (row.itens as SteelQuote["itens"]) ?? [],
    custos: row.custos as SteelQuote["custos"],
    memorial: (row.memorial as SteelQuote["memorial"]) ?? null,
    mensagens: (row.mensagens as SteelQuote["mensagens"]) ?? [],
    aiMode: (row.ai_mode as SteelQuote["aiMode"]) ?? "steelmind",
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : null,
  };
}

function quoteToRow(quote: SteelQuote) {
  return {
    id: quote.id,
    titulo: quote.titulo,
    status: quote.status,
    observacoes: quote.observacoes,
    arquivos: quote.arquivos,
    pipeline: quote.pipeline,
    itens: quote.itens,
    custos: quote.custos,
    memorial: quote.memorial,
    mensagens: quote.mensagens,
    ai_mode: quote.aiMode,
    created_by: quote.createdBy ?? null,
    created_at: quote.createdAt,
    updated_at: quote.updatedAt,
  };
}

export async function listQuotes(): Promise<SteelQuote[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("steel_quotes")
      .select("*")
      .order("updated_at", { ascending: false });
    return (data ?? []).map(rowToQuote);
  }
  return readLocalQuotes().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getQuote(id: string): Promise<SteelQuote | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.from("steel_quotes").select("*").eq("id", id).maybeSingle();
    return data ? rowToQuote(data) : null;
  }
  return readLocalQuotes().find((q) => q.id === id) ?? null;
}

export async function saveQuote(quote: SteelQuote): Promise<SteelQuote> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.from("steel_quotes").upsert(quoteToRow(quote));
    return quote;
  }
  const quotes = readLocalQuotes();
  const idx = quotes.findIndex((q) => q.id === quote.id);
  if (idx >= 0) quotes[idx] = quote;
  else quotes.unshift(quote);
  writeLocalQuotes(quotes);
  return quote;
}

export async function deleteQuote(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("steel_quotes").delete().eq("id", id);
    return !error;
  }
  const quotes = readLocalQuotes();
  const next = quotes.filter((q) => q.id !== id);
  if (next.length === quotes.length) return false;
  writeLocalQuotes(next);
  return true;
}

export function quotesBackend(): string {
  return getSupabase() ? "supabase" : "local-json";
}
