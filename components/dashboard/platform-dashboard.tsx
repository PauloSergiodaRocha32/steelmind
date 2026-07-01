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
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  movements: { entradas: number; saidas: number };
  modules: Array<{ name: string; href: string; status: string }>;
}

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Almoxarifado: Package,
  Compras: ShoppingCart,
  Engenharia: Wrench,
};

export function PlatformDashboard() {
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/v1/platform/overview");
        const json = await res.json();
        if (res.ok) setData(json.data);
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
      <div>
        <h2 className="text-lg font-semibold">SteelMind Platform</h2>
        <p className="text-sm text-muted-foreground">
          Gestio + Steel + Almoxarifado unificados · persistência:{" "}
          <Badge variant="outline">{data.persistence.backend}</Badge>
          {data.persistence.supabaseConfigured && (
            <Badge className="ml-2" variant="secondary">
              <Database className="mr-1 h-3 w-3" />
              Supabase
            </Badge>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Produtos</CardTitle>
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
            <CardTitle className="text-sm text-muted-foreground">Filiais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {data.warehouse?.filiais ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">Inglesa Metais</p>
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
              {data.engineering.bomsLocais} BOMs locais
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {data.movements.entradas + data.movements.saidas}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.movements.entradas} entradas · {data.movements.saidas} saídas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {data.modules.map((mod) => {
          const Icon = MODULE_ICONS[mod.name] ?? Factory;
          return (
            <Link key={mod.href} href={mod.href}>
              <Card
                className={cn(
                  "border-border/50 bg-card/40 transition-colors hover:border-primary/40 hover:bg-card/60",
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-5 w-5 text-primary" />
                    {mod.name}
                  </CardTitle>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={mod.status === "online" ? "default" : "secondary"}
                  >
                    {mod.status === "online" ? "Online" : "Sync necessário"}
                  </Badge>
                  {mod.name === "Almoxarifado" && data.stock && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {data.stock.alertas} alertas de estoque
                    </p>
                  )}
                  {mod.name === "Compras" && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {data.purchasing.gestioAbertas} abertas no Gestio
                    </p>
                  )}
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
            Integração Gestio ERP
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>Catálogo sincronizado com 3 filiais</p>
          <p>Taxonomia: material + forma (INOX 304, Cantoneira…)</p>
          <p>Entrada/saída de estoque via API</p>
          <p>Requisições de compra + projetos de engenharia</p>
        </CardContent>
      </Card>
    </div>
  );
}
