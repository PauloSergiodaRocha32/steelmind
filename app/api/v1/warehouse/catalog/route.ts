import { NextResponse } from "next/server";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";
import { loadGestioCatalog } from "@/modules/warehouse/application/load-catalog";
import { buildCatalogTree } from "@/modules/warehouse/application/queries/build-catalog-tree";

export async function GET(request: Request) {
  const auth = await requirePermission("warehouse:read");
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const material = searchParams.get("material");
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

  const directory = buildCatalogTree(catalog, {
    material,
    filial: filial ? Number(filial) : null,
  });

  return NextResponse.json({
    data: {
      syncedAt: catalog.syncedAt,
      stats: catalog.stats,
      filiais: catalog.filiais,
      directory,
    },
  });
}
