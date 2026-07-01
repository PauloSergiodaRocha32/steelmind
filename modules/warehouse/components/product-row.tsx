import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { WarehouseProductSummary } from "@/modules/warehouse/types/product";

interface ProductRowProps {
  product: WarehouseProductSummary;
  showMaterial?: boolean;
}

export function ProductRow({ product, showMaterial = false }: ProductRowProps) {
  return (
    <Link
      href={`/warehouse/product/${product.idProd}`}
      className="flex items-start justify-between gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0">
        <span className="font-mono text-xs text-muted-foreground">
          {product.codigo ?? "—"}
        </span>
        <p className="truncate font-medium">{product.descricao}</p>
        {showMaterial && (
          <p className="truncate text-xs text-muted-foreground">
            {product.material} · {product.categoria}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {product.saldoTotal > 0 ? (
          <Badge>{product.saldoTotal} {product.unidade ?? "un"}</Badge>
        ) : (
          <Badge variant="outline">0</Badge>
        )}
        {product.abaixoDoMinimo && (
          <Badge variant="destructive" className="text-[10px]">
            Abaixo mín.
          </Badge>
        )}
      </div>
    </Link>
  );
}
