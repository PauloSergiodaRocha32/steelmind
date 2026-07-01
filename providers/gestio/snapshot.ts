import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { GestioSyncSnapshot } from "@/types/gestio";

const CATALOG_PATH = resolve(process.cwd(), "data/gestio/catalog.json");

export function loadGestioSnapshot(): GestioSyncSnapshot | null {
  if (!existsSync(CATALOG_PATH)) return null;
  return JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as GestioSyncSnapshot;
}

export function requireGestioSnapshot(): GestioSyncSnapshot {
  const snapshot = loadGestioSnapshot();
  if (!snapshot) {
    throw new Error(
      "Gestio snapshot not synced. Run POST /api/v1/warehouse/sync or npm run gestio:sync",
    );
  }
  return snapshot;
}
