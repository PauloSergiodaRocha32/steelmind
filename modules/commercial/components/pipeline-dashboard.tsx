"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  STAGE_LABELS,
  STAGE_ORDER,
  type CommercialOpportunity,
  type OpportunityStage,
} from "@/types/commercial";

export function PipelineDashboard() {
  const [opps, setOpps] = useState<CommercialOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ titulo: "", cliente: "", valor: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/commercial/opportunities");
    if (res.ok) {
      const json = await res.json();
      setOpps(json.data.opportunities ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const moveStage = async (id: string, stage: OpportunityStage) => {
    await fetch("/api/v1/commercial/opportunities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stage }),
    });
    await load();
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/v1/commercial/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: form.titulo,
        cliente: form.cliente,
        valorEstimado: parseFloat(form.valor) || 0,
        stage: "lead",
      }),
    });
    setForm({ titulo: "", cliente: "", valor: "" });
    setCreating(false);
    await load();
  };

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="mb-2 bg-primary/15 text-primary">Comercial</Badge>
          <h1 className="text-2xl font-bold">Pipeline de oportunidades</h1>
          <p className="text-sm text-muted-foreground">
            Lead → Orçamento IA → Engenharia → Produção · Inglesa Metais
          </p>
        </div>
        <Link href="/budget">
          <Button className="gap-2">
            <Zap className="h-4 w-4" />
            Novo orçamento IA
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 bg-card/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" />
            Nova oportunidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid gap-2 sm:grid-cols-4">
            <Input
              placeholder="Título do projeto"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              required
            />
            <Input
              placeholder="Cliente"
              value={form.cliente}
              onChange={(e) => setForm((f) => ({ ...f, cliente: e.target.value }))}
              required
            />
            <Input
              placeholder="Valor estimado (R$)"
              type="number"
              value={form.valor}
              onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
            />
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {STAGE_ORDER.filter((s) => s !== "lost").map((stage) => {
          const items = opps.filter((o) => o.stage === stage);
          return (
            <div key={stage} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {STAGE_LABELS[stage]}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {items.length}
                </Badge>
              </div>
              <div className="min-h-[120px] space-y-2 rounded-xl border border-border/40 bg-muted/10 p-2">
                {items.map((opp) => (
                  <div
                    key={opp.id}
                    className="rounded-lg border border-border/40 bg-card/80 p-2.5 text-xs shadow-sm"
                  >
                    <p className="font-medium leading-snug">{opp.titulo}</p>
                    <p className="mt-1 text-muted-foreground">{opp.cliente}</p>
                    <p className="mt-1 font-semibold text-primary">
                      R$ {opp.valorEstimado.toLocaleString("pt-BR")}
                    </p>
                    {opp.quoteId && (
                      <Link
                        href="/budget"
                        className="mt-1 inline-block text-[10px] text-primary underline"
                      >
                        Orçamento vinculado
                      </Link>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {STAGE_ORDER.filter((s) => s !== stage && s !== "lost")
                        .slice(0, 2)
                        .map((next) => (
                          <button
                            key={next}
                            type="button"
                            onClick={() => moveStage(opp.id, next)}
                            className="rounded border border-border/50 px-1.5 py-0.5 text-[9px] hover:border-primary/40"
                          >
                            → {STAGE_LABELS[next]}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
                {!items.length && (
                  <p className="py-6 text-center text-[10px] text-muted-foreground/60">
                    Vazio
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4" />
            Fluxo integrado SteelMind v1
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["1. Oportunidade", "Cadastre lead no pipeline comercial"],
            ["2. Orçamento IA", "Copilot gera memorial + BOM + preços Gestio"],
            ["3. Engenharia", "BOM vinculado ao projeto Gestio"],
            ["4. Execução", "Compras, almoxarifado e produção"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg border border-border/30 p-3">
              <p className="font-medium">{t}</p>
              <p className="mt-1 text-muted-foreground">{d}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
