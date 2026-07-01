import type {
  BenchmarkCase,
  BenchmarkComparisonResult,
  BenchmarkRepository,
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

export class InMemoryBenchmarkRepository implements BenchmarkRepository {
  private readonly cases = new Map<string, BenchmarkCase>();
  private readonly runs = new Map<string, BenchmarkRunResult>();

  async registerCase(benchmarkCase: BenchmarkCase): Promise<void> {
    this.cases.set(benchmarkCase.id, benchmarkCase);
  }

  async runBenchmark(
    engineVersion: string,
    calculator: (input: BenchmarkCase["entrada"]) => number,
  ): Promise<BenchmarkRunResult> {
    const runId = crypto.randomUUID();
    const executedAt = new Date().toISOString();

    const results = [...this.cases.values()]
      .filter((item) => item.engineVersion === engineVersion)
      .map((item) => {
        const resultadoCalculado = calculator(item.entrada);
        const erroAbsoluto = Math.abs(resultadoCalculado - item.resultadoEsperado);
        const erroPercentual =
          item.resultadoEsperado === 0
            ? 0
            : (erroAbsoluto / item.resultadoEsperado) * 100;

        return {
          caseId: item.id,
          resultadoEsperado: item.resultadoEsperado,
          resultadoCalculado: round(resultadoCalculado),
          erroAbsoluto: round(erroAbsoluto),
          erroPercentual: round(erroPercentual),
          status: erroPercentual <= 5 ? "passed" : "failed",
        } as const;
      });

    const run: BenchmarkRunResult = {
      runId,
      engineVersion,
      executedAt,
      results,
    };
    this.runs.set(runId, run);
    return run;
  }

  async compareResults(
    baseRunId: string,
    candidateRunId: string,
  ): Promise<BenchmarkComparisonResult | null> {
    const base = this.runs.get(baseRunId);
    const candidate = this.runs.get(candidateRunId);
    if (!base || !candidate) return null;

    const baseErrors = base.results.map((item) => item.erroAbsoluto);
    const candidateErrors = candidate.results.map((item) => item.erroAbsoluto);
    const basePercent = base.results.map((item) => item.erroPercentual);
    const candidatePercent = candidate.results.map((item) => item.erroPercentual);

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
    const run = this.runs.get(runId);
    if (!run) return null;

    const totalCases = run.results.length;
    const passedCases = run.results.filter((item) => item.status === "passed").length;
    const failedCases = totalCases - passedCases;
    const averageAbsoluteError = round(
      average(run.results.map((item) => item.erroAbsoluto)),
    );
    const averagePercentageError = round(
      average(run.results.map((item) => item.erroPercentual)),
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
