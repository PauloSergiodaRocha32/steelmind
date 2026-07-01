"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Factory, Loader2, Package, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductionData {
  projetos: Array<{
    codigoDoProjeto: number;
    descricaoDoProjeto: string | null;
    ativo: boolean;
  }>;
  movements: { entradas: number; saidas: number };
}

export function ProductionDashboard() {
  const [data, setData] = useState<ProductionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [projRes, movRes] = await Promise.all([
          fetch("/api/v1/engineering/projects"),
          fetch("/api/v1/warehouse/movements"),
        ]);
        const projJson = projRes.ok ? await projRes.json() : { data: { projetos: [] } };
        const movJson = movRes.ok ? await movRes.json() : { data: { totalEntradas: 0, totalSaidas: 0 } };
        setData({
          projetos: projJson.data?.projetos ?? [],
          movements: {
            entradas: movJson.data?.totalEntradas ?? 0,
            saidas: movJson.data?.totalSaidas ?? 0,
          },
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-2">Produção</Badge>
        <h1 className="text-2xl font-bold">Chão de fábrica</h1>
        <p className="text-sm text-muted-foreground">
          Projetos ativos no Gestio + movimentações de estoque
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Projetos ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data?.projetos.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data?.movements.entradas ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data?.movements.saidas ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Factory className="h-4 w-4" />
            Projetos em execução (Gestio)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data?.projetos ?? []).slice(0, 12).map((p) => (
            <Link
              key={p.codigoDoProjeto}
              href={`/engineering`}
              className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2 text-sm hover:border-primary/30"
            >
              <div>
                <p className="font-medium">
                  #{p.codigoDoProjeto} · {p.descricaoDoProjeto ?? "Sem descrição"}
                </p>
              </div>
              <Badge variant="secondary">Ativo</Badge>
            </Link>
          ))}
          {!data?.projetos.length && (
            <p className="text-sm text-muted-foreground">Nenhum projeto ativo no Gestio</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/warehouse">
          <Card className="border-border/50 bg-card/40 transition-colors hover:border-primary/30">
            <CardContent className="flex items-center gap-3 py-4">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Almoxarifado · estoque e movimentações</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/engineering">
          <Card className="border-border/50 bg-card/40 transition-colors hover:border-primary/30">
            <CardContent className="flex items-center gap-3 py-4">
              <Wrench className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Engenharia · BOM e projetos</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
