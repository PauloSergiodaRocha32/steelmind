import { NextResponse } from "next/server";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";
import { adjustQuoteWithChat, confirmQuote } from "@/lib/budget/ai-engine";
import { getQuote, saveQuote } from "@/lib/persistence/quotes-store";
import {
  applyReadinessToPipeline,
  assessQuoteReadinessForQuote,
} from "@/application/quoting/use-cases/assess-quote-readiness";

export async function POST(request: Request) {
  const auth = await requirePermission("budget:write");
  if (isAuthError(auth)) return auth;

  try {
    const body = (await request.json()) as {
      quoteId: string;
      message?: string;
      action?: "confirm";
      force?: boolean;
    };

    const quote = await getQuote(body.quoteId);
    if (!quote) {
      return NextResponse.json(
        { error: { message: "Orçamento não encontrado" } },
        { status: 404 },
      );
    }

    if (body.action === "confirm") {
      const readiness = assessQuoteReadinessForQuote(quote);
      if (readiness.level === "blocked" && !body.force) {
        const quoted = applyReadinessToPipeline(quote, readiness);
        await saveQuote(quoted);
        return NextResponse.json(
          {
            error: {
              code: "QUOTE_NOT_READY",
              message:
                "Orçamento com pendências críticas. Revise os alertas antes de confirmar.",
            },
            data: { quote: quoted, readiness },
          },
          { status: 422 },
        );
      }

      const confirmed = confirmQuote(applyReadinessToPipeline(quote, readiness));
      await saveQuote(confirmed);
      return NextResponse.json({ data: { quote: confirmed, readiness } });
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
    const readiness = assessQuoteReadinessForQuote(updated);
    const updatedWithReadiness = applyReadinessToPipeline(updated, readiness);
    await saveQuote(updatedWithReadiness);

    return NextResponse.json({
      data: { quote: updatedWithReadiness, reply, changes, readiness },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no chat";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
