import type { ProductClassification } from "@/types/gestio";

/** Material prefix (1º segmento do código interno) → grupo Gestio */
export const MATERIAL_PREFIX_TO_GROUP: Record<
  string,
  { code: string; label: string }
> = {
  AC: { code: "918393", label: "Aço Carbono" },
  I304: { code: "240868", label: "AÇO INOX 304" },
  I316: { code: "089693", label: "AÇO INOX 316" },
  AL: { code: "624610", label: "ALUMÍNIO" },
  FX: { code: "583788", label: "FIXADORES" },
  CO: { code: "260702", label: "Consumíveis" },
  LT: { code: "819411", label: "LATÃO" },
  FE: { code: "148001", label: "FERRAGENS" },
  VD: { code: "627788", label: "VIDROS" },
  AB: { code: "754025", label: "ACABAMENTOS" },
  MAT: { code: "260702", label: "Consumíveis" },
  ORC: { code: "926419", label: "ORÇAMENTO" },
};

/** Forma/perfil (2º segmento) → categoria + tipo Gestio */
export const SHAPE_CODE_TO_TAXONOMY: Record<
  string,
  { categoryId: number; category: string; typeId: number; type: string }
> = {
  TR: { categoryId: 4, category: "Tubos Retangulares", typeId: 1, type: "TUBO" },
  TQ: { categoryId: 5, category: "Tubos Quadrados", typeId: 4, type: "Tubos Quadrados" },
  TRD: { categoryId: 6, category: "Tubos Redondos", typeId: 1, type: "TUBO" },
  CAN: { categoryId: 7, category: "Cantoneiras", typeId: 5, type: "Cantoneiras" },
  CL: { categoryId: 16, category: "Chapas Lisas", typeId: 11, type: "Chapa" },
  CX: { categoryId: 17, category: "Chapas Xadrez", typeId: 11, type: "Chapa" },
  BC: { categoryId: 8, category: "Barras Chatas", typeId: 6, type: "Barras Chatas" },
  BQ: { categoryId: 14, category: "Barras Quadradas", typeId: 10, type: "Barra" },
  BR: { categoryId: 15, category: "Barras Redondas", typeId: 10, type: "Barra" },
  PAR: { categoryId: 25, category: "Parafusos", typeId: 19, type: "Parafuso" },
  ARR: { categoryId: 13, category: "Arruelas", typeId: 9, type: "Arruela" },
  POR: { categoryId: 29, category: "Porcas", typeId: 21, type: "Porca" },
  PH: { categoryId: 26, category: "Perfis H", typeId: 20, type: "Perfil" },
  PI: { categoryId: 27, category: "Perfis I", typeId: 20, type: "Perfil" },
  PU: { categoryId: 9, category: "Perfis U", typeId: 7, type: "Perfis U" },
  PW: { categoryId: 11, category: "Vigas W", typeId: 20, type: "Perfil" },
  DOB: { categoryId: 21, category: "Dobradiças", typeId: 15, type: "Dobradiça" },
  FEC: { categoryId: 22, category: "Fechaduras", typeId: 17, type: "Fechadura" },
  CHU: { categoryId: 18, category: "Chumbadores", typeId: 12, type: "Chumbador" },
  DIS: { categoryId: 20, category: "Discos", typeId: 14, type: "Disco" },
  LIX: { categoryId: 23, category: "Lixas", typeId: 18, type: "Lixa" },
  REB: { categoryId: 31, category: "Rebites", typeId: 23, type: "Rebite" },
  TE: { categoryId: 34, category: "Telas", typeId: 26, type: "Tela" },
  PRI: { categoryId: 30, category: "Primer", typeId: 22, type: "Primer" },
  SOL: { categoryId: 12, category: "Solda e Acabamento", typeId: 24, type: "Soldagem" },
  VID: { categoryId: 36, category: "Vidros", typeId: 28, type: "Vidro" },
  CR: { categoryId: 19, category: "Corrimãos", typeId: 13, type: "Corrimão" },
  ME: { categoryId: 24, category: "Metais Expandidos", typeId: 16, type: "Expandido" },
  SPG: { categoryId: 33, category: "Spray Galvanizante", typeId: 25, type: "Spray" },
  TIN: { categoryId: 35, category: "Tintas", typeId: 27, type: "Tinta" },
};

const DESCRIPTION_RULES: Array<{
  pattern: RegExp;
  shape: string;
}> = [
  { pattern: /tubo\s+retangular/i, shape: "TR" },
  { pattern: /tubo\s+quadrado/i, shape: "TQ" },
  { pattern: /tubo\s+redondo/i, shape: "TRD" },
  { pattern: /cantoneira/i, shape: "CAN" },
  { pattern: /chapa\s+lisa/i, shape: "CL" },
  { pattern: /chapa\s+xadrez/i, shape: "CX" },
  { pattern: /barra\s+chata/i, shape: "BC" },
  { pattern: /barra\s+quadrada/i, shape: "BQ" },
  { pattern: /barra\s+redonda/i, shape: "BR" },
  { pattern: /parafuso/i, shape: "PAR" },
  { pattern: /arruela/i, shape: "ARR" },
  { pattern: /porca/i, shape: "POR" },
  { pattern: /dobradi[cç]a/i, shape: "DOB" },
  { pattern: /fechadura/i, shape: "FEC" },
  { pattern: /arame\s+mig/i, shape: "SOL" },
  { pattern: /canaleta/i, shape: "CAN" },
  { pattern: /corrim[aã]o/i, shape: "CR" },
  { pattern: /chapa.*lat[aã]o/i, shape: "CL" },
  { pattern: /escada|port[aã]o|guarda-corpo|estrutura\s+met[aá]lica/i, shape: "CR" },
  { pattern: /chapa.*a[cç]o\s+carbono|revestimento.*chapa/i, shape: "CL" },
  { pattern: /pisante|barra\s+redonda\s+lat[aã]o/i, shape: "BR" },
  { pattern: /porta\s+de\s+giro.*alum/i, shape: "CL" },
  { pattern: /garrafa|água/i, shape: "SOL" },
];

const LEGACY_ORCAMENTO_PATTERN = /^(G\d+|\d{4}(\.0)?)$/i;

export function parseProductCode(codigoInterno: string | null): {
  materialPrefix: string | null;
  shapeCode: string | null;
} {
  if (!codigoInterno) return { materialPrefix: null, shapeCode: null };

  if (LEGACY_ORCAMENTO_PATTERN.test(codigoInterno.trim())) {
    return { materialPrefix: "ORC", shapeCode: null };
  }

  if (/^A\d+$/i.test(codigoInterno.trim())) {
    return { materialPrefix: "CO", shapeCode: "SOL" };
  }

  const parts = codigoInterno.split("-");
  if (parts.length < 2) return { materialPrefix: null, shapeCode: null };

  const materialPrefix = parts[0]?.toUpperCase() ?? null;
  const shapeCode = parts[1]?.toUpperCase() ?? null;

  return { materialPrefix, shapeCode };
}

const DESCRIPTION_MATERIAL_RULES: Array<{
  pattern: RegExp;
  prefix: string;
}> = [
  { pattern: /inox\s*316|aisi\s*316/i, prefix: "I316" },
  { pattern: /inox\s*304|aisi\s*304/i, prefix: "I304" },
  { pattern: /alum[ií]nio/i, prefix: "AL" },
  { pattern: /lat[aã]o/i, prefix: "LT" },
  { pattern: /a[cç]o\s+carbono/i, prefix: "AC" },
];

function resolveMaterialFromDescription(desc: string): string | null {
  for (const rule of DESCRIPTION_MATERIAL_RULES) {
    if (rule.pattern.test(desc)) return rule.prefix;
  }
  return null;
}

export function classifyProduct(
  codigoInterno: string | null,
  descricao: string | null,
  existing?: {
    codigoDoGrupoDeProduto?: string | null;
    codigoDaCategoriaDeProduto?: number | null;
    codigoDoTipoDeProduto?: number | null;
  },
): ProductClassification | null {
  if (
    existing?.codigoDoGrupoDeProduto &&
    existing.codigoDaCategoriaDeProduto &&
    existing.codigoDoTipoDeProduto
  ) {
    return {
      codigoDoGrupoDeProduto: existing.codigoDoGrupoDeProduto,
      codigoDaCategoriaDeProduto: existing.codigoDaCategoriaDeProduto,
      codigoDoTipoDeProduto: existing.codigoDoTipoDeProduto,
      material: "—",
      categoria: "—",
      tipo: "—",
      source: "existing",
    };
  }

  const desc = descricao ?? "";
  let { materialPrefix, shapeCode } = parseProductCode(codigoInterno);
  let resolvedShape = shapeCode;

  if (!resolvedShape || !SHAPE_CODE_TO_TAXONOMY[resolvedShape]) {
    for (const rule of DESCRIPTION_RULES) {
      if (rule.pattern.test(desc)) {
        resolvedShape = rule.shape;
        break;
      }
    }
  }

  if (materialPrefix === "ORC" || (codigoInterno && LEGACY_ORCAMENTO_PATTERN.test(codigoInterno.trim()))) {
    const descMaterial = resolveMaterialFromDescription(desc);
    if (descMaterial) {
      materialPrefix = descMaterial;
    }
  }

  const material =
    (materialPrefix && MATERIAL_PREFIX_TO_GROUP[materialPrefix]) ?? null;
  let shape =
    (resolvedShape && SHAPE_CODE_TO_TAXONOMY[resolvedShape]) ?? null;

  if (!shape && materialPrefix === "ORC") {
    shape = {
      categoryId: 1,
      category: "MATERIAIS",
      typeId: 3,
      type: "Matéria-Prima",
    };
  }

  if (!material || !shape) return null;

  return {
    codigoDoGrupoDeProduto: material.code,
    codigoDaCategoriaDeProduto: shape.categoryId,
    codigoDoTipoDeProduto: shape.typeId,
    material: material.label,
    categoria: shape.category,
    tipo: shape.type,
    source:
      shapeCode === resolvedShape && materialPrefix !== "ORC" ? "code" : "description",
  };
}

export const CANONICAL_DIRECTORY = Object.entries(MATERIAL_PREFIX_TO_GROUP).map(
  ([prefix, group]) => ({
    prefix,
    material: group.label,
    grupoCode: group.code,
    shapes: Object.entries(SHAPE_CODE_TO_TAXONOMY).map(([code, shape]) => ({
      code,
      ...shape,
    })),
  }),
);
