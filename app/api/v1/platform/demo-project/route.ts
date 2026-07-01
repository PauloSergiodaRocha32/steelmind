import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api-guard";
import { runDemoProject } from "@/lib/demo/demo-project";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { DEMO_BOM_CATALOG, DEMO_PROJECT_TITLE, DEMO_PROJECT_CODE } = await import(
    "@/lib/demo/demo-project"
  );

  return NextResponse.json({
    data: {
      title: DEMO_PROJECT_TITLE,
      codigoProjeto: DEMO_PROJECT_CODE,
      itemCount: DEMO_BOM_CATALOG.length,
      items: DEMO_BOM_CATALOG,
      description:
        "Projeto demo end-to-end: oportunidade → orçamento IA → BOM → compras → almoxarifado → produção → agentes cloud",
    },
  });
}

export async function POST() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const result = await runDemoProject(auth.id);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao executar projeto demo";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
