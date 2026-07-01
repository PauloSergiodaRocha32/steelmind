"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TAXONOMY = [
  { prefix: "I304", material: "INOX 304", exemplo: "I304-CAN-50x50" },
  { prefix: "I316", material: "INOX 316", exemplo: "I316-TUB-40x20" },
  { prefix: "AC", material: "Aço carbono", exemplo: "AC-TR-40x20" },
  { prefix: "FX", material: "Fixação", exemplo: "FX-PAR-M10" },
  { prefix: "CO", material: "Consumíveis", exemplo: "CO-SOL-ARAMEMIG" },
];

const FORMAS = [
  "Cantoneira (CAN)", "Tubo (TUB)", "Chapa (CHA)", "Perfil U (PER)",
  "Barra (BAR)", "Tela (TEL)", "Fixação (PAR/ARR)",
];

export function KnowledgeHub() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-2">Base de conhecimento</Badge>
        <h1 className="text-2xl font-bold">Taxonomia Inglesa Metais</h1>
        <p className="text-sm text-muted-foreground">
          Padrões de codificação aplicados no Gestio e SteelMind · 2.276 produtos
        </p>
      </div>

      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle className="text-sm">Prefixos de material</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-muted-foreground">
                <th className="pb-2 pr-4">Prefixo</th>
                <th className="pb-2 pr-4">Material</th>
                <th className="pb-2">Exemplo</th>
              </tr>
            </thead>
            <tbody>
              {TAXONOMY.map((t) => (
                <tr key={t.prefix} className="border-b border-border/20">
                  <td className="py-2 pr-4 font-mono text-primary">{t.prefix}</td>
                  <td className="py-2 pr-4">{t.material}</td>
                  <td className="py-2 font-mono text-xs text-muted-foreground">{t.exemplo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/50 bg-card/40">
          <CardHeader>
            <CardTitle className="text-sm">Formas / tipos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {FORMAS.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40">
          <CardHeader>
            <CardTitle className="text-sm">Filiais Gestio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1 · Inglesa Metais Serralheria</p>
            <p>2 · Inglesa Metais Soluções</p>
            <p>3 · IM Comércio e Serviços</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Sync: <code>npm run gestio:sync</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
