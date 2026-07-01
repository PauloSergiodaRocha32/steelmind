"use client";

import { useCallback, useEffect, useState } from "react";
import type { WarehouseCatalogResponse } from "@/modules/warehouse/types/catalog";
import type { StockOverview } from "@/modules/warehouse/types/product";
import type { WarehouseProductSummary } from "@/modules/warehouse/types/product";

export function useWarehouseCatalog(filial: number | null) {
  const [catalog, setCatalog] = useState<WarehouseCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filial) params.set("filial", String(filial));
      const res = await fetch(`/api/v1/warehouse/catalog?${params}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Falha ao carregar catálogo");
      }
      setCatalog(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [filial]);

  useEffect(() => {
    void load();
  }, [load]);

  return { catalog, loading, error, reload: load };
}

export function useWarehouseSearch(
  query: string,
  filial: number | null,
  enabled: boolean,
) {
  const [results, setResults] = useState<WarehouseProductSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query, limit: "30" });
        if (filial) params.set("filial", String(filial));
        const res = await fetch(`/api/v1/warehouse/search?${params}`);
        const json = await res.json();
        if (res.ok) setResults(json.data.results);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filial, enabled]);

  return { results, loading };
}

export function useStockOverview(filial: number | null, enabled: boolean) {
  const [stock, setStock] = useState<StockOverview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    void (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filial) params.set("filial", String(filial));
        const res = await fetch(`/api/v1/warehouse/stock?${params}`);
        const json = await res.json();
        if (res.ok) setStock(json.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [filial, enabled]);

  return { stock, loading };
}
