import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api-guard";
import { listQuotes, getQuote } from "@/lib/persistence/quotes-store";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const quote = getQuote(id);
    if (!quote) {
      return NextResponse.json(
        { error: { message: "Orçamento não encontrado" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: quote });
  }

  const quotes = listQuotes().map((q) => ({
    id: q.id,
    titulo: q.titulo,
    status: q.status,
    total: q.custos.total,
    margem: q.custos.margemPercentual,
    prazoDias: q.custos.prazoDias,
    aiMode: q.aiMode,
    updatedAt: q.updatedAt,
    arquivos: q.arquivos.length,
  }));

  return NextResponse.json({ data: { quotes } });
}
