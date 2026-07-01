import type {
  StockAlertItem,
  StockOverview,
  WarehouseProductSummary,
} from "@/modules/warehouse/types/product";
import type { GestioSyncSnapshot } from "@/types/gestio";
import {
  buildEnrichmentMaps,
  enrichProduct,
} from "./product-enrichment";

export function buildStockOverview(
  catalog: GestioSyncSnapshot,
  filial?: number | null,
): StockOverview {
  const maps = buildEnrichmentMaps(catalog, filial ?? undefined);
  const comSaldo: WarehouseProductSummary[] = [];
  const alertas: StockAlertItem[] = [];

  for (const produto of catalog.produtos) {
    const enriched = enrichProduct(produto, catalog, maps);

    if (enriched.saldoTotal > 0) {
      comSaldo.push(enriched);
    }

    if (enriched.abaixoDoMinimo) {
      alertas.push({
        idProd: enriched.idProd,
        codigo: enriched.codigo,
        descricao: enriched.descricao,
        material: enriched.material,
        estoqueMinimo: enriched.estoqueMinimo,
        saldoTotal: enriched.saldoTotal,
        deficit: enriched.estoqueMinimo - enriched.saldoTotal,
      });
    }
  }

  comSaldo.sort((a, b) => b.saldoTotal - a.saldoTotal);
  alertas.sort((a, b) => b.deficit - a.deficit);

  const totaisPorFilial = catalog.filiais.map((filialItem) => {
    let produtosComSaldo = 0;
    let quantidadeTotal = 0;

    for (const saldo of catalog.saldos) {
      if (
        saldo.codigoDaFilial === filialItem.codigoDaFilial &&
        saldo.quantidadeTotal > 0
      ) {
        produtosComSaldo++;
        quantidadeTotal += saldo.quantidadeTotal;
      }
    }

    return {
      codigoDaFilial: filialItem.codigoDaFilial,
      nome: filialItem.nomeFantasia,
      produtosComSaldo,
      quantidadeTotal,
    };
  });

  return { comSaldo, alertas, totaisPorFilial };
}
