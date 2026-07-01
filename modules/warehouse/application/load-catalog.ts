import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { GestioSyncSnapshot } from "@/types/gestio";

const CATALOG_PATH = resolve(process.cwd(), "data/gestio/catalog.json");

export function loadGestioCatalog(): GestioSyncSnapshot | null {
  if (!existsSync(CATALOG_PATH)) return null;
  return JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as GestioSyncSnapshot;
}

export function requireGestioCatalog(): GestioSyncSnapshot {
  const catalog = loadGestioCatalog();
  if (!catalog) {
    throw new Error(
      "Catálogo não sincronizado. Execute POST /api/v1/warehouse/sync ou npm run gestio:sync",
    );
  }
  return catalog;
}
