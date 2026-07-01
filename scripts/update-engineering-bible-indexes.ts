import fs from "node:fs";
import path from "node:path";

const ROOT = "STEELMIND_ENGINEERING_BIBLE";
const PLATFORM_SECTION = "14-Knowledge-Platform";

type SectionMeta = {
  purpose: string;
  audience: string;
  related: string[];
};

type SemanticTheme = {
  theme: string;
  intent: string;
  canonicalDocs: string[];
};

type TraceabilityLink = {
  id: string;
  topic: string;
  docs: string[];
  code: string[];
  tests: string[];
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

const SEMANTIC_THEMES: SemanticTheme[] = [
  {
    theme: "Arquitetura orientada a domínio",
    intent: "Como o sistema é organizado e evolui com segurança",
    canonicalDocs: [
      "00-Foundation/04-Constitution.md",
      "02-Architecture/Overview.md",
      "02-Architecture/DDD.md",
      "11-ADRs/CatalogoDecisoes.md",
    ],
  },
  {
    theme: "Orçamento operacional explicável",
    intent: "Como orçamento vira ação para compras e produção",
    canonicalDocs: [
      "06-Domains/OrcamentoOperacionalInglesa.md",
      "12-Roadmap/MasterRoadmap.md",
      "13-Research/Orcamentacao.md",
      "11-ADRs/ADR-008-Readiness-Gate-Operacional.md",
    ],
  },
  {
    theme: "Knowledge Engine e regras versionadas",
    intent: "Como preservar e evoluir conhecimento técnico",
    canonicalDocs: [
      "07-Knowledge/ABNT.md",
      "02-Architecture/RuleEngine.md",
      "13-Research/NormasABNT.md",
      "11-ADRs/ADR-005-Knowledge-Base-Rule-Engine.md",
    ],
  },
  {
    theme: "IA grounded e auditoria",
    intent: "Como usar IA com confiança e rastreabilidade",
    canonicalDocs: [
      "08-AI/AIConstitution.md",
      "08-AI/Guardrails.md",
      "13-Research/IAAplicadaEngenharia.md",
      "11-ADRs/ADR-006-Bible-Navegavel.md",
    ],
  },
  {
    theme: "Riscos e governança de execução",
    intent: "Como evitar regressão arquitetural e operacional",
    canonicalDocs: [
      "12-Roadmap/RiskRegister.md",
      "12-Roadmap/TechDebtCatalog.md",
      "14-Knowledge-Platform/ContributionGovernance.md",
      "05-Engineering/CI-CD.md",
    ],
  },
];

const TRACEABILITY_LINKS: TraceabilityLink[] = [
  {
    id: "TRC-001",
    topic: "Readiness Gate operacional no orçamento",
    docs: [
      "06-Domains/OrcamentoOperacionalInglesa.md",
      "11-ADRs/ADR-008-Readiness-Gate-Operacional.md",
      "13-Research/Orcamentacao.md",
    ],
    code: [
      "domains/quoting/services/quote-readiness.ts",
      "application/quoting/use-cases/assess-quote-readiness.ts",
      "app/api/v1/budget/chat/route.ts",
      "app/api/v1/budget/analyze/route.ts",
      "modules/budget/components/budget-copilot.tsx",
    ],
    tests: ["domains/quoting/services/quote-readiness.test.ts"],
  },
  {
    id: "TRC-002",
    topic: "Shadow mode e comparação de motores",
    docs: [
      "02-Architecture/ShadowMode.md",
      "11-ADRs/ADR-003-Shadow-Mode.md",
      "12-Roadmap/Milestones.md",
    ],
    code: [
      "application/quoting/use-cases/run-quote-engine-v2-shadow.ts",
      "modules/shadow/application/services/difference-analyzer.ts",
      "modules/shadow/application/services/shadow-run-recorder.ts",
    ],
    tests: [
      "modules/shadow/application/services/difference-analyzer.test.ts",
      "modules/shadow/infrastructure/file-shadow-run.repository.test.ts",
    ],
  },
  {
    id: "TRC-003",
    topic: "Knowledge Platform e automação da wiki",
    docs: [
      "14-Knowledge-Platform/PlatformArchitecture.md",
      "11-ADRs/ADR-009-Wiki-V2-CrossLinks-Rastreabilidade.md",
    ],
    code: [
      "scripts/create-engineering-bible.ts",
      "scripts/seed-engineering-bible-content.ts",
      "scripts/update-engineering-bible-indexes.ts",
    ],
    tests: [],
  },
];

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

function toNodeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "_");
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
    lines.push(`    INDEX --> ${toNodeId(section)}["${section}"]`);
  }

  for (const section of sections) {
    const meta = SECTION_META[section];
    if (!meta) continue;
    for (const related of meta.related) {
      lines.push(
        `    ${toNodeId(section)} --> ${toNodeId(related)}`,
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

function writeSemanticCrossLinks(rootPath: string) {
  const rows = SEMANTIC_THEMES.map((item) => {
    const links = item.canonicalDocs
      .map((doc) => `[${doc}](../${doc})`)
      .join("<br>");
    return `| ${item.theme} | ${item.intent} | ${links} |`;
  });

  const content = [
    "# Semantic Cross Links",
    "",
    "Mapa semântico de temas estratégicos para descoberta rápida de conhecimento.",
    "",
    "| Tema | Intenção de busca | Documentos canônicos |",
    "|------|-------------------|----------------------|",
    ...rows,
    "",
    "## Regra de uso",
    "",
    "- Atualize primeiro o documento canônico do tema.",
    "- Evite duplicar conteúdo; use links cruzados.",
    "",
  ].join("\n");

  fs.writeFileSync(
    path.join(rootPath, PLATFORM_SECTION, "SemanticCrossLinks.md"),
    content,
    "utf-8",
  );
}

function writeArchitectureContextMap(rootPath: string) {
  const lines = [
    "# Architecture Context Map",
    "",
    "```mermaid",
    "graph LR",
    '    Comercial["Comercial"] --> Orcamento["Orçamento"]',
    '    Orcamento --> Engenharia["Engenharia"]',
    '    Orcamento --> Compras["Compras"]',
    '    Orcamento --> Producao["Produção"]',
    '    Orcamento --> Financeiro["Financeiro"]',
    '    Orcamento --> Conhecimento["Knowledge Engine"]',
    '    Orcamento --> Shadow["Shadow/Calibration"]',
    '    Conhecimento --> IA["IA Grounded"]',
    '    Integracao["ACL Gestio"] --> Orcamento',
    '    Integracao --> Compras',
    '    Integracao --> Engenharia',
    "```",
    "",
    "## Referências de contexto",
    "",
    "- [02-Architecture/DDD.md](../02-Architecture/DDD.md)",
    "- [02-Architecture/ACL.md](../02-Architecture/ACL.md)",
    "- [06-Domains/OrcamentoOperacionalInglesa.md](../06-Domains/OrcamentoOperacionalInglesa.md)",
    "- [11-ADRs/_INDEX.md](../11-ADRs/_INDEX.md)",
    "",
  ];

  fs.writeFileSync(
    path.join(rootPath, PLATFORM_SECTION, "ArchitectureContextMap.md"),
    lines.join("\n"),
    "utf-8",
  );
}

function writeConsolidatedRiskCatalog(rootPath: string) {
  const riskRegisterPath = path.join(rootPath, "12-Roadmap", "RiskRegister.md");
  const riskLines = fs
    .readFileSync(riskRegisterPath, "utf-8")
    .split("\n")
    .filter((line) => /^\| R-\d+ \|/.test(line));

  const normalizedRows = riskLines.map((line) => {
    const columns = line.split("|").map((item) => item.trim()).filter(Boolean);
    const [id, risk, prob, impact, mitigation] = columns;
    return `| ${id} | ${risk} | ${prob} | ${impact} | ${mitigation} | [12-Roadmap/RiskRegister.md](../12-Roadmap/RiskRegister.md) |`;
  });

  const additionalRows = [
    "| R-OPS-01 | Dependência externa Gestio indisponível | Média | Alto | Fallback local + avisos de fonte nas APIs | [app/api/v1/purchasing/requisitions/route.ts](../../app/api/v1/purchasing/requisitions/route.ts) |",
    "| R-OPS-02 | Confirmação de orçamento sem dados críticos | Média | Alto | Readiness Gate com bloqueio seletivo | [app/api/v1/budget/chat/route.ts](../../app/api/v1/budget/chat/route.ts) |",
    "| R-DOC-01 | Crescimento de docs sem rastreabilidade | Média | Médio | Wiki v2 com matriz doc->código->testes | [TraceabilityMatrix.md](TraceabilityMatrix.md) |",
  ];

  const content = [
    "# Consolidated Risk Catalog",
    "",
    "Consolidação de riscos estratégicos, técnicos e operacionais em uma visão única.",
    "",
    "| ID | Risco | Probabilidade | Impacto | Mitigação | Fonte |",
    "|----|-------|---------------|---------|-----------|-------|",
    ...normalizedRows,
    ...additionalRows,
    "",
    "## Uso recomendado",
    "",
    "1. Revisar este catálogo em cada ciclo de arquitetura.",
    "2. Atualizar risco e mitigação quando houver mudança de contexto.",
    "3. Abrir ADR quando mitigação exigir mudança estrutural.",
    "",
  ].join("\n");

  fs.writeFileSync(
    path.join(rootPath, PLATFORM_SECTION, "ConsolidatedRiskCatalog.md"),
    content,
    "utf-8",
  );
}

function formatPathLink(relativeFromRoot: string): string {
  return `[${relativeFromRoot}](../${relativeFromRoot})`;
}

function formatCodeLink(relativeFromWorkspace: string): string {
  return `[${relativeFromWorkspace}](../../${relativeFromWorkspace})`;
}

function statusChip(found: boolean): string {
  return found ? "✅" : "⚠️";
}

function writeTraceabilityMatrix(rootPath: string) {
  const rows = TRACEABILITY_LINKS.map((entry) => {
    const docLinks = entry.docs.map((item) => formatPathLink(item)).join("<br>");
    const codeLinks = entry.code
      .map((item) => `${statusChip(fs.existsSync(path.join("/workspace", item)))} ${formatCodeLink(item)}`)
      .join("<br>");
    const testLinks =
      entry.tests.length === 0
        ? "N/A"
        : entry.tests
            .map(
              (item) =>
                `${statusChip(fs.existsSync(path.join("/workspace", item)))} ${formatCodeLink(item)}`,
            )
            .join("<br>");

    return `| ${entry.id} | ${entry.topic} | ${docLinks} | ${codeLinks} | ${testLinks} |`;
  });

  const content = [
    "# Traceability Matrix",
    "",
    "Rastreabilidade entre conhecimento, implementação e validação automatizada.",
    "",
    "| ID | Tema | Documento(s) | Código | Testes |",
    "|----|------|--------------|--------|--------|",
    ...rows,
    "",
    "## Política de rastreabilidade",
    "",
    "- Toda mudança estrutural deve ter referência documental e evidência de validação.",
    "- Priorizar cobertura de testes para fluxos críticos operacionais.",
    "",
  ].join("\n");

  fs.writeFileSync(
    path.join(rootPath, PLATFORM_SECTION, "TraceabilityMatrix.md"),
    content,
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
    writeSemanticCrossLinks(ROOT);
    writeArchitectureContextMap(ROOT);
    writeConsolidatedRiskCatalog(ROOT);
    writeTraceabilityMatrix(ROOT);
    writeKnowledgeInventory(ROOT, sections);
    writeQualityDashboard(ROOT, sections);
    writeKnowledgeGraph(ROOT, sections);
  }
  console.log("Indices da Engineering Bible atualizados com sucesso.");
}

main();
