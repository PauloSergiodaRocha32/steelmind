import { classifyProduct } from "@/services/gestio/taxonomy";
import type { GestioProduto } from "@/types/gestio";
import type { CanonicalCatalogItem } from "@/domains/integration/gestio-acl/ports/catalog-provider.port";

export function mapGestioProductToCanonicalItem(
  product: GestioProduto,
): CanonicalCatalogItem {
  const classification = classifyProduct(
    product.codigoInterno,
    product.descricaoDoProduto,
    product,
  );

  return {
    externalId: String(product.idProd),
    code: product.codigoInterno,
    description: product.descricaoDoProduto ?? `Produto ${product.idProd}`,
    unit: product.simboloDaUnidadeDeMedida,
    materialFamily: classification?.material ?? "NÃO_CLASSIFICADO",
    active: product.ativo,
  };
}
