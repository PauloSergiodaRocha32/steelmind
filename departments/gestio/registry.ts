import type {
  DataAvailability,
  GestioAuditSummary,
  GestioDataRequirement,
  GestioTeamDefinition,
  GestioTeamId,
} from "./types";

export const GESTIO_TEAMS: Record<GestioTeamId, GestioTeamDefinition> = {
  workforce: {
    id: "workforce",
    name: "Workforce Team",
    responsibility:
      "Funcionários, salários, férias, benefícios, produtividade, encargos e custo hora.",
    questionExamples: [
      "Quanto custa uma hora de serralheiro?",
      "Qual centro de custo deste funcionário?",
      "Quais encargos incidem sobre esta função?",
    ],
    providerPaths: ["providers/employees", "providers/finance"],
    knowledgePaths: ["knowledge/workforce"],
  },
  materials: {
    id: "materials",
    name: "Materials Team",
    responsibility:
      "Materiais, estoque, peso, fornecedor, custo e classificação/categoria.",
    questionExamples: [
      "Quanto custa o tubo 50x30?",
      "Existe estoque deste material?",
      "Qual peso deste perfil?",
    ],
    providerPaths: ["providers/materials", "providers/inventory"],
    knowledgePaths: ["knowledge/materials", "knowledge/gestio"],
  },
  purchasing: {
    id: "purchasing",
    name: "Purchasing Team",
    responsibility:
      "Compras, histórico, lead time, fornecedor principal e desempenho de fornecedor.",
    questionExamples: [
      "Qual fornecedor possui menor prazo?",
      "Qual histórico de compra deste item?",
      "Quem é o fornecedor principal?",
    ],
    providerPaths: ["providers/suppliers", "providers/gestio"],
    knowledgePaths: ["knowledge/suppliers"],
  },
  production: {
    id: "production",
    name: "Production Team",
    responsibility:
      "Máquinas, setores, capacidade, produtividade e tempo padrão.",
    questionExamples: [
      "Existe capacidade de produção?",
      "Qual setor executa esta operação?",
      "Qual tempo padrão desta etapa?",
    ],
    providerPaths: ["providers/production"],
    knowledgePaths: ["knowledge/production", "knowledge/manufacturing"],
  },
  finance: {
    id: "finance",
    name: "Finance Team",
    responsibility:
      "Despesas indiretas, markups, impostos, custos fixos e centros de custo.",
    questionExamples: [
      "Qual markup aplicar?",
      "Quais impostos incidem neste orçamento?",
      "Qual custo fixo mensal considerar?",
    ],
    providerPaths: ["providers/finance"],
    knowledgePaths: ["knowledge/pricing", "knowledge/budget"],
  },
  crm: {
    id: "crm",
    name: "CRM Team",
    responsibility:
      "Clientes, histórico, obras, contratos e vínculo comercial com projetos.",
    questionExamples: [
      "Esse cliente já comprou este tipo de obra?",
      "Quais contratos estão ativos?",
      "Qual projeto Gest.io está ligado ao orçamento?",
    ],
    providerPaths: ["providers/crm", "providers/gestio"],
    knowledgePaths: ["knowledge/gestio"],
  },
  "engineering-knowledge": {
    id: "engineering-knowledge",
    name: "Engineering Knowledge Team",
    responsibility:
      "Normas, fórmulas e regras técnicas que não pertencem ao Gest.io.",
    questionExamples: [
      "Qual norma influencia este cálculo?",
      "Qual fórmula governa este orçamento técnico?",
      "Quais módulos dependem desta regra?",
    ],
    providerPaths: [],
    knowledgePaths: ["knowledge/engineering", "knowledge/materials"],
  },
};

export const GESTIO_DATA_REQUIREMENTS: GestioDataRequirement[] = [
  {
    information: "Funcionário",
    existsInGestio: "yes",
    required: "required",
    responsibleTeam: "workforce",
    systemOfRecord: "gestio",
    providerPath: "providers/employees",
    gap: "Implement provider and field mapping.",
  },
  {
    information: "Salário",
    existsInGestio: "yes",
    required: "required",
    responsibleTeam: "workforce",
    systemOfRecord: "gestio",
    providerPath: "providers/employees",
    gap: "Confirm salary field mapping.",
  },
  {
    information: "Encargos",
    existsInGestio: "yes",
    required: "required",
    responsibleTeam: "workforce",
    systemOfRecord: "gestio",
    providerPath: "providers/employees",
    gap: "Confirm whether charges are stored or derived.",
  },
  {
    information: "Centro de custo",
    existsInGestio: "yes",
    required: "required",
    responsibleTeam: "workforce",
    systemOfRecord: "gestio",
    providerPath: "providers/finance",
    gap: "Map cost center relation.",
  },
  {
    information: "Custo hora",
    existsInGestio: "partial",
    required: "required",
    responsibleTeam: "workforce",
    systemOfRecord: "gestio",
    providerPath: "providers/employees",
    gap: "Derive from salary, benefits, charges and productive hours if absent.",
  },
  {
    information: "Material",
    existsInGestio: "yes",
    required: "required",
    responsibleTeam: "materials",
    systemOfRecord: "gestio",
    providerPath: "providers/materials",
    gap: "Implemented for catalog and taxonomy.",
  },
  {
    information: "Peso",
    existsInGestio: "partial",
    required: "ideal",
    responsibleTeam: "materials",
    systemOfRecord: "gestio",
    providerPath: "providers/materials",
    gap: "Audit products missing weight.",
  },
  {
    information: "Fornecedor",
    existsInGestio: "yes",
    required: "required",
    responsibleTeam: "purchasing",
    systemOfRecord: "gestio",
    providerPath: "providers/suppliers",
    gap: "Implement supplier provider.",
  },
  {
    information: "Estoque",
    existsInGestio: "yes",
    required: "required",
    responsibleTeam: "materials",
    systemOfRecord: "gestio",
    providerPath: "providers/inventory",
    gap: "Implemented for balances and branch summaries.",
  },
  {
    information: "Máquina",
    existsInGestio: "yes",
    required: "required",
    responsibleTeam: "production",
    systemOfRecord: "gestio",
    providerPath: "providers/production",
    gap: "Implement production provider.",
  },
  {
    information: "Tempo padrão",
    existsInGestio: "partial",
    required: "required",
    responsibleTeam: "production",
    systemOfRecord: "steelmind",
    providerPath: "providers/production",
    gap: "If absent in Gest.io, model standard time in SteelMind Knowledge.",
  },
  {
    information: "Despesas indiretas",
    existsInGestio: "partial",
    required: "required",
    responsibleTeam: "finance",
    systemOfRecord: "gestio",
    providerPath: "providers/finance",
    gap: "Audit source tables.",
  },
  {
    information: "Markup",
    existsInGestio: "partial",
    required: "required",
    responsibleTeam: "finance",
    systemOfRecord: "steelmind",
    providerPath: "knowledge/pricing",
    gap: "Define versioned pricing policy.",
  },
  {
    information: "Impostos",
    existsInGestio: "yes",
    required: "required",
    responsibleTeam: "finance",
    systemOfRecord: "gestio",
    providerPath: "providers/finance",
    gap: "Confirm tax fields.",
  },
  {
    information: "Cliente",
    existsInGestio: "yes",
    required: "required",
    responsibleTeam: "crm",
    systemOfRecord: "gestio",
    providerPath: "providers/crm",
    gap: "Implement CRM provider.",
  },
  {
    information: "Contrato",
    existsInGestio: "partial",
    required: "required",
    responsibleTeam: "crm",
    systemOfRecord: "gestio",
    providerPath: "providers/crm",
    gap: "Audit contract endpoints.",
  },
  {
    information: "Norma ABNT",
    existsInGestio: "no",
    required: "required",
    responsibleTeam: "engineering-knowledge",
    systemOfRecord: "steelmind",
    providerPath: "knowledge/engineering",
    gap: "Must live in Knowledge Platform.",
  },
  {
    information: "Fórmulas",
    existsInGestio: "no",
    required: "required",
    responsibleTeam: "engineering-knowledge",
    systemOfRecord: "steelmind",
    providerPath: "knowledge/engineering",
    gap: "Must live in Knowledge Platform.",
  },
];

export function listGestioTeams(): GestioTeamDefinition[] {
  return Object.values(GESTIO_TEAMS);
}

export function getGestioTeam(teamId: GestioTeamId): GestioTeamDefinition {
  return GESTIO_TEAMS[teamId];
}

export function getRequirementsForTeam(
  teamId: GestioTeamId,
): GestioDataRequirement[] {
  return GESTIO_DATA_REQUIREMENTS.filter(
    (requirement) => requirement.responsibleTeam === teamId,
  );
}

export function summarizeGestioAudit(): GestioAuditSummary {
  const byAvailability = zeroAvailability();
  const byTeam = zeroTeams();

  for (const requirement of GESTIO_DATA_REQUIREMENTS) {
    byAvailability[requirement.existsInGestio]++;
    byTeam[requirement.responsibleTeam]++;
  }

  const requiredGaps = GESTIO_DATA_REQUIREMENTS.filter(
    (requirement) =>
      requirement.required === "required" &&
      requirement.existsInGestio !== "yes",
  );

  return {
    total: GESTIO_DATA_REQUIREMENTS.length,
    byAvailability,
    byTeam,
    requiredGaps,
  };
}

function zeroAvailability(): Record<DataAvailability, number> {
  return { yes: 0, partial: 0, no: 0, unknown: 0 };
}

function zeroTeams(): Record<GestioTeamId, number> {
  return {
    workforce: 0,
    materials: 0,
    purchasing: 0,
    production: 0,
    finance: 0,
    crm: 0,
    "engineering-knowledge": 0,
  };
}
