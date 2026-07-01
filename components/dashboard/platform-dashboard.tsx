"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Database,
  Factory,
  Package,
  ShoppingCart,
  Sparkles,
  Target,
  Wrench,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WorkflowSummary } from "@/types/workflow";

interface PlatformOverview {
  persistence: { backend: string; supabaseConfigured: boolean };
  warehouse: {
    totalProdutos: number;
    produtosClassificados: number;
    filiais: number;
    saldosComQuantidade: number;
  } | null;
  stock: { comSaldo: number; alertas: number } | null;
  engineering: { projetosGestio: number; bomsLocais: number };
  purchasing: { requisicoesLocais: number; gestioAbertas: number };
  commercial: { opportunities: number; pipelineValue: number };
  budget: { quotes: number; confirmed: number };
  movements: { entradas: number; saidas: number };
  modules: Array<{ name: string; href: string; status: string }>;
}

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Almoxarifado: Package,
  Compras: ShoppingCart,
  Engenharia: Wrench,
  Orçamentos: Zap,
  Oportunidades: Target,
  Produção: Factory,
  IA: Sparkles,
};

const STAGE_COLORS: Record<string, string> = {
  done: "bg-emerald-500",
  active: "bg-primary animate-pulse",
  blocked: "bg-amber-500",
  idle: "bg-muted-foreground/30",
};

export function PlatformDashboard() {
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [overviewRes, workflowRes] = await Promise.all([
          fetch("/api/v1/platform/overview"),
          fetch("/api/v1/platform/workflow"),
        ]);
        const overviewJson = overviewRes.ok ? await overviewRes.json() : null;
        const workflowJson = workflowRes.ok ? await workflowRes.json() : null;
        if (overviewJson) setData(overviewJson.data);
        if (workflowJson) setWorkflows(workflowJson.data.workflows ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-muted-foreground">
        Execute <code className="text-sm">npm run gestio:sync</code> para carregar dados.
      </p>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/40 to-violet-500/5 p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge className="mb-2 bg-primary/20 text-primary">v1 · Command Center</Badge>
            <h2 className="text-xl font-bold">SteelMind · Inglesa Metais</h2>
            <p className="text-sm text-muted-foreground">
              Comercial → Orçamento IA → Engenharia → Compras → Almoxarifado → Produção
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/budget">
              <Button size="sm" className="gap-2">
                <Zap className="h-4 w-4" />
                Orçamento IA
              </Button>
            </Link>
            <Link href="/opportunities">
              <Button size="sm" variant="outline" className="gap-2">
                <Target className="h-4 w-4" />
                Pipeline
              </Button>
            </Link>
            <Link href="/projeto">
              <Button size="sm" variant="outline" className="gap-2">
                <Factory className="h-4 w-4" />
                Projeto Demo
              </Button>
            </Link>
          </div>
        </div>
        <p className="relative z-10 mt-3 text-xs text-muted-foreground">
          Persistência: <Badge variant="outline">{data.persistence.backend}</Badge>
          {data.persistence.supabaseConfigured && (
            <Badge className="ml-2" variant="secondary">
              <Database className="mr-1 h-3 w-3" />
              Supabase
            </Badge>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Produtos Gestio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {data.warehouse?.totalProdutos ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.warehouse?.produtosClassificados ?? 0} classificados
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {data.commercial?.opportunities ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">
              R$ {(data.commercial?.pipelineValue ?? 0).toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Orçamentos IA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {data.budget?.quotes ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.budget?.confirmed ?? 0} confirmados
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {data.engineering.projetosGestio}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.engineering.bomsLocais} BOMs
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Alertas estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {data.stock?.alertas ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.purchasing.gestioAbertas} reqs Gestio
            </p>
          </CardContent>
        </Card>
      </div>

      {workflows.length > 0 && (
        <Card className="border-border/50 bg-card/40">
          <CardHeader>
            <CardTitle className="text-base">Fluxos ativos · cross-context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflows.slice(0, 3).map((wf) => (
              <div key={wf.titulo} className="rounded-xl border border-border/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium">{wf.titulo}</p>
                  {wf.valorTotal != null && (
                    <Badge variant="secondary">
                      R$ {wf.valorTotal.toLocaleString("pt-BR")}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {wf.stages.map((stage) => (
                    <Link
                      key={stage.id}
                      href={stage.href}
                      className="flex items-center gap-1.5 rounded-full border border-border/40 px-2.5 py-1 text-[10px] hover:border-primary/40"
                    >
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", STAGE_COLORS[stage.status])}
                      />
                      {stage.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.modules.map((mod) => {
          const Icon = MODULE_ICONS[mod.name] ?? Factory;
          return (
            <Link key={mod.href} href={mod.href}>
              <Card className="h-full border-border/50 bg-card/40 transition-colors hover:border-primary/40 hover:bg-card/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-primary" />
                    {mod.name}
                  </CardTitle>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge variant={mod.status === "online" ? "default" : "secondary"}>
                    {mod.status === "online" ? "Online" : "Sync necessário"}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Especialistas integrados · v1
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <p>Gestio ERP · 3 filiais · sync + classificação</p>
          <p>Auth RBAC · 6 perfis · JWT local + Supabase</p>
          <p>Orçamento IA · Copilot + memorial + Gestio pricing</p>
          <p>Comercial · pipeline Kanban de oportunidades</p>
          <p>Engenharia · projetos + BOM persistente</p>
          <p>Supabase · quotes + opportunities + RLS</p>
        </CardContent>
      </Card>
    </div>
  );
}
