import type {
  AgentRequest,
  CouncilAgentId,
  CouncilTarget,
  DecisionOutcome,
} from "@/lib/ai/steelmind-os/protocol";

export interface AgentExecutionResult {
  status: DecisionOutcome;
  summary: string;
  actions?: AgentRequest["actions"];
  rationale?: string;
  confidence?: number;
  payload?: Record<string, unknown>;
}

export interface CouncilRuntimeAgent {
  id: CouncilAgentId;
  name: string;
  capabilities: string[];
  canHandle(request: AgentRequest): boolean;
  execute(request: AgentRequest): Promise<AgentExecutionResult>;
}

export interface AgentExecutionMetric {
  status: DecisionOutcome;
  durationMs: number;
  at: string;
}

export interface AgentRuntimeSnapshot {
  id: CouncilAgentId;
  name: string;
  capabilities: string[];
  online: boolean;
  lastSeenAt: string | null;
  lastExecutionMs: number | null;
  executions: number;
  failures: number;
  lastStatus: DecisionOutcome | null;
}

export interface AgentRegistry {
  register(agent: CouncilRuntimeAgent): void;
  unregister(agentId: CouncilAgentId): void;
  resolveByTarget(target: CouncilTarget): CouncilRuntimeAgent | null;
  resolveByRequest(request: AgentRequest): CouncilRuntimeAgent | null;
  recordExecution(agentId: CouncilAgentId, metric: AgentExecutionMetric): void;
  listAgents(): CouncilRuntimeAgent[];
  listSnapshots(): AgentRuntimeSnapshot[];
}

interface AgentMetricState {
  lastSeenAt: string | null;
  lastExecutionMs: number | null;
  executions: number;
  failures: number;
  lastStatus: DecisionOutcome | null;
}

function createEmptyState(): AgentMetricState {
  return {
    lastSeenAt: null,
    lastExecutionMs: null,
    executions: 0,
    failures: 0,
    lastStatus: null,
  };
}

export class InMemoryAgentRegistry implements AgentRegistry {
  private readonly agents = new Map<CouncilAgentId, CouncilRuntimeAgent>();
  private readonly metrics = new Map<CouncilAgentId, AgentMetricState>();

  register(agent: CouncilRuntimeAgent): void {
    this.agents.set(agent.id, agent);
    this.metrics.set(agent.id, this.metrics.get(agent.id) ?? createEmptyState());
  }

  unregister(agentId: CouncilAgentId): void {
    this.agents.delete(agentId);
    this.metrics.delete(agentId);
  }

  resolveByTarget(target: CouncilTarget): CouncilRuntimeAgent | null {
    if (target === "ai-council") return null;
    return this.agents.get(target) ?? null;
  }

  resolveByRequest(request: AgentRequest): CouncilRuntimeAgent | null {
    const direct = this.resolveByTarget(request.target);
    if (direct) return direct;
    return this.listAgents().find((agent) => agent.canHandle(request)) ?? null;
  }

  recordExecution(agentId: CouncilAgentId, metric: AgentExecutionMetric): void {
    const state = this.metrics.get(agentId) ?? createEmptyState();
    state.lastSeenAt = metric.at;
    state.lastExecutionMs = metric.durationMs;
    state.executions += 1;
    state.lastStatus = metric.status;
    if (metric.status === "failed" || metric.status === "refused") {
      state.failures += 1;
    }
    this.metrics.set(agentId, state);
  }

  listAgents(): CouncilRuntimeAgent[] {
    return [...this.agents.values()];
  }

  listSnapshots(): AgentRuntimeSnapshot[] {
    return this.listAgents().map((agent) => {
      const metric = this.metrics.get(agent.id) ?? createEmptyState();
      return {
        id: agent.id,
        name: agent.name,
        capabilities: agent.capabilities,
        online: true,
        lastSeenAt: metric.lastSeenAt,
        lastExecutionMs: metric.lastExecutionMs,
        executions: metric.executions,
        failures: metric.failures,
        lastStatus: metric.lastStatus,
      };
    });
  }
}
