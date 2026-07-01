export interface BomItem {
  idProd: number;
  codigo: string | null;
  descricao: string | null;
  material: string;
  quantidade: number;
  unidade: string | null;
}

export interface ProjectBom {
  codigoDoProjeto: number;
  descricaoDoProjeto: string;
  items: BomItem[];
  updatedAt: string;
}

export interface PurchaseRequisitionItem {
  idProd: number;
  codigo: string | null;
  descricao: string | null;
  quantidade: number;
  motivo: string;
}

export interface PurchaseRequisition {
  id: string;
  descricao: string;
  codigoDaFilial: number | null;
  codigoDoProjeto: number | null;
  status: "draft" | "pending" | "sent" | "closed";
  items: PurchaseRequisitionItem[];
  createdAt: string;
  gestioNumero?: number | null;
  createdBy?: string | null;
}

export interface MovementLogEntry {
  id: string;
  tipo: "entrada" | "saida";
  codigoDaFilial: number;
  idProd: number;
  codigoInterno: string | null;
  quantidade: number;
  codigoDoProjeto: number | null;
  gestioNumero: number | null;
  observacao: string | null;
  createdAt: string;
  createdBy?: string | null;
}

export interface SteelmindStore {
  projectBoms: ProjectBom[];
  purchaseRequisitions: PurchaseRequisition[];
  movementLogs: MovementLogEntry[];
  lastSyncAt: string | null;
}

export const EMPTY_STORE: SteelmindStore = {
  projectBoms: [],
  purchaseRequisitions: [],
  movementLogs: [],
  lastSyncAt: null,
};
