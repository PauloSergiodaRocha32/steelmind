export type AgentId =
  | "engineering"
  | "budget"
  | "materials"
  | "workforce"
  | "gestio"
  | "production"
  | "qa"
  | "architecture"
  | "release"
  | "documentation"
  | "knowledge"
  | "product"
  | "planning";

export interface AgentStep {
  agent: AgentId;
  action: string;
  knowledgePaths?: string[];
  providerPaths?: string[];
  outputPaths?: string[];
}

export interface OrchestratorPlan {
  intent: string;
  createdAt: string;
  steps: AgentStep[];
  status: "planned" | "in_progress" | "completed" | "blocked";
}

export interface OrchestratorResult {
  plan: OrchestratorPlan;
  notes: string[];
}
