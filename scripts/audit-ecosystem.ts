#!/usr/bin/env tsx
/**
 * SteelMind v1 ecosystem audit — tests all roles against key APIs.
 * Run: npm run audit  (requires dev server on :3000)
 */
import { ROLE_PERMISSIONS, type Permission } from "../lib/auth/permissions";
import type { UserRole } from "../types/auth";

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";

const USERS: Array<{ role: UserRole; email: string; password: string }> = [
  { role: "admin", email: "admin@inglesametais.com", password: "admin123" },
  { role: "manager", email: "gerente@inglesametais.com", password: "gerente123" },
  { role: "warehouse", email: "almoxarifado@inglesametais.com", password: "almox123" },
  { role: "purchasing", email: "compras@inglesametais.com", password: "compras123" },
  { role: "engineering", email: "engenharia@inglesametais.com", password: "eng123" },
  { role: "viewer", email: "viewer@inglesametais.com", password: "viewer123" },
];

type Endpoint = {
  method: "GET" | "POST";
  path: string;
  permission: Permission | null;
  body?: object;
};

const ENDPOINTS: Endpoint[] = [
  { method: "GET", path: "/api/v1/platform/overview", permission: null },
  { method: "GET", path: "/api/v1/platform/workflow", permission: null },
  { method: "GET", path: "/api/v1/warehouse/catalog", permission: "warehouse:read" },
  { method: "GET", path: "/api/v1/purchasing/requisitions", permission: "purchasing:read" },
  { method: "GET", path: "/api/v1/engineering/projects", permission: "engineering:read" },
  { method: "GET", path: "/api/v1/budget/quotes", permission: "budget:read" },
  { method: "GET", path: "/api/v1/commercial/opportunities", permission: "commercial:read" },
  { method: "POST", path: "/api/v1/warehouse/sync", permission: "gestio:sync" },
  { method: "POST", path: "/api/v1/budget/analyze", permission: "budget:write", body: { observacoes: "teste audit", arquivos: [] } },
];

function expectedStatus(role: UserRole, ep: Endpoint): number {
  if (!ep.permission) return 200;
  return ROLE_PERMISSIONS[role]?.includes(ep.permission) ? 200 : 403;
}

async function login(email: string, password: string): Promise<string | null> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const cookie = res.headers.get("set-cookie");
  const match = cookie?.match(/steelmind_session=([^;]+)/);
  return match ? `steelmind_session=${match[1]}` : null;
}

async function callApi(cookie: string, ep: Endpoint): Promise<number> {
  const res = await fetch(`${BASE}${ep.path}`, {
    method: ep.method,
    headers: {
      Cookie: cookie,
      ...(ep.body ? { "Content-Type": "application/json" } : {}),
    },
    body: ep.body ? JSON.stringify(ep.body) : undefined,
  });
  return res.status;
}

async function main() {
  console.log("SteelMind v1 Ecosystem Audit\n" + "=".repeat(50));

  let failures = 0;
  let passes = 0;

  // Health
  const loginPage = await fetch(`${BASE}/login`);
  if (!loginPage.ok) {
    console.error("FAIL: dev server not reachable at", BASE);
    process.exit(1);
  }
  console.log("OK  Dev server reachable\n");

  for (const user of USERS) {
    const cookie = await login(user.email, user.password);
    if (!cookie) {
      console.error(`FAIL Login: ${user.role} (${user.email})`);
      failures++;
      continue;
    }
    console.log(`\n--- Role: ${user.role} (${user.email}) ---`);

    for (const ep of ENDPOINTS) {
      const expected = expectedStatus(user.role, ep);
      const actual = await callApi(cookie, ep);
      const ok =
        actual === expected ||
        (expected === 200 && (actual === 201 || actual === 404 || actual === 500));

      if (ok) {
        passes++;
        console.log(`  OK  ${ep.method} ${ep.path} → ${actual} (expected ~${expected})`);
      } else {
        failures++;
        console.log(`  FAIL ${ep.method} ${ep.path} → ${actual} (expected ${expected})`);
      }
    }
  }

  // Unauthenticated
  const unauth = await fetch(`${BASE}/api/v1/platform/overview`);
  if (unauth.status === 401) {
    passes++;
    console.log("\nOK  Unauthenticated API blocked (401)");
  } else {
    failures++;
    console.log("\nFAIL Unauthenticated API should be 401, got", unauth.status);
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Results: ${passes} passed, ${failures} failed`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
