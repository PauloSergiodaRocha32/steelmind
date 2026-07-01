export type WorkflowStageId =
  | "commercial"
  | "budget"
  | "engineering"
  | "purchasing"
  | "warehouse"
  | "production";

export interface WorkflowLink {
  opportunityId?: string | null;
  quoteId?: string | null;
  codigoProjetoGestio?: number | null;
  purchaseRequisitionIds?: string[];
}

export interface WorkflowStageStatus {
  id: WorkflowStageId;
  label: string;
  status: "idle" | "active" | "done" | "blocked";
  detail: string;
  href: string;
}

export interface WorkflowSummary {
  titulo: string;
  valorTotal?: number | null;
  stages: WorkflowStageStatus[];
  links: WorkflowLink;
}
