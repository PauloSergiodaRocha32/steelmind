import { NextResponse } from "next/server";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";
import { analyzeQuote } from "@/lib/budget/ai-engine";
import { saveQuote } from "@/lib/persistence/quotes-store";
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

    return NextResponse.json({ data: quote }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro na análise";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
