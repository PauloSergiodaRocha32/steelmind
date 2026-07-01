import {
  CANONICAL_DIRECTORY,
  MATERIAL_PREFIX_TO_GROUP,
  SHAPE_CODE_TO_TAXONOMY,
  classifyProduct,
  parseProductCode,
} from "@/providers/gestio/taxonomy";
import { requireGestioSnapshot } from "@/providers/gestio/snapshot";
import type { GestioProduto, GestioSyncSnapshot, ProductClassification } from "@/types/gestio";

export interface MaterialProduct {
  idProd: number;
  codigo: string | null;
  descricao: string | null;
  grupoCode: string | null;
  categoriaId: number | null;
  tipoId: number | null;
  unidade: string | null;
  classification: ProductClassification | null;
}

export interface MaterialTaxonomy {
  materials: typeof MATERIAL_PREFIX_TO_GROUP;
  shapes: typeof SHAPE_CODE_TO_TAXONOMY;
  directory: typeof CANONICAL_DIRECTORY;
}

export function getTaxonomy(): MaterialTaxonomy {
  return {
    materials: MATERIAL_PREFIX_TO_GROUP,
    shapes: SHAPE_CODE_TO_TAXONOMY,
    directory: CANONICAL_DIRECTORY,
  };
}

export function normalizeProduct(produto: GestioProduto): MaterialProduct {
  const classification = classifyProduct(
    produto.codigoInterno,
    produto.descricaoDoProduto,
    produto,
  );

  return {
    idProd: produto.idProd,
    codigo: produto.codigoInterno,
    descricao: produto.descricaoDoProduto,
    grupoCode:
      produto.codigoDoGrupoDeProduto ??
      classification?.codigoDoGrupoDeProduto ??
      null,
    categoriaId:
      produto.codigoDaCategoriaDeProduto ??
      classification?.codigoDaCategoriaDeProduto ??
      null,
    tipoId:
      produto.codigoDoTipoDeProduto ??
      classification?.codigoDoTipoDeProduto ??
      null,
    unidade: produto.simboloDaUnidadeDeMedida,
    classification,
  };
}

export function getProducts(
  snapshot: GestioSyncSnapshot = requireGestioSnapshot(),
): MaterialProduct[] {
  return snapshot.produtos.map(normalizeProduct);
}

export function getProductById(
  idProd: number,
  snapshot: GestioSyncSnapshot = requireGestioSnapshot(),
): MaterialProduct | null {
  const produto = snapshot.produtos.find((p) => p.idProd === idProd);
  return produto ? normalizeProduct(produto) : null;
}

export function getProductsByMaterialPrefix(
  prefix: string,
  snapshot: GestioSyncSnapshot = requireGestioSnapshot(),
): MaterialProduct[] {
  const normalized = prefix.toUpperCase();
  return getProducts(snapshot).filter((p) => {
    const parsed = parseProductCode(p.codigo);
    return parsed.materialPrefix === normalized;
  });
}

export {
  classifyProduct,
  parseProductCode,
  CANONICAL_DIRECTORY,
  MATERIAL_PREFIX_TO_GROUP,
  SHAPE_CODE_TO_TAXONOMY,
};
