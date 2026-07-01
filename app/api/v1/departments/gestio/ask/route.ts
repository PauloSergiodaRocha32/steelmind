import { NextResponse } from "next/server";
import { askGestioDepartment } from "@/departments/gestio";
import type { GestioTeamId } from "@/departments/gestio";
import { isAuthError, requirePermission } from "@/lib/auth/api-guard";

export async function POST(request: Request) {
  const auth = await requirePermission("platform:admin");
  if (isAuthError(auth)) return auth;

  try {
    const body = (await request.json()) as {
      question?: string;
      preferredTeam?: GestioTeamId;
    };
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json(
        { error: { message: "Campo 'question' é obrigatório" } },
        { status: 400 },
      );
    }

    return NextResponse.json({
      data: askGestioDepartment({
        question,
        preferredTeam: body.preferredTeam,
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao consultar Departamento Gest.io";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
