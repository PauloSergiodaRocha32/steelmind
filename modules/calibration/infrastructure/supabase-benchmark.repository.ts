import { getDefaultTenantId, getSupabaseInfraClient } from "@/lib/persistence/supabase-client";
import type {
  BenchmarkCase,
  BenchmarkComparisonResult,
  BenchmarkRepository,
  BenchmarkRunCaseResult,
  BenchmarkRunResult,
  BenchmarkSummary,
} from "@/modules/calibration/repository/benchmark.repository";

function round(value: number): number {
  return Number(value.toFixed(4));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toBenchmarkCaseRow(benchmarkCase: BenchmarkCase) {
  return {
    id: benchmarkCase.id,
    tenant_id: getDefaultTenantId(),
    produto: benchmarkCase.produto,
    categoria: benchmarkCase.categoria,
    entrada: benchmarkCase.entrada,
    resultado_esperado: benchmarkCase.resultadoEsperado,
    engine_version: benchmarkCase.engineVersion,
  };
}

function toBenchmarkCase(item: Record<string, unknown>): BenchmarkCase {
  return {
    id: String(item.id),
    produto: String(item.produto),
    categoria: String(item.categoria),
    entrada: (item.entrada as Record<string, unknown>) ?? {},
    resultadoEsperado: Number(item.resultado_esperado ?? 0),
    engineVersion: String(item.engine_version),
  };
}

function statusFromPercent(erroPercentual: number): "passed" | "failed" {
  return erroPercentual <= 5 ? "passed" : "failed";
}

function toBenchmarkRunCaseResult(
  row: Record<string, unknown>,
): BenchmarkRunCaseResult {
  return {
    caseId: String(row.case_id),
    resultadoEsperado: Number(row.resultado_esperado ?? 0),
    resultadoCalculado: Number(row.resultado_calculado ?? 0),
    erroAbsoluto: Number(row.erro_absoluto ?? 0),
    erroPercentual: Number(row.erro_percentual ?? 0),
    status: row.status as BenchmarkRunCaseResult["status"],
  };
}

export class SupabaseBenchmarkRepository implements BenchmarkRepository {
  async registerCase(benchmarkCase: BenchmarkCase): Promise<void> {
    const supabase = getSupabaseInfraClient();
    if (!supabase) return;
    await supabase.from("benchmark_cases").upsert(toBenchmarkCaseRow(benchmarkCase));
  }

  async runBenchmark(
    engineVersion: string,
    calculator: (input: BenchmarkCase["entrada"]) => number,
  ): Promise<BenchmarkRunResult> {
    const supabase = getSupabaseInfraClient();
    if (!supabase) {
      return {
        runId: crypto.randomUUID(),
        engineVersion,
        executedAt: new Date().toISOString(),
        results: [],
      };
    }

    const { data: casesData } = await supabase
      .from("benchmark_cases")
      .select("*")
      .eq("engine_version", engineVersion);
    const cases = (casesData ?? []).map((item) => toBenchmarkCase(item));

    const runId = crypto.randomUUID();
    const executedAt = new Date().toISOString();

    await supabase.from("benchmark_runs").insert({
      id: runId,
      tenant_id: getDefaultTenantId(),
      engine_version: engineVersion,
      executed_at: executedAt,
    });

    const results: BenchmarkRunCaseResult[] = [];
    for (const benchmarkCase of cases) {
      const resultadoCalculado = calculator(benchmarkCase.entrada);
      const erroAbsoluto = Math.abs(resultadoCalculado - benchmarkCase.resultadoEsperado);
      const erroPercentual =
        benchmarkCase.resultadoEsperado === 0
          ? 0
          : (erroAbsoluto / benchmarkCase.resultadoEsperado) * 100;
      const status = statusFromPercent(erroPercentual);

      const row = {
        id: crypto.randomUUID(),
        tenant_id: getDefaultTenantId(),
        run_id: runId,
        case_id: benchmarkCase.id,
        resultado_esperado: benchmarkCase.resultadoEsperado,
        resultado_calculado: round(resultadoCalculado),
        erro_absoluto: round(erroAbsoluto),
        erro_percentual: round(erroPercentual),
        status,
      };
      await supabase.from("benchmark_run_results").insert(row);

      results.push({
        caseId: benchmarkCase.id,
        resultadoEsperado: row.resultado_esperado,
        resultadoCalculado: row.resultado_calculado,
        erroAbsoluto: row.erro_absoluto,
        erroPercentual: row.erro_percentual,
        status,
      });
    }

    return { runId, engineVersion, executedAt, results };
  }

  async compareResults(
    baseRunId: string,
    candidateRunId: string,
  ): Promise<BenchmarkComparisonResult | null> {
    const supabase = getSupabaseInfraClient();
    if (!supabase) return null;

    const [{ data: baseRows }, { data: candidateRows }] = await Promise.all([
      supabase.from("benchmark_run_results").select("*").eq("run_id", baseRunId),
      supabase.from("benchmark_run_results").select("*").eq("run_id", candidateRunId),
    ]);

    if (!baseRows?.length || !candidateRows?.length) return null;

    const base = baseRows.map((item) => toBenchmarkRunCaseResult(item));
    const candidate = candidateRows.map((item) => toBenchmarkRunCaseResult(item));

    const baseErrors = base.map((item) => item.erroAbsoluto);
    const candidateErrors = candidate.map((item) => item.erroAbsoluto);
    const basePercent = base.map((item) => item.erroPercentual);
    const candidatePercent = candidate.map((item) => item.erroPercentual);

    return {
      baseRunId,
      candidateRunId,
      deltaErroMedio: round(average(candidateErrors) - average(baseErrors)),
      deltaErroMaximo: round(
        Math.max(...candidateErrors, 0) - Math.max(...baseErrors, 0),
      ),
      deltaMape: round(average(candidatePercent) - average(basePercent)),
    };
  }

  async generateSummary(runId: string): Promise<BenchmarkSummary | null> {
    const supabase = getSupabaseInfraClient();
    if (!supabase) return null;

    const { data } = await supabase
      .from("benchmark_run_results")
      .select("*")
      .eq("run_id", runId);
    if (!data?.length) return null;

    const results = data.map((item) => toBenchmarkRunCaseResult(item));
    const totalCases = results.length;
    const passedCases = results.filter((item) => item.status === "passed").length;
    const failedCases = totalCases - passedCases;
    const averageAbsoluteError = round(
      average(results.map((item) => item.erroAbsoluto)),
    );
    const averagePercentageError = round(
      average(results.map((item) => item.erroPercentual)),
    );

    return {
      totalCases,
      passedCases,
      failedCases,
      averageAbsoluteError,
      averagePercentageError,
    };
  }
}
