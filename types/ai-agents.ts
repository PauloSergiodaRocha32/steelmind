export type AgentId =
  | "orchestrator"
  | "health"
  | "rbac"
  | "gestio"
  | "modules"
  | "data"
  | "security";

export type AgentSeverity = "info" | "warn" | "error";
export type AgentStatus = "pass" | "warn" | "fail" | "running";

export interface AgentFinding {
  severity: AgentSeverity;
  agent: AgentId;
  code: string;
  message: string;
  fix?: string;
  href?: string;
}

export interface AgentRunResult {
  id: string;
  agent: AgentId;
  status: AgentStatus;
  durationMs: number;
  findings: AgentFinding[];
  startedAt: string;
  finishedAt: string;
}

export interface OrchestratorReport {
  id: string;
  status: AgentStatus;
  agents: AgentRunResult[];
  summary: {
    pass: number;
    warn: number;
    fail: number;
    totalFindings: number;
  };
  score: number;
  startedAt: string;
  finishedAt: string;
  triggeredBy?: string | null;
}

export interface SteelAIMessage {
  id: string;
  role: "user" | "assistant" | "system" | "agent";
  content: string;
  timestamp: string;
  agentId?: AgentId;
  metadata?: Record<string, unknown>;
}

export interface SteelAIConversation {
  id: string;
  userId: string;
  messages: SteelAIMessage[];
  contextPath?: string;
  updatedAt: string;
}

export const AGENT_LABELS: Record<AgentId, string> = {
  orchestrator: "Orquestrador Cloud",
  health: "Saúde da Plataforma",
  rbac: "RBAC & Auth",
  gestio: "Gestio ERP",
  modules: "Módulos Funcionais",
  data: "Persistência de Dados",
  security: "Segurança",
};

export const AGENT_DESCRIPTIONS: Record<AgentId, string> = {
  orchestrator: "Coordena todos os agentes cloud e gera score de saúde",
  health: "Verifica APIs, rotas e respostas críticas",
  rbac: "Valida matriz de permissões dos 6 perfis",
  gestio: "Audita catálogo, sync e integração ERP",
  modules: "Testa módulos Commercial → Budget → Warehouse",
  data: "Verifica JSON local e Supabase",
  security: "Auth, cookies, secrets e RLS",
};
