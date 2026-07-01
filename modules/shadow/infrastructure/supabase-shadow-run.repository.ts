import type { ShadowRun } from "@/modules/shadow/domain/entities/shadow-run";
import type { ShadowRunRepository } from "@/modules/shadow/repository/shadow-run.repository";
import { getDefaultTenantId, getSupabaseInfraClient } from "@/lib/persistence/supabase-client";

function toRow(run: ShadowRun) {
  const confidenceRaw = run.outputSnapshot.confidence;
  const warningsRaw = run.outputSnapshot.warnings;

  return {
    id: run.id,
    tenant_id: getDefaultTenantId(),
    constructive_system_code: run.projectType,
    legacy_total: run.officialBudget.precoFinal,
    v2_total: run.steelMindBudget.precoFinal,
    delta_amount: run.differences.absoluteError,
    delta_percent: run.differences.percentageError,
    confidence: typeof confidenceRaw === "number" ? confidenceRaw : 0,
    warning_count: Array.isArray(warningsRaw) ? warningsRaw.length : 0,
    payload: run,
    created_at: run.createdAt,
  };
}

function fromRow(row: Record<string, unknown>): ShadowRun | null {
  const payload = row.payload as ShadowRun | undefined;
  if (!payload) return null;
  return payload;
}

export class SupabaseShadowRunRepository implements ShadowRunRepository {
  async save(run: ShadowRun): Promise<void> {
    const supabase = getSupabaseInfraClient();
    if (!supabase) return;
    await supabase.from("quote_engine_shadow_runs").upsert(toRow(run));
  }

  async getById(id: string): Promise<ShadowRun | null> {
    const supabase = getSupabaseInfraClient();
    if (!supabase) return null;

    const { data } = await supabase
      .from("quote_engine_shadow_runs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!data) return null;
    return fromRow(data);
  }

  async list(limit = 100): Promise<ShadowRun[]> {
    const supabase = getSupabaseInfraClient();
    if (!supabase) return [];

    const { data } = await supabase
      .from("quote_engine_shadow_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    return (data ?? [])
      .map((item) => fromRow(item))
      .filter((item): item is ShadowRun => Boolean(item));
  }
}
