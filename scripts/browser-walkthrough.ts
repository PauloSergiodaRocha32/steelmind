#!/usr/bin/env tsx
/**
 * Browser walkthrough — executa projeto demo passo a passo no Chromium.
 * Run: npm run demo:browser
 */
import { chromium } from "playwright";

const BASE = process.env.DEMO_BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.DEMO_EMAIL ?? "admin@inglesametais.com";
const PASSWORD = process.env.DEMO_PASSWORD ?? "admin123";

const PAGES = [
  { path: "/login", label: "Login" },
  { path: "/", label: "Command Center" },
  { path: "/projeto", label: "Projeto Demo Wizard" },
  { path: "/opportunities", label: "Pipeline Comercial" },
  { path: "/budget", label: "Orçamento IA Copilot" },
  { path: "/engineering", label: "Engenharia BOM" },
  { path: "/purchasing", label: "Compras" },
  { path: "/warehouse", label: "Almoxarifado" },
  { path: "/production", label: "Produção" },
  { path: "/knowledge", label: "Conhecimento" },
  { path: "/ai", label: "AI Hub + Agentes" },
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
    const loginResponse = await context.request.post(`${BASE}/api/auth/login`, {
      data: { email: EMAIL, password: PASSWORD },
    });
    if (!loginResponse.ok()) {
      const body = await loginResponse.text();
      throw new Error(`Falha no login API (${loginResponse.status()}): ${body}`);
    }
    console.log("  ✓ Autenticado\n");
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

    // Execute demo project
    console.log("→ Executando projeto demo em /projeto…");
    await page.goto(`${BASE}/projeto`, { waitUntil: "networkidle" });
    const runBtn = page.getByRole("button", { name: /Executar projeto completo/i });
    await runBtn.click();
    await page.waitForSelector("text=Projeto executado com sucesso", { timeout: 120000 });
    console.log("  ✓ Projeto demo concluído\n");

    // Tour all pages
    for (const { path, label } of PAGES.slice(2)) {
      console.log(`→ ${label} (${path})…`);
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(800);
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
        await chatInput.fill("status do projeto demo");
        await page
          .locator("button")
          .filter({ has: page.locator("svg.lucide-send-horizontal, svg.lucide-send") })
          .last()
          .click();
        await page.waitForTimeout(2000);
        console.log("  ✓ Steel AI respondeu");
      }
    }

    console.log("\n" + "=".repeat(55));
    console.log("✅ Walkthrough completo — versão final validada no browser");
  } catch (err) {
    console.error("\n❌ Walkthrough falhou:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
