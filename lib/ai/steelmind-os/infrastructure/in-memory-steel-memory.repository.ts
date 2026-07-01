import type {
  SteelMemoryEventRecord,
  SteelMemoryExecutionRecord,
  SteelMemoryRecord,
  SteelMemoryRepository,
  SteelMemoryWriteInput,
} from "@/lib/ai/steelmind-os/core/steel-memory.repository";
import { buildDecisionLogPayload, type CouncilFlowStage } from "@/lib/ai/steelmind-os/protocol";

function defaultId(): string {
  return crypto.randomUUID();
}

function deriveTags(input: SteelMemoryWriteInput): string[] {
  const builtIn = [
    input.request.target,
    input.response.status,
    input.request.capability.split(".")[0] ?? input.request.capability,
  ];
  const tags = [...builtIn, ...(input.tags ?? [])].map((item) => item.trim()).filter(Boolean);
  return [...new Set(tags)];
}

function inferFlowStage(input: SteelMemoryWriteInput): CouncilFlowStage {
  if (input.flowStage) return input.flowStage;

  const byResponder: Partial<Record<SteelMemoryWriteInput["response"]["responder"], CouncilFlowStage>> = {
    architect: "architect",
    engineering: "engineering",
    qa: "qa",
    guardian: "guardian",
  };

  return byResponder[input.response.responder] ?? "merge";
}

export class InMemorySteelMemoryRepository implements SteelMemoryRepository {
  private readonly records = new Map<string, SteelMemoryRecord>();
  private readonly executions: SteelMemoryExecutionRecord[] = [];
  private readonly events: SteelMemoryEventRecord[] = [];

  constructor(
    private readonly options: {
      now?: () => string;
      idGenerator?: () => string;
      maxRecords?: number;
    } = {},
  ) {}

  async saveDecision(input: SteelMemoryWriteInput): Promise<SteelMemoryRecord> {
    const idGenerator = this.options.idGenerator ?? defaultId;
    const now = this.options.now ?? (() => new Date().toISOString());

    const record: SteelMemoryRecord = {
      id: idGenerator(),
      requestId: input.request.requestId,
      correlationId: input.request.correlationId,
      capability: input.request.capability,
      summary: input.response.summary,
      tags: deriveTags(input),
      references: input.response.decisionTrace.entries.flatMap((entry) => entry.references),
      trace: input.response.decisionTrace,
      decisionLogs: [
        buildDecisionLogPayload({
          request: input.request,
          response: input.response,
          flowStage: inferFlowStage(input),
          timestamp: now(),
        }),
      ],
      storedAt: now(),
    };

    this.records.set(record.requestId, record);
    this.trimCollections();
    return record;
  }

  async saveExecution(
    execution: Omit<SteelMemoryExecutionRecord, "id">,
  ): Promise<SteelMemoryExecutionRecord> {
    const idGenerator = this.options.idGenerator ?? defaultId;
    const payload: SteelMemoryExecutionRecord = {
      id: idGenerator(),
      ...execution,
    };
    this.executions.unshift(payload);
    this.trimCollections();
    return payload;
  }

  async saveEvent(event: Omit<SteelMemoryEventRecord, "id">): Promise<SteelMemoryEventRecord> {
    const idGenerator = this.options.idGenerator ?? defaultId;
    const payload: SteelMemoryEventRecord = {
      id: idGenerator(),
      ...event,
    };
    this.events.unshift(payload);
    this.trimCollections();
    return payload;
  }

  async findByRequestId(requestId: string): Promise<SteelMemoryRecord | null> {
    return this.records.get(requestId) ?? null;
  }

  async listRecent(limit = 20): Promise<SteelMemoryRecord[]> {
    return [...this.records.values()]
      .sort((a, b) => b.storedAt.localeCompare(a.storedAt))
      .slice(0, limit);
  }

  async listExecutions(limit = 20): Promise<SteelMemoryExecutionRecord[]> {
    return this.executions.slice(0, limit);
  }

  async listEvents(limit = 20): Promise<SteelMemoryEventRecord[]> {
    return this.events.slice(0, limit);
  }

  async getStats() {
    const last = await this.listRecent(1);
    return {
      totalDecisions: this.records.size,
      totalExecutions: this.executions.length,
      totalEvents: this.events.length,
      lastStoredAt: last[0]?.storedAt ?? null,
    };
  }

  private trimCollections() {
    const max = this.options.maxRecords ?? 500;
    if (this.executions.length > max) {
      this.executions.length = max;
    }
    if (this.events.length > max) {
      this.events.length = max;
    }

    const records = [...this.records.values()].sort((a, b) => b.storedAt.localeCompare(a.storedAt));
    if (records.length > max) {
      const keep = new Set(records.slice(0, max).map((item) => item.requestId));
      for (const requestId of this.records.keys()) {
        if (!keep.has(requestId)) {
          this.records.delete(requestId);
        }
      }
    }
  }
}
