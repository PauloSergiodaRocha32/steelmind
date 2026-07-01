import { NextResponse } from "next/server";
import { loadGestioCatalog } from "@/modules/warehouse/application/load-catalog";
import { buildStockOverview } from "@/modules/warehouse/application/queries/stock-overview";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filial = searchParams.get("filial");

  const catalog = loadGestioCatalog();
  if (!catalog) {
    return NextResponse.json(
      {
        error: {
          message:
            "Catálogo não sincronizado. Execute POST /api/v1/warehouse/sync ou npm run gestio:sync",
        },
      },
      { status: 404 },
    );
  }

  const overview = buildStockOverview(
    catalog,
    filial ? Number(filial) : null,
  );

  return NextResponse.json({ data: overview });
}
