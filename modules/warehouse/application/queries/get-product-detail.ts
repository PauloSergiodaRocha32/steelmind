import type { WarehouseProductDetail } from "@/modules/warehouse/types/product";
import type { GestioSyncSnapshot } from "@/types/gestio";
import {
  buildEnrichmentMaps,
  enrichProduct,
  getSaldoValorPorFilial,
} from "./product-enrichment";

export function getProductDetail(
  catalog: GestioSyncSnapshot,
  idProd: number,
): WarehouseProductDetail | null {
  const produto = catalog.produtos.find((p) => p.idProd === idProd);
  if (!produto) return null;

  const maps = buildEnrichmentMaps(catalog);
  const summary = enrichProduct(produto, catalog, maps);
  const saldosFilial = getSaldoValorPorFilial(catalog, idProd);

  const filiais = catalog.filiais.map((f) => {
    const saldo = saldosFilial.find((s) => s.codigoDaFilial === f.codigoDaFilial);
    return {
      codigoDaFilial: f.codigoDaFilial,
      nome: f.nomeFantasia,
      quantidade: saldo?.quantidade ?? 0,
      valorTotal: saldo?.valorTotal ?? 0,
    };
  });

  return {
    ...summary,
    ncm: produto.ncm,
    marca: produto.marca,
    grupoCode: produto.codigoDoGrupoDeProduto ?? "000000",
    categoryId: produto.codigoDaCategoriaDeProduto ?? 0,
    typeId: produto.codigoDoTipoDeProduto ?? 0,
    ativo: produto.ativo,
    filiais,
  };
}
