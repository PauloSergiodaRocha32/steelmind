import { NextResponse } from "next/server";
import { createGestioClient } from "@/services/gestio/client";
import { getStore, savePurchaseRequisition } from "@/lib/persistence/store";
import { loadGestioCatalog } from "@/modules/warehouse/application/load-catalog";
import { buildStockOverview } from "@/modules/warehouse/application/queries/stock-overview";

export async function GET() {
  try {
    const client = createGestioClient();
    await client.authenticate();
    const [abertas, encerradas, store] = await Promise.all([
      client.getRequisicoesCompraAbertas(),
      client.getRequisicoesCompraEncerradas(),
      getStore(),
    ]);

    const catalog = loadGestioCatalog();
    const alertas = catalog
      ? buildStockOverview(catalog).alertas.slice(0, 20)
      : [];

    return NextResponse.json({
      data: {
        gestioAbertas: abertas.slice(0, 30),
        gestioEncerradas: encerradas.slice(0, 10),
        localRequisitions: store.purchaseRequisitions,
        stockAlertas: alertas,
        backend: store.backend,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar compras";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      descricao: string;
      codigoDaFilial?: number;
      codigoDoProjeto?: number;
      items: Array<{
        idProd: number;
        codigo: string | null;
        descricao: string | null;
        quantidade: number;
        motivo: string;
      }>;
    };

    const req = await savePurchaseRequisition({
      descricao: body.descricao,
      codigoDaFilial: body.codigoDaFilial ?? null,
      codigoDoProjeto: body.codigoDoProjeto ?? null,
      status: "pending",
      items: body.items,
    });

    return NextResponse.json({ data: req }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar requisição";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
