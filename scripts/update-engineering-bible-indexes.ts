import fs from "node:fs";
import path from "node:path";

const ROOT = "STEELMIND_ENGINEERING_BIBLE";
const PLATFORM_SECTION = "14-Knowledge-Platform";

type SectionMeta = {
  purpose: string;
  audience: string;
  related: string[];
};

const SECTION_META: Record<string, SectionMeta> = {
  "00-Foundation": {
    purpose: "Missão, visão, constituição e princípios-base",
    audience: "Todos",
    related: ["01-Product", "02-Architecture", "11-ADRs"],
  },
  "01-Product": {
    purpose: "Visão de produto, regras e fluxos",
    audience: "Produto, Comercial, Engenharia",
    related: ["00-Foundation", "12-Roadmap", "13-Research"],
  },
  "02-Architecture": {
    purpose: "Estrutura técnica e boundaries do sistema",
    audience: "Arquitetura, Desenvolvimento",
    related: ["11-ADRs", "04-Backend", "06-Domains"],
  },
  "03-Frontend": {
    purpose: "Padrões e sistema visual do frontend",
    audience: "Frontend, Produto",
    related: ["01-Product", "05-Engineering"],
  },
  "04-Backend": {
    purpose: "APIs, autenticação, persistência e performance",
    audience: "Backend, Arquitetura",
    related: ["02-Architecture", "05-Engineering"],
  },
  "05-Engineering": {
    purpose: "Padrões de engenharia, testes, CI/CD e release",
    audience: "Desenvolvimento, DevOps, QA",
    related: ["02-Architecture", "10-Playbooks", "14-Knowledge-Platform"],
  },
  "06-Domains": {
    purpose: "Conhecimento dos domínios de negócio do produto",
    audience: "Engenharia, Comercial, Produto",
    related: ["07-Knowledge", "13-Research", "12-Roadmap"],
  },
  "07-Knowledge": {
    purpose: "Base técnica de materiais, normas e processos",
    audience: "Engenharia, IA, Operação",
    related: ["06-Domains", "13-Research", "08-AI"],
  },
  "08-AI": {
    purpose: "Políticas e padrões de IA grounded",
    audience: "IA, Arquitetura, Produto",
    related: ["07-Knowledge", "11-ADRs", "13-Research"],
  },
  "09-Templates": {
    purpose: "Modelos de documentos para execução padronizada",
    audience: "Todos",
    related: ["10-Playbooks", "11-ADRs"],
  },
  "10-Playbooks": {
    purpose: "Guias operacionais para execução recorrente",
    audience: "Engenharia, Operação, Suporte",
    related: ["05-Engineering", "09-Templates"],
  },
  "11-ADRs": {
    purpose: "Registro de decisões arquiteturais",
    audience: "Arquitetura, Engenharia, Produto",
    related: ["00-Foundation", "02-Architecture", "12-Roadmap"],
  },
  "12-Roadmap": {
    purpose: "Planejamento de evolução com riscos e dependências",
    audience: "Produto, Arquitetura, Liderança",
    related: ["11-ADRs", "13-Research", "06-Domains"],
  },
  "13-Research": {
    purpose: "Pesquisas estratégicas para decisões técnicas",
    audience: "Pesquisa, Engenharia, Produto, IA",
    related: ["07-Knowledge", "12-Roadmap", "11-ADRs"],
  },
  "14-Knowledge-Platform": {
    purpose: "Arquitetura da wiki, descoberta e governança",
    audience: "Todos",
    related: ["00-Foundation", "11-ADRs", "12-Roadmap", "13-Research"],
  },
};

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

function hasPlaceholderTodo(filePath: string): boolean {
  const content = fs.readFileSync(filePath, "utf-8");
  return /^\s*TODO\s*$/m.test(content);
}

function writeSectionIndex(sectionPath: string, sectionName: string) {
  const files = readDirSorted(sectionPath).filter(
    (item) => item.endsWith(".md") && item !== "_INDEX.md",
  );

  const meta = SECTION_META[sectionName];
  const relatedLinks = meta
    ? meta.related.map((section) => `[${section}](../${section}/_INDEX.md)`).join(", ")
    : "N/A";

  const rows = files.map((file) => {
    const filePath = path.join(sectionPath, file);
    const title = extractTitle(filePath);
    return `| [${file}](${file}) | ${title} |`;
  });

  const content = [
    `# ${sectionName} — Índice`,
    "",
    `Breadcrumb: [HOME](../HOME.md) > [Índice Global](../_INDEX.md) > ${sectionName}`,
    "",
    "Arquivo gerado automaticamente por `npm run bible:index`.",
    "",
    meta ? `**Propósito da seção:** ${meta.purpose}` : "",
    meta ? `**Público principal:** ${meta.audience}` : "",
    meta ? `**Seções relacionadas:** ${relatedLinks}` : "",
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
    const meta = SECTION_META[section];
    const purpose = meta?.purpose ?? "Sem descrição";
    const audience = meta?.audience ?? "N/A";
    return `| [${section}](${section}/_INDEX.md) | ${fileCount} | ${audience} | ${purpose} |`;
  });

  const content = [
    "# SteelMind Engineering Bible — Índice Global",
    "",
    "Breadcrumb: [HOME](HOME.md) > Índice Global",
    "",
    "Arquivo gerado automaticamente por `npm run bible:index`.",
    "",
    "| Seção | Arquivos Markdown | Público | Objetivo |",
    "|-------|-------------------|---------|----------|",
    ...rows,
    "",
  ].join("\n");

  fs.writeFileSync(path.join(rootPath, "_INDEX.md"), content, "utf-8");
}

function writeKnowledgeInventory(rootPath: string, sections: string[]) {
  const rows: string[] = [];

  for (const section of sections) {
    const sectionPath = path.join(rootPath, section);
    const files = readDirSorted(sectionPath).filter((item) => item.endsWith(".md"));
    const todoFiles = files.filter((file) =>
      hasPlaceholderTodo(path.join(sectionPath, file)),
    ).length;

    rows.push(
      `| [${section}](../${section}/_INDEX.md) | ${files.length} | ${todoFiles} |`,
    );
  }

  const totalFiles = sections
    .map((section) =>
      readDirSorted(path.join(rootPath, section)).filter((item) => item.endsWith(".md")).length,
    )
    .reduce((acc, current) => acc + current, 0);

  const totalTodo = sections
    .map((section) => {
      const sectionPath = path.join(rootPath, section);
      const files = readDirSorted(sectionPath).filter((item) => item.endsWith(".md"));
      return files.filter((file) => hasPlaceholderTodo(path.join(sectionPath, file))).length;
    })
    .reduce((acc, current) => acc + current, 0);

  const content = [
    "# Knowledge Inventory",
    "",
    "Inventário automático da base de conhecimento.",
    "",
    `- Total de documentos markdown: **${totalFiles}**`,
    `- Documentos com TODO: **${totalTodo}**`,
    "",
    "| Seção | Documentos | Com TODO |",
    "|-------|------------|----------|",
    ...rows,
    "",
  ].join("\n");

  fs.writeFileSync(
    path.join(rootPath, PLATFORM_SECTION, "KnowledgeInventory.md"),
    content,
    "utf-8",
  );
}

function writeQualityDashboard(rootPath: string, sections: string[]) {
  const qualityRows = sections
    .map((section) => {
      const sectionPath = path.join(rootPath, section);
      const files = readDirSorted(sectionPath).filter((item) => item.endsWith(".md"));
      const todoFiles = files.filter((file) =>
        hasPlaceholderTodo(path.join(sectionPath, file)),
      ).length;
      const quality = files.length === 0 ? 0 : Math.round(((files.length - todoFiles) / files.length) * 100);

      return { section, files: files.length, todoFiles, quality };
    })
    .sort((a, b) => a.quality - b.quality);

  const content = [
    "# Quality Dashboard",
    "",
    "Visão de qualidade documental gerada automaticamente.",
    "",
    "| Seção | Docs | TODO | Qualidade (%) |",
    "|-------|------|------|---------------|",
    ...qualityRows.map(
      (row) =>
        `| [${row.section}](../${row.section}/_INDEX.md) | ${row.files} | ${row.todoFiles} | ${row.quality} |`,
    ),
    "",
    "## Prioridades sugeridas",
    "",
    ...qualityRows
      .slice(0, 3)
      .map(
        (row, index) =>
          `${index + 1}. ${row.section} (${row.quality}%): priorizar substituição de TODO por conteúdo operacional.`,
      ),
    "",
  ].join("\n");

  fs.writeFileSync(
    path.join(rootPath, PLATFORM_SECTION, "QualityDashboard.md"),
    content,
    "utf-8",
  );
}

function writeKnowledgeGraph(rootPath: string, sections: string[]) {
  const lines = [
    "# Knowledge Graph",
    "",
    "```mermaid",
    "graph TD",
    '    HOME["HOME"] --> INDEX["Índice Global"]',
  ];

  for (const section of sections) {
    lines.push(`    INDEX --> ${section.replace(/[^a-zA-Z0-9]/g, "_")}["${section}"]`);
  }

  for (const section of sections) {
    const meta = SECTION_META[section];
    if (!meta) continue;
    for (const related of meta.related) {
      lines.push(
        `    ${section.replace(/[^a-zA-Z0-9]/g, "_")} --> ${related.replace(/[^a-zA-Z0-9]/g, "_")}`,
      );
    }
  }

  lines.push("```", "");

  fs.writeFileSync(
    path.join(rootPath, PLATFORM_SECTION, "KnowledgeGraph.md"),
    lines.join("\n"),
    "utf-8",
  );
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
  if (sections.includes(PLATFORM_SECTION)) {
    writeKnowledgeInventory(ROOT, sections);
    writeQualityDashboard(ROOT, sections);
    writeKnowledgeGraph(ROOT, sections);
  }
  console.log("Indices da Engineering Bible atualizados com sucesso.");
}

main();
