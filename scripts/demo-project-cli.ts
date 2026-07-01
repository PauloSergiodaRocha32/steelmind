#!/usr/bin/env tsx
/**
 * CLI demo project — executa projeto sem browser.
 * Run: npm run demo:project
 */
import { runDemoProject } from "../lib/demo/demo-project";

async function main() {
  console.log("SteelMind Demo Project CLI");
  console.log("=".repeat(55));

  const result = await runDemoProject("cli-demo");
  console.log(`\n✅ ${result.opportunity.titulo}`);
  console.log(`   Oportunidade: ${result.opportunity.id} (${result.opportunity.stage})`);
  console.log(`   Orçamento: R$ ${result.quote.custos.total.toLocaleString("pt-BR")} · ${result.quote.itens.length} itens`);
  console.log(`   BOM: ${result.bomItemCount} materiais`);
  console.log(`   Requisição: ${result.requisitionId}`);
  console.log(`   Movimentações: ${result.movementsLogged}`);
  console.log(`   Agentes cloud: ${result.agentScore}/100`);
  console.log("\nLista de materiais:");
  for (const item of result.itemList) {
    console.log(`  • [${item.categoria}] #${item.idProd} — ${item.quantidade} ${item.unidade}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
