import { describe, expect, it } from "vitest";
import { SteelmindCoreRuntime } from "@/lib/ai/steelmind-os/core/steelmind-core";
import { InMemoryAgentRegistry } from "@/lib/ai/steelmind-os/core/agent-registry";
import { InMemoryEventBus } from "@/lib/ai/steelmind-os/core/event-bus";
import { InMemorySteelMemoryRepository } from "@/lib/ai/steelmind-os/infrastructure/in-memory-steel-memory.repository";
import type { SteelmindCoreExecutor } from "@/lib/ai/steelmind-os/core/steelmind-core";

describe("SteelmindCoreRuntime", () => {
  it("exposes runtime status and forwards execution", async () => {
    const registry = new InMemoryAgentRegistry();
    registry.register({
      id: "engineering",
      name: "Engineering",
      capabilities: ["engineering.analyze"],
      canHandle: () => true,
      execute: async () => ({ status: "approved", summary: "ok" }),
    });

    const memory = new InMemorySteelMemoryRepository({
      now: () => "2026-07-01T18:20:00.000Z",
      idGenerator: () => "memory-1",
    });
    const eventBus = new InMemoryEventBus({
      now: () => "2026-07-01T18:20:00.000Z",
      idGenerator: () => "event-1",
    });

    const executor: SteelmindCoreExecutor = {
      route: async () => ({
        requestId: "req-core-1",
        responder: "engineering",
        status: "approved",
        summary: "done",
        actions: [],
        createdAt: "2026-07-01T18:20:00.000Z",
        decisionTrace: {
          traceId: "trace-core-1",
          assembledAt: "2026-07-01T18:20:00.000Z",
          entries: [],
          finalDecision: {
            outcome: "approved",
            decidedBy: "engineering",
            rationale: "ok",
            confidence: 0.9,
          },
        },
      }),
    };

    const runtime = new SteelmindCoreRuntime({
      executor,
      registry,
      memory,
      eventBus,
    });

    const response = await runtime.execute({
      requestId: "req-core-1",
      requestedBy: "api",
      target: "engineering",
      capability: "engineering.analyze",
      prompt: "analyze",
    });

    const status = await runtime.getStatus();

    expect(response.status).toBe("approved");
    expect(status.agents).toHaveLength(1);
    expect(status.memoryRecords).toBe(0);
    expect(status.lastEventType).toBeNull();
  });
});
