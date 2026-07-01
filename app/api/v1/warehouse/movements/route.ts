import { NextResponse } from "next/server";
import { createGestioClient } from "@/services/gestio/client";
import { getStore, logMovement } from "@/lib/persistence/store";
import type {
  CreateEntradaPayload,
  CreateSaidaPayload,
  GestioMovimentacaoEntrada,
  GestioMovimentacaoSaida,
} from "@/types/gestio-extended";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";

function mapLocalMovementsFallback(
  movements: Awaited<ReturnType<typeof getStore>>["movementLogs"],
): {
  entradas: GestioMovimentacaoEntrada[];
  saidas: GestioMovimentacaoSaida[];
} {
  const entradas = movements
    .filter((item) => item.tipo === "entrada")
    .slice(0, 50)
    .map((item, index) => ({
      numeroDaEntrada: item.gestioNumero ?? index + 1,
      seq: index + 1,
      codigoDaFilial: item.codigoDaFilial,
      descricaoDaFilial: `Filial ${item.codigoDaFilial}`,
      codigoDoAlmoxarifado: item.codigoDaFilial,
      idProd: item.idProd,
      codigoInterno: item.codigoInterno,
      descricaoDoProduto: item.observacao ?? "Movimentacao local",
      quantidade: item.quantidade,
      dataDaEntrada: item.createdAt,
      codigoDoProjeto: item.codigoDoProjeto,
      observacao: item.observacao,
    }));

  const saidas = movements
    .filter((item) => item.tipo === "saida")
    .slice(0, 50)
    .map((item, index) => ({
      numeroDaSaida: item.gestioNumero ?? index + 1,
      seq: index + 1,
      codigoDaFilial: item.codigoDaFilial,
      idProd: item.idProd,
      codigoInterno: item.codigoInterno,
      descricaoDoProduto: item.observacao ?? "Movimentacao local",
      quantidade: item.quantidade,
      dataDaSaida: item.createdAt,
      codigoDoProjeto: item.codigoDoProjeto,
      observacao: item.observacao,
    }));

  return { entradas, saidas };
}

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
        source: "gestio",
      },
    });
  } catch {
    const store = await getStore();
    const fallback = mapLocalMovementsFallback(store.movementLogs);

    return NextResponse.json({
      data: {
        entradas: fallback.entradas,
        saidas: fallback.saidas,
        totalEntradas: fallback.entradas.length,
        totalSaidas: fallback.saidas.length,
        source: "local-fallback",
      },
    });
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
    const message =
      error instanceof Error ? error.message : "Erro ao registrar movimentacao";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
