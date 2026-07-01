import { NextResponse } from "next/server";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";
import { analyzeQuote } from "@/lib/budget/ai-engine";
import { saveQuote } from "@/lib/persistence/quotes-store";
import { runQuoteEngineV2Shadow } from "@/application/quoting/use-cases/run-quote-engine-v2-shadow";
import {
  applyReadinessToPipeline,
  assessQuoteReadinessForQuote,
} from "@/application/quoting/use-cases/assess-quote-readiness";
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
    const readiness = assessQuoteReadinessForQuote(quote, observacoes);
    const quoteWithReadiness = applyReadinessToPipeline(quote, readiness);
    await saveQuote(quoteWithReadiness);

    void runQuoteEngineV2Shadow({
      title: quoteWithReadiness.titulo,
      notes: observacoes,
      files: arquivos,
      legacyTotal: quoteWithReadiness.custos.total,
      legacyBreakdown: {
        materiais: quoteWithReadiness.custos.materiais,
        maoDeObra: quoteWithReadiness.custos.maoDeObra,
        consumiveis: quoteWithReadiness.custos.servicos,
        pintura: 0,
        logistica: 0,
        margem: quoteWithReadiness.custos.margemValor,
        precoFinal: quoteWithReadiness.custos.total,
      },
      requestedBy: auth.id,
      estimator: "official-budget-engine-v1",
      projectType: "guarda-corpo",
    }).catch((error) => {
      console.error("[quote-engine-v2-shadow] persistence failed", error);
    });

    return NextResponse.json(
      { data: { quote: quoteWithReadiness, readiness } },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro na análise";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
