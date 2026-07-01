import { runOrchestrator, runSingleAgent } from "@/lib/ai/agents/orchestrator";
import type { AgentId } from "@/types/ai-agents";
import type { CouncilRuntimeAgent } from "@/lib/ai/steelmind-os/core/agent-registry";
import type { AgentRequest } from "@/lib/ai/steelmind-os/protocol";

type LegacyGroup = {
  target: CouncilRuntimeAgent["id"];
  name: string;
  capabilities: string[];
  agents: AgentId[];
};

const LEGACY_GROUPS: LegacyGroup[] = [
  {
    target: "qa",
    name: "QA Guardian",
    capabilities: ["qa.audit", "qa.health"],
    agents: ["health", "rbac", "security"],
  },
  {
    target: "devops",
    name: "DevOps Integrations",
    capabilities: ["devops.runtime", "devops.integration"],
    agents: ["modules", "data", "gestio"],
  },
  {
    target: "engineering",
    name: "Engineering Runtime",
    capabilities: ["engineering.analyze", "engineering.execute"],
    agents: ["modules", "health"],
  },
  {
    target: "budget",
    name: "Budget Specialist",
    capabilities: ["budget.analyze", "budget.execute"],
    agents: ["health"],
  },
  {
    target: "commercial",
    name: "Commercial Specialist",
    capabilities: ["commercial.analyze", "commercial.execute"],
    agents: ["modules"],
  },
  {
    target: "production",
    name: "Production Specialist",
    capabilities: ["production.analyze", "production.execute"],
    agents: ["modules"],
  },
  {
    target: "procurement",
    name: "Procurement Specialist",
    capabilities: ["procurement.analyze", "procurement.execute"],
    agents: ["gestio"],
  },
  {
    target: "knowledge",
    name: "Knowledge Specialist",
    capabilities: ["knowledge.analyze", "knowledge.execute"],
    agents: ["modules"],
  },
  {
    target: "architect",
    name: "Architect Specialist",
    capabilities: ["architect.review", "architect.approve"],
    agents: ["rbac"],
  },
  {
    target: "security",
    name: "Security Specialist",
    capabilities: ["security.audit", "security.execute"],
    agents: ["security"],
  },
];

function summarizeLegacyResults(results: Awaited<ReturnType<typeof runSingleAgent>>[]): {
  summary: string;
  confidence: number;
  payload: Record<string, unknown>;
} {
  const valid = results.filter((item): item is NonNullable<typeof item> => Boolean(item));
  const errors = valid.reduce(
    (count, item) => count + item.findings.filter((finding) => finding.severity === "error").length,
    0,
  );
  const warns = valid.reduce(
    (count, item) => count + item.findings.filter((finding) => finding.severity === "warn").length,
    0,
  );

  const confidence = Math.max(0.3, Math.min(0.98, 1 - errors * 0.08 - warns * 0.03));

  return {
    summary: `${valid.length} legacy agents executed (${errors} errors, ${warns} warnings).`,
    confidence,
    payload: {
      agents: valid.map((item) => ({
        agent: item.agent,
        status: item.status,
        findings: item.findings.length,
        durationMs: item.durationMs,
      })),
    },
  };
}

async function executeLegacyGroup(group: LegacyGroup, request: AgentRequest) {
  if (request.capability.startsWith("platform.")) {
    const report = await runOrchestrator("steelmind-os");
    const confidence = Math.max(0.4, Math.min(0.98, report.score / 100));
    return {
      status: report.status === "fail" ? "failed" : report.status === "warn" ? "needs_input" : "approved",
      summary: `Cloud orchestrator score: ${report.score}/100 (${report.status}).`,
      confidence,
      payload: {
        report,
      },
    } as const;
  }

  const results = await Promise.all(group.agents.map((agentId) => runSingleAgent(agentId)));
  const summary = summarizeLegacyResults(results);

  return {
    status: summary.confidence < request.context.decision.minimumConfidence ? "needs_input" : "approved",
    summary: `${group.name}: ${summary.summary}`,
    confidence: summary.confidence,
    payload: {
      ...summary.payload,
      capability: request.capability,
    },
  } as const;
}

export function createLegacyCouncilAgents(): CouncilRuntimeAgent[] {
  return LEGACY_GROUPS.map((group) => ({
    id: group.target,
    name: group.name,
    capabilities: group.capabilities,
    canHandle: (request) =>
      request.target === group.target ||
      group.capabilities.some((capability) => request.capability.startsWith(capability.split(".")[0] ?? "")),
    execute: (request) => executeLegacyGroup(group, request),
  }));
}
