import { describe, expect, it } from "vitest";
import {
  InMemoryAgentRegistry,
  type CouncilRuntimeAgent,
} from "@/lib/ai/steelmind-os/core/agent-registry";
import { normalizeAgentRequest } from "@/lib/ai/steelmind-os/protocol";

function buildAgent(id: CouncilRuntimeAgent["id"]): CouncilRuntimeAgent {
  return {
    id,
    name: `${id}-agent`,
    capabilities: ["engineering.analyze"],
    canHandle: (request) => request.capability.startsWith("engineering."),
    execute: async () => ({
      status: "approved",
      summary: "ok",
    }),
  };
}

describe("InMemoryAgentRegistry", () => {
  it("resolves by target and capability", () => {
    const registry = new InMemoryAgentRegistry();
    registry.register(buildAgent("engineering"));

    const request = normalizeAgentRequest({
      requestId: "req-registry-1",
      requestedBy: "api",
      target: "ai-council",
      capability: "engineering.analyze",
      prompt: "analyze",
    });

    expect(registry.resolveByTarget("engineering")?.id).toBe("engineering");
    expect(registry.resolveByRequest(request)?.id).toBe("engineering");
  });

  it("tracks execution metrics for snapshots", () => {
    const registry = new InMemoryAgentRegistry();
    registry.register(buildAgent("engineering"));

    registry.recordExecution("engineering", {
      status: "approved",
      durationMs: 42,
      at: "2026-07-01T18:10:00.000Z",
    });

    const snapshot = registry.listSnapshots()[0];
    expect(snapshot).toMatchObject({
      id: "engineering",
      executions: 1,
      failures: 0,
      lastExecutionMs: 42,
      lastStatus: "approved",
    });
  });
});
