import { NextResponse } from "next/server";
import { createGestioClient } from "@/services/gestio/client";
import { getStore, isSupabaseConfigured } from "@/lib/persistence/store";
import { loadGestioCatalog } from "@/modules/warehouse/application/load-catalog";
import { buildStockOverview } from "@/modules/warehouse/application/queries/stock-overview";

export async function GET() {
  try {
    const catalog = loadGestioCatalog();
    const store = await getStore();

    let gestioStats = null;
    let projetos = 0;
    let movimentos = { entradas: 0, saidas: 0 };

    try {
      const client = createGestioClient();
      await client.authenticate();
      const [projetosList, entradas, saidas, abertas] = await Promise.all([
        client.getProjetos(),
        client.getEntradas(),
        client.getSaidas(),
        client.getRequisicoesCompraAbertas(),
      ]);
      projetos = projetosList.filter((p) => p.ativo).length;
      movimentos = { entradas: entradas.length, saidas: saidas.length };
      gestioStats = {
        requisicoesAbertas: abertas.length,
      };
    } catch {
      /* Gestio optional for overview */
    }

    const stock = catalog ? buildStockOverview(catalog) : null;

    return NextResponse.json({
      data: {
        persistence: {
          backend: store.backend,
          supabaseConfigured: isSupabaseConfigured(),
        },
        warehouse: catalog?.stats ?? null,
        stock: stock
          ? {
              comSaldo: stock.comSaldo.length,
              alertas: stock.alertas.length,
            }
          : null,
        engineering: {
          projetosGestio: projetos,
          bomsLocais: store.projectBoms.length,
        },
        purchasing: {
          requisicoesLocais: store.purchaseRequisitions.length,
          gestioAbertas: gestioStats?.requisicoesAbertas ?? 0,
        },
        movements: movimentos,
        modules: [
          { name: "Almoxarifado", href: "/warehouse", status: catalog ? "online" : "sync-required" },
          { name: "Compras", href: "/purchasing", status: "online" },
          { name: "Engenharia", href: "/engineering", status: "online" },
        ],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no overview";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
