"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  Package,
  Play,
  ShoppingCart,
  Sparkles,
  Target,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DemoProjectResult, DemoProjectStep } from "@/lib/demo/demo-project";

const STEP_ICONS: Record<string, typeof Target> = {
  commercial: Target,
  budget: Zap,
  engineering: Wrench,
  purchasing: ShoppingCart,
  warehouse: Package,
  production: Sparkles,
  agents: Sparkles,
};

function StepRow({ step, index }: { step: DemoProjectStep; index: number }) {
  const Icon = STEP_ICONS[step.id] ?? Circle;
  const done = step.status === "done";
  const running = step.status === "running";
  const error = step.status === "error";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 transition-all",
        done && "border-emerald-500/30 bg-emerald-500/5",
        running && "border-primary/40 bg-primary/5 shadow-[0_0_20px_hsl(var(--primary)/0.12)]",
        error && "border-red-500/30 bg-red-500/5",
        !done && !running && !error && "border-border/50 bg-card/30",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          done && "bg-emerald-500/20 text-emerald-400",
          running && "bg-primary/20 text-primary",
          error && "bg-red-500/20 text-red-400",
          !done && !running && !error && "bg-muted text-muted-foreground",
        )}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : running ? <Loader2 className="h-4 w-4 animate-spin" /> : index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-sm font-medium">{step.label}</p>
        </div>
        {step.detail && (
          <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
        )}
      </div>
      {step.href && done && (
        <Link href={step.href}>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </Link>
      )}
    </div>
  );
}

export function ProjectWizard() {
  const [preview, setPreview] = useState<{
    title: string;
    itemCount: number;
    items: Array<{ idProd: number; categoria: string; quantidade: number; unidade: string }>;
  } | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DemoProjectResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    const res = await fetch("/api/v1/platform/demo-project");
    if (res.ok) {
      const json = await res.json();
      setPreview(json.data);
    }
  }, []);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const execute = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/v1/platform/demo-project", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Falha na execução");
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setRunning(false);
    }
  };

  const steps = result?.steps ?? [];
  const itemList = result?.itemList ?? preview?.items?.map((i) => ({
    idProd: i.idProd,
    descricao: i.categoria,
    quantidade: i.quantidade,
    unidade: i.unidade,
    categoria: i.categoria,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="mb-2 bg-primary/15 text-primary">Walkthrough v1</Badge>
          <h1 className="text-2xl font-bold">Projeto demo end-to-end</h1>
          <p className="text-sm text-muted-foreground">
            Execute o fluxo completo Inglesa Metais: comercial → orçamento IA → BOM → compras → almoxarifado → produção → agentes cloud
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2"
          disabled={running}
          onClick={() => void execute()}
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {running ? "Executando projeto…" : "Executar projeto completo"}
        </Button>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="py-4 text-sm text-red-400">{error}</CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-primary/5">
          <CardContent className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-emerald-400">Projeto executado com sucesso</p>
              <p className="text-sm text-muted-foreground">
                {result.bomItemCount} itens BOM · R${" "}
                {result.quote.custos.total.toLocaleString("pt-BR")} · Score cloud{" "}
                {result.agentScore}/100
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/opportunities">
                <Button variant="outline" size="sm" className="gap-1">
                  Pipeline <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
              <Link href="/budget">
                <Button variant="outline" size="sm" className="gap-1">
                  Orçamento <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
              <Link href="/">
                <Button size="sm" className="gap-1">
                  Command Center <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/40">
          <CardHeader>
            <CardTitle className="text-base">
              {running ? "Executando passos…" : result ? "Passos concluídos" : "Passos do projeto"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(steps.length ? steps : [
              { id: "commercial", label: "1. Oportunidade comercial", status: "pending" as const },
              { id: "budget", label: "2. Orçamento IA + memorial", status: "pending" as const },
              { id: "engineering", label: "3. BOM engenharia (12+ itens)", status: "pending" as const },
              { id: "purchasing", label: "4. Requisição de compras", status: "pending" as const },
              { id: "warehouse", label: "5. Saída almoxarifado", status: "pending" as const },
              { id: "production", label: "6. Produção — projeto ganho", status: "pending" as const },
              { id: "agents", label: "7. Scan cloud agentes", status: "pending" as const },
            ]).map((step, i) => (
              <StepRow key={step.id} step={step} index={i} />
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40">
          <CardHeader>
            <CardTitle className="text-base">
              Lista de materiais diversos ({itemList.length} itens)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {preview?.title ?? "Guarda-corpo INOX 304 — Condomínio Vista Verde Campinas"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-h-[420px] space-y-1 overflow-y-auto text-sm">
              {itemList.map((item) => (
                <div
                  key={item.idProd}
                  className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2 hover:bg-muted/20"
                >
                  <div className="min-w-0 flex-1">
                    <Badge variant="secondary" className="mb-1 text-[10px]">
                      {item.categoria}
                    </Badge>
                    <p className="truncate text-xs text-muted-foreground">
                      #{item.idProd} · {item.descricao}
                    </p>
                  </div>
                  <Badge className="ml-2 shrink-0 tabular-nums">
                    {item.quantidade} {item.unidade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Navegue pelo browser — tour manual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/login", label: "Login" },
              { href: "/", label: "Command Center" },
              { href: "/projeto", label: "Este wizard" },
              { href: "/opportunities", label: "Pipeline" },
              { href: "/budget", label: "Orçamento IA" },
              { href: "/engineering", label: "Engenharia BOM" },
              { href: "/purchasing", label: "Compras" },
              { href: "/warehouse", label: "Almoxarifado" },
              { href: "/production", label: "Produção" },
              { href: "/ai", label: "AI Hub + Agentes" },
            ].map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="outline" className="w-full justify-start text-xs" size="sm">
                  {link.label}
                  <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
