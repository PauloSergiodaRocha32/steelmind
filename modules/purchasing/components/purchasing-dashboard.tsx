"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  Loader2,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PurchaseRequisition } from "@/types/steelmind-store";
import type { GestioRequisicaoCompra } from "@/types/gestio-extended";

interface PurchasingData {
  gestioAbertas: GestioRequisicaoCompra[];
  gestioEncerradas: GestioRequisicaoCompra[];
  localRequisitions: PurchaseRequisition[];
  stockAlertas: Array<{
    idProd: number;
    codigo: string | null;
    descricao: string | null;
    material: string;
    estoqueMinimo: number;
    saldoTotal: number;
    deficit: number;
  }>;
  backend: string;
}

export function PurchasingDashboard() {
  const [data, setData] = useState<PurchasingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/purchasing/requisitions");
      const json = await res.json();
      if (res.ok) setData(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createFromAlerts = async () => {
    if (!data?.stockAlertas.length) return;
    setCreating(true);
    try {
      const res = await fetch("/api/v1/purchasing/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: `Reposição automática — ${new Date().toLocaleDateString("pt-BR")}`,
          items: data.stockAlertas.slice(0, 10).map((a) => ({
            idProd: a.idProd,
            codigo: a.codigo,
            descricao: a.descricao,
            quantidade: a.deficit,
            motivo: `Abaixo do mínimo (${a.saldoTotal}/${a.estoqueMinimo})`,
          })),
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message);
      }
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/20" />;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Compras integradas ao Gestio · persistência:{" "}
          <Badge variant="outline">{data?.backend ?? "—"}</Badge>
        </p>
        <Button onClick={createFromAlerts} disabled={creating || !data?.stockAlertas.length}>
          {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Requisição a partir de alertas
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Gestio abertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data?.gestioAbertas.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Requisições SteelMind</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data?.localRequisitions.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Alertas estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data?.stockAlertas.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <CardTitle className="text-base">Produtos abaixo do mínimo</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto space-y-2 text-sm">
            {(data?.stockAlertas.length ?? 0) === 0 ? (
              <p className="text-muted-foreground">Sem alertas no momento.</p>
            ) : (
              data?.stockAlertas.map((a) => (
                <div key={a.idProd} className="flex justify-between gap-2 border-b border-border/30 py-2">
                  <div className="min-w-0">
                    <Link href={`/warehouse/product/${a.idProd}`} className="font-mono text-xs hover:underline">
                      {a.codigo}
                    </Link>
                    <p className="truncate">{a.descricao}</p>
                  </div>
                  <Badge variant="destructive">{a.saldoTotal}/{a.estoqueMinimo}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <CardTitle className="text-base">Requisições locais</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto space-y-2 text-sm">
            {(data?.localRequisitions.length ?? 0) === 0 ? (
              <p className="text-muted-foreground">Nenhuma requisição local ainda.</p>
            ) : (
              data?.localRequisitions.map((r) => (
                <div key={r.id} className="border-b border-border/30 py-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.descricao}</p>
                    <Badge>{r.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {r.items.length} itens · {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/40">
        <CardHeader className="flex flex-row items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <CardTitle className="text-base">Requisições abertas no Gestio</CardTitle>
        </CardHeader>
        <CardContent className="max-h-48 overflow-y-auto text-sm">
          {(data?.gestioAbertas.length ?? 0) === 0 ? (
            <p className="text-muted-foreground">Nenhuma requisição aberta no Gestio.</p>
          ) : (
            data?.gestioAbertas.map((r) => (
              <div key={r.numeroDaRequisicao} className="border-b border-border/30 py-2">
                <p className="font-medium">#{r.numeroDaRequisicao} — {r.descricaoDaRequisicao}</p>
                <p className="text-xs text-muted-foreground">
                  {r.descricaoDoProjeto ?? "Sem projeto"} ·{" "}
                  {new Date(r.dataDaRequisicao).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
