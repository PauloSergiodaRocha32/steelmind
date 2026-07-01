export type CalibrationStatus =
  | "pending"
  | "passed"
  | "failed"
  | "needs_review";

export interface CalibrationCase {
  id: string;
  produto: string;
  categoria: string;
  entrada: Record<string, unknown>;
  resultadoEsperado: number;
  resultadoCalculado: number;
  erroPercentual: number;
  erroAbsoluto: number;
  status: CalibrationStatus;
  observacoes?: string | null;
  validatedBy?: string | null;
  validatedAt?: string | null;
  engineVersion: string;
}
