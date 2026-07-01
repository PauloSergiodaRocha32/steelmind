import { contextToPrompt, type PlatformAIContext } from "@/lib/ai/context-builder";
import { getLatestAgentReport } from "@/lib/persistence/ai-store";
import type { OrchestratorReport } from "@/types/ai-agents";

async function callOpenAI(system: string, user: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.5,
        max_tokens: 900,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return json.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

function ruleBasedReply(message: string, ctx: PlatformAIContext, report: OrchestratorReport | null): string {
  const lower = message.toLowerCase();

  if (/rodar|executar|scan|agente|auditoria|cloud/.test(lower)) {
    if (report) {
      return `Último scan cloud: **score ${report.score}/100** (${report.status}).\n\n` +
        `✅ ${report.summary.pass} agentes OK · ⚠️ ${report.summary.warn} avisos · ❌ ${report.summary.fail} falhas\n\n` +
        `Peça ao admin para clicar **"Rodar agentes cloud"** no painel IA, ou execute \`npm run agents:run\`.`;
    }
    return "Nenhum scan cloud executado ainda. Clique **Rodar agentes cloud** no painel Steel AI ou peça a um admin.";
  }

  if (/gestio|sync|cat[aá]logo|produto/.test(lower)) {
    if (!ctx.gestio) {
      return "⚠️ Gestio **não sincronizado**. Execute `npm run gestio:sync` ou acesse Almoxarifado → Sync. Sem isso, orçamentos usam estimativas.";
    }
    return `✅ Gestio online: **${ctx.gestio.produtos} produtos**, ${ctx.gestio.classificados} classificados, ${ctx.gestio.filiais} filiais.\n\nTaxonomia: INOX 304, cantoneira, tubo 40x20… Veja /knowledge.`;
  }

  if (/or[cç]amento|budget|copilot|margem/.test(lower)) {
    return `Você tem **${ctx.counts.quotes} orçamentos** no sistema. Acesse **/budget** para o Copilot IA.\n\nComandos: _"margem 35%, prazo 15 dias, com instalação em Campinas"_`;
  }

  if (/oportunidade|pipeline|comercial/.test(lower)) {
    return `Pipeline comercial: **${ctx.counts.opportunities} oportunidades**. Fluxo: Lead → Orçamento IA → Engenharia → Produção. Acesse **/opportunities**.`;
  }

  if (/estoque|almox|warehouse|moviment/.test(lower)) {
    return `Almoxarifado: **${ctx.counts.movements} movimentações** registradas. ${ctx.gestio ? `${ctx.gestio.produtos} produtos no catálogo.` : "Sync Gestio pendente."} Acesse **/warehouse**.`;
  }

  if (/permiss|role|acesso|rbac/.test(lower)) {
    return `Seu perfil: **${ctx.user.role}**. Permissões ativas no contexto atual.\n\nPerfis: admin, gerente, almoxarifado, compras, engenharia, viewer. Valide com \`npm run audit\`.`;
  }

  if (/bom|engenharia|projeto/.test(lower)) {
    return `Engenharia: **${ctx.counts.boms} BOMs** locais. Projetos vêm do Gestio. Acesse **/engineering** para editar listas de materiais por projeto.`;
  }

  if (/compras|requisi/.test(lower)) {
    return `Compras: **${ctx.counts.requisitions} requisições** locais + reqs abertas no Gestio. Acesse **/purchasing**.`;
  }

  if (/oi|ol[aá]|help|ajuda|como/.test(lower)) {
    return `Olá **${ctx.user.name}**! Sou o **Steel AI permanente** — copilot da Inglesa Metais.\n\n` +
      "Posso ajudar com:\n" +
      "• Gestio e catálogo\n• Orçamentos IA\n• Pipeline comercial\n• Permissões e agentes cloud\n\n" +
      `Página atual: \`${ctx.path}\``;
  }

  return `Entendi sua pergunta sobre "${message.slice(0, 80)}".\n\n` +
    `Contexto: ${ctx.counts.opportunities} oportunidades · ${ctx.counts.quotes} orçamentos · ` +
    `${ctx.gestio?.produtos ?? 0} produtos Gestio.\n\n` +
    "Tente: _\"status gestio\"_, _\"rodar agentes\"_, _\"como fazer orçamento\"_ ou acesse **/ai** para o painel completo.";
}

export async function generateSteelAIReply(
  message: string,
  ctx: PlatformAIContext,
): Promise<{ content: string; mode: "openai" | "steelmind" }> {
  const report = await getLatestAgentReport();
  const system = [
    "Você é Steel AI, copilot permanente da plataforma SteelMind da Inglesa Metais (serralheria).",
    "Responda em português, objetivo, com markdown leve. Conhece Gestio ERP, orçamentos, almoxarifado.",
    "Contexto da plataforma:",
    contextToPrompt(ctx),
    report ? `Último scan agentes: score ${report.score}/100, status ${report.status}` : "",
  ].join("\n");

  const ai = await callOpenAI(system, message);
  if (ai) return { content: ai, mode: "openai" };

  return { content: ruleBasedReply(message, ctx, report), mode: "steelmind" };
}

export function formatAgentReportSummary(report: OrchestratorReport): string {
  const lines = [
    `🛡️ **Scan Cloud SteelMind** — Score **${report.score}/100** (${report.status.toUpperCase()})`,
    "",
    `Agentes: ✅ ${report.summary.pass} · ⚠️ ${report.summary.warn} · ❌ ${report.summary.fail}`,
    "",
  ];

  for (const agent of report.agents) {
    const icon = agent.status === "pass" ? "✅" : agent.status === "warn" ? "⚠️" : "❌";
    const issues = agent.findings.filter((f) => f.severity !== "info");
    lines.push(`${icon} **${agent.agent}** (${agent.durationMs}ms)`);
    for (const f of issues.slice(0, 3)) {
      lines.push(`  • ${f.message}${f.fix ? ` → _${f.fix}_` : ""}`);
    }
  }

  return lines.join("\n");
}
