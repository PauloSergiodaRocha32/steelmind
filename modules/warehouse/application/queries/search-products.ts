import type { WarehouseProductSummary } from "@/modules/warehouse/types/product";
import type { GestioSyncSnapshot } from "@/types/gestio";
import {
  buildEnrichmentMaps,
  enrichProduct,
} from "./product-enrichment";

export interface SearchProductsOptions {
  q: string;
  filial?: number | null;
  material?: string | null;
  comSaldo?: boolean;
  limit?: number;
}

function matchesQuery(product: WarehouseProductSummary, q: string): boolean {
  const term = q.toLowerCase().trim();
  if (!term) return true;

  return (
    (product.codigo?.toLowerCase().includes(term) ?? false) ||
    (product.descricao?.toLowerCase().includes(term) ?? false) ||
    product.material.toLowerCase().includes(term) ||
    product.categoria.toLowerCase().includes(term)
  );
}

export function searchProducts(
  catalog: GestioSyncSnapshot,
  options: SearchProductsOptions,
): WarehouseProductSummary[] {
  const limit = options.limit ?? 50;
  const maps = buildEnrichmentMaps(catalog, options.filial ?? undefined);
  const results: WarehouseProductSummary[] = [];

  for (const produto of catalog.produtos) {
    const enriched = enrichProduct(produto, catalog, maps);

    if (options.material && enriched.material !== options.material) continue;
    if (options.comSaldo && enriched.saldoTotal <= 0) continue;
    if (!matchesQuery(enriched, options.q)) continue;

    results.push(enriched);
    if (results.length >= limit) break;
  }

  return results.sort((a, b) => {
    if (a.saldoTotal !== b.saldoTotal) return b.saldoTotal - a.saldoTotal;
    return (a.codigo ?? "").localeCompare(b.codigo ?? "");
  });
}
