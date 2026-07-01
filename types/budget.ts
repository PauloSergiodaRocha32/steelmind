export type QuoteStatus =
  | "draft"
  | "analyzing"
  | "memorial_ready"
  | "priced"
  | "confirmed"
  | "sent";

export type PipelineStepId =
  | "ingest"
  | "extract"
  | "bom"
  | "pricing"
  | "memorial"
  | "review";

export interface PipelineStep {
  id: PipelineStepId;
  label: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
}

export interface UploadedFileMeta {
  name: string;
  type: string;
  size: number;
}

export interface QuoteLineItem {
  id: string;
  codigo: string | null;
  descricao: string;
  material: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  subtotal: number;
  gestioIdProd?: number | null;
  origem: "catalogo" | "estimativa" | "servico";
}

export interface QuoteCostSummary {
  materiais: number;
  maoDeObra: number;
  servicos: number;
  subtotal: number;
  margemPercentual: number;
  margemValor: number;
  total: number;
  prazoDias: number;
  incluiInstalacao: boolean;
  incluiPintura: boolean;
  localInstalacao?: string | null;
}

export interface TechnicalMemorial {
  titulo: string;
  escopo: string;
  especificacoes: string[];
  materiais: string[];
  processos: string[];
  normas: string[];
  prazoEntrega: string;
  observacoes: string;
  geradoEm: string;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  appliedChanges?: string[];
}

export interface SteelQuote {
  id: string;
  titulo: string;
  status: QuoteStatus;
  observacoes: string;
  arquivos: UploadedFileMeta[];
  pipeline: PipelineStep[];
  itens: QuoteLineItem[];
  custos: QuoteCostSummary;
  memorial: TechnicalMemorial | null;
  mensagens: CopilotMessage[];
  aiMode: "openai" | "steelmind";
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
}

export interface AnalyzeQuoteInput {
  observacoes: string;
  arquivos: UploadedFileMeta[];
  titulo?: string;
}

export interface ChatAdjustInput {
  quoteId: string;
  message: string;
}

export const PIPELINE_TEMPLATE: Omit<PipelineStep, "status" | "detail">[] = [
  { id: "ingest", label: "Ingestão de arquivos" },
  { id: "extract", label: "Extração com IA" },
  { id: "bom", label: "Lista de materiais (BOM)" },
  { id: "pricing", label: "Precificação Gestio" },
  { id: "memorial", label: "Memorial técnico" },
  { id: "review", label: "Revisão final" },
];
