import fs from "node:fs";
import path from "node:path";

const ROOT = "STEELMIND_ENGINEERING_BIBLE";

function readDirSorted(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function extractTitle(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const line = content.split("\n").find((item) => item.startsWith("# "));
    return line ? line.replace(/^#\s+/, "").trim() : path.basename(filePath, ".md");
  } catch {
    return path.basename(filePath, ".md");
  }
}

function writeSectionIndex(sectionPath: string, sectionName: string) {
  const files = readDirSorted(sectionPath).filter(
    (item) => item.endsWith(".md") && item !== "_INDEX.md",
  );

  const rows = files.map((file) => {
    const filePath = path.join(sectionPath, file);
    const title = extractTitle(filePath);
    return `| [${file}](${file}) | ${title} |`;
  });

  const content = [
    `# ${sectionName} — Índice`,
    "",
    "Arquivo gerado automaticamente por `npm run bible:index`.",
    "",
    "| Documento | Título |",
    "|-----------|--------|",
    ...rows,
    "",
  ].join("\n");

  fs.writeFileSync(path.join(sectionPath, "_INDEX.md"), content, "utf-8");
}

function writeRootIndex(rootPath: string) {
  const sections = readDirSorted(rootPath).filter((item) =>
    fs.statSync(path.join(rootPath, item)).isDirectory(),
  );

  const rows = sections.map((section) => {
    const sectionPath = path.join(rootPath, section);
    const fileCount = readDirSorted(sectionPath).filter((item) =>
      item.endsWith(".md"),
    ).length;
    return `| [${section}](${section}/_INDEX.md) | ${fileCount} |`;
  });

  const content = [
    "# SteelMind Engineering Bible — Índice Global",
    "",
    "Arquivo gerado automaticamente por `npm run bible:index`.",
    "",
    "| Seção | Arquivos Markdown |",
    "|-------|-------------------|",
    ...rows,
    "",
  ].join("\n");

  fs.writeFileSync(path.join(rootPath, "_INDEX.md"), content, "utf-8");
}

function main() {
  ensureDir(ROOT);
  const sections = readDirSorted(ROOT).filter((item) =>
    fs.statSync(path.join(ROOT, item)).isDirectory(),
  );

  for (const section of sections) {
    writeSectionIndex(path.join(ROOT, section), section);
  }
  writeRootIndex(ROOT);
  console.log("Indices da Engineering Bible atualizados com sucesso.");
}

main();
