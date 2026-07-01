import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  MovementLogEntry,
  ProjectBom,
  PurchaseRequisition,
  SteelmindStore,
} from "@/types/steelmind-store";
import { EMPTY_STORE } from "@/types/steelmind-store";

const STORE_PATH = resolve(process.cwd(), "data/steelmind/store.json");

function ensureStoreDir() {
  const dir = resolve(process.cwd(), "data/steelmind");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readLocalStore(): SteelmindStore {
  ensureStoreDir();
  if (!existsSync(STORE_PATH)) {
    writeFileSync(STORE_PATH, JSON.stringify(EMPTY_STORE, null, 2));
    return { ...EMPTY_STORE };
  }
  return JSON.parse(readFileSync(STORE_PATH, "utf-8")) as SteelmindStore;
}

function writeLocalStore(store: SteelmindStore) {
  ensureStoreDir();
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}

export async function getStore(): Promise<SteelmindStore & { backend: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ...readLocalStore(), backend: "local-json" };
  }

  const [boms, reqs, movements] = await Promise.all([
    supabase.from("project_boms").select("*"),
    supabase.from("purchase_requisitions").select("*"),
    supabase.from("movement_logs").select("*").order("created_at", { ascending: false }).limit(100),
  ]);

  return {
    backend: "supabase",
    lastSyncAt: null,
    projectBoms: (boms.data ?? []).map((row) => ({
      codigoDoProjeto: row.codigo_do_projeto,
      descricaoDoProjeto: row.descricao_do_projeto ?? "",
      items: row.items ?? [],
      updatedAt: row.updated_at,
    })),
    purchaseRequisitions: (reqs.data ?? []).map((row) => ({
      id: row.id,
      descricao: row.descricao,
      codigoDaFilial: row.codigo_da_filial,
      codigoDoProjeto: row.codigo_do_projeto,
      status: row.status,
      items: row.items ?? [],
      createdAt: row.created_at,
      gestioNumero: row.gestio_numero,
      createdBy: row.created_by ?? null,
    })),
    movementLogs: (movements.data ?? []).map((row) => ({
      id: row.id,
      tipo: row.tipo,
      codigoDaFilial: row.codigo_da_filial,
      idProd: row.id_prod,
      codigoInterno: row.codigo_interno,
      quantidade: row.quantidade,
      codigoDoProjeto: row.codigo_do_projeto,
      gestioNumero: row.gestio_numero,
      observacao: row.observacao,
      createdAt: row.created_at,
      createdBy: row.created_by ?? null,
    })),
  };
}

export async function saveProjectBom(bom: ProjectBom): Promise<ProjectBom> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.from("project_boms").upsert({
      codigo_do_projeto: bom.codigoDoProjeto,
      descricao_do_projeto: bom.descricaoDoProjeto,
      items: bom.items,
      updated_at: new Date().toISOString(),
    });
    return bom;
  }

  const store = readLocalStore();
  const idx = store.projectBoms.findIndex(
    (b) => b.codigoDoProjeto === bom.codigoDoProjeto,
  );
  if (idx >= 0) store.projectBoms[idx] = bom;
  else store.projectBoms.push(bom);
  writeLocalStore(store);
  return bom;
}

export async function savePurchaseRequisition(
  req: Omit<PurchaseRequisition, "id" | "createdAt"> & { id?: string },
): Promise<PurchaseRequisition> {
  const full: PurchaseRequisition = {
    id: req.id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    descricao: req.descricao,
    codigoDaFilial: req.codigoDaFilial,
    codigoDoProjeto: req.codigoDoProjeto,
    status: req.status,
    items: req.items,
    gestioNumero: req.gestioNumero,
    createdBy: req.createdBy ?? null,
  };

  const supabase = getSupabase();
  if (supabase) {
    await supabase.from("purchase_requisitions").insert({
      id: full.id,
      descricao: full.descricao,
      codigo_da_filial: full.codigoDaFilial,
      codigo_do_projeto: full.codigoDoProjeto,
      status: full.status,
      items: full.items,
      gestio_numero: full.gestioNumero,
      created_by: full.createdBy ?? null,
    });
    return full;
  }

  const store = readLocalStore();
  store.purchaseRequisitions.unshift(full);
  writeLocalStore(store);
  return full;
}

export async function logMovement(
  entry: Omit<MovementLogEntry, "id" | "createdAt">,
): Promise<MovementLogEntry> {
  const full: MovementLogEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    await supabase.from("movement_logs").insert({
      id: full.id,
      tipo: full.tipo,
      codigo_da_filial: full.codigoDaFilial,
      id_prod: full.idProd,
      codigo_interno: full.codigoInterno,
      quantidade: full.quantidade,
      codigo_do_projeto: full.codigoDoProjeto,
      gestio_numero: full.gestioNumero,
      observacao: full.observacao,
      created_by: full.createdBy ?? null,
    });
    return full;
  }

  const store = readLocalStore();
  store.movementLogs.unshift(full);
  writeLocalStore(store);
  return full;
}

export async function getProjectBom(
  codigoDoProjeto: number,
): Promise<ProjectBom | null> {
  const store = await getStore();
  return (
    store.projectBoms.find((b) => b.codigoDoProjeto === codigoDoProjeto) ?? null
  );
}
