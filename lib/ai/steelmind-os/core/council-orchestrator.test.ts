import { describe, expect, it } from "vitest";
import { CouncilOrchestrator, type SpecialistAgent } from "@/lib/ai/steelmind-os/core/council-orchestrator";
import { InMemorySteelMemoryRepository } from "@/lib/ai/steelmind-os/infrastructure/in-memory-steel-memory.repository";
import { InMemoryAgentRegistry } from "@/lib/ai/steelmind-os/core/agent-registry";
import { InMemoryEventBus } from "@/lib/ai/steelmind-os/core/event-bus";

describe("CouncilOrchestrator", () => {
  it("routes to specialist and assembles council decision trace", async () => {
    const memory = new InMemorySteelMemoryRepository({
      now: () => "2026-07-01T16:00:00.000Z",
      idGenerator: () => "memory-1",
    });
    const eventBus = new InMemoryEventBus({
      now: () => "2026-07-01T16:00:00.000Z",
      idGenerator: () => "event-1",
    });
    const registry = new InMemoryAgentRegistry();

    const engineeringSpecialist: SpecialistAgent = {
      id: "engineering",
      name: "Engineering Specialist",
      capabilities: ["engineering.analyze"],
      canHandle: (request) => request.capability.startsWith("engineering."),
      execute: async () => ({
        status: "approved",
        summary: "Engineering specialist prepared implementation draft.",
        rationale: "Scope and constraints are clear for engineering.",
        confidence: 0.93,
      }),
    };

    registry.register(engineeringSpecialist);

    let sequence = 0;
    const orchestrator = new CouncilOrchestrator(registry, memory, eventBus, {
      now: () => "2026-07-01T16:00:00.000Z",
      idGenerator: () => `trace-${++sequence}`,
    });

    const response = await orchestrator.route({
      requestedBy: "api",
      target: "engineering",
      capability: "engineering.analyze",
      prompt: "Assess implementation path for quote enrichment",
      context: {
        references: [{ kind: "adr", ref: "ADR-015" }],
      },
      decision: {
        minimumConfidence: 0.8,
      },
      execution: {
        sourceRoute: "/api/v1/ai/mission-control",
      },
    });

    expect(response.status).toBe("approved");
    expect(response.responder).toBe("engineering");
    expect(response.decisionTrace.entries).toHaveLength(3);
    expect(response.decisionTrace.entries.map((entry) => entry.decidedBy)).toEqual([
      "orchestrator",
      "guardian",
      "engineering",
    ]);
    expect(response.decisionTrace.finalDecision).toMatchObject({
      outcome: "approved",
      decidedBy: "engineering",
    });
    expect(response.executionContext?.sourceRoute).toBe("/api/v1/ai/mission-control");
    expect(response.decisionContext?.minimumConfidence).toBe(0.8);

    const saved = await memory.findByRequestId(response.requestId);
    expect(saved?.summary).toBe("Engineering specialist prepared implementation draft.");
    expect(saved?.trace.traceId).toBe(response.decisionTrace.traceId);

    const events = await memory.listEvents();
    expect(events.map((event) => event.type)).toEqual(
      expect.arrayContaining(["request.intake", "guardian.checked", "agent.executed", "decision.completed"]),
    );

    const executions = await memory.listExecutions();
    expect(executions[0]).toMatchObject({
      requestId: response.requestId,
      responder: "engineering",
      status: "approved",
    });
  });
});
