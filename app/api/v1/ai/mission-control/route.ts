import { NextResponse } from "next/server";
import { isAuthError, requireAuth } from "@/lib/auth/api-guard";
import { executeCouncilRequest, getMissionControlSnapshot } from "@/lib/ai/steelmind-os/runtime";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const snapshot = await getMissionControlSnapshot();
  return NextResponse.json({ data: snapshot });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = (await request.json().catch(() => ({}))) as {
    target?: string;
    capability?: string;
    prompt?: string;
  };

  const response = await executeCouncilRequest({
    requestedBy: auth.id,
    target: (body.target as Parameters<typeof executeCouncilRequest>[0]["target"]) ?? "ai-council",
    capability: body.capability ?? "platform.audit",
    prompt: body.prompt ?? "Run operational mission control check",
    execution: {
      sourceRoute: "/api/v1/ai/mission-control",
      triggeredBy: auth.role,
      environment: process.env.NODE_ENV === "production" ? "production" : "local",
    },
    context: {
      references: [{ kind: "constitution", ref: "CONSTITUTION_V2.md#4" }],
    },
  });

  return NextResponse.json({ data: response });
}
