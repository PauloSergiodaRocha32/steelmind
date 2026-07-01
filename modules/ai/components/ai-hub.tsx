"use client";

import Link from "next/link";
import {
  Bot,
  Brain,
  Cloud,
  FileSearch,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgentDashboard } from "@/components/ai/agent-dashboard";

const CAPABILITIES = [
  {
    icon: Zap,
    title: "Orçamento Copilot",
    desc: "Upload de PDF/DWG + memorial técnico + precificação Gestio em segundos",
    href: "/budget",
    badge: "Ativo",
  },
  {
    icon: MessageSquare,
    title: "Steel AI permanente",
    desc: "Copilot flutuante em todas as telas — Gestio, RBAC, pipeline e agentes cloud",
    href: "#steel-ai",
    badge: "Novo",
  },
  {
    icon: Cloud,
    title: "Multi-agentes cloud",
    desc: "6 agentes auditam saúde, RBAC, Gestio, módulos, dados e segurança",
    href: "#agents",
    badge: "Cloud",
  },
  {
    icon: FileSearch,
    title: "Classificação Gestio",
    desc: "2.276 produtos com taxonomia material + forma (INOX 304, cantoneira…)",
    href: "/warehouse",
    badge: "Sync",
  },
  {
    icon: Brain,
    title: "OpenAI (opcional)",
    desc: "Respostas enriquecidas quando OPENAI_API_KEY está configurada",
    href: "/budget",
    badge: "Plus",
  },
];

export function AIHub() {
  return (
    <div className="space-y-8">
      <div>
        <Badge className="mb-2 bg-primary/15 text-primary">
          <Sparkles className="mr-1 h-3 w-3" />
          SteelMind AI
        </Badge>
        <h1 className="text-2xl font-bold">Centro de inteligência artificial</h1>
        <p className="text-sm text-muted-foreground">
          IA permanente, multi-agentes cloud e copilot operacional para a Inglesa Metais
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CAPABILITIES.map((cap) => (
          <Link key={cap.title} href={cap.href}>
            <Card className="h-full border-border/50 bg-card/40 transition-colors hover:border-primary/40">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <cap.icon className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="text-[10px]">
                  {cap.badge}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">{cap.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{cap.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card
        id="steel-ai"
        className="border-primary/20 bg-gradient-to-br from-primary/10 to-violet-500/5"
      >
        <CardContent className="flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Bot className="mt-1 h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold">Steel AI · Copilot permanente</p>
              <p className="text-sm text-muted-foreground">
                Botão flutuante no canto inferior direito em todas as páginas.
                Contexto da tela atual, histórico persistente e scan cloud integrado.
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Clique no ícone <Bot className="inline h-4 w-4" /> no canto da tela
          </p>
        </CardContent>
      </Card>

      <div id="agents">
        <h2 className="mb-4 text-lg font-semibold">Painel de agentes cloud</h2>
        <AgentDashboard />
      </div>

      <Card className="border-border/50">
        <CardContent className="flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">SteelMind Copilot · BLACK EDITION</p>
            <p className="text-sm text-muted-foreground">
              Pipeline de 6 etapas: ingestão → extração → BOM → Gestio → memorial → revisão
            </p>
          </div>
          <Link href="/budget">
            <Button className="gap-2">
              <Zap className="h-4 w-4" />
              Abrir Copilot
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
