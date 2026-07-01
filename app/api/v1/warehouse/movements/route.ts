import { NextResponse } from "next/server";
import { createGestioClient } from "@/services/gestio/client";
import { logMovement } from "@/lib/persistence/store";
import type { CreateEntradaPayload, CreateSaidaPayload } from "@/types/gestio-extended";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";

export async function GET() {
  const auth = await requirePermission("warehouse:read");
  if (isAuthError(auth)) return auth;

  try {
    const client = createGestioClient();
    await client.authenticate();
    const [entradas, saidas] = await Promise.all([
      client.getEntradas(),
      client.getSaidas(),
    ]);

    return NextResponse.json({
      data: {
        entradas: entradas.slice(0, 50),
        saidas: saidas.slice(0, 50),
        totalEntradas: entradas.length,
        totalSaidas: saidas.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao listar movimentações";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requirePermission("warehouse:move");
  if (isAuthError(auth)) return auth;

  try {
    const body = (await request.json()) as {
      tipo: "entrada" | "saida";
      payload: CreateEntradaPayload | CreateSaidaPayload;
    };

    const client = createGestioClient();
    await client.authenticate();

    if (body.tipo === "entrada") {
      const result = await client.createEntrada(body.payload as CreateEntradaPayload);
      await logMovement({
        tipo: "entrada",
        codigoDaFilial: result.codigoDaFilial,
        idProd: result.idProd,
        codigoInterno: result.codigoInterno,
        quantidade: result.quantidade,
        codigoDoProjeto: result.codigoDoProjeto ?? null,
        gestioNumero: result.numeroDaEntrada,
        observacao: body.payload.observacao ?? null,
        createdBy: auth.id,
      });
      return NextResponse.json({ data: result });
    }

    const result = await client.createSaida(body.payload as CreateSaidaPayload);
    await logMovement({
      tipo: "saida",
      codigoDaFilial: result.codigoDaFilial,
      idProd: result.idProd,
      codigoInterno: result.codigoInterno,
      quantidade: result.quantidade,
      codigoDoProjeto: result.codigoDoProjeto ?? null,
      gestioNumero: result.numeroDaSaida,
      observacao: body.payload.observacao ?? null,
      createdBy: auth.id,
    });
    return NextResponse.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao registrar movimentação";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
