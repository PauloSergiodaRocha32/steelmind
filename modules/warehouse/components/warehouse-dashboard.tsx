"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Layers,
  Package,
  RefreshCw,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { WarehouseCatalogResponse } from "@/modules/warehouse/types/catalog";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

export function WarehouseDashboard() {
  const [catalog, setCatalog] = useState<WarehouseCatalogResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/warehouse/catalog");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Falha ao carregar catálogo");
      }
      setCatalog(json.data);
      if (!selectedMaterial && json.data.directory?.[0]) {
        setSelectedMaterial(json.data.directory[0].material);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [selectedMaterial]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/warehouse/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Falha na sincronização");
      }
      await loadCatalog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na sincronização");
    } finally {
      setSyncing(false);
    }
  };

  const selectedNode = catalog?.directory.find(
    (d) => d.material === selectedMaterial,
  );

  if (loading && !catalog) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/30" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-muted/20" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Integração Gestio → SteelMind · Almoxarifado unificado
          </p>
          {catalog?.syncedAt && (
            <p className="text-xs text-muted-foreground/80">
              Última sync:{" "}
              {new Date(catalog.syncedAt).toLocaleString("pt-BR")}
            </p>
          )}
        </div>
        <Button onClick={handleSync} disabled={syncing} size="sm">
          <RefreshCw
            className={cn("mr-2 h-4 w-4", syncing && "animate-spin")}
          />
          {syncing ? "Sincronizando..." : "Sincronizar Gestio"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {catalog && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Produtos"
              value={catalog.stats.totalProdutos}
              icon={Package}
            />
            <StatCard
              label="Classificados"
              value={catalog.stats.produtosClassificados}
              icon={Layers}
            />
            <StatCard
              label="Filiais"
              value={catalog.stats.filiais}
              icon={Building2}
            />
            <StatCard
              label="Com saldo"
              value={catalog.stats.saldosComQuantidade}
              icon={Warehouse}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="border-border/50 bg-card/40 lg:col-span-4">
              <CardHeader>
                <CardTitle className="text-base">Materiais</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[420px]">
                  <div className="space-y-1 p-4 pt-0">
                    {catalog.directory.map((node) => (
                      <button
                        key={node.material}
                        type="button"
                        onClick={() => setSelectedMaterial(node.material)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                          selectedMaterial === node.material
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50",
                        )}
                      >
                        <span className="font-medium">{node.material}</span>
                        <Badge variant="secondary" className="tabular-nums">
                          {node.totalProdutos}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/40 lg:col-span-8">
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedNode?.material ?? "Selecione um material"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[380px]">
                  {selectedNode ? (
                    <div className="space-y-6 pr-4">
                      {selectedNode.categorias.map((cat) => (
                        <div key={cat.categoria}>
                          <div className="mb-2 flex items-center gap-2">
                            <h3 className="text-sm font-semibold">
                              {cat.categoria}
                            </h3>
                            <Badge variant="outline">{cat.count}</Badge>
                          </div>
                          <div className="space-y-1">
                            {cat.produtos.slice(0, 8).map((p) => (
                              <div
                                key={p.idProd}
                                className="flex items-start justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/30"
                              >
                                <div className="min-w-0">
                                  <span className="font-mono text-xs text-muted-foreground">
                                    {p.codigo ?? "—"}
                                  </span>
                                  <p className="truncate">{p.descricao}</p>
                                </div>
                                {Object.keys(p.saldoPorFilial).length > 0 && (
                                  <Badge className="shrink-0">
                                    {Object.values(p.saldoPorFilial).reduce(
                                      (a, b) => a + b,
                                      0,
                                    )}{" "}
                                    un
                                  </Badge>
                                )}
                              </div>
                            ))}
                            {cat.count > 8 && (
                              <p className="px-2 text-xs text-muted-foreground">
                                +{cat.count - 8} produtos
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum material selecionado.
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 bg-card/40">
            <CardHeader>
              <CardTitle className="text-base">Filiais integradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {catalog.filiais.map((f) => (
                  <div
                    key={f.codigoDaFilial}
                    className="rounded-lg border border-border/40 px-4 py-3"
                  >
                    <p className="text-xs text-muted-foreground">
                      Filial {f.codigoDaFilial}
                    </p>
                    <p className="text-sm font-medium leading-snug">
                      {f.nomeFantasia}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
