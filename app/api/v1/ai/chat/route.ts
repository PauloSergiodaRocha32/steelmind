import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api-guard";
import { buildPlatformAIContext } from "@/lib/ai/context-builder";
import { appendMessage, getOrCreateConversation } from "@/lib/persistence/ai-store";
import { executeCouncilRequest } from "@/lib/ai/steelmind-os/runtime";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const conv = await getOrCreateConversation(auth.id);
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "/";

  const ctx = await buildPlatformAIContext(auth, path);

  return NextResponse.json({
    data: {
      conversation: conv,
      context: ctx,
    },
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const body = (await request.json()) as { message?: string; path?: string };
    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: { message: "Mensagem obrigatoria" } },
        { status: 400 },
      );
    }

    const path = body.path ?? "/";
    const ctx = await buildPlatformAIContext(auth, path);

    await appendMessage(
      auth.id,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: body.message,
        timestamp: new Date().toISOString(),
      },
      path,
    );

    const governedResponse = await executeCouncilRequest({
      requestedBy: auth.id,
      target: "knowledge",
      capability: "knowledge.execute",
      prompt: body.message,
      execution: {
        sourceRoute: `/api/v1/ai/chat:${path}`,
        triggeredBy: auth.role,
        environment: process.env.NODE_ENV === "production" ? "production" : "local",
        metadata: {
          userEmail: auth.email,
        },
      },
      decision: {
        decisionClass: "B",
        minimumConfidence: 0.72,
        requiresGuardian: true,
      },
      context: {
        references: [
          { kind: "constitution", ref: "CONSTITUTION_V2.md#4" },
          { kind: "rule", ref: "agent-bug-hunter.mdc" },
        ],
        payload: {
          message: body.message,
          aiContext: ctx,
          path,
        },
      },
      actions: [
        {
          type: "execute",
          description: "Generate governed AI response for operational flow",
          owner: "knowledge",
          priority: "high",
        },
      ],
    });

    const blockedByGuardian = governedResponse.status === "refused";
    const enginePayload = (governedResponse.payload ?? {}) as {
      content?: string;
      mode?: string;
    };

    const content = blockedByGuardian
      ? `Guardian bloqueou a solicitacao por politica de seguranca/integridade: ${
          governedResponse.refusalReason ?? "violacao constitucional"
        }.`
      : enginePayload.content ?? governedResponse.summary;

    const mode = blockedByGuardian ? "guardian_blocked" : enginePayload.mode ?? "governed";

    const assistantMsg = {
      id: crypto.randomUUID(),
      role: "assistant" as const,
      content,
      timestamp: new Date().toISOString(),
      metadata: {
        mode,
        guardianStatus: governedResponse.status,
        confidence: governedResponse.decisionTrace.finalDecision.confidence,
        decidedBy: governedResponse.decisionTrace.finalDecision.decidedBy,
      },
    };

    const conv = await appendMessage(auth.id, assistantMsg, path);

    return NextResponse.json({
      data: {
        reply: content,
        mode,
        conversation: conv,
        governance: {
          status: governedResponse.status,
          decision: governedResponse.decisionTrace.finalDecision,
          refusalReason: governedResponse.refusalReason ?? null,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no Steel AI";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
