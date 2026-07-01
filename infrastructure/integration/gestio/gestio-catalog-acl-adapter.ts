import { loadGestioCatalog } from "@/modules/warehouse/application/load-catalog";
import type {
  CanonicalCatalogItem,
  CatalogProviderPort,
} from "@/domains/integration/gestio-acl/ports/catalog-provider.port";
import { mapGestioProductToCanonicalItem } from "@/domains/integration/gestio-acl/mappers/gestio-product.mapper";

export class GestioCatalogAclAdapter implements CatalogProviderPort {
  async listCatalogItems(): Promise<CanonicalCatalogItem[]> {
    const snapshot = loadGestioCatalog();
    if (!snapshot) return [];
    return snapshot.produtos.map(mapGestioProductToCanonicalItem);
  }

  async findCatalogItemByExternalId(
    externalId: string,
  ): Promise<CanonicalCatalogItem | null> {
    const snapshot = loadGestioCatalog();
    if (!snapshot) return null;

    const product = snapshot.produtos.find((item) => String(item.idProd) === externalId);
    if (!product) return null;
    return mapGestioProductToCanonicalItem(product);
  }
}
