"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Layers,
  Package,
  RefreshCw,
  Search,
  Warehouse,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ProductSearchPanel } from "@/modules/warehouse/components/product-search-panel";
import { StockOverviewPanel } from "@/modules/warehouse/components/stock-overview-panel";
import { MovementsPanel } from "@/modules/warehouse/components/movements-panel";
import { ProductRow } from "@/modules/warehouse/components/product-row";
import {
  useStockOverview,
  useWarehouseCatalog,
  useWarehouseSearch,
} from "@/modules/warehouse/hooks/use-warehouse-catalog";

type TabId = "catalogo" | "busca" | "estoque" | "movimentacoes";

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

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "catalogo", label: "Catálogo", icon: Layers },
  { id: "busca", label: "Busca", icon: Search },
  { id: "estoque", label: "Estoque", icon: Warehouse },
  { id: "movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
];

export function WarehouseDashboard() {
  const [filial, setFilial] = useState<number | null>(null);
  const [tab, setTab] = useState<TabId>("catalogo");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  const { catalog, loading, error, reload } = useWarehouseCatalog(filial);
  const { results, loading: searchLoading } = useWarehouseSearch(
    searchQuery,
    filial,
    tab === "busca",
  );
  const { stock, loading: stockLoading } = useStockOverview(
    filial,
    tab === "estoque",
  );

  useEffect(() => {
    if (catalog?.directory[0] && !selectedMaterial) {
      setSelectedMaterial(catalog.directory[0].material);
    }
  }, [catalog, selectedMaterial]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/v1/warehouse/sync", { method: "POST" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message ?? "Falha na sincronização");
      }
      await reload();
    } catch (err) {
      console.error(err);
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
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Gestio → SteelMind · Almoxarifado unificado
          </p>
          {catalog?.syncedAt && (
            <p className="text-xs text-muted-foreground/80">
              Última sync: {new Date(catalog.syncedAt).toLocaleString("pt-BR")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filial ?? ""}
            onChange={(e) =>
              setFilial(e.target.value ? Number(e.target.value) : null)
            }
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Todas as filiais</option>
            {catalog?.filiais.map((f) => (
              <option key={f.codigoDaFilial} value={f.codigoDaFilial}>
                Filial {f.codigoDaFilial} — {f.nomeFantasia}
              </option>
            ))}
          </select>
          <Button onClick={handleSync} disabled={syncing} size="sm">
            <RefreshCw
              className={cn("mr-2 h-4 w-4", syncing && "animate-spin")}
            />
            {syncing ? "Sincronizando..." : "Sincronizar"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {catalog && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Produtos" value={catalog.stats.totalProdutos} icon={Package} />
            <StatCard label="Classificados" value={catalog.stats.produtosClassificados} icon={Layers} />
            <StatCard label="Filiais" value={catalog.stats.filiais} icon={Building2} />
            <StatCard label="Com saldo" value={catalog.stats.saldosComQuantidade} icon={Warehouse} />
          </div>

          <div className="flex gap-1 rounded-lg border border-border/50 bg-muted/20 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  tab === id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {tab === "catalogo" && (
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
                          <Badge variant="secondary">{node.totalProdutos}</Badge>
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
                              <h3 className="text-sm font-semibold">{cat.categoria}</h3>
                              <Badge variant="outline">{cat.count}</Badge>
                            </div>
                            <div>
                              {cat.produtos.map((p) => (
                                <ProductRow
                                  key={p.idProd}
                                  product={{
                                    idProd: p.idProd,
                                    codigo: p.codigo,
                                    descricao: p.descricao,
                                    material: selectedNode.material,
                                    categoria: cat.categoria,
                                    tipo: "—",
                                    unidade: null,
                                    estoqueMinimo: 0,
                                    estoqueMaximo: 0,
                                    saldoPorFilial: p.saldoPorFilial,
                                    saldoTotal: Object.values(p.saldoPorFilial).reduce(
                                      (a, b) => a + b,
                                      0,
                                    ),
                                    abaixoDoMinimo: false,
                                  }}
                                />
                              ))}
                              {cat.count > cat.produtos.length && (
                                <p className="px-2 text-xs text-muted-foreground">
                                  +{cat.count - cat.produtos.length} produtos — use Busca
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Selecione um material à esquerda.
                      </p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "busca" && (
            <ProductSearchPanel
              query={searchQuery}
              onQueryChange={setSearchQuery}
              results={results}
              loading={searchLoading}
            />
          )}

          {tab === "estoque" && (
            <StockOverviewPanel stock={stock} loading={stockLoading} />
          )}

          {tab === "movimentacoes" && <MovementsPanel />}
        </>
      )}
    </div>
  );
}
