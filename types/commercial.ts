export type OpportunityStage =
  | "lead"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface CommercialOpportunity {
  id: string;
  titulo: string;
  cliente: string;
  contato?: string | null;
  valorEstimado: number;
  stage: OpportunityStage;
  quoteId?: string | null;
  codigoProjetoGestio?: number | null;
  observacoes?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
}

export const STAGE_LABELS: Record<OpportunityStage, string> = {
  lead: "Lead",
  qualification: "Qualificação",
  proposal: "Proposta",
  negotiation: "Negociação",
  won: "Ganho",
  lost: "Perdido",
};

export const STAGE_ORDER: OpportunityStage[] = [
  "lead",
  "qualification",
  "proposal",
  "negotiation",
  "won",
  "lost",
];
