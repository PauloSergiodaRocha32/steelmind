/**
 * Engineering Agent — implements calculations defined in knowledge/engineering/.
 * See knowledge/agents/engineering.md for charter.
 */

export interface FachadaAcmInput {
  areaBruta: number;
  perdas?: number;
  espessuraAcm: 3 | 4;
  moduloChapa?: { largura: number; altura: number };
  tipoSubestrutura: "cantoneira" | "perfil-u";
  alturaFachada?: number;
}

export interface FachadaAcmResult {
  areaLiquida: number;
  qtdChapas: number;
  pesoTotalKg: number;
  subestrutura: { tipo: string; quantidade: number; unidade: string };
  normasAplicaveis: string[];
  alertas: string[];
}

const PESO_POR_ESPESSURA: Record<3 | 4, number> = {
  3: 4.5,
  4: 5.5,
};

/** Implements knowledge/engineering/fachada-acm.md v1.0 */
export function calcularFachadaAcm(input: FachadaAcmInput): FachadaAcmResult {
  const perdas = input.perdas ?? 8;
  const modulo = input.moduloChapa ?? { largura: 1220, altura: 2440 };
  const alertas: string[] = [];
  const normas: string[] = [];

  const areaLiquida = input.areaBruta * (1 + perdas / 100);
  const areaChapa = (modulo.largura / 1000) * (modulo.altura / 1000);
  const qtdChapas = Math.ceil(areaLiquida / areaChapa);
  const pesoTotalKg = areaLiquida * PESO_POR_ESPESSURA[input.espessuraAcm];

  if (input.alturaFachada != null && input.alturaFachada > 10) {
    alertas.push("Fachada > 10 m — exigir ACM FR (normas AVCB/bombeiros)");
    normas.push("Normas AVCB / bombeiros — ACM FR");
  }

  if (perdas < 5) {
    alertas.push("Perdas abaixo do mínimo recomendado (5%)");
  }

  normas.push("Manual do fabricante ACM — fixação e dilatação");

  const perimetro = Math.sqrt(input.areaBruta) * 4;
  const comprimentoBarra = 6;
  const qtdSubestrutura = Math.ceil(perimetro / comprimentoBarra);

  return {
    areaLiquida: round2(areaLiquida),
    qtdChapas,
    pesoTotalKg: round2(pesoTotalKg),
    subestrutura: {
      tipo: input.tipoSubestrutura,
      quantidade: qtdSubestrutura,
      unidade: "barra",
    },
    normasAplicaveis: normas,
    alertas,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const KNOWLEDGE_SPEC = "knowledge/engineering/fachada-acm.md";
