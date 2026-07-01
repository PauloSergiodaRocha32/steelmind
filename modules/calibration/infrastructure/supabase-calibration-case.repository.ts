import type { CalibrationCase } from "@/modules/calibration/domain/entities/calibration-case";
import type { CalibrationCaseRepository } from "@/modules/calibration/repository/calibration-case.repository";
import { getDefaultTenantId, getSupabaseInfraClient } from "@/lib/persistence/supabase-client";

function toRow(calibrationCase: CalibrationCase) {
  return {
    id: calibrationCase.id,
    tenant_id: getDefaultTenantId(),
    produto: calibrationCase.produto,
    categoria: calibrationCase.categoria,
    entrada: calibrationCase.entrada,
    resultado_esperado: calibrationCase.resultadoEsperado,
    resultado_calculado: calibrationCase.resultadoCalculado,
    erro_percentual: calibrationCase.erroPercentual,
    erro_absoluto: calibrationCase.erroAbsoluto,
    status: calibrationCase.status,
    observacoes: calibrationCase.observacoes ?? null,
    validated_by: calibrationCase.validatedBy ?? null,
    validated_at: calibrationCase.validatedAt ?? null,
    engine_version: calibrationCase.engineVersion,
  };
}

function fromRow(row: Record<string, unknown>): CalibrationCase {
  return {
    id: String(row.id),
    produto: String(row.produto),
    categoria: String(row.categoria),
    entrada: (row.entrada as Record<string, unknown>) ?? {},
    resultadoEsperado: Number(row.resultado_esperado ?? 0),
    resultadoCalculado: Number(row.resultado_calculado ?? 0),
    erroPercentual: Number(row.erro_percentual ?? 0),
    erroAbsoluto: Number(row.erro_absoluto ?? 0),
    status: row.status as CalibrationCase["status"],
    observacoes: row.observacoes ? String(row.observacoes) : null,
    validatedBy: row.validated_by ? String(row.validated_by) : null,
    validatedAt: row.validated_at ? String(row.validated_at) : null,
    engineVersion: String(row.engine_version),
  };
}

export class SupabaseCalibrationCaseRepository implements CalibrationCaseRepository {
  async save(calibrationCase: CalibrationCase): Promise<void> {
    const supabase = getSupabaseInfraClient();
    if (!supabase) return;
    await supabase.from("calibration_cases").upsert(toRow(calibrationCase));
  }

  async getById(id: string): Promise<CalibrationCase | null> {
    const supabase = getSupabaseInfraClient();
    if (!supabase) return null;

    const { data } = await supabase
      .from("calibration_cases")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? fromRow(data) : null;
  }

  async list(filters?: {
    status?: CalibrationCase["status"];
    categoria?: string;
    engineVersion?: string;
  }): Promise<CalibrationCase[]> {
    const supabase = getSupabaseInfraClient();
    if (!supabase) return [];

    let query = supabase
      .from("calibration_cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.categoria) query = query.eq("categoria", filters.categoria);
    if (filters?.engineVersion) query = query.eq("engine_version", filters.engineVersion);

    const { data } = await query;
    return (data ?? []).map((item) => fromRow(item));
  }
}
