import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { GestioSyncSnapshot } from "@/types/gestio";
import { classifyProduct } from "@/services/gestio/taxonomy";

function loadCatalog(): GestioSyncSnapshot | null {
  const path = resolve(process.cwd(), "data/gestio/catalog.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8")) as GestioSyncSnapshot;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const material = searchParams.get("material");
  const filial = searchParams.get("filial");

  const catalog = loadCatalog();
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

  const grupoMap = new Map(
    catalog.grupos.map((g) => [g.codigoDoGrupoDeProduto, g.descricaoDoGrupoDeProduto]),
  );
  const categoriaMap = new Map(
    catalog.categorias.map((c) => [
      c.codigoDaCategoriaDeProduto,
      c.descricaoDaCategoriaDeProduto,
    ]),
  );

  const directory = new Map<
    string,
    {
      material: string;
      grupoCode: string;
      categorias: Map<
        string,
        {
          categoria: string;
          categoryId: number;
          produtos: Array<{
            idProd: number;
            codigo: string | null;
            descricao: string | null;
            saldoPorFilial: Record<number, number>;
          }>;
        }
      >;
    }
  >();

  const saldoIndex = new Map<string, number>();
  for (const saldo of catalog.saldos) {
    if (filial && saldo.codigoDaFilial !== Number(filial)) continue;
    const key = `${saldo.codigoDaFilial}:${saldo.idProd}`;
    saldoIndex.set(key, (saldoIndex.get(key) ?? 0) + saldo.quantidadeTotal);
  }

  for (const produto of catalog.produtos) {
    const classification = classifyProduct(
      produto.codigoInterno,
      produto.descricaoDoProduto,
      produto,
    );

    const grupoCode =
      produto.codigoDoGrupoDeProduto ??
      classification?.codigoDoGrupoDeProduto ??
      "000000";
    const materialLabel =
      grupoMap.get(grupoCode) ?? classification?.material ?? "Sem material";

    if (material && !materialLabel.toLowerCase().includes(material.toLowerCase())) {
      continue;
    }

    const categoryId =
      produto.codigoDaCategoriaDeProduto ??
      classification?.codigoDaCategoriaDeProduto ??
      0;
    const categoriaLabel =
      categoriaMap.get(categoryId) ??
      classification?.categoria ??
      "Sem categoria";

    if (!directory.has(materialLabel)) {
      directory.set(materialLabel, {
        material: materialLabel,
        grupoCode,
        categorias: new Map(),
      });
    }

    const matEntry = directory.get(materialLabel)!;
    if (!matEntry.categorias.has(categoriaLabel)) {
      matEntry.categorias.set(categoriaLabel, {
        categoria: categoriaLabel,
        categoryId,
        produtos: [],
      });
    }

    const saldoPorFilial: Record<number, number> = {};
    for (const f of catalog.filiais) {
      const qty = saldoIndex.get(`${f.codigoDaFilial}:${produto.idProd}`) ?? 0;
      if (qty > 0) saldoPorFilial[f.codigoDaFilial] = qty;
    }

    matEntry.categorias.get(categoriaLabel)!.produtos.push({
      idProd: produto.idProd,
      codigo: produto.codigoInterno,
      descricao: produto.descricaoDoProduto,
      saldoPorFilial,
    });
  }

  const tree = Array.from(directory.values())
    .sort((a, b) => a.material.localeCompare(b.material))
    .map((mat) => ({
      material: mat.material,
      grupoCode: mat.grupoCode,
      totalProdutos: Array.from(mat.categorias.values()).reduce(
        (sum, c) => sum + c.produtos.length,
        0,
      ),
      categorias: Array.from(mat.categorias.values())
        .sort((a, b) => a.categoria.localeCompare(b.categoria))
        .map((cat) => ({
          categoria: cat.categoria,
          categoryId: cat.categoryId,
          count: cat.produtos.length,
          produtos: cat.produtos.slice(0, 50),
        })),
    }));

  return NextResponse.json({
    data: {
      syncedAt: catalog.syncedAt,
      stats: catalog.stats,
      filiais: catalog.filiais,
      directory: tree,
    },
  });
}
