import { NextResponse } from "next/server";
import { orchestrate } from "@/agents/orchestrator";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";

export async function POST(request: Request) {
  const auth = await requirePermission("platform:admin");
  if (isAuthError(auth)) return auth;

  try {
    const body = (await request.json()) as { intent?: string };
    const intent = body.intent?.trim();

    if (!intent) {
      return NextResponse.json(
        { error: { message: "Campo 'intent' é obrigatório" } },
        { status: 400 },
      );
    }

    const result = orchestrate(intent);

    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao orquestrar intent";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
