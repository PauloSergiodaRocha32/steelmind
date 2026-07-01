#!/usr/bin/env tsx
/**
 * Cloud Multi-Agent Orchestrator
 * Run: npm run agents:run
 * Used by Cloud Agents to audit and validate SteelMind end-to-end.
 */
import { runOrchestrator } from "../../lib/ai/agents/orchestrator";
import { formatAgentReportSummary } from "../../lib/ai/steelmind-brain";
import { saveAgentReport } from "../../lib/persistence/ai-store";

async function main() {
  console.log("SteelMind Cloud Multi-Agent Orchestrator");
  console.log("=".repeat(55));
  console.log(`Started: ${new Date().toISOString()}\n`);

  const report = await runOrchestrator("cloud-script");
  await saveAgentReport(report);

  console.log(formatAgentReportSummary(report));
  console.log("\n" + "=".repeat(55));
  console.log(`Score: ${report.score}/100 · Status: ${report.status}`);
  console.log(`Findings: ${report.summary.totalFindings} total`);

  if (report.status === "fail") {
    console.error("\n❌ Cloud agents detected critical issues.");
    process.exit(1);
  }
  if (report.status === "warn") {
    console.warn("\n⚠️ Cloud agents completed with warnings.");
    process.exit(0);
  }
  console.log("\n✅ All cloud agents passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
