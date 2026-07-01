"use client";

import { AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductRow } from "@/modules/warehouse/components/product-row";
import type { StockOverview } from "@/modules/warehouse/types/product";

interface StockOverviewPanelProps {
  stock: StockOverview | null;
  loading: boolean;
}

export function StockOverviewPanel({ stock, loading }: StockOverviewPanelProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 rounded-xl bg-muted/30" />
        <div className="h-48 rounded-xl bg-muted/20" />
      </div>
    );
  }

  if (!stock) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {stock.totaisPorFilial.map((filial) => (
          <Card key={filial.codigoDaFilial} className="border-border/50 bg-card/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Filial {filial.codigoDaFilial}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="truncate text-sm font-medium">{filial.nome}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">
                  {filial.produtosComSaldo} com saldo
                </Badge>
                <Badge>{filial.quantidadeTotal} un total</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/40">
        <CardHeader className="flex flex-row items-center gap-2">
          <Package className="h-4 w-4" />
          <CardTitle className="text-base">Produtos com saldo</CardTitle>
          <Badge variant="outline">{stock.comSaldo.length}</Badge>
        </CardHeader>
        <CardContent className="max-h-64 overflow-y-auto">
          {stock.comSaldo.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum produto com saldo no momento.
            </p>
          ) : (
            stock.comSaldo.map((product) => (
              <ProductRow key={product.idProd} product={product} showMaterial />
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <CardTitle className="text-base">Alertas — abaixo do mínimo</CardTitle>
          <Badge variant="destructive">{stock.alertas.length}</Badge>
        </CardHeader>
        <CardContent className="max-h-48 overflow-y-auto">
          {stock.alertas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum alerta de estoque mínimo.
            </p>
          ) : (
            stock.alertas.slice(0, 20).map((item) => (
              <div
                key={item.idProd}
                className="flex items-center justify-between border-b border-border/30 py-2 text-sm last:border-0"
              >
                <div className="min-w-0">
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.codigo}
                  </span>
                  <p className="truncate">{item.descricao}</p>
                </div>
                <Badge variant="destructive">
                  {item.saldoTotal}/{item.estoqueMinimo}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
