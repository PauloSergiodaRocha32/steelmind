import { describe, expect, it } from "vitest";
import { normalizeAgentRequest } from "@/lib/ai/steelmind-os/protocol";
import { InMemorySteelMemoryRepository } from "@/lib/ai/steelmind-os/infrastructure/in-memory-steel-memory.repository";

describe("InMemorySteelMemoryRepository", () => {
  it("persists decisions, executions and events", async () => {
    const repo = new InMemorySteelMemoryRepository({
      now: () => "2026-07-01T18:30:00.000Z",
      idGenerator: () => "memory-record",
    });

    const request = normalizeAgentRequest({
      requestId: "req-memory-1",
      correlationId: "corr-memory-1",
      requestedBy: "api",
      target: "engineering",
      capability: "engineering.analyze",
      prompt: "Analyze",
      context: {
        references: [{ kind: "adr", ref: "ADR-015" }],
      },
    });

    const response = {
      requestId: request.requestId,
      responder: "engineering" as const,
      status: "approved" as const,
      summary: "done",
      actions: [],
      createdAt: "2026-07-01T18:30:00.000Z",
      decisionTrace: {
        traceId: "trace-memory-1",
        assembledAt: "2026-07-01T18:30:00.000Z",
        entries: [
          {
            decidedBy: "engineering" as const,
            rationale: "ok",
            references: [{ kind: "adr" as const, ref: "ADR-015" }],
            confidence: 0.9,
            decidedAt: "2026-07-01T18:30:00.000Z",
            outcome: "approved" as const,
          },
        ],
        finalDecision: {
          outcome: "approved" as const,
          decidedBy: "engineering" as const,
          rationale: "ok",
          confidence: 0.9,
        },
      },
    };

    await repo.saveDecision({ request, response });
    await repo.saveExecution({
      requestId: request.requestId,
      correlationId: request.correlationId,
      responder: "engineering",
      capability: request.capability,
      status: "approved",
      confidence: 0.9,
      durationMs: 85,
      timestamp: "2026-07-01T18:30:00.000Z",
    });
    await repo.saveEvent({
      requestId: request.requestId,
      correlationId: request.correlationId,
      type: "decision.completed",
      source: "engineering",
      status: "approved",
      timestamp: "2026-07-01T18:30:00.000Z",
      payload: { summary: "done" },
    });

    const stats = await repo.getStats();
    expect(stats).toMatchObject({
      totalDecisions: 1,
      totalExecutions: 1,
      totalEvents: 1,
    });

    const executions = await repo.listExecutions();
    const events = await repo.listEvents();
    expect(executions[0]?.durationMs).toBe(85);
    expect(events[0]?.type).toBe("decision.completed");
  });
});
