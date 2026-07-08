import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { SteelQuote } from "@/types/budget";

const QUOTES_PATH = resolve(process.cwd(), "data/steelmind/quotes.json");

function ensureDir() {
  const dir = resolve(process.cwd(), "data/steelmind");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readQuotes(): SteelQuote[] {
  ensureDir();
  if (!existsSync(QUOTES_PATH)) {
    writeFileSync(QUOTES_PATH, "[]");
    return [];
  }
  return JSON.parse(readFileSync(QUOTES_PATH, "utf-8")) as SteelQuote[];
}

function writeQuotes(quotes: SteelQuote[]) {
  ensureDir();
  writeFileSync(QUOTES_PATH, JSON.stringify(quotes, null, 2));
}

export function listQuotes(): SteelQuote[] {
  return readQuotes().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getQuote(id: string): SteelQuote | null {
  return readQuotes().find((q) => q.id === id) ?? null;
}

export function saveQuote(quote: SteelQuote): SteelQuote {
  const quotes = readQuotes();
  const idx = quotes.findIndex((q) => q.id === quote.id);
  if (idx >= 0) quotes[idx] = quote;
  else quotes.unshift(quote);
  writeQuotes(quotes);
  return quote;
}

export function deleteQuote(id: string): boolean {
  const quotes = readQuotes();
  const next = quotes.filter((q) => q.id !== id);
  if (next.length === quotes.length) return false;
  writeQuotes(next);
  return true;
}
