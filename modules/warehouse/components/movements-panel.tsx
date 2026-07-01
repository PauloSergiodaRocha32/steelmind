"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  GestioMovimentacaoEntrada,
  GestioMovimentacaoSaida,
} from "@/types/gestio-extended";

interface MovementsData {
  entradas: GestioMovimentacaoEntrada[];
  saidas: GestioMovimentacaoSaida[];
  totalEntradas: number;
  totalSaidas: number;
}

export function MovementsPanel() {
  const [data, setData] = useState<MovementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    tipo: "entrada" as "entrada" | "saida",
    codigoDaFilial: 1,
    codigoDoAlmoxarifado: 1,
    idProd: "",
    quantidade: "",
    observacao: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/warehouse/movements");
      const json = await res.json();
      if (res.ok) setData(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/warehouse/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: form.tipo,
          payload: {
            codigoDaFilial: form.codigoDaFilial,
            codigoDoAlmoxarifado: form.codigoDoAlmoxarifado,
            idProd: Number(form.idProd),
            quantidade: Number(form.quantidade),
            observacao: form.observacao || `SteelMind — ${form.tipo}`,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);
      setForm((f) => ({ ...f, idProd: "", quantidade: "", observacao: "" }));
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-muted/20" />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center gap-2">
            <ArrowDownToLine className="h-4 w-4 text-green-500" />
            <CardTitle className="text-base">Entradas recentes</CardTitle>
            <Badge variant="outline">{data?.totalEntradas ?? 0}</Badge>
          </CardHeader>
          <CardContent className="max-h-52 space-y-2 overflow-y-auto text-sm">
            {data?.entradas.map((e) => (
              <div key={`${e.numeroDaEntrada}-${e.seq}`} className="border-b border-border/30 py-2 last:border-0">
                <span className="font-mono text-xs text-muted-foreground">{e.codigoInterno}</span>
                <p className="truncate">{e.descricaoDoProduto}</p>
                <p className="text-xs text-muted-foreground">
                  +{e.quantidade} · Filial {e.codigoDaFilial}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center gap-2">
            <ArrowUpFromLine className="h-4 w-4 text-orange-500" />
            <CardTitle className="text-base">Saídas recentes</CardTitle>
            <Badge variant="outline">{data?.totalSaidas ?? 0}</Badge>
          </CardHeader>
          <CardContent className="max-h-52 space-y-2 overflow-y-auto text-sm">
            {(data?.saidas.length ?? 0) === 0 ? (
              <p className="text-muted-foreground">Nenhuma saída registrada.</p>
            ) : (
              data?.saidas.map((s) => (
                <div key={`${s.numeroDaSaida}-${s.seq}`} className="border-b border-border/30 py-2 last:border-0">
                  <span className="font-mono text-xs text-muted-foreground">{s.codigoInterno}</span>
                  <p className="truncate">{s.descricaoDoProduto}</p>
                  <p className="text-xs text-muted-foreground">
                    -{s.quantidade} · Filial {s.codigoDaFilial}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Nova movimentação (Gestio)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <select
              value={form.tipo}
              onChange={(e) =>
                setForm((f) => ({ ...f, tipo: e.target.value as "entrada" | "saida" }))
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
            <Input
              type="number"
              placeholder="ID Produto (Gestio)"
              value={form.idProd}
              onChange={(e) => setForm((f) => ({ ...f, idProd: e.target.value }))}
              required
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Quantidade"
              value={form.quantidade}
              onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))}
              required
            />
            <Input
              type="number"
              placeholder="Filial"
              value={form.codigoDaFilial}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  codigoDaFilial: Number(e.target.value),
                  codigoDoAlmoxarifado: Number(e.target.value),
                }))
              }
            />
            <Input
              placeholder="Observação"
              value={form.observacao}
              onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
              className="sm:col-span-2"
            />
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar no Gestio
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Dica: use o ID do produto na{" "}
            <Link href="/warehouse" className="underline">
              ficha do almoxarifado
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
