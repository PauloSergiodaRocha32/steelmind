import { NextResponse } from "next/server";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";
import {
  listOpportunities,
  createOpportunity,
  saveOpportunity,
  getOpportunity,
} from "@/lib/persistence/commercial-store";
import type { OpportunityStage } from "@/types/commercial";

export async function GET() {
  const auth = await requirePermission("commercial:read");
  if (isAuthError(auth)) return auth;

  const opportunities = await listOpportunities();
  return NextResponse.json({ data: { opportunities } });
}

export async function POST(request: Request) {
  const auth = await requirePermission("commercial:write");
  if (isAuthError(auth)) return auth;

  try {
    const body = (await request.json()) as {
      titulo: string;
      cliente: string;
      contato?: string;
      valorEstimado?: number;
      stage?: OpportunityStage;
      observacoes?: string;
    };

    const opp = await createOpportunity({
      titulo: body.titulo,
      cliente: body.cliente,
      contato: body.contato ?? null,
      valorEstimado: body.valorEstimado ?? 0,
      stage: body.stage ?? "lead",
      observacoes: body.observacoes ?? null,
      quoteId: null,
      codigoProjetoGestio: null,
      createdBy: auth.id,
    });

    return NextResponse.json({ data: opp }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar oportunidade";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requirePermission("commercial:write");
  if (isAuthError(auth)) return auth;

  try {
    const body = (await request.json()) as {
      id: string;
      stage?: OpportunityStage;
      quoteId?: string | null;
      codigoProjetoGestio?: number | null;
      valorEstimado?: number;
    };

    const opp = await getOpportunity(body.id);
    if (!opp) {
      return NextResponse.json(
        { error: { message: "Oportunidade não encontrada" } },
        { status: 404 },
      );
    }

    const updated = await saveOpportunity({
      ...opp,
      stage: body.stage ?? opp.stage,
      quoteId: body.quoteId !== undefined ? body.quoteId : opp.quoteId,
      codigoProjetoGestio:
        body.codigoProjetoGestio !== undefined
          ? body.codigoProjetoGestio
          : opp.codigoProjetoGestio,
      valorEstimado: body.valorEstimado ?? opp.valorEstimado,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
