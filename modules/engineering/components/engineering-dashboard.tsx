"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Layers, Loader2, Plus, Save, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BomItem } from "@/types/steelmind-store";
import type { GestioProjeto } from "@/types/gestio-extended";

export function EngineeringDashboard() {
  const [projetos, setProjetos] = useState<GestioProjeto[]>([]);
  const [selected, setSelected] = useState<GestioProjeto | null>(null);
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ idProd: "", quantidade: "1" });

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/engineering/projects");
        const json = await res.json();
        if (res.ok) {
          setProjetos(json.data.projetos);
          if (json.data.projetos[0]) setSelected(json.data.projetos[0]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadBom = useCallback(async (projeto: GestioProjeto) => {
    const res = await fetch(`/api/v1/engineering/bom/${projeto.codigoDoProjeto}`);
    const json = await res.json();
    if (res.ok && json.data) setBomItems(json.data.items ?? []);
    else setBomItems([]);
  }, []);

  useEffect(() => {
    if (selected) void loadBom(selected);
  }, [selected, loadBom]);

  const saveBom = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/engineering/bom/${selected.codigoDoProjeto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricaoDoProjeto: selected.descricaoDoProjeto,
          items: bomItems,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    if (!newItem.idProd) return;
    setBomItems((items) => [
      ...items,
      {
        idProd: Number(newItem.idProd),
        codigo: null,
        descricao: `Produto #${newItem.idProd}`,
        material: "—",
        quantidade: Number(newItem.quantidade) || 1,
        unidade: "un",
      },
    ]);
    setNewItem({ idProd: "", quantidade: "1" });
  };

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/20" />;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <p className="text-sm text-muted-foreground">
        {projetos.length} projetos do Gestio · BOM (lista de materiais) persistido localmente/Supabase
      </p>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="border-border/50 bg-card/40 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-4 w-4" />
              Projetos Gestio
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[420px] space-y-1 overflow-y-auto p-0 px-4 pb-4">
            {projetos.map((p) => (
              <button
                key={p.codigoDoProjeto}
                type="button"
                onClick={() => setSelected(p)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selected?.codigoDoProjeto === p.codigoDoProjeto
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <span className="truncate font-medium">{p.descricaoDoProjeto}</span>
                <Badge variant="secondary">#{p.codigoDoProjeto}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40 lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4" />
              BOM — {selected?.descricaoDoProjeto ?? "Selecione"}
            </CardTitle>
            <Button size="sm" onClick={saveBom} disabled={saving || !selected}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar BOM
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ID Produto"
                value={newItem.idProd}
                onChange={(e) => setNewItem((n) => ({ ...n, idProd: e.target.value }))}
              />
              <Input
                placeholder="Qtd"
                type="number"
                value={newItem.quantidade}
                onChange={(e) => setNewItem((n) => ({ ...n, quantidade: e.target.value }))}
                className="w-24"
              />
              <Button type="button" variant="secondary" onClick={addItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 text-sm">
              {bomItems.length === 0 ? (
                <p className="text-muted-foreground">BOM vazio — adicione materiais por ID Gestio.</p>
              ) : (
                bomItems.map((item, i) => (
                  <div key={`${item.idProd}-${i}`} className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted/30">
                    <div>
                      <Link href={`/warehouse/product/${item.idProd}`} className="font-mono text-xs hover:underline">
                        #{item.idProd}
                      </Link>
                      <p>{item.descricao}</p>
                    </div>
                    <Badge>{item.quantidade} {item.unidade ?? "un"}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
