import type {
  GestioMovimentacaoEntrada,
  GestioMovimentacaoSaida,
} from "@/types/gestio-extended";
import type { GestioSaldoEstoque } from "@/types/gestio";

export interface InventoryBalance {
  idProd: number;
  codigoDaFilial: number;
  quantidade: number;
  valorTotal: number;
}

export interface InventoryBalanceByProduct {
  idProd: number;
  saldoTotal: number;
  porFilial: InventoryBalance[];
}

export interface InventoryMovementEntry {
  kind: "entrada";
  id: number;
  idProd: number;
  codigoDaFilial: number;
  quantidade: number;
  data: string | null;
  observacao: string | null;
  raw: GestioMovimentacaoEntrada;
}

export interface InventoryMovementExit {
  kind: "saida";
  id: number;
  idProd: number;
  codigoDaFilial: number;
  quantidade: number;
  data: string | null;
  observacao: string | null;
  raw: GestioMovimentacaoSaida;
}

export type InventoryMovement =
  | InventoryMovementEntry
  | InventoryMovementExit;

export interface BranchStockSummary {
  codigoDaFilial: number;
  nome: string;
  produtosComSaldo: number;
  quantidadeTotal: number;
}

export type { GestioSaldoEstoque };
