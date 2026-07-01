import { NextResponse } from "next/server";
import { createGestioClient } from "@/services/gestio/client";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";
import type { GestioProjeto } from "@/types/gestio-extended";

export async function GET() {
  const auth = await requirePermission("engineering:read");
  if (isAuthError(auth)) return auth;

  try {
    let projetos: GestioProjeto[] = [];
    let gestioAvailable = false;
    try {
      const client = createGestioClient();
      await client.authenticate();
      projetos = await client.getProjetos();
      gestioAvailable = true;
    } catch {
      projetos = [];
    }

    return NextResponse.json({
      data: {
        projetos: projetos.filter((p) => p.ativo),
        total: projetos.length,
        source: gestioAvailable ? "gestio" : "fallback-local",
        warning: gestioAvailable
          ? null
          : "Gestio indisponível no momento; exibindo lista vazia de projetos externos.",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar projetos";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
