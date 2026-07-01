import type { AgentRequestInput, AgentResponse } from "@/lib/ai/steelmind-os/protocol";
import { InMemoryEventBus } from "@/lib/ai/steelmind-os/core/event-bus";
import { InMemoryAgentRegistry } from "@/lib/ai/steelmind-os/core/agent-registry";
import { InMemorySteelMemoryRepository } from "@/lib/ai/steelmind-os/infrastructure/in-memory-steel-memory.repository";
import { CouncilOrchestrator } from "@/lib/ai/steelmind-os/core/council-orchestrator";
import { SteelmindCoreRuntime } from "@/lib/ai/steelmind-os/core/steelmind-core";
import { createLegacyCouncilAgents } from "@/lib/ai/steelmind-os/adapters/legacy-cloud-agents.adapter";

const eventBus = new InMemoryEventBus();
const registry = new InMemoryAgentRegistry();
const memory = new InMemorySteelMemoryRepository();

for (const agent of createLegacyCouncilAgents()) {
  registry.register(agent);
}

const orchestrator = new CouncilOrchestrator(registry, memory, eventBus);
const runtime = new SteelmindCoreRuntime({
  executor: orchestrator,
  registry,
  memory,
  eventBus,
});

export async function executeCouncilRequest(input: AgentRequestInput): Promise<AgentResponse> {
  return runtime.execute(input);
}

export async function getMissionControlSnapshot() {
  const [status, recentDecisions, events, executions, memoryStats] = await Promise.all([
    runtime.getStatus(),
    memory.listRecent(20),
    memory.listEvents(40),
    memory.listExecutions(20),
    memory.getStats(),
  ]);

  const lastExecution = executions[0] ?? null;
  const recentDecision = recentDecisions[0] ?? null;
  const guardianDecisions = recentDecisions.filter(
    (decision) => decision.trace.finalDecision.decidedBy === "guardian",
  );
  const blockedDecisions = recentDecisions.filter(
    (decision) => decision.trace.finalDecision.outcome === "refused",
  );
  const averageResponseMs =
    executions.length > 0
      ? Math.round(executions.reduce((sum, item) => sum + item.durationMs, 0) / executions.length)
      : 0;

  const guardianState = blockedDecisions.length > 0 ? "blocking" : "active";

  return {
    agents: status.agents,
    currentExecution: lastExecution,
    lastEvent: eventBus.getLastEvent(),
    recentEvents: events,
    recentDecisions,
    guardian: {
      state: guardianState,
      checks: guardianDecisions.length,
      blocked: blockedDecisions.length,
      lastDecision: recentDecision?.trace.finalDecision ?? null,
    },
    memory: {
      ...memoryStats,
      averageResponseMs,
      usage: {
        decisionRecords: recentDecisions.length,
        executionRecords: executions.length,
        eventRecords: events.length,
      },
    },
  };
}
