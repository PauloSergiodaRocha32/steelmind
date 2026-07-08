import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api-guard";
import { adjustQuoteWithChat, confirmQuote } from "@/lib/budget/ai-engine";
import { getQuote, saveQuote } from "@/lib/persistence/quotes-store";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const body = (await request.json()) as {
      quoteId: string;
      message?: string;
      action?: "confirm";
    };

    const quote = getQuote(body.quoteId);
    if (!quote) {
      return NextResponse.json(
        { error: { message: "Orçamento não encontrado" } },
        { status: 404 },
      );
    }

    if (body.action === "confirm") {
      const confirmed = confirmQuote(quote);
      saveQuote(confirmed);
      return NextResponse.json({ data: confirmed });
    }

    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: { message: "Mensagem obrigatória" } },
        { status: 400 },
      );
    }

    const { quote: updated, reply, changes } = await adjustQuoteWithChat(
      quote,
      body.message,
    );
    saveQuote(updated);

    return NextResponse.json({ data: { quote: updated, reply, changes } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no chat";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
