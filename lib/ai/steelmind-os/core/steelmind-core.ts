import type { AgentRequestInput, AgentResponse } from "@/lib/ai/steelmind-os/protocol";
import type { SteelMemoryRepository } from "@/lib/ai/steelmind-os/core/steel-memory.repository";
import type { EventBus } from "@/lib/ai/steelmind-os/core/event-bus";
import type { AgentRegistry, AgentRuntimeSnapshot } from "@/lib/ai/steelmind-os/core/agent-registry";

export interface SteelmindCoreRuntimeStatus {
  agents: AgentRuntimeSnapshot[];
  memoryRecords: number;
  recentRequestIds: string[];
  lastEventType: string | null;
}

export interface SteelmindCoreExecutor {
  route(input: AgentRequestInput): Promise<AgentResponse>;
}

export class SteelmindCoreRuntime {
  constructor(
    private readonly dependencies: {
      executor: SteelmindCoreExecutor;
      registry: AgentRegistry;
      memory: SteelMemoryRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: AgentRequestInput): Promise<AgentResponse> {
    return this.dependencies.executor.route(input);
  }

  async getStatus(): Promise<SteelmindCoreRuntimeStatus> {
    const recent = await this.dependencies.memory.listRecent(20);
    return {
      agents: this.dependencies.registry.listSnapshots(),
      memoryRecords: recent.length,
      recentRequestIds: recent.map((entry) => entry.requestId),
      lastEventType: this.dependencies.eventBus.getLastEvent()?.type ?? null,
    };
  }
}
