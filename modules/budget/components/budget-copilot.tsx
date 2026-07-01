"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SteelQuote, PipelineStep } from "@/types/budget";
import type { QuoteReadinessReport } from "@/domains/quoting/types";

const SUGGESTIONS = [
  "margem 35%",
  "prazo 15 dias",
  "com instalação em Campinas",
  "sem pintura",
  "adicionar pintura eletrostática",
];

interface QuoteSummary {
  id: string;
  titulo: string;
  status: string;
  total: number;
  updatedAt: string;
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function PipelineRail({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div
          key={step.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-all",
            step.status === "done" && "border-emerald-500/30 bg-emerald-500/5",
            step.status === "running" && "border-primary/40 bg-primary/5 shadow-[0_0_20px_hsl(var(--primary)/0.15)]",
            step.status === "pending" && "border-border/40 bg-muted/10 opacity-60",
          )}
        >
          <div
            className={cn(
              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
              step.status === "done" && "bg-emerald-500/20 text-emerald-400",
              step.status === "running" && "bg-primary/20 text-primary animate-pulse",
              step.status === "pending" && "bg-muted text-muted-foreground",
            )}
          >
            {step.status === "done" ? "✓" : i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium">{step.label}</p>
            {step.detail && (
              <p className="text-[10px] text-muted-foreground">{step.detail}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BudgetCopilot() {
  const [history, setHistory] = useState<QuoteSummary[]>([]);
  const [quote, setQuote] = useState<SteelQuote | null>(null);
  const [readiness, setReadiness] = useState<QuoteReadinessReport | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [simulatedPipeline, setSimulatedPipeline] = useState<PipelineStep[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    const res = await fetch("/api/v1/budget/quotes");
    if (res.ok) {
      const json = await res.json();
      setHistory(json.data.quotes ?? []);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [quote?.mensagens]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setReadiness(null);
    setSimulatedPipeline(
      ["ingest", "extract", "bom", "pricing", "memorial", "review"].map((id, i) => ({
        id: id as PipelineStep["id"],
        label: ["Ingestão", "Extração IA", "BOM", "Precificação", "Memorial", "Revisão"][i],
        status: i === 0 ? "running" : "pending",
      })),
    );

    const advance = (step: number) => {
      setSimulatedPipeline((prev) =>
        prev?.map((s, i) => ({
          ...s,
          status: i < step ? "done" : i === step ? "running" : "pending",
        })) ?? null,
      );
    };

    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 450));
      advance(i + 1);
    }

    try {
      const form = new FormData();
      form.append("observacoes", observacoes);
      files.forEach((f) => form.append("files", f));

      const res = await fetch("/api/v1/budget/analyze", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);
      setQuote(json.data.quote);
      setReadiness(json.data.readiness ?? null);
      setSimulatedPipeline(null);
      await loadHistory();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro na análise");
      setSimulatedPipeline(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const sendChat = async (text?: string) => {
    const message = (text ?? chatInput).trim();
    if (!message || !quote) return;
    setChatLoading(true);
    setChatInput("");
    try {
      const res = await fetch("/api/v1/budget/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: quote.id, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);
      setQuote(json.data.quote);
      setReadiness(json.data.readiness ?? null);
      await loadHistory();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro");
    } finally {
      setChatLoading(false);
    }
  };

  const confirmQuote = async () => {
    if (!quote) return;
    const res = await fetch("/api/v1/budget/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId: quote.id, action: "confirm" }),
    });
    const json = await res.json();
    if (res.ok) {
      setQuote(json.data.quote);
      setReadiness(json.data.readiness ?? null);
      await loadHistory();
      return;
    }
    if (res.status === 422) {
      setQuote(json.data?.quote ?? quote);
      setReadiness(json.data?.readiness ?? readiness);
      alert(json.error?.message ?? "Orçamento com pendências críticas");
    }
  };

  const loadQuote = async (id: string) => {
    const res = await fetch(`/api/v1/budget/quotes?id=${id}`);
    if (res.ok) {
      const json = await res.json();
      setQuote(json.data.quote);
      setReadiness(json.data.readiness ?? null);
    }
  };

  const pipeline = simulatedPipeline ?? quote?.pipeline ?? [];

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <div className="pointer-events-none absolute inset-0 shell-gradient shell-grid opacity-60" />

      <div className="relative space-y-6">
        {/* Hero */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                <Sparkles className="mr-1 h-3 w-3" />
                AI COPILOT
              </Badge>
              <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                BLACK EDITION
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Orçamentos inteligentes
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Anexe PDFs, DWG ou fotos do e-mail. A IA monta o memorial técnico, cruza preços
              com o Gestio e só calcula valores após sua confirmação — ajuste tudo em português.
            </p>
          </div>
          {quote && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-primary">{formatBRL(quote.custos.total)}</p>
              <p className="text-xs text-muted-foreground">
                margem {quote.custos.margemPercentual}% · {quote.custos.prazoDias} dias
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          {/* Coluna esquerda — ingestão */}
          <div className="space-y-4 xl:col-span-3">
            {!quote ? (
              <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Upload className="h-4 w-4 text-primary" />
                    Arquivos do projeto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
                      dragOver
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-border/50 hover:border-primary/40 hover:bg-muted/20",
                    )}
                  >
                    <Paperclip className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Arraste PDFs, DWG ou imagens</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF · Excel · CSV · Word · DWG · DXF · imagens
                    </p>
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf,.dwg,.dxf,.xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg,.webp"
                      onChange={(e) => setFiles((p) => [...p, ...Array.from(e.target.files ?? [])])}
                    />
                  </div>

                  {files.length > 0 && (
                    <ul className="space-y-1">
                      {files.map((f) => (
                        <li
                          key={f.name + f.size}
                          className="flex items-center gap-2 rounded-md bg-muted/30 px-2 py-1.5 text-xs"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="truncate">{f.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Observações (opcional)
                    </label>
                    <Textarea
                      placeholder="Ex.: guarda-corpo 12 m tubo 40x20 · prazo 15 dias · com instalação em Campinas"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="min-h-[100px] resize-none bg-background/50"
                    />
                  </div>

                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-primary to-violet-600 hover:opacity-90"
                    onClick={runAnalysis}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    {analyzing ? "IA analisando..." : "Enviar para análise IA"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pipeline IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <PipelineRail steps={pipeline} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => {
                      setQuote(null);
                      setReadiness(null);
                      setFiles([]);
                      setObservacoes("");
                    }}
                  >
                    Novo orçamento
                  </Button>
                </CardContent>
              </Card>
            )}

            {history.length > 0 && (
              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">Recentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {history.slice(0, 5).map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => loadQuote(h.id)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted/40"
                    >
                      <span className="truncate">{h.titulo}</span>
                      <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna central — memorial + BOM */}
          <div className="space-y-4 xl:col-span-5">
            {analyzing && (
              <Card className="border-primary/30 bg-card/60">
                <CardContent className="flex items-center gap-4 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">SteelMind IA processando...</p>
                    <p className="text-sm text-muted-foreground">
                      Extraindo escopo, montando BOM e cruzando catálogo Gestio
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {quote?.memorial && (
              <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-primary" />
                    Memorial técnico
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{quote.memorial.titulo}</p>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Escopo</p>
                    <p>{quote.memorial.escopo}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Especificações</p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {quote.memorial.especificacoes.map((e) => (
                          <li key={e}>• {e}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Processos</p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {quote.memorial.processos.map((p) => (
                          <li key={p}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {quote.aiMode === "openai" ? "OpenAI + Gestio" : "SteelMind Engine + Gestio"}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {quote?.itens && (
              <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Lista de materiais (BOM)</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/50 text-left text-muted-foreground">
                        <th className="pb-2 pr-2">Item</th>
                        <th className="pb-2 pr-2">Qtd</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.itens.map((item) => (
                        <tr key={item.id} className="border-b border-border/20">
                          <td className="py-2 pr-2">
                            <p className="font-medium">{item.descricao}</p>
                            <p className="text-[10px] text-muted-foreground">{item.material}</p>
                          </td>
                          <td className="py-2 pr-2 whitespace-nowrap">
                            {item.quantidade} {item.unidade}
                          </td>
                          <td className="py-2 text-right font-medium">
                            {formatBRL(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {!quote && !analyzing && (
              <Card className="border-dashed border-border/40 bg-transparent">
                <CardContent className="py-16 text-center">
                  <Bot className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">
                    Anexe arquivos do projeto e clique em analisar.
                    <br />
                    A IA monta memorial, BOM e precificação automaticamente.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna direita — copilot chat + custos */}
          <div className="space-y-4 xl:col-span-4">
            {quote && (
              <>
                {readiness && (
                  <Card
                    className={cn(
                      "border",
                      readiness.level === "ready" &&
                        "border-emerald-500/30 bg-emerald-500/5",
                      readiness.level === "review_required" &&
                        "border-amber-500/30 bg-amber-500/5",
                      readiness.level === "blocked" &&
                        "border-red-500/30 bg-red-500/5",
                    )}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {readiness.level === "ready" ? (
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          Prontidão operacional
                        </span>
                        <Badge
                          variant={readiness.level === "blocked" ? "destructive" : "outline"}
                          className="text-[10px]"
                        >
                          {readiness.level === "ready"
                            ? "Pronto"
                            : readiness.level === "review_required"
                              ? "Revisar"
                              : "Bloqueado"}{" "}
                          · {readiness.score}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      {readiness.checks.length === 0 ? (
                        <p className="text-emerald-600">
                          Nenhuma pendência detectada para confirmação.
                        </p>
                      ) : (
                        readiness.checks.slice(0, 5).map((check) => (
                          <div
                            key={check.id}
                            className={cn(
                              "rounded-md border px-2 py-1.5",
                              check.severity === "critical" &&
                                "border-red-500/30 bg-red-500/5",
                              check.severity === "warning" &&
                                "border-amber-500/30 bg-amber-500/5",
                              check.severity === "info" &&
                                "border-sky-500/30 bg-sky-500/5",
                            )}
                          >
                            <p className="font-medium">
                              {check.severity === "critical"
                                ? "Crítico"
                                : check.severity === "warning"
                                  ? "Atenção"
                                  : "Info"}
                            </p>
                            <p className="text-muted-foreground">{check.message}</p>
                          </div>
                        ))
                      )}
                      {readiness.blockers.length > 0 && (
                        <p className="text-[11px] font-medium text-red-500">
                          {readiness.blockers.length} pendência(s) crítica(s) impedem confirmação.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="grid grid-cols-2 gap-3 py-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">Materiais</p>
                      <p className="font-semibold">{formatBRL(quote.custos.materiais)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mão de obra</p>
                      <p className="font-semibold">{formatBRL(quote.custos.maoDeObra)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Serviços</p>
                      <p className="font-semibold">{formatBRL(quote.custos.servicos)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Margem ({quote.custos.margemPercentual}%)</p>
                      <p className="font-semibold">{formatBRL(quote.custos.margemValor)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex flex-col border-border/50 bg-card/60 backdrop-blur-sm xl:h-[420px]">
                  <CardHeader className="shrink-0 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Bot className="h-4 w-4 text-primary" />
                      Copilot · fale em português
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                      {quote.mensagens
                        .filter((m) => m.role !== "system")
                        .map((m) => (
                          <div
                            key={m.id}
                            className={cn(
                              "rounded-lg px-3 py-2 text-xs",
                              m.role === "user"
                                ? "ml-6 bg-primary/15 text-foreground"
                                : "mr-6 bg-muted/40 text-muted-foreground",
                            )}
                          >
                            <p className="whitespace-pre-wrap">{m.content.replace(/\*\*/g, "")}</p>
                          </div>
                        ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => sendChat(s)}
                          disabled={chatLoading}
                          className="rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[10px] hover:border-primary/40 hover:text-primary"
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Textarea
                        placeholder='Ex.: "margem 35%, prazo 15 dias, com instalação"'
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void sendChat();
                          }
                        }}
                        className="min-h-[44px] flex-1 resize-none py-2 text-xs"
                        rows={1}
                      />
                      <Button
                        size="icon"
                        onClick={() => sendChat()}
                        disabled={chatLoading || !chatInput.trim()}
                      >
                        {chatLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {quote.status !== "confirmed" && (
                  <Button
                    className="w-full gap-2"
                    variant="default"
                    onClick={confirmQuote}
                    disabled={readiness?.level === "blocked"}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {readiness?.level === "blocked"
                      ? "Corrigir pendências críticas para confirmar"
                      : "Confirmar memorial e valores"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
