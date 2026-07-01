import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api-guard";
import { buildPlatformAIContext } from "@/lib/ai/context-builder";
import { generateSteelAIReply } from "@/lib/ai/steelmind-brain";
import { appendMessage, getOrCreateConversation } from "@/lib/persistence/ai-store";

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
        { error: { message: "Mensagem obrigatória" } },
        { status: 400 },
      );
    }

    const path = body.path ?? "/";
    const ctx = await buildPlatformAIContext(auth, path);

    await appendMessage(auth.id, {
      id: crypto.randomUUID(),
      role: "user",
      content: body.message,
      timestamp: new Date().toISOString(),
    }, path);

    const { content, mode } = await generateSteelAIReply(body.message, ctx);

    const assistantMsg = {
      id: crypto.randomUUID(),
      role: "assistant" as const,
      content,
      timestamp: new Date().toISOString(),
      metadata: { mode },
    };

    const conv = await appendMessage(auth.id, assistantMsg, path);

    return NextResponse.json({
      data: {
        reply: content,
        mode,
        conversation: conv,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no Steel AI";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
