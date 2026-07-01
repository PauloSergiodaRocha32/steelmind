import { createGestioClient } from "@/providers/gestio/client";
import { requireGestioSnapshot } from "@/providers/gestio/snapshot";
import type { GestioSyncSnapshot } from "@/types/gestio";
import type {
  BranchStockSummary,
  InventoryBalance,
  InventoryBalanceByProduct,
  InventoryMovement,
} from "./types";

function normalizeBalance(saldo: {
  idProd: number;
  codigoDaFilial: number;
  quantidadeTotal: number;
  valorTotal: number;
}): InventoryBalance {
  return {
    idProd: saldo.idProd,
    codigoDaFilial: saldo.codigoDaFilial,
    quantidade: saldo.quantidadeTotal,
    valorTotal: saldo.valorTotal,
  };
}

export function getSnapshot(): GestioSyncSnapshot {
  return requireGestioSnapshot();
}

export function getBalances(
  snapshot: GestioSyncSnapshot = getSnapshot(),
  filial?: number,
): InventoryBalance[] {
  return snapshot.saldos
    .filter((s) => s.quantidadeTotal > 0)
    .filter((s) => filial == null || s.codigoDaFilial === filial)
    .map(normalizeBalance);
}

export function getBalanceByProduct(
  idProd: number,
  snapshot: GestioSyncSnapshot = getSnapshot(),
): InventoryBalanceByProduct {
  const porFilial = getBalances(snapshot).filter((b) => b.idProd === idProd);
  return {
    idProd,
    saldoTotal: porFilial.reduce((sum, b) => sum + b.quantidade, 0),
    porFilial,
  };
}

export function getBranchSummaries(
  snapshot: GestioSyncSnapshot = getSnapshot(),
): BranchStockSummary[] {
  return snapshot.filiais.map((filial) => {
    let produtosComSaldo = 0;
    let quantidadeTotal = 0;

    for (const saldo of snapshot.saldos) {
      if (
        saldo.codigoDaFilial === filial.codigoDaFilial &&
        saldo.quantidadeTotal > 0
      ) {
        produtosComSaldo++;
        quantidadeTotal += saldo.quantidadeTotal;
      }
    }

    return {
      codigoDaFilial: filial.codigoDaFilial,
      nome: filial.nomeFantasia ?? filial.descricaoDaFilial,
      produtosComSaldo,
      quantidadeTotal,
    };
  });
}

export async function fetchMovements(): Promise<InventoryMovement[]> {
  const client = createGestioClient();
  await client.authenticate();

  const [entradas, saidas] = await Promise.all([
    client.getEntradas(),
    client.getSaidas(),
  ]);

  const entries: InventoryMovement[] = entradas.map((e) => ({
    kind: "entrada" as const,
    id: e.numeroDaEntrada,
    idProd: e.idProd,
    codigoDaFilial: e.codigoDaFilial,
    quantidade: e.quantidade,
    data: e.dataDaEntrada ?? null,
    observacao: e.observacao ?? null,
    raw: e,
  }));

  const exits: InventoryMovement[] = saidas.map((s) => ({
    kind: "saida" as const,
    id: s.numeroDaSaida,
    idProd: s.idProd,
    codigoDaFilial: s.codigoDaFilial,
    quantidade: s.quantidade,
    data: s.dataDaSaida ?? null,
    observacao: s.observacao ?? null,
    raw: s,
  }));

  return [...entries, ...exits].sort((a, b) => {
    const dateA = a.data ?? "";
    const dateB = b.data ?? "";
    return dateB.localeCompare(dateA);
  });
}
