"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WarehouseProductDetail } from "@/modules/warehouse/types/product";

interface ProductDetailPageProps {
  id: string;
}

export function ProductDetailPage({ id }: ProductDetailPageProps) {
  const [product, setProduct] = useState<WarehouseProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/warehouse/products/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message ?? "Erro ao carregar");
        setProduct(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <AppShell title="Produto">
      <Link
        href="/warehouse"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Almoxarifado
      </Link>

      {loading && (
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted/30" />
          <div className="h-48 rounded-xl bg-muted/20" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {product && (
        <div className="space-y-6">
          <div>
            <p className="font-mono text-sm text-muted-foreground">
              {product.codigo}
            </p>
            <h2 className="text-xl font-semibold">{product.descricao}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{product.material}</Badge>
              <Badge variant="secondary">{product.categoria}</Badge>
              <Badge variant="outline">{product.tipo}</Badge>
              {!product.ativo && <Badge variant="destructive">Inativo</Badge>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/50 bg-card/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Saldo total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {product.saldoTotal} {product.unidade ?? "un"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Estoque mín.
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{product.estoqueMinimo}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">NCM</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{product.ncm ?? "—"}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 bg-card/40">
            <CardHeader className="flex flex-row items-center gap-2">
              <Package className="h-4 w-4" />
              <CardTitle className="text-base">Saldo por filial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {product.filiais.map((f) => (
                  <div
                    key={f.codigoDaFilial}
                    className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Filial {f.codigoDaFilial}
                      </p>
                      <p className="text-sm font-medium">{f.nome}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={f.quantidade > 0 ? "default" : "outline"}>
                        {f.quantidade} un
                      </Badge>
                      {f.valorTotal > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          R$ {f.valorTotal.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
