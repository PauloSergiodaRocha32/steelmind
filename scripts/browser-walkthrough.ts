#!/usr/bin/env tsx
/**
 * Browser walkthrough — executa projeto demo passo a passo no Chromium.
 * Run: npm run demo:browser
 */
import { chromium } from "playwright";

const BASE = process.env.DEMO_BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.DEMO_EMAIL ?? "admin@inglesametais.com";
const PASSWORD = process.env.DEMO_PASSWORD ?? "admin123";

type RouteCheck = {
  path: string;
  label: string;
  assertReady?: (page: import("playwright").Page) => Promise<void>;
};

const ROUTES: RouteCheck[] = [
  { path: "/login", label: "Login" },
  {
    path: "/",
    label: "Mission Control (Command Center)",
    assertReady: async (page) => {
      await page.waitForSelector("text=v1 · Command Center", { timeout: 15000 });
    },
  },
  { path: "/projeto", label: "Projeto Demo Wizard" },
  { path: "/opportunities", label: "Pipeline Comercial" },
  { path: "/budget", label: "Orçamento IA Copilot" },
  { path: "/engineering", label: "Engenharia BOM" },
  { path: "/purchasing", label: "Compras" },
  { path: "/warehouse", label: "Almoxarifado" },
  { path: "/production", label: "Produção" },
  { path: "/knowledge", label: "Conhecimento" },
  {
    path: "/ai",
    label: "AI Hub + Agentes",
    assertReady: async (page) => {
      await page.waitForSelector("text=Painel de agentes cloud", { timeout: 15000 });
    },
  },
];

async function main() {
  console.log("SteelMind Browser Walkthrough");
  console.log("=".repeat(55));
  console.log(`Base URL: ${BASE}`);
  console.log(`User: ${EMAIL}\n`);

  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== "0",
    slowMo: process.env.SLOW_MO ? Number(process.env.SLOW_MO) : 150,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "pt-BR",
  });
  const page = await context.newPage();

  try {
    // Login
    console.log("→ Login…");
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    const emailInput = page.getByPlaceholder("E-mail");
    const isLoginVisible = await emailInput
      .isVisible({ timeout: 4000 })
      .catch(() => false);

    if (isLoginVisible) {
      await emailInput.fill(EMAIL);
      await page.getByPlaceholder("Senha").fill(PASSWORD);
      const loginResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/auth/login") &&
          response.request().method() === "POST",
        { timeout: 15000 },
      );
      await page.getByRole("button", { name: /Entrar/i }).click();
      const loginResponse = await loginResponsePromise;
      if (!loginResponse.ok()) {
        throw new Error(`Login HTTP ${loginResponse.status()}`);
      }
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      console.log("  ✓ Autenticado\n");
    } else {
      console.log("  ✓ Sessão já autenticada\n");
    }

    // Execute demo project
    console.log("→ Executando projeto demo em /projeto…");
    await page.goto(`${BASE}/projeto`, { waitUntil: "networkidle" });
    const runBtn = page.getByRole("button", { name: /Executar projeto completo/i });
    const hasRunButton = await runBtn.isVisible({ timeout: 6000 }).catch(() => false);
    if (hasRunButton) {
      await runBtn.click();
      await page.waitForSelector("text=Projeto executado com sucesso", { timeout: 120000 });
    } else {
      const alreadyCompleted = await page
        .locator("text=Projeto executado com sucesso")
        .isVisible({ timeout: 6000 })
        .catch(() => false);
      if (!alreadyCompleted) {
        throw new Error("Não foi possível confirmar execução do projeto demo em /projeto");
      }
    }
    console.log("  ✓ Projeto demo concluído\n");

    // Mission control + main routes
    for (const { path, label, assertReady } of ROUTES.slice(1)) {
      console.log(`→ ${label} (${path})…`);
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
      if (assertReady) {
        await assertReady(page);
      } else {
        await page.waitForLoadState("networkidle");
      }
      await page.waitForTimeout(500);
      console.log(`  ✓ ${label}`);
    }

    // Steel AI copilot
    console.log("\n→ Abrindo Steel AI permanente…");
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const aiFab = page.getByRole("button", { name: /Abrir Steel AI/i });
    if (await aiFab.isVisible()) {
      await aiFab.click();
      await page.waitForTimeout(500);
      const chatInput = page.getByPlaceholder(/Pergunte sobre Gestio/i);
      if (await chatInput.isVisible()) {
        const bubbleCountBefore = await page.locator(".whitespace-pre-wrap").count();
        await chatInput.fill("status do projeto demo");
        await page
          .locator("button")
          .filter({ has: page.locator("svg.lucide-send-horizontal, svg.lucide-send") })
          .last()
          .click();
        await page.waitForFunction(
          ({ beforeCount }) =>
            document.querySelectorAll(".whitespace-pre-wrap").length >=
            beforeCount + 2,
          { beforeCount: bubbleCountBefore },
          { timeout: 20000 },
        );
        console.log("  ✓ Steel AI respondeu");
      }
    }

    console.log("\n" + "=".repeat(55));
    console.log("✅ Walkthrough completo — versão final validada no browser");
    console.log(`🔗 URL de validação: ${BASE}`);
  } catch (err) {
    console.error("\n❌ Walkthrough falhou:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
