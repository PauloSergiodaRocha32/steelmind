import type { AgentId, AgentStep } from "./types";

export interface AgentDefinition {
  id: AgentId;
  charterPath: string;
  knowledgePaths: string[];
  providerPaths: string[];
}

export const AGENT_REGISTRY: Record<AgentId, AgentDefinition> = {
  engineering: {
    id: "engineering",
    charterPath: "knowledge/agents/engineering.md",
    knowledgePaths: ["knowledge/engineering/"],
    providerPaths: ["providers/materials/", "providers/inventory/", "providers/gestio/"],
  },
  budget: {
    id: "budget",
    charterPath: "knowledge/agents/budget.md",
    knowledgePaths: ["knowledge/budget/"],
    providerPaths: ["providers/gestio/"],
  },
  materials: {
    id: "materials",
    charterPath: "knowledge/agents/materials.md",
    knowledgePaths: ["knowledge/materials/"],
    providerPaths: ["providers/materials/"],
  },
  workforce: {
    id: "workforce",
    charterPath: "knowledge/agents/workforce.md",
    knowledgePaths: ["knowledge/workforce/"],
    providerPaths: ["providers/employees/"],
  },
  gestio: {
    id: "gestio",
    charterPath: "knowledge/agents/gestio.md",
    knowledgePaths: ["knowledge/gestio/"],
    providerPaths: ["providers/gestio/", "providers/inventory/", "providers/materials/"],
  },
  production: {
    id: "production",
    charterPath: "knowledge/agents/production.md",
    knowledgePaths: ["knowledge/production/", "knowledge/manufacturing/"],
    providerPaths: ["providers/production/"],
  },
  qa: {
    id: "qa",
    charterPath: "knowledge/agents/qa.md",
    knowledgePaths: ["knowledge/engineering/"],
    providerPaths: [],
  },
  architecture: {
    id: "architecture",
    charterPath: "knowledge/agents/architecture.md",
    knowledgePaths: ["knowledge/architecture/", "docs/"],
    providerPaths: [],
  },
  release: {
    id: "release",
    charterPath: "knowledge/agents/release.md",
    knowledgePaths: ["knowledge/architecture/"],
    providerPaths: [],
  },
  documentation: {
    id: "documentation",
    charterPath: "knowledge/agents/documentation.md",
    knowledgePaths: ["knowledge/", "docs/"],
    providerPaths: [],
  },
  knowledge: {
    id: "knowledge",
    charterPath: "knowledge/agents/knowledge.md",
    knowledgePaths: ["knowledge/"],
    providerPaths: [],
  },
  product: {
    id: "product",
    charterPath: "knowledge/agents/product.md",
    knowledgePaths: ["knowledge/constitution/"],
    providerPaths: [],
  },
  planning: {
    id: "planning",
    charterPath: "knowledge/agents/planning.md",
    knowledgePaths: ["docs/ROADMAP.md", "docs/SIP.md"],
    providerPaths: [],
  },
};

export function getAgent(id: AgentId): AgentDefinition {
  return AGENT_REGISTRY[id];
}

export function listAgents(): AgentDefinition[] {
  return Object.values(AGENT_REGISTRY);
}

export function resolveStepResources(step: AgentStep): {
  charter: string;
  knowledge: string[];
  providers: string[];
} {
  const agent = AGENT_REGISTRY[step.agent];
  return {
    charter: agent.charterPath,
    knowledge: step.knowledgePaths ?? agent.knowledgePaths,
    providers: step.providerPaths ?? agent.providerPaths,
  };
}
