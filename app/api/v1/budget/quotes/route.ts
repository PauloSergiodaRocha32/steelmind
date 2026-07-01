import { NextResponse } from "next/server";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";
import { listQuotes, getQuote, quotesBackend } from "@/lib/persistence/quotes-store";
import { assessQuoteReadinessForQuote } from "@/application/quoting/use-cases/assess-quote-readiness";

export async function GET(request: Request) {
  const auth = await requirePermission("budget:read");
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const quote = await getQuote(id);
    if (!quote) {
      return NextResponse.json(
        { error: { message: "Orçamento não encontrado" } },
        { status: 404 },
      );
    }
    const readiness = assessQuoteReadinessForQuote(quote);
    return NextResponse.json({ data: { quote, readiness } });
  }

  const quotes = await listQuotes();
  return NextResponse.json({
    data: {
      backend: quotesBackend(),
      quotes: quotes.map((q) => ({
        id: q.id,
        titulo: q.titulo,
        status: q.status,
        total: q.custos.total,
        margem: q.custos.margemPercentual,
        prazoDias: q.custos.prazoDias,
        aiMode: q.aiMode,
        updatedAt: q.updatedAt,
        arquivos: q.arquivos.length,
      })),
    },
  });
}
