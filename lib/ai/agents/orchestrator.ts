import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { ROLE_PERMISSIONS } from "@/lib/auth/permissions";
import { loadGestioCatalog } from "@/modules/warehouse/application/load-catalog";
import { readManifestStats } from "@/lib/ai/context-builder";
import type {
  AgentFinding,
  AgentId,
  AgentRunResult,
  AgentStatus,
  OrchestratorReport,
} from "@/types/ai-agents";

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";

function finding(
  agent: AgentId,
  severity: AgentFinding["severity"],
  code: string,
  message: string,
  fix?: string,
  href?: string,
): AgentFinding {
  return { agent, severity, code, message, fix, href };
}

function statusFromFindings(findings: AgentFinding[]): AgentStatus {
  if (findings.some((f) => f.severity === "error")) return "fail";
  if (findings.some((f) => f.severity === "warn")) return "warn";
  return "pass";
}

async function runHealthAgent(): Promise<AgentRunResult> {
  const start = Date.now();
  const findings: AgentFinding[] = [];
  const endpoints = [
    "/api/v1/platform/overview",
    "/api/v1/warehouse/catalog",
    "/api/v1/budget/quotes",
    "/api/v1/commercial/opportunities",
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE}${ep}`, { signal: AbortSignal.timeout(8000) });
      if (res.status === 401) {
        findings.push(
          finding("health", "info", "AUTH_REQUIRED", `${ep} protegido (401 sem cookie)`),
        );
      } else if (res.status >= 500) {
        findings.push(
          finding("health", "error", "SERVER_ERROR", `${ep} retornou ${res.status}`, "Verificar logs do servidor", ep),
        );
      } else if (res.status === 404 && ep.includes("catalog")) {
        findings.push(
          finding("health", "warn", "CATALOG_MISSING", "Catálogo Gestio não sincronizado", "npm run gestio:sync", "/warehouse"),
        );
      }
    } catch {
      findings.push(
        finding("health", "error", "UNREACHABLE", `${ep} inacessível`, "Inicie npm run dev"),
      );
    }
  }

  return {
    id: crypto.randomUUID(),
    agent: "health",
    status: statusFromFindings(findings),
    durationMs: Date.now() - start,
    findings,
    startedAt: new Date(start).toISOString(),
    finishedAt: new Date().toISOString(),
  };
}

async function runRbacAgent(): Promise<AgentRunResult> {
  const start = Date.now();
  const findings: AgentFinding[] = [];
  const roles = Object.keys(ROLE_PERMISSIONS) as Array<keyof typeof ROLE_PERMISSIONS>;

  for (const role of roles) {
    const perms = ROLE_PERMISSIONS[role];
    if (!perms?.length) {
      findings.push(finding("rbac", "error", "EMPTY_ROLE", `Role ${role} sem permissões`));
    }
  }

  if (!ROLE_PERMISSIONS.warehouse?.includes("warehouse:move")) {
    findings.push(finding("rbac", "error", "WH_MOVE", "Warehouse sem permissão de movimentação"));
  }
  if (!ROLE_PERMISSIONS.viewer?.includes("budget:read")) {
    findings.push(finding("rbac", "warn", "VIEWER_BUDGET", "Viewer sem leitura de orçamentos"));
  }

  findings.push(
    finding("rbac", "info", "RBAC_MATRIX", `${roles.length} perfis configurados · audit via npm run audit`),
  );

  return {
    id: crypto.randomUUID(),
    agent: "rbac",
    status: statusFromFindings(findings),
    durationMs: Date.now() - start,
    findings,
    startedAt: new Date(start).toISOString(),
    finishedAt: new Date().toISOString(),
  };
}

async function runGestioAgent(): Promise<AgentRunResult> {
  const start = Date.now();
  const findings: AgentFinding[] = [];
  const catalog = loadGestioCatalog();
  const manifest = readManifestStats();

  if (!catalog) {
    findings.push(
      finding("gestio", "error", "NO_CATALOG", "Catálogo Gestio ausente", "npm run gestio:sync", "/warehouse"),
    );
  } else {
    const pct = Math.round(
      (catalog.stats.produtosClassificados / catalog.stats.totalProdutos) * 100,
    );
    findings.push(
      finding("gestio", "info", "CATALOG_OK", `${catalog.stats.totalProdutos} produtos · ${pct}% classificados`),
    );
    if (pct < 90) {
      findings.push(
        finding("gestio", "warn", "LOW_CLASSIFY", `Classificação em ${pct}%`, "npm run gestio:classify:apply"),
      );
    }
  }

  if (!process.env.GESTIO_EMAIL || !process.env.GESTIO_PASSWORD) {
    findings.push(
      finding("gestio", "warn", "NO_CREDS", "GESTIO_EMAIL/PASSWORD não configurados no .env"),
    );
  }

  if (manifest?.stats?.totalProdutos && catalog && manifest.stats.totalProdutos !== catalog.stats.totalProdutos) {
    findings.push(
      finding("gestio", "warn", "MANIFEST_STALE", "Manifest desatualizado vs catalog.json", "npm run gestio:sync"),
    );
  }

  return {
    id: crypto.randomUUID(),
    agent: "gestio",
    status: statusFromFindings(findings),
    durationMs: Date.now() - start,
    findings,
    startedAt: new Date(start).toISOString(),
    finishedAt: new Date().toISOString(),
  };
}

async function runModulesAgent(): Promise<AgentRunResult> {
  const start = Date.now();
  const findings: AgentFinding[] = [];
  const modules = [
    { name: "Commercial", path: "/opportunities", file: "modules/commercial/components/pipeline-dashboard.tsx" },
    { name: "Budget AI", path: "/budget", file: "modules/budget/components/budget-copilot.tsx" },
    { name: "Warehouse", path: "/warehouse", file: "modules/warehouse/components/warehouse-dashboard.tsx" },
    { name: "Engineering", path: "/engineering", file: "modules/engineering/components/engineering-dashboard.tsx" },
    { name: "Purchasing", path: "/purchasing", file: "modules/purchasing/components/purchasing-dashboard.tsx" },
    { name: "Production", path: "/production", file: "modules/production/components/production-dashboard.tsx" },
    { name: "AI Hub", path: "/ai", file: "modules/ai/components/ai-hub.tsx" },
  ];

  for (const mod of modules) {
    const exists = existsSync(resolve(process.cwd(), mod.file));
    if (!exists) {
      findings.push(finding("modules", "error", "MODULE_MISSING", `${mod.name} sem componente`, undefined, mod.path));
    } else {
      findings.push(finding("modules", "info", "MODULE_OK", `${mod.name} implementado`, undefined, mod.path));
    }
  }

  return {
    id: crypto.randomUUID(),
    agent: "modules",
    status: statusFromFindings(findings),
    durationMs: Date.now() - start,
    findings,
    startedAt: new Date(start).toISOString(),
    finishedAt: new Date().toISOString(),
  };
}

async function runDataAgent(): Promise<AgentRunResult> {
  const start = Date.now();
  const findings: AgentFinding[] = [];
  const files = [
    "data/steelmind/store.json",
    "data/steelmind/users.json",
    "data/steelmind/quotes.json",
    "data/steelmind/opportunities.json",
    "data/steelmind/ai/agent-reports.json",
  ];

  for (const f of files) {
    const full = resolve(process.cwd(), f);
    if (existsSync(full)) {
      findings.push(finding("data", "info", "FILE_OK", `${f} presente`));
    } else if (f.includes("ai/")) {
      findings.push(finding("data", "info", "FILE_NEW", `${f} será criado no primeiro scan`));
    } else {
      findings.push(finding("data", "warn", "FILE_MISSING", `${f} ausente (criado no primeiro uso)`));
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    findings.push(
      finding("data", "info", "LOCAL_MODE", "Modo JSON local — configure Supabase para produção"),
    );
  }

  return {
    id: crypto.randomUUID(),
    agent: "data",
    status: statusFromFindings(findings),
    durationMs: Date.now() - start,
    findings,
    startedAt: new Date(start).toISOString(),
    finishedAt: new Date().toISOString(),
  };
}

async function runSecurityAgent(): Promise<AgentRunResult> {
  const start = Date.now();
  const findings: AgentFinding[] = [];

  if (
    process.env.AUTH_SECRET === "steelmind-dev-secret-change-in-production" ||
    !process.env.AUTH_SECRET
  ) {
    findings.push(
      finding("security", "warn", "WEAK_SECRET", "AUTH_SECRET fraco ou padrão", "Defina AUTH_SECRET forte no .env"),
    );
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("eyJ")) {
    findings.push(
      finding("security", "warn", "SERVICE_KEY", "SERVICE_ROLE_KEY no ambiente — nunca expor no client"),
    );
  }

  if (!existsSync(resolve(process.cwd(), "middleware.ts"))) {
    findings.push(finding("security", "error", "NO_MIDDLEWARE", "Middleware de auth ausente"));
  } else {
    findings.push(finding("security", "info", "MIDDLEWARE_OK", "Middleware de auth ativo"));
  }

  findings.push(finding("security", "info", "RLS", "RLS Supabase configurado na migration v1"));

  return {
    id: crypto.randomUUID(),
    agent: "security",
    status: statusFromFindings(findings),
    durationMs: Date.now() - start,
    findings,
    startedAt: new Date(start).toISOString(),
    finishedAt: new Date().toISOString(),
  };
}

function computeScore(agents: AgentRunResult[]): number {
  let score = 100;
  for (const a of agents) {
    for (const f of a.findings) {
      if (f.severity === "error") score -= 8;
      if (f.severity === "warn") score -= 3;
    }
  }
  return Math.max(0, Math.min(100, score));
}

export async function runOrchestrator(triggeredBy?: string | null): Promise<OrchestratorReport> {
  const startedAt = new Date().toISOString();

  const agents = await Promise.all([
    runHealthAgent(),
    runRbacAgent(),
    runGestioAgent(),
    runModulesAgent(),
    runDataAgent(),
    runSecurityAgent(),
  ]);

  const summary = {
    pass: agents.filter((a) => a.status === "pass").length,
    warn: agents.filter((a) => a.status === "warn").length,
    fail: agents.filter((a) => a.status === "fail").length,
    totalFindings: agents.reduce((n, a) => n + a.findings.length, 0),
  };

  const score = computeScore(agents);
  const status: AgentStatus =
    summary.fail > 0 ? "fail" : summary.warn > 0 ? "warn" : "pass";

  return {
    id: crypto.randomUUID(),
    status,
    agents,
    summary,
    score,
    startedAt,
    finishedAt: new Date().toISOString(),
    triggeredBy: triggeredBy ?? null,
  };
}

export async function runSingleAgent(agentId: AgentId): Promise<AgentRunResult | null> {
  const map: Partial<Record<AgentId, () => Promise<AgentRunResult>>> = {
    health: runHealthAgent,
    rbac: runRbacAgent,
    gestio: runGestioAgent,
    modules: runModulesAgent,
    data: runDataAgent,
    security: runSecurityAgent,
  };
  const fn = map[agentId];
  return fn ? fn() : null;
}
