import type { NormCitation } from "@/domains/shared/types";

export interface GuardrailRule {
  id: string;
  version: string;
  name: string;
  formula: string;
  source: string;
  owner: string;
  revisionDate: string;
  assumptions: string[];
  limitations: string[];
  norms: NormCitation[];
  parameters: Record<string, number>;
}

export interface GuardrailRulebook {
  constructiveSystemId: string;
  constructiveSystemVersion: string;
  title: string;
  description: string;
  lastReviewedAt: string;
  rules: GuardrailRule[];
}

export const GUARDA_CORPO_RULEBOOK_V1: GuardrailRulebook = {
  constructiveSystemId: "GUARDA_CORPO",
  constructiveSystemVersion: "v1.0.0",
  title: "Guarda-corpo metálico padrão",
  description:
    "Rulebook inicial para orçamento de guarda-corpo com foco em rastreabilidade, auditabilidade e calibração incremental.",
  lastReviewedAt: "2026-07-01",
  rules: [
    {
      id: "GRCP-MAT-001",
      version: "1.0.0",
      name: "Custo base de material por metro linear",
      formula:
        "materialCost = comprimentoLinearM * custoBaseMaterialPorMetro * fatorMaterial",
      source: "Catálogo Gestio + calibração interna inicial",
      owner: "Conselho de Arquitetura SteelMind",
      revisionDate: "2026-07-01",
      assumptions: [
        "Projeto com modulação padrão de guarda-corpo.",
        "Sem geometrias especiais fora do padrão reto.",
      ],
      limitations: [
        "Não contempla peças especiais sob medida fora da tipologia padrão.",
      ],
      norms: [
        { code: "ABNT NBR 14718", title: "Guarda-corpos para edificações" },
      ],
      parameters: {
        baseMaterialPerMeter: 245,
        materialFactorInox304: 1.24,
        materialFactorCarbono: 1,
      },
    },
    {
      id: "GRCP-FAB-001",
      version: "1.0.0",
      name: "Fabricação e soldagem por metro linear",
      formula:
        "fabricationCost = comprimentoLinearM * horasFabricacaoPorMetro * custoHoraFabricacao",
      source: "Medição interna de produtividade + base industrial",
      owner: "Conselho de Arquitetura SteelMind",
      revisionDate: "2026-07-01",
      assumptions: [
        "Equipe e setup padrão de serralheria industrial.",
      ],
      limitations: [
        "Não inclui retrabalho extraordinário por alterações de projeto.",
      ],
      norms: [
        { code: "ABNT NBR 8800", title: "Projeto de estruturas de aço" },
      ],
      parameters: {
        fabricationHoursPerMeter: 0.62,
        fabricationHourRate: 92,
      },
    },
    {
      id: "GRCP-PNT-001",
      version: "1.0.0",
      name: "Pintura industrial",
      formula: "paintingCost = areaPinturaM2 * custoPinturaPorM2",
      source: "Tabela interna de acabamento industrial",
      owner: "Conselho de Arquitetura SteelMind",
      revisionDate: "2026-07-01",
      assumptions: ["Preparação de superfície padrão."],
      limitations: ["Não contempla jateamento especial fora do escopo."],
      norms: [
        {
          code: "ABNT NBR 7348",
          title: "Pintura industrial de superfícies metálicas",
        },
      ],
      parameters: {
        paintAreaFactor: 1.18,
        paintingCostPerM2: 43,
      },
    },
    {
      id: "GRCP-INS-001",
      version: "1.0.0",
      name: "Montagem em campo",
      formula:
        "installationCost = (comprimentoLinearM * custoInstalacaoPorMetro) + mobilizacaoBase",
      source: "Histórico operacional de montagem em campo",
      owner: "Conselho de Arquitetura SteelMind",
      revisionDate: "2026-07-01",
      assumptions: ["Acesso de obra sem restrição crítica."],
      limitations: ["Não contempla logística especial de içamento pesado."],
      norms: [
        { code: "NR-18", title: "Condições e meio ambiente de trabalho na construção" },
      ],
      parameters: {
        installationCostPerMeter: 58,
        mobilizationBase: 920,
      },
    },
  ],
};
