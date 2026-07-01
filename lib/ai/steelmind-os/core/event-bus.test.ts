import { describe, expect, it } from "vitest";
import { InMemoryEventBus } from "@/lib/ai/steelmind-os/core/event-bus";

describe("InMemoryEventBus", () => {
  it("publishes events and keeps bounded history", () => {
    let sequence = 0;
    const bus = new InMemoryEventBus({
      maxEvents: 2,
      now: () => "2026-07-01T18:00:00.000Z",
      idGenerator: () => `evt-${++sequence}`,
    });

    bus.publish({
      type: "request.intake",
      source: "runtime",
      requestId: "req-1",
      correlationId: "corr-1",
    });
    bus.publish({
      type: "guardian.checked",
      source: "guardian",
      requestId: "req-1",
      correlationId: "corr-1",
      status: "approved",
    });
    bus.publish({
      type: "decision.completed",
      source: "orchestrator",
      requestId: "req-1",
      correlationId: "corr-1",
      status: "approved",
    });

    const recent = bus.listRecent();
    expect(recent).toHaveLength(2);
    expect(recent[0]?.id).toBe("evt-3");
    expect(recent[1]?.id).toBe("evt-2");
    expect(bus.getLastEvent()?.type).toBe("decision.completed");
  });

  it("supports subscribers", () => {
    const bus = new InMemoryEventBus();
    const captured: string[] = [];

    const unsubscribe = bus.subscribe((event) => {
      captured.push(event.type);
    });

    bus.publish({
      type: "request.intake",
      source: "runtime",
      requestId: "req-2",
      correlationId: "corr-2",
    });
    unsubscribe();
    bus.publish({
      type: "decision.completed",
      source: "orchestrator",
      requestId: "req-2",
      correlationId: "corr-2",
      status: "approved",
    });

    expect(captured).toEqual(["request.intake"]);
  });
});
