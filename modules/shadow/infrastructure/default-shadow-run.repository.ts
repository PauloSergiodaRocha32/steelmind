import { resolve } from "node:path";
import { FileShadowRunRepository } from "@/modules/shadow/infrastructure/file-shadow-run.repository";
import { SupabaseShadowRunRepository } from "@/modules/shadow/infrastructure/supabase-shadow-run.repository";
import { CompositeShadowRunRepository } from "@/modules/shadow/infrastructure/composite-shadow-run.repository";
import { getSupabaseInfraClient } from "@/lib/persistence/supabase-client";
import type { ShadowRunRepository } from "@/modules/shadow/repository/shadow-run.repository";

export function getDefaultShadowRunRepository(): ShadowRunRepository {
  const fileRepo = new FileShadowRunRepository(
    resolve(process.cwd(), "data/steelmind/shadow/shadow-runs.json"),
  );

  if (!getSupabaseInfraClient()) {
    return fileRepo;
  }

  const supabaseRepo = new SupabaseShadowRunRepository();
  return new CompositeShadowRunRepository([supabaseRepo, fileRepo]);
}
