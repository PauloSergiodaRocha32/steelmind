import { loadGestioCatalog } from "@/modules/warehouse/application/load-catalog";
import { parseIntent, mergeIntent } from "@/lib/budget/parse-intent";
import { buildQuoteItems, summarizeCosts } from "@/lib/budget/pricing";
import type {
  AnalyzeQuoteInput,
  CopilotMessage,
  PipelineStep,
  SteelQuote,
  TechnicalMemorial,
} from "@/types/budget";
import { PIPELINE_TEMPLATE as STEPS } from "@/types/budget";

async function callOpenAI(prompt: string): Promise<string | null> {
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
          {
            role: "system",
            content:
              "Você é engenheiro de orçamentos de serralheria da Inglesa Metais. Responda em português, objetivo e técnico.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1200,
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

function buildMemorial(
  intent: ReturnType<typeof parseIntent>,
  files: string[],
  items: SteelQuote["itens"],
  custos: SteelQuote["custos"],
  aiExtra?: string | null,
): TechnicalMemorial {
  const produto = intent.produto ?? "Serralheria sob medida";
  const material = intent.material ?? "Aço carbono";
  const dim = intent.dimensoes ?? "Conforme projeto anexo";
  const metros = intent.comprimentoMetros ?? 10;

  return {
    titulo: `${produto} — ${material}`,
    escopo: `Fornecimento e ${custos.incluiInstalacao ? "instalação de" : "fabricação de"} ${produto.toLowerCase()} com ${metros} m lineares aproximados, perfil ${dim}, incluindo corte, soldagem MIG, acabamento${custos.incluiPintura ? " e pintura eletrostática" : ""}.${files.length ? ` Baseado em ${files.length} arquivo(s) de projeto.` : ""}`,
    especificacoes: [
      `Material principal: ${material}`,
      `Dimensões de perfil: ${dim}`,
      `Comprimento total estimado: ${metros} m`,
      custos.incluiPintura ? "Acabamento: pintura eletrostática RAL a definir" : "Acabamento: apenas preparação de superfície",
      custos.incluiInstalacao
        ? `Instalação em obra${custos.localInstalacao ? ` — ${custos.localInstalacao}` : ""}`
        : "Entrega FOB fábrica (sem instalação)",
    ],
    materiais: items
      .filter((i) => i.origem !== "servico")
      .slice(0, 8)
      .map((i) => `${i.descricao} — ${i.quantidade} ${i.unidade}`),
    processos: [
      "Corte e preparação de perfis",
      "Soldagem MIG/MAG certificada",
      "Ensaio visual e dimensional",
      custos.incluiPintura ? "Jateamento + pintura eletrostática" : "Proteção temporária contra corrosão",
    ],
    normas: ["NBR 8800 (referência estrutural)", "NR-12 (segurança em máquinas)", "Boas práticas ABNT para serralheria"],
    prazoEntrega: `${custos.prazoDias} dias úteis após aprovação do memorial`,
    observacoes: aiExtra?.slice(0, 800) ?? "Valores calculados após confirmação do escopo. Ajustes via copilot em linguagem natural.",
    geradoEm: new Date().toISOString(),
  };
}

function donePipeline(details: string[]): PipelineStep[] {
  return STEPS.map((s, i) => ({
    ...s,
    status: "done" as const,
    detail: details[i],
  }));
}

export async function analyzeQuote(
  input: AnalyzeQuoteInput,
  createdBy?: string | null,
): Promise<SteelQuote> {
  const catalog = loadGestioCatalog();
  const intent = parseIntent(input.observacoes);
  const fileNames = input.arquivos.map((f) => f.name);

  const aiPrompt = [
    `Projeto: ${input.titulo ?? intent.produto ?? "Serralheria"}`,
    `Observações: ${input.observacoes || "não informadas"}`,
    `Arquivos: ${fileNames.join(", ") || "nenhum"}`,
    "Gere 3 bullets técnicos curtos para memorial de serralheria.",
  ].join("\n");
  const aiExtra = await callOpenAI(aiPrompt);

  const itens = buildQuoteItems(catalog, intent, fileNames);
  const custos = summarizeCosts(itens, {
    margemPercentual: intent.margemPercentual ?? 30,
    prazoDias: intent.prazoDias ?? 12,
    incluiInstalacao: intent.incluiInstalacao ?? /instala/i.test(input.observacoes),
    incluiPintura: intent.incluiPintura ?? !/sem\s+pintura/i.test(input.observacoes),
    local: intent.local,
  });

  const memorial = buildMemorial(intent, fileNames, itens, custos, aiExtra);
  const titulo = input.titulo ?? memorial.titulo;

  const assistantMsg: CopilotMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: `Análise concluída para **${titulo}**. Memorial técnico pronto com ${itens.length} itens na BOM. Total preliminar: **R$ ${custos.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}** (margem ${custos.margemPercentual}%). Confirme o escopo ou ajuste em português: _"margem 35%, prazo 15 dias, com instalação"_.`,
    timestamp: new Date().toISOString(),
  };

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    titulo,
    status: "memorial_ready",
    observacoes: input.observacoes,
    arquivos: input.arquivos,
    pipeline: donePipeline([
      `${input.arquivos.length} arquivo(s) recebidos`,
      aiExtra ? "OpenAI + heurísticas SteelMind" : "Motor SteelMind (Gestio + NLP)",
      `${itens.filter((i) => i.origem !== "servico").length} materiais mapeados`,
      catalog ? "Preços cruzados com catálogo Gestio" : "Estimativa de mercado (sync pendente)",
      "Memorial técnico gerado",
      "Aguardando sua confirmação",
    ]),
    itens,
    custos,
    memorial,
    mensagens: [
      {
        id: crypto.randomUUID(),
        role: "system",
        content: "SteelMind Copilot · BLACK EDITION",
        timestamp: now,
      },
      assistantMsg,
    ],
    aiMode: aiExtra ? "openai" : "steelmind",
    createdAt: now,
    updatedAt: now,
    createdBy: createdBy ?? null,
  };
}

export async function adjustQuoteWithChat(
  quote: SteelQuote,
  message: string,
): Promise<{ quote: SteelQuote; reply: string; changes: string[] }> {
  const intent = mergeIntent(parseIntent(quote.observacoes), parseIntent(message));
  const changes: string[] = [];

  let itens = [...quote.itens];
  let custos = { ...quote.custos };

  if (intent.margemPercentual !== undefined) {
    custos.margemPercentual = intent.margemPercentual;
    changes.push(`Margem ajustada para ${intent.margemPercentual}%`);
  }
  if (intent.prazoDias !== undefined) {
    custos.prazoDias = intent.prazoDias;
    changes.push(`Prazo ajustado para ${intent.prazoDias} dias`);
  }
  if (intent.incluiInstalacao && !custos.incluiInstalacao) {
    custos.incluiInstalacao = true;
    itens.push({
      id: crypto.randomUUID(),
      codigo: null,
      descricao: "Instalação em obra",
      material: "Serviço",
      quantidade: 1,
      unidade: "vb",
      precoUnitario: 1200,
      subtotal: 1200,
      origem: "servico",
    });
    changes.push("Instalação adicionada");
  }
  if (intent.removerInstalacao) {
    custos.incluiInstalacao = false;
    itens = itens.filter((i) => !/instala/i.test(i.descricao));
    changes.push("Instalação removida");
  }
  if (intent.removerPintura) {
    custos.incluiPintura = false;
    itens = itens.filter((i) => !/pintura/i.test(i.descricao));
    changes.push("Pintura removida");
  }
  if (intent.incluiPintura && !custos.incluiPintura) {
    custos.incluiPintura = true;
    itens.push({
      id: crypto.randomUUID(),
      codigo: null,
      descricao: "Pintura eletrostática",
      material: "Acabamento",
      quantidade: 12,
      unidade: "m²",
      precoUnitario: 38,
      subtotal: 456,
      origem: "servico",
    });
    changes.push("Pintura adicionada");
  }
  if (intent.local) {
    custos.localInstalacao = intent.local;
    changes.push(`Local: ${intent.local}`);
  }

  itens = itens.map((i) => ({
    ...i,
    subtotal: Math.round(i.quantidade * i.precoUnitario * 100) / 100,
  }));

  custos = summarizeCosts(itens, {
    margemPercentual: custos.margemPercentual,
    prazoDias: custos.prazoDias,
    incluiInstalacao: custos.incluiInstalacao,
    incluiPintura: custos.incluiPintura,
    local: custos.localInstalacao,
  });

  const memorial = quote.memorial
    ? buildMemorial(intent, quote.arquivos.map((f) => f.name), itens, custos)
    : null;

  const reply =
    changes.length > 0
      ? `Feito! ${changes.join(" · ")}. Novo total: **R$ ${custos.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}**.`
      : `Entendi: "${message}". Você pode pedir ajustes como _margem 35%_, _prazo 15 dias_, _com instalação em Campinas_ ou _sem pintura_.`;

  const userMsg: CopilotMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  };
  const assistantMsg: CopilotMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: reply,
    timestamp: new Date().toISOString(),
    appliedChanges: changes,
  };

  return {
    quote: {
      ...quote,
      observacoes: `${quote.observacoes}\n${message}`.trim(),
      itens,
      custos,
      memorial,
      status: changes.length ? "priced" : quote.status,
      mensagens: [...quote.mensagens, userMsg, assistantMsg],
      updatedAt: new Date().toISOString(),
    },
    reply,
    changes,
  };
}

export function confirmQuote(quote: SteelQuote): SteelQuote {
  return {
    ...quote,
    status: "confirmed",
    pipeline: quote.pipeline.map((s) =>
      s.id === "review" ? { ...s, status: "done", detail: "Confirmado pelo usuário" } : s,
    ),
    updatedAt: new Date().toISOString(),
  };
}
