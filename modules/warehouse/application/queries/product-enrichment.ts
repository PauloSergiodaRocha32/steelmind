import { classifyProduct } from "@/services/gestio/taxonomy";
import type {
  GestioProduto,
  GestioSaldoEstoque,
  GestioSyncSnapshot,
} from "@/types/gestio";
import type { WarehouseProductSummary } from "@/modules/warehouse/types/product";

interface EnrichmentMaps {
  grupoMap: Map<string, string>;
  categoriaMap: Map<number, string>;
  tipoMap: Map<number, string>;
  saldoIndex: Map<string, number>;
}

export function buildEnrichmentMaps(
  catalog: GestioSyncSnapshot,
  filialFilter?: number,
): EnrichmentMaps {
  const grupoMap = new Map(
    catalog.grupos.map((g) => [g.codigoDoGrupoDeProduto, g.descricaoDoGrupoDeProduto]),
  );
  const categoriaMap = new Map(
    catalog.categorias.map((c) => [
      c.codigoDaCategoriaDeProduto,
      c.descricaoDaCategoriaDeProduto,
    ]),
  );
  const tipoMap = new Map(
    catalog.tipos.map((t) => [t.codigoDoTipoDeProduto, t.descricaoDoTipoDeProduto]),
  );

  const saldoIndex = new Map<string, number>();
  for (const saldo of catalog.saldos) {
    if (filialFilter && saldo.codigoDaFilial !== filialFilter) continue;
    const key = `${saldo.codigoDaFilial}:${saldo.idProd}`;
    saldoIndex.set(key, (saldoIndex.get(key) ?? 0) + saldo.quantidadeTotal);
  }

  return { grupoMap, categoriaMap, tipoMap, saldoIndex };
}

export function enrichProduct(
  produto: GestioProduto,
  catalog: GestioSyncSnapshot,
  maps: EnrichmentMaps,
): WarehouseProductSummary {
  const classification = classifyProduct(
    produto.codigoInterno,
    produto.descricaoDoProduto,
    produto,
  );

  const grupoCode =
    produto.codigoDoGrupoDeProduto ??
    classification?.codigoDoGrupoDeProduto ??
    "000000";
  const categoryId =
    produto.codigoDaCategoriaDeProduto ??
    classification?.codigoDaCategoriaDeProduto ??
    0;
  const typeId =
    produto.codigoDoTipoDeProduto ?? classification?.codigoDoTipoDeProduto ?? 0;

  const material =
    maps.grupoMap.get(grupoCode) ?? classification?.material ?? "Sem material";
  const categoria =
    maps.categoriaMap.get(categoryId) ??
    classification?.categoria ??
    "Sem categoria";
  const tipo =
    maps.tipoMap.get(typeId) ?? classification?.tipo ?? "—";

  const saldoPorFilial: Record<number, number> = {};
  for (const filial of catalog.filiais) {
    const qty =
      maps.saldoIndex.get(`${filial.codigoDaFilial}:${produto.idProd}`) ?? 0;
    if (qty > 0) saldoPorFilial[filial.codigoDaFilial] = qty;
  }

  const saldoTotal = Object.values(saldoPorFilial).reduce((a, b) => a + b, 0);
  const estoqueMinimo = produto.estoqueMinimo ?? 0;

  return {
    idProd: produto.idProd,
    codigo: produto.codigoInterno,
    descricao: produto.descricaoDoProduto,
    material,
    categoria,
    tipo,
    unidade: produto.simboloDaUnidadeDeMedida,
    estoqueMinimo,
    estoqueMaximo: produto.estoqueMaximo ?? 0,
    saldoPorFilial,
    saldoTotal,
    abaixoDoMinimo: estoqueMinimo > 0 && saldoTotal < estoqueMinimo,
  };
}

export function getSaldoValorPorFilial(
  catalog: GestioSyncSnapshot,
  idProd: number,
): Array<{ codigoDaFilial: number; quantidade: number; valorTotal: number }> {
  const byFilial = new Map<number, { quantidade: number; valorTotal: number }>();

  for (const saldo of catalog.saldos) {
    if (saldo.idProd !== idProd || saldo.quantidadeTotal <= 0) continue;
    const current = byFilial.get(saldo.codigoDaFilial) ?? {
      quantidade: 0,
      valorTotal: 0,
    };
    byFilial.set(saldo.codigoDaFilial, {
      quantidade: current.quantidade + saldo.quantidadeTotal,
      valorTotal: current.valorTotal + saldo.valorTotal,
    });
  }

  return Array.from(byFilial.entries()).map(([codigoDaFilial, data]) => ({
    codigoDaFilial,
    ...data,
  }));
}

export type { GestioSaldoEstoque };
