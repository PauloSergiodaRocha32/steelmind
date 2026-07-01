import { NextResponse } from "next/server";
import { createGestioClient } from "@/services/gestio/client";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";

export async function GET() {
  const auth = await requirePermission("engineering:read");
  if (isAuthError(auth)) return auth;

  try {
    const client = createGestioClient();
    await client.authenticate();
    const projetos = await client.getProjetos();

    return NextResponse.json({
      data: {
        projetos: projetos.filter((p) => p.ativo),
        total: projetos.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar projetos";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
