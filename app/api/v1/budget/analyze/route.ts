import { NextResponse } from "next/server";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";
import { analyzeQuote } from "@/lib/budget/ai-engine";
import { saveQuote } from "@/lib/persistence/quotes-store";
import { runQuoteEngineV2Shadow } from "@/application/quoting/use-cases/run-quote-engine-v2-shadow";
import type { UploadedFileMeta } from "@/types/budget";

export async function POST(request: Request) {
  const auth = await requirePermission("budget:write");
  if (isAuthError(auth)) return auth;

  try {
    const contentType = request.headers.get("content-type") ?? "";
    let observacoes = "";
    let titulo: string | undefined;
    const arquivos: UploadedFileMeta[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      observacoes = String(form.get("observacoes") ?? "");
      titulo = form.get("titulo") ? String(form.get("titulo")) : undefined;
      for (const entry of form.getAll("files")) {
        if (entry instanceof File) {
          arquivos.push({
            name: entry.name,
            type: entry.type || "application/octet-stream",
            size: entry.size,
          });
        }
      }
    } else {
      const body = (await request.json()) as {
        observacoes?: string;
        titulo?: string;
        arquivos?: UploadedFileMeta[];
      };
      observacoes = body.observacoes ?? "";
      titulo = body.titulo;
      arquivos.push(...(body.arquivos ?? []));
    }

    const quote = await analyzeQuote(
      { observacoes, arquivos, titulo },
      auth.id,
    );
    await saveQuote(quote);

    runQuoteEngineV2Shadow({
      title: quote.titulo,
      notes: observacoes,
      files: arquivos,
      legacyTotal: quote.custos.total,
      requestedBy: auth.id,
    });

    return NextResponse.json({ data: quote }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro na análise";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
