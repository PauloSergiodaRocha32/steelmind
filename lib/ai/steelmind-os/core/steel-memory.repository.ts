import type {
  AgentRequest,
  AgentResponse,
  CouncilFlowStage,
  DecisionReference,
  DecisionTrace,
  SteelMemoryDecisionLogPayload,
} from "@/lib/ai/steelmind-os/protocol";
import type { SteelmindEvent } from "@/lib/ai/steelmind-os/core/event-bus";

export interface SteelMemoryExecutionRecord {
  id: string;
  requestId: string;
  correlationId: string;
  responder: AgentResponse["responder"];
  capability: string;
  status: AgentResponse["status"];
  confidence: number;
  durationMs: number;
  timestamp: string;
}

export interface SteelMemoryEventRecord {
  id: string;
  requestId: string;
  correlationId: string;
  type: SteelmindEvent["type"];
  source: SteelmindEvent["source"];
  status?: SteelmindEvent["status"];
  timestamp: string;
  payload?: Record<string, unknown>;
}

export interface SteelMemoryRecord {
  id: string;
  requestId: string;
  correlationId: string;
  capability: string;
  summary: string;
  tags: string[];
  references: DecisionReference[];
  trace: DecisionTrace;
  decisionLogs: SteelMemoryDecisionLogPayload[];
  storedAt: string;
}

export interface SteelMemoryWriteInput {
  request: AgentRequest;
  response: AgentResponse;
  tags?: string[];
  flowStage?: CouncilFlowStage;
}

export interface SteelMemoryStats {
  totalDecisions: number;
  totalExecutions: number;
  totalEvents: number;
  lastStoredAt: string | null;
}

export interface SteelMemoryRepository {
  saveDecision(input: SteelMemoryWriteInput): Promise<SteelMemoryRecord>;
  saveExecution(execution: Omit<SteelMemoryExecutionRecord, "id">): Promise<SteelMemoryExecutionRecord>;
  saveEvent(event: Omit<SteelMemoryEventRecord, "id">): Promise<SteelMemoryEventRecord>;
  findByRequestId(requestId: string): Promise<SteelMemoryRecord | null>;
  listRecent(limit?: number): Promise<SteelMemoryRecord[]>;
  listExecutions(limit?: number): Promise<SteelMemoryExecutionRecord[]>;
  listEvents(limit?: number): Promise<SteelMemoryEventRecord[]>;
  getStats(): Promise<SteelMemoryStats>;
}
