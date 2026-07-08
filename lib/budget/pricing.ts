import { classifyProduct } from "@/services/gestio/taxonomy";
import type { GestioProduto, GestioSyncSnapshot } from "@/types/gestio";
import type { QuoteLineItem } from "@/types/budget";
import type { ParsedIntent } from "@/lib/budget/parse-intent";

function unitPriceFromSaldo(
  catalog: GestioSyncSnapshot,
  idProd: number,
): number | null {
  const saldos = catalog.saldos.filter((s) => s.idProd === idProd && s.quantidadeTotal > 0);
  if (!saldos.length) return null;
  const totalQty = saldos.reduce((a, s) => a + s.quantidadeTotal, 0);
  const totalVal = saldos.reduce((a, s) => a + s.valorTotal, 0);
  if (totalQty <= 0 || totalVal <= 0) return null;
  return totalVal / totalQty;
}

function searchCatalog(
  catalog: GestioSyncSnapshot,
  terms: string[],
  limit = 5,
): GestioProduto[] {
  const scored = catalog.produtos
    .map((p) => {
      const hay = `${p.codigoInterno ?? ""} ${p.descricaoDoProduto ?? ""}`.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (hay.includes(t.toLowerCase())) score += t.length;
      }
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map((x) => x.p);
}

export function buildQuoteItems(
  catalog: GestioSyncSnapshot | null,
  intent: ParsedIntent,
  fileNames: string[],
): QuoteLineItem[] {
  const items: QuoteLineItem[] = [];
  const produto = intent.produto ?? inferProductFromFiles(fileNames);
  const material = intent.material ?? "Aço carbono";
  const metros = intent.comprimentoMetros ?? 10;
  const terms = [
    material.split(" ")[0],
    intent.dimensoes?.split(" ")[0] ?? "tubo",
    "40x20",
  ].filter(Boolean);

  if (catalog) {
    const matches = searchCatalog(catalog, terms, 4);
    for (const p of matches) {
      const cls = classifyProduct(p.codigoInterno, p.descricaoDoProduto, p);
      const unit = unitPriceFromSaldo(catalog, p.idProd) ?? estimateUnitPrice(cls?.material ?? material);
      const qty = p.descricaoDoProduto?.match(/chapa|placa/i) ? metros * 1.2 : metros * 1.8;
      items.push({
        id: crypto.randomUUID(),
        codigo: p.codigoInterno,
        descricao: p.descricaoDoProduto ?? "Material",
        material: cls?.material ?? material,
        quantidade: Math.round(qty * 10) / 10,
        unidade: p.simboloDaUnidadeDeMedida ?? "m",
        precoUnitario: Math.round(unit * 100) / 100,
        subtotal: 0,
        gestioIdProd: p.idProd,
        origem: "catalogo",
      });
    }
  }

  if (!items.length) {
    items.push(
      makeEstimateItem(`Tubo 40x20 mm — ${material}`, material, metros * 2.2, "m", 28.5),
      makeEstimateItem("Cantoneira 50x50x3 mm", material, metros * 0.4, "m", 42),
      makeEstimateItem("Chapa #18 (recorte)", material, metros * 0.6, "m²", 95),
    );
  }

  items.push(
    makeEstimateItem("Solda MIG + acabamento", "Processo", metros * 0.5, "h", 85, "servico"),
    makeEstimateItem(`Montagem ${produto}`, "Mão de obra", metros * 1.2, "h", 72, "servico"),
  );

  if (intent.incluiPintura !== false) {
    items.push(makeEstimateItem("Pintura eletrostática", "Acabamento", metros * 1.5, "m²", 38, "servico"));
  }

  if (intent.incluiInstalacao) {
    items.push(makeEstimateItem("Instalação em obra", "Serviço", 1, "vb", 850 + metros * 45, "servico"));
  }

  return items.map((i) => ({
    ...i,
    subtotal: Math.round(i.quantidade * i.precoUnitario * 100) / 100,
  }));
}

function makeEstimateItem(
  descricao: string,
  material: string,
  quantidade: number,
  unidade: string,
  precoUnitario: number,
  origem: QuoteLineItem["origem"] = "estimativa",
): QuoteLineItem {
  return {
    id: crypto.randomUUID(),
    codigo: null,
    descricao,
    material,
    quantidade: Math.round(quantidade * 10) / 10,
    unidade,
    precoUnitario,
    subtotal: 0,
    origem,
  };
}

function estimateUnitPrice(material: string): number {
  if (/inox/i.test(material)) return 68;
  if (/galvan/i.test(material)) return 38;
  return 28;
}

function inferProductFromFiles(files: string[]): string {
  const joined = files.join(" ").toLowerCase();
  if (/guarda|corrim/i.test(joined)) return "Guarda-corpo";
  if (/port[aã]o/i.test(joined)) return "Portão";
  if (/dwg|dxf/i.test(joined)) return "Estrutura metálica (projeto CAD)";
  return "Serralheria sob medida";
}

export function summarizeCosts(
  items: QuoteLineItem[],
  opts: {
    margemPercentual: number;
    prazoDias: number;
    incluiInstalacao: boolean;
    incluiPintura: boolean;
    local?: string | null;
  },
) {
  const materiais = items
    .filter((i) => i.origem === "catalogo" || i.origem === "estimativa")
    .reduce((a, i) => a + i.subtotal, 0);
  const maoDeObra = items
    .filter((i) => i.descricao.toLowerCase().includes("montagem") || i.descricao.toLowerCase().includes("solda"))
    .reduce((a, i) => a + i.subtotal, 0);
  const servicos = items
    .filter((i) => i.origem === "servico")
    .reduce((a, i) => a + i.subtotal, 0);
  const subtotal = materiais + maoDeObra + servicos;
  const margemValor = Math.round(subtotal * (opts.margemPercentual / 100) * 100) / 100;
  return {
    materiais: Math.round(materiais * 100) / 100,
    maoDeObra: Math.round(maoDeObra * 100) / 100,
    servicos: Math.round(servicos * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    margemPercentual: opts.margemPercentual,
    margemValor,
    total: Math.round((subtotal + margemValor) * 100) / 100,
    prazoDias: opts.prazoDias,
    incluiInstalacao: opts.incluiInstalacao,
    incluiPintura: opts.incluiPintura,
    localInstalacao: opts.local ?? null,
  };
}
