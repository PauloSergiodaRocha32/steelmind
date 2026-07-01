import { createGestioClient } from "@/services/gestio/client";
import { classifyProduct } from "@/services/gestio/taxonomy";
import type {
  GestioProduto,
  GestioSyncSnapshot,
  GestioSyncStats,
  ProductClassification,
} from "@/types/gestio";

export interface ClassifyResult {
  idProd: number;
  codigoInterno: string | null;
  descricao: string | null;
  classification: ProductClassification;
}

export interface ClassifyBatchResult {
  classifiable: ClassifyResult[];
  skipped: number;
  alreadyClassified: number;
}

export function analyzeClassification(
  produtos: GestioProduto[],
): ClassifyBatchResult {
  const classifiable: ClassifyResult[] = [];
  let skipped = 0;
  let alreadyClassified = 0;

  for (const produto of produtos) {
    if (
      produto.codigoDoGrupoDeProduto &&
      produto.codigoDaCategoriaDeProduto &&
      produto.codigoDoTipoDeProduto
    ) {
      alreadyClassified++;
      continue;
    }

    const classification = classifyProduct(
      produto.codigoInterno,
      produto.descricaoDoProduto,
      produto,
    );

    if (!classification || classification.source === "existing") {
      skipped++;
      continue;
    }

    classifiable.push({
      idProd: produto.idProd,
      codigoInterno: produto.codigoInterno,
      descricao: produto.descricaoDoProduto,
      classification,
    });
  }

  return { classifiable, skipped, alreadyClassified };
}

function buildStats(
  produtos: GestioProduto[],
  saldos: { quantidadeTotal: number }[],
  filiais: unknown[],
): GestioSyncStats {
  const produtosClassificados = produtos.filter(
    (p) =>
      p.codigoDoGrupoDeProduto &&
      p.codigoDaCategoriaDeProduto &&
      p.codigoDoTipoDeProduto,
  ).length;

  return {
    totalProdutos: produtos.length,
    produtosClassificados,
    produtosSemClassificacao: produtos.length - produtosClassificados,
    saldosComQuantidade: saldos.filter((s) => s.quantidadeTotal > 0).length,
    filiais: filiais.length,
  };
}

export async function syncGestioData(): Promise<GestioSyncSnapshot> {
  const client = createGestioClient();
  await client.authenticate();

  const [filiais, categorias, grupos, tipos, produtos, saldos] =
    await Promise.all([
      client.getFiliais(),
      client.getCategorias(),
      client.getGrupos(),
      client.getTipos(),
      client.getProdutos(),
      client.getTodosSaldos(),
    ]);

  const almoxarifados = (
    await Promise.all(
      filiais.map((f) => client.getAlmoxarifados(f.codigoDaFilial)),
    )
  ).flat();

  const stats = buildStats(produtos, saldos, filiais);

  return {
    syncedAt: new Date().toISOString(),
    empresa: filiais[0]?.descricaoDaFilial ?? "Inglesa Metais",
    filiais,
    categorias,
    grupos,
    tipos,
    almoxarifados,
    produtos,
    saldos,
    stats,
  };
}

export async function applyGestioClassification(
  dryRun = true,
  concurrency = 8,
): Promise<{
  dryRun: boolean;
  updated: number;
  failed: number;
  preview: ClassifyResult[];
}> {
  const client = createGestioClient();
  await client.authenticate();
  const produtos = await client.getProdutos();
  const { classifiable } = analyzeClassification(produtos);

  if (dryRun) {
    return {
      dryRun: true,
      updated: 0,
      failed: 0,
      preview: classifiable.slice(0, 20),
    };
  }

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < classifiable.length; i += concurrency) {
    const batch = classifiable.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map(async (item) => {
        const produto = produtos.find((p) => p.idProd === item.idProd);
        if (!produto) throw new Error("not found");
        await client.updateProduto({
          ...produto,
          codigoDoGrupoDeProduto: item.classification.codigoDoGrupoDeProduto,
          codigoDaCategoriaDeProduto:
            item.classification.codigoDaCategoriaDeProduto,
          codigoDoTipoDeProduto: item.classification.codigoDoTipoDeProduto,
        });
      }),
    );

    for (const result of results) {
      if (result.status === "fulfilled") updated++;
      else failed++;
    }

    if ((i + concurrency) % 200 === 0 || i + concurrency >= classifiable.length) {
      console.log(
        `Progresso: ${Math.min(i + concurrency, classifiable.length)}/${classifiable.length}`,
      );
    }
  }

  return { dryRun: false, updated, failed, preview: classifiable.slice(0, 10) };
}
