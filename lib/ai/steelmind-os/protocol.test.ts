import { describe, expect, it } from "vitest";
import {
  buildDecisionLogPayload,
  normalizeAgentRequest,
  normalizeCtoAgentHealthReport,
} from "@/lib/ai/steelmind-os/protocol";

describe("normalizeAgentRequest", () => {
  it("normalizes defaults, ids and protocol contexts", () => {
    let sequence = 0;
    const nextId = () => `id-${++sequence}`;
    const now = () => "2026-07-01T16:00:00.000Z";

    const request = normalizeAgentRequest(
      {
        requestedBy: "  Ricardo   Estimador ",
        capability: "  budget.execute  ",
        prompt: "  Build  quote  with rules ",
        execution: {
          sourceRoute: " /api/v1/ai/mission-control ",
          environment: "ci",
        },
        decision: {
          minimumConfidence: 0.82,
        },
        context: {
          constraints: ["  no magic numbers ", "", "no magic numbers"],
          proposedChanges: [
            " app/api/v1/budget/quotes/route.ts ",
            "app/api/v1/budget/quotes/route.ts",
          ],
          references: [
            { kind: "adr", ref: "  ADR-015 " },
            { kind: "constitution", ref: " CONSTITUTION.md#9-enforcement " },
          ],
        },
        actions: [
          {
            type: "execute",
            description: "  Create execution plan  ",
            owner: "budget",
          },
        ],
      },
      { now, idGenerator: nextId },
    );

    expect(request.requestId).toBe("id-1");
    expect(request.correlationId).toBe("id-1");
    expect(request.requestedAt).toBe("2026-07-01T16:00:00.000Z");
    expect(request.target).toBe("ai-council");
    expect(request.requestedBy).toBe("Ricardo Estimador");
    expect(request.capability).toBe("budget.execute");
    expect(request.context.constraints).toEqual(["no magic numbers"]);
    expect(request.context.proposedChanges).toEqual(["app/api/v1/budget/quotes/route.ts"]);
    expect(request.context.execution).toMatchObject({
      environment: "ci",
      sourceRoute: "/api/v1/ai/mission-control",
    });
    expect(request.context.decision).toMatchObject({
      minimumConfidence: 0.82,
      requiresGuardian: true,
    });
    expect(request.actions[0]).toMatchObject({
      id: "id-2",
      status: "pending",
      priority: "normal",
      description: "Create execution plan",
    });
  });
});

describe("buildDecisionLogPayload", () => {
  it("creates canonical steel memory payload", () => {
    const request = normalizeAgentRequest({
      requestId: "req-1",
      correlationId: "corr-1",
      requestedBy: "api",
      target: "engineering",
      capability: "engineering.analyze",
      prompt: "Analyze quote structure",
      context: {
        references: [{ kind: "adr", ref: "ADR-015" }],
      },
    });

    const payload = buildDecisionLogPayload({
      request,
      flowStage: "guardian",
      response: {
        requestId: "req-1",
        responder: "guardian",
        status: "approved",
        summary: "Guardian approved request.",
        actions: [],
        createdAt: "2026-07-01T16:00:00.000Z",
        decisionTrace: {
          traceId: "trace-1",
          assembledAt: "2026-07-01T16:00:00.000Z",
          entries: [
            {
              decidedBy: "guardian",
              confidence: 1.2,
              decidedAt: "2026-07-01T16:00:00.000Z",
              outcome: "approved",
              rationale: "Compliant request",
              references: [{ kind: "constitution", ref: "CONSTITUTION_V2.md#10" }],
            },
          ],
          finalDecision: {
            outcome: "approved",
            decidedBy: "guardian",
            rationale: "Compliant request",
            confidence: 1.2,
          },
        },
      },
    });

    expect(payload).toMatchObject({
      logVersion: "1.0",
      requestId: "req-1",
      correlationId: "corr-1",
      flowStage: "guardian",
      decidedBy: "guardian",
      outcome: "approved",
      confidence: 1,
    });
  });
});

describe("normalizeCtoAgentHealthReport", () => {
  it("normalizes scores, rankings and hotspots", () => {
    let sequence = 0;
    const report = normalizeCtoAgentHealthReport(
      {
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
        architectureGrade: {
          score: 102.23,
          grade: " A- ",
          rationale: " solid boundaries ",
        },
        qualityGrade: {
          score: -3,
          grade: " B ",
          rationale: " tests are stable ",
        },
        testCoverage: {
          lineCoverage: 89.994,
          branchCoverage: 70.994,
        },
        technicalDebt: {
          openItems: 12.7,
          trend: "down",
          hotspots: [" modules/shadow ", "modules/shadow", " lib/ai "],
        },
        duplication: {
          duplicatedBlocks: 4.2,
          hotspots: ["app/api", "app/api"],
        },
        performance: {
          p95LatencyMs: -10,
          buildTimeMinutes: 7.123,
          regressionDetected: false,
        },
        standardsHealth: {
          violations: 2.2,
          status: "warning",
          driftAreas: ["docs", "docs", "tests"],
        },
        risks: [
          {
            id: "risk-1",
            level: "high",
            area: " architecture ",
            description: " contract drift ",
            mitigation: " enforce schema checks ",
            references: [{ kind: "adr", ref: " ADR-015 " }],
          },
        ],
        recommendedPriorities: [
          {
            id: "p2",
            title: " reduce duplication ",
            priorityRank: 3,
            impact: "medium",
            effort: "medium",
            owner: "engineering",
            rationale: " improves maintainability ",
          },
          {
            id: "p1",
            title: " stabilize tests ",
            priorityRank: 1,
            impact: "high",
            effort: "low",
            owner: "qa",
            rationale: " protects release flow ",
          },
        ],
        executiveSummary: " monthly health snapshot ",
      },
      {
        now: () => "2026-07-01T16:00:00.000Z",
        idGenerator: () => `report-${++sequence}`,
      },
    );

    expect(report.reportId).toBe("report-1");
    expect(report.generatedBy).toBe("cto-agent");
    expect(report.architectureGrade.score).toBe(100);
    expect(report.qualityGrade.score).toBe(0);
    expect(report.technicalDebt.hotspots).toEqual(["modules/shadow", "lib/ai"]);
    expect(report.performance.p95LatencyMs).toBe(0);
    expect(report.recommendedPriorities[0].id).toBe("p1");
  });
});
