"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Cloud,
  Loader2,
  Shield,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AGENT_DESCRIPTIONS,
  AGENT_LABELS,
  type AgentId,
  type AgentRunResult,
  type OrchestratorReport,
} from "@/types/ai-agents";

const AGENT_ICONS: Partial<Record<AgentId, typeof Activity>> = {
  health: Activity,
  rbac: Shield,
  gestio: Cloud,
  modules: CheckCircle2,
  data: Activity,
  security: Shield,
};

function StatusIcon({ status }: { status: string }) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 text-amber-400" />;
  return <XCircle className="h-4 w-4 text-red-400" />;
}

function AgentCard({ agent }: { agent: AgentRunResult }) {
  const Icon = AGENT_ICONS[agent.agent] ?? Activity;
  const issues = agent.findings.filter((f) => f.severity !== "info");

  return (
    <Card className="border-border/50 bg-card/40">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">{AGENT_LABELS[agent.agent]}</CardTitle>
        </div>
        <StatusIcon status={agent.status} />
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {AGENT_DESCRIPTIONS[agent.agent]}
        </p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px]">
            {agent.durationMs}ms
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {agent.findings.length} findings
          </Badge>
        </div>
        {issues.length > 0 && (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {issues.slice(0, 3).map((f) => (
              <li key={f.code} className="flex gap-1.5">
                <span
                  className={
                    f.severity === "error"
                      ? "text-red-400"
                      : f.severity === "warn"
                        ? "text-amber-400"
                        : ""
                  }
                >
                  •
                </span>
                {f.message}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function AgentDashboard() {
  const [report, setReport] = useState<OrchestratorReport | null>(null);
  const [history, setHistory] = useState<OrchestratorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [canRun, setCanRun] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [agentsRes, meRes] = await Promise.all([
        fetch("/api/v1/ai/agents"),
        fetch("/api/auth/me"),
      ]);
      if (agentsRes.ok) {
        const json = await agentsRes.json();
        setReport(json.data.latest);
        setHistory(json.data.history ?? []);
      }
      if (meRes.ok) {
        const me = await meRes.json();
        const perms: string[] = me.data?.permissions ?? [];
        setCanRun(perms.includes("platform:admin") || me.data?.role === "manager");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runAll = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyUser: true }),
      });
      if (res.ok) {
        const json = await res.json();
        setReport(json.data.report);
        await load();
      }
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const score = report?.score ?? null;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent">
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Multi-Agentes Cloud
            </p>
            <p className="text-3xl font-bold tabular-nums">
              {score != null ? `${score}/100` : "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              {report
                ? `Último scan: ${new Date(report.finishedAt).toLocaleString("pt-BR")} · ${report.status.toUpperCase()}`
                : "Nenhum scan executado ainda"}
            </p>
          </div>
          {canRun && (
            <Button
              className="gap-2"
              disabled={running}
              onClick={() => void runAll()}
            >
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
              Rodar agentes cloud
            </Button>
          )}
        </CardContent>
      </Card>

      {report && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {report.agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {history.length > 1 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Histórico de scans</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {history.slice(0, 5).map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {new Date(h.finishedAt).toLocaleString("pt-BR")}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{h.score}/100</Badge>
                    <StatusIcon status={h.status} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
