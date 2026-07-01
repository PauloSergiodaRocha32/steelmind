import { NextResponse } from "next/server";
import { loadGestioCatalog } from "@/modules/warehouse/application/load-catalog";
import { getProductDetail } from "@/modules/warehouse/application/queries/get-product-detail";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const idProd = Number(id);

  if (Number.isNaN(idProd)) {
    return NextResponse.json(
      { error: { message: "ID de produto inválido" } },
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

  const product = getProductDetail(catalog, idProd);
  if (!product) {
    return NextResponse.json(
      { error: { message: "Produto não encontrado" } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: product });
}
