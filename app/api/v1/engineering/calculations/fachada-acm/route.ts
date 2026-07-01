import { NextResponse } from "next/server";
import { calcularFachadaAcm } from "@/agents/engineering";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";

export async function POST(request: Request) {
  const auth = await requirePermission("engineering:write");
  if (isAuthError(auth)) return auth;

  try {
    const body = (await request.json()) as Parameters<typeof calcularFachadaAcm>[0];
    const result = calcularFachadaAcm(body);

    return NextResponse.json({
      data: result,
      meta: {
        knowledgeSpec: "knowledge/engineering/fachada-acm.md",
        version: "1.0",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro no cálculo de fachada ACM";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
