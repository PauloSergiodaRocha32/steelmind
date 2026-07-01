import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api-guard";
import { hasPermission } from "@/lib/auth/permissions";
import { runOrchestrator, runSingleAgent } from "@/lib/ai/agents/orchestrator";
import { formatAgentReportSummary } from "@/lib/ai/steelmind-brain";
import {
  saveAgentReport,
  getLatestAgentReport,
  getAgentReportHistory,
  appendMessage,
} from "@/lib/persistence/ai-store";
import { executeCouncilRequest, getMissionControlSnapshot } from "@/lib/ai/steelmind-os/runtime";
import type { AgentId } from "@/types/ai-agents";

function canRunCloudAgents(role: string): boolean {
  return hasPermission(role as Parameters<typeof hasPermission>[0], "platform:admin") || role === "manager";
}

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const [latest, history, missionControl] = await Promise.all([
    getLatestAgentReport(),
    getAgentReportHistory(10),
    getMissionControlSnapshot(),
  ]);

  return NextResponse.json({ data: { latest, history, missionControl } });
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (isAuthError(user)) return user;

  if (!canRunCloudAgents(user.role)) {
    return NextResponse.json(
      { error: { message: "Apenas admin ou gerente podem rodar agentes cloud" } },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      agent?: AgentId;
      notifyUser?: boolean;
    };

    if (body.agent && body.agent !== "orchestrator") {
      const result = await runSingleAgent(body.agent);
      if (!result) {
        return NextResponse.json(
          { error: { message: "Agente desconhecido" } },
          { status: 400 },
        );
      }
      return NextResponse.json({ data: { agent: result } });
    }

    const report = await runOrchestrator(user.id);
    await saveAgentReport(report);

    const protocolResponse = await executeCouncilRequest({
      requestedBy: user.id,
      capability: "platform.audit",
      prompt: "Run integrated cloud agents health check",
      target: "qa",
      execution: {
        sourceRoute: "/api/v1/ai/agents",
        triggeredBy: user.role,
        environment: process.env.NODE_ENV === "production" ? "production" : "local",
      },
      context: {
        references: [{ kind: "constitution", ref: "CONSTITUTION_V2.md#4" }],
      },
    });

    const summary = formatAgentReportSummary(report);

    if (body.notifyUser !== false) {
      await appendMessage(user.id, {
        id: crypto.randomUUID(),
        role: "agent",
        content: `${summary}\n\nAI Council: ${protocolResponse.summary}`,
        timestamp: new Date().toISOString(),
        agentId: "orchestrator",
      });
    }

    return NextResponse.json({ data: { report, summary, protocolResponse } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro nos agentes";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
