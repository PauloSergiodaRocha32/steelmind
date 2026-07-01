import type { CatalogDirectoryNode } from "@/modules/warehouse/types/catalog";
import type { GestioSyncSnapshot } from "@/types/gestio";
import {
  buildEnrichmentMaps,
  enrichProduct,
} from "./product-enrichment";

export interface BuildCatalogOptions {
  material?: string | null;
  filial?: number | null;
}

export function buildCatalogTree(
  catalog: GestioSyncSnapshot,
  options: BuildCatalogOptions = {},
): CatalogDirectoryNode[] {
  const maps = buildEnrichmentMaps(catalog, options.filial ?? undefined);
  const directory = new Map<
    string,
    {
      material: string;
      grupoCode: string;
      categorias: Map<
        string,
        CatalogDirectoryNode["categorias"][number] & {
          produtosFull: CatalogDirectoryNode["categorias"][number]["produtos"];
        }
      >;
    }
  >();

  for (const produto of catalog.produtos) {
    const enriched = enrichProduct(produto, catalog, maps);

    if (
      options.material &&
      !enriched.material.toLowerCase().includes(options.material.toLowerCase())
    ) {
      continue;
    }

    if (!directory.has(enriched.material)) {
      directory.set(enriched.material, {
        material: enriched.material,
        grupoCode:
          produto.codigoDoGrupoDeProduto ??
          "000000",
        categorias: new Map(),
      });
    }

    const matEntry = directory.get(enriched.material)!;
    if (!matEntry.categorias.has(enriched.categoria)) {
      matEntry.categorias.set(enriched.categoria, {
        categoria: enriched.categoria,
        categoryId: produto.codigoDaCategoriaDeProduto ?? 0,
        count: 0,
        produtos: [],
        produtosFull: [],
      });
    }

    const catEntry = matEntry.categorias.get(enriched.categoria)!;
    catEntry.produtosFull.push({
      idProd: enriched.idProd,
      codigo: enriched.codigo,
      descricao: enriched.descricao,
      saldoPorFilial: enriched.saldoPorFilial,
    });
    catEntry.count = catEntry.produtosFull.length;
  }

  return Array.from(directory.values())
    .sort((a, b) => a.material.localeCompare(b.material))
    .map((mat) => ({
      material: mat.material,
      grupoCode: mat.grupoCode,
      totalProdutos: Array.from(mat.categorias.values()).reduce(
        (sum, c) => sum + c.count,
        0,
      ),
      categorias: Array.from(mat.categorias.values())
        .sort((a, b) => a.categoria.localeCompare(b.categoria))
        .map(({ produtosFull, ...cat }) => ({
          ...cat,
          produtos: produtosFull.slice(0, 50),
        })),
    }));
}
