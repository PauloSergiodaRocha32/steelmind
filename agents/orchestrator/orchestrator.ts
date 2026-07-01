import { resolveStepResources, AGENT_REGISTRY } from "./registry";
import type { AgentStep, OrchestratorPlan, OrchestratorResult } from "./types";

const INTENT_PATTERNS: Array<{
  pattern: RegExp;
  knowledgeSpec: string;
  steps: AgentStep[];
}> = [
  {
    pattern: /fachada\s+acm|acm\s+facade|cálculo.*acm/i,
    knowledgeSpec: "knowledge/engineering/fachada-acm.md",
    steps: [
      {
        agent: "planning",
        action: "Confirmar escopo e dependências do cálculo de fachada ACM",
      },
      {
        agent: "engineering",
        action: "Ler spec, consultar Departamento Gest.io e implementar cálculo",
        departmentPaths: ["departments/gestio"],
        knowledgePaths: [
          "knowledge/engineering/fachada-acm.md",
          "knowledge/materials/acm-panels.md",
        ],
        providerPaths: ["providers/materials/", "providers/inventory/"],
        outputPaths: ["modules/engineering/"],
      },
      {
        agent: "materials",
        action: "Perguntar ao Materials Team sobre ACM no catálogo",
        departmentPaths: ["departments/gestio#materials"],
        providerPaths: ["providers/materials/"],
      },
      {
        agent: "gestio",
        action: "Perguntar ao CRM Team sobre projetos e vínculos Gest.io",
        departmentPaths: ["departments/gestio#crm"],
        providerPaths: ["providers/gestio/"],
      },
      {
        agent: "budget",
        action:
          "Consultar Workforce, Purchasing, Production e Finance antes de estimar custo",
        departmentPaths: [
          "departments/gestio#workforce",
          "departments/gestio#purchasing",
          "departments/gestio#production",
          "departments/gestio#finance",
        ],
        knowledgePaths: ["knowledge/budget/"],
      },
      {
        agent: "qa",
        action: "Validar outputs contra knowledge/engineering/fachada-acm.md",
      },
      {
        agent: "documentation",
        action: "Atualizar memorial e referências cruzadas",
        outputPaths: ["knowledge/engineering/", "docs/"],
      },
      {
        agent: "release",
        action: "Abrir PR draft para revisão humana",
      },
    ],
  },
];

function defaultSteps(intent: string): AgentStep[] {
  return [
    {
      agent: "planning",
      action: `Analisar intent: "${intent}"`,
      knowledgePaths: ["docs/SIP.md"],
    },
    {
      agent: "architecture",
      action: "Verificar limites de módulo e ADRs",
      knowledgePaths: ["knowledge/architecture/", "docs/ARCHITECTURE.md"],
    },
    {
      agent: "documentation",
      action: "Documentar plano antes de implementar",
    },
  ];
}

export function planFromIntent(intent: string): OrchestratorPlan {
  const match = INTENT_PATTERNS.find((p) => p.pattern.test(intent));
  const steps = match ? match.steps : defaultSteps(intent);

  return {
    intent,
    createdAt: new Date().toISOString(),
    steps,
    status: "planned",
  };
}

export function executePlan(plan: OrchestratorPlan): OrchestratorResult {
  const notes: string[] = [];

  for (const step of plan.steps) {
    const resources = resolveStepResources(step);
    const agent = AGENT_REGISTRY[step.agent];

    notes.push(
      `[${step.agent}] ${step.action}`,
      `  charter: ${agent.charterPath}`,
      `  departments: ${step.departmentPaths?.join(", ") || "—"}`,
      `  knowledge: ${resources.knowledge.join(", ") || "—"}`,
      `  providers: ${resources.providers.join(", ") || "—"}`,
    );

    if (step.outputPaths?.length) {
      notes.push(`  outputs: ${step.outputPaths.join(", ")}`);
    }
  }

  notes.push(
    "",
    "→ Próximo passo: executar steps e abrir PR (revisão humana obrigatória)",
  );

  return { plan: { ...plan, status: "planned" }, notes };
}

export function orchestrate(intent: string): OrchestratorResult {
  const plan = planFromIntent(intent);
  return executePlan(plan);
}
