export interface CanonicalCatalogItem {
  externalId: string;
  code: string | null;
  description: string;
  unit: string | null;
  materialFamily: string;
  active: boolean;
}

export interface CatalogProviderPort {
  listCatalogItems(): Promise<CanonicalCatalogItem[]>;
  findCatalogItemByExternalId(externalId: string): Promise<CanonicalCatalogItem | null>;
}
