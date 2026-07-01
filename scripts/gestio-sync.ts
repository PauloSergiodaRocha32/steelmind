import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import {
  syncGestioData,
  applyGestioClassification,
  analyzeClassification,
} from "../services/gestio/sync";

config();

const args = process.argv.slice(2);
const shouldClassify = args.includes("--classify");
const dryRun = !args.includes("--apply");

async function main() {
  const dataDir = resolve(process.cwd(), "data/gestio");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  console.log("Sincronizando dados do Gestio (todas as filiais)...");
  const snapshot = await syncGestioData();

  const catalogPath = resolve(dataDir, "catalog.json");
  writeFileSync(catalogPath, JSON.stringify(snapshot, null, 2));
  console.log(`Catálogo salvo em ${catalogPath}`);
  console.log("Estatísticas:", snapshot.stats);

  const analysis = analyzeClassification(snapshot.produtos);
  console.log(
    `Classificação: ${analysis.alreadyClassified} já OK, ${analysis.classifiable.length} para atualizar, ${analysis.skipped} sem regra`,
  );

  if (shouldClassify) {
    console.log(
      dryRun
        ? "Modo dry-run — use --apply para gravar no Gestio"
        : "Aplicando classificação no Gestio...",
    );
    const result = await applyGestioClassification(dryRun);
    console.log(result);

    if (!dryRun) {
      const refreshed = await syncGestioData();
      writeFileSync(catalogPath, JSON.stringify(refreshed, null, 2));
      console.log("Catálogo atualizado após classificação.");
    }
  }

  const manifestPath = resolve(dataDir, "manifest.json");
  const manifest = {
    syncedAt: snapshot.syncedAt,
    empresa: snapshot.empresa,
    stats: snapshot.stats,
    filiais: snapshot.filiais.map((f) => ({
      codigo: f.codigoDaFilial,
      nome: f.descricaoDaFilial,
      cnpj: f.cnpj,
    })),
    grupos: snapshot.grupos.length,
    categorias: snapshot.categorias.length,
    classificaveis: analysis.classifiable.length,
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifesto salvo em ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
