export interface ParsedIntent {
  produto?: string;
  dimensoes?: string;
  material?: string;
  comprimentoMetros?: number;
  margemPercentual?: number;
  prazoDias?: number;
  incluiInstalacao?: boolean;
  incluiPintura?: boolean;
  local?: string;
  removerInstalacao?: boolean;
  removerPintura?: boolean;
}

const MATERIAL_PATTERNS = [
  { re: /inox\s*304/i, value: "INOX 304" },
  { re: /inox\s*316/i, value: "INOX 316" },
  { re: /a[cç]o\s*carbono/i, value: "Aço carbono" },
  { re: /galvaniz/i, value: "Galvanizado" },
];

const PRODUCT_PATTERNS = [
  { re: /guarda[\s-]?corpo/i, value: "Guarda-corpo" },
  { re: /corrim[aã]o/i, value: "Corrimão" },
  { re: /port[aã]o/i, value: "Portão" },
  { re: /estrutura\s*met[aá]lica/i, value: "Estrutura metálica" },
  { re: /escada/i, value: "Escada metálica" },
  { re: /mezanino/i, value: "Mezanino" },
  { re: /cobertura/i, value: "Cobertura metálica" },
];

export function parseIntent(text: string): ParsedIntent {
  const intent: ParsedIntent = {};
  const lower = text.toLowerCase();

  for (const { re, value } of PRODUCT_PATTERNS) {
    if (re.test(text)) {
      intent.produto = value;
      break;
    }
  }

  for (const { re, value } of MATERIAL_PATTERNS) {
    if (re.test(text)) {
      intent.material = value;
      break;
    }
  }

  const tubo = text.match(/tubo\s*(\d+)\s*[x×]\s*(\d+)/i);
  if (tubo) intent.dimensoes = `Tubo ${tubo[1]}x${tubo[2]} mm`;

  const cantoneira = text.match(/cantoneira\s*(\d+)\s*[x×]\s*(\d+)/i);
  if (cantoneira) intent.dimensoes = `Cantoneira ${cantoneira[1]}x${cantoneira[2]} mm`;

  const metros = text.match(/(\d+(?:[.,]\d+)?)\s*m(?:etros)?(?:\b|$)/i);
  if (metros) intent.comprimentoMetros = parseFloat(metros[1].replace(",", "."));

  const margem = text.match(/margem\s*(\d+(?:[.,]\d+)?)\s*%/i);
  if (margem) intent.margemPercentual = parseFloat(margem[1].replace(",", "."));

  const prazo = text.match(/prazo\s*(\d+)\s*dias?/i);
  if (prazo) intent.prazoDias = parseInt(prazo[1], 10);

  if (/com\s+instala/i.test(lower) || /inclui\s+instala/i.test(lower)) {
    intent.incluiInstalacao = true;
  }
  if (/sem\s+instala/i.test(lower)) intent.removerInstalacao = true;

  if (/com\s+pintura/i.test(lower) || /inclui\s+pintura/i.test(lower)) {
    intent.incluiPintura = true;
  }
  if (/sem\s+pintura/i.test(lower)) intent.removerPintura = true;

  const local = text.match(/(?:em|instala[cç][aã]o\s+em)\s+([A-Za-zÀ-ú\s]+?)(?:\s*[·•|]|$)/i);
  if (local) intent.local = local[1].trim();

  return intent;
}

export function mergeIntent(
  base: ParsedIntent,
  patch: ParsedIntent,
): ParsedIntent {
  return { ...base, ...Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  ) };
}
