"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductRow } from "@/modules/warehouse/components/product-row";
import type { WarehouseProductSummary } from "@/modules/warehouse/types/product";

interface ProductSearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: WarehouseProductSummary[];
  loading: boolean;
}

export function ProductSearchPanel({
  query,
  onQueryChange,
  results,
  loading,
}: ProductSearchPanelProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar por código, descrição, material..."
          className="pl-9"
        />
      </div>

      {query.trim().length >= 2 && (
        <div className="rounded-lg border border-border/50 bg-card/30">
          {loading && (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Buscando...
            </p>
          )}
          {!loading && results.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Nenhum produto encontrado.
            </p>
          )}
          {!loading &&
            results.map((product) => (
              <ProductRow key={product.idProd} product={product} showMaterial />
            ))}
        </div>
      )}
    </div>
  );
}
