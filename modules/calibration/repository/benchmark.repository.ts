import type { CalibrationCase } from "@/modules/calibration/domain/entities/calibration-case";

export interface BenchmarkCase {
  id: string;
  produto: string;
  categoria: string;
  entrada: Record<string, unknown>;
  resultadoEsperado: number;
  engineVersion: string;
}

export interface BenchmarkRunCaseResult {
  caseId: string;
  resultadoEsperado: number;
  resultadoCalculado: number;
  erroAbsoluto: number;
  erroPercentual: number;
  status: CalibrationCase["status"];
}

export interface BenchmarkRunResult {
  runId: string;
  engineVersion: string;
  executedAt: string;
  results: BenchmarkRunCaseResult[];
}

export interface BenchmarkComparisonResult {
  baseRunId: string;
  candidateRunId: string;
  deltaErroMedio: number;
  deltaErroMaximo: number;
  deltaMape: number;
}

export interface BenchmarkSummary {
  totalCases: number;
  passedCases: number;
  failedCases: number;
  averageAbsoluteError: number;
  averagePercentageError: number;
}

export interface BenchmarkRepository {
  registerCase(benchmarkCase: BenchmarkCase): Promise<void>;
  runBenchmark(
    engineVersion: string,
    calculator: (input: BenchmarkCase["entrada"]) => number,
  ): Promise<BenchmarkRunResult>;
  compareResults(
    baseRunId: string,
    candidateRunId: string,
  ): Promise<BenchmarkComparisonResult | null>;
  generateSummary(runId: string): Promise<BenchmarkSummary | null>;
}
