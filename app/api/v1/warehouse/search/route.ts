import { NextResponse } from "next/server";
import { loadGestioCatalog } from "@/modules/warehouse/application/load-catalog";
import { searchProducts } from "@/modules/warehouse/application/queries/search-products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const filial = searchParams.get("filial");
  const material = searchParams.get("material");
  const comSaldo = searchParams.get("comSaldo") === "true";
  const limit = Number(searchParams.get("limit") ?? "50");

  if (!q.trim()) {
    return NextResponse.json(
      { error: { message: "Parâmetro q é obrigatório" } },
      { status: 400 },
    );
  }

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

  const results = searchProducts(catalog, {
    q,
    filial: filial ? Number(filial) : null,
    material,
    comSaldo,
    limit,
  });

  return NextResponse.json({
    data: {
      query: q,
      count: results.length,
      results,
    },
  });
}
