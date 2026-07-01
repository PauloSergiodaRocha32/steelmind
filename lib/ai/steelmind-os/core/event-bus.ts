import type {
  AgentRequest,
  CouncilAgentId,
  DecisionOutcome,
} from "@/lib/ai/steelmind-os/protocol";

export const STEELMIND_EVENT_TYPES = [
  "request.intake",
  "route.resolved",
  "agent.executed",
  "guardian.checked",
  "memory.persisted",
  "decision.completed",
  "decision.blocked",
] as const;

export type SteelmindEventType = (typeof STEELMIND_EVENT_TYPES)[number];

export interface SteelmindEvent {
  id: string;
  type: SteelmindEventType;
  source: CouncilAgentId | "runtime";
  requestId: string;
  correlationId: string;
  timestamp: string;
  status?: DecisionOutcome;
  durationMs?: number;
  payload?: Record<string, unknown>;
}

export interface EventBus {
  publish(event: Omit<SteelmindEvent, "id" | "timestamp">): SteelmindEvent;
  subscribe(listener: (event: SteelmindEvent) => void): () => void;
  listRecent(limit?: number): SteelmindEvent[];
  getLastEvent(): SteelmindEvent | null;
}

function createId(): string {
  return crypto.randomUUID();
}

export class InMemoryEventBus implements EventBus {
  private readonly listeners = new Set<(event: SteelmindEvent) => void>();
  private readonly events: SteelmindEvent[] = [];

  constructor(
    private readonly options: {
      now?: () => string;
      idGenerator?: () => string;
      maxEvents?: number;
    } = {},
  ) {}

  publish(event: Omit<SteelmindEvent, "id" | "timestamp">): SteelmindEvent {
    const now = this.options.now ?? (() => new Date().toISOString());
    const idGenerator = this.options.idGenerator ?? createId;

    const payload: SteelmindEvent = {
      ...event,
      id: idGenerator(),
      timestamp: now(),
    };

    this.events.unshift(payload);
    const maxEvents = this.options.maxEvents ?? 500;
    if (this.events.length > maxEvents) {
      this.events.length = maxEvents;
    }

    for (const listener of this.listeners) {
      listener(payload);
    }

    return payload;
  }

  subscribe(listener: (event: SteelmindEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  listRecent(limit = 30): SteelmindEvent[] {
    return this.events.slice(0, limit);
  }

  getLastEvent(): SteelmindEvent | null {
    return this.events[0] ?? null;
  }
}

export function inferRequestIdsFromInput(input: AgentRequest): Pick<SteelmindEvent, "requestId" | "correlationId"> {
  return {
    requestId: input.requestId,
    correlationId: input.correlationId,
  };
}
