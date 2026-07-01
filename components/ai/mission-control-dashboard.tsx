"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, ShieldCheck, Loader2, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MissionControlData = {
  agents: Array<{
    id: string;
    name: string;
    online: boolean;
    executions: number;
    failures: number;
    lastExecutionMs: number | null;
    lastStatus: string | null;
  }>;
  currentExecution: {
    capability: string;
    status: string;
    confidence: number;
    durationMs: number;
    responder: string;
  } | null;
  lastEvent: {
    type: string;
    source: string;
    timestamp: string;
    status?: string;
  } | null;
  recentDecisions: Array<{
    requestId: string;
    summary: string;
    trace: {
      finalDecision: {
        outcome: string;
        decidedBy: string;
        confidence: number;
      };
    };
    storedAt: string;
  }>;
  guardian: {
    state: string;
    checks: number;
    blocked: number;
    lastDecision: {
      outcome: string;
      decidedBy: string;
      confidence: number;
    } | null;
  };
  memory: {
    totalDecisions: number;
    totalExecutions: number;
    totalEvents: number;
    lastStoredAt: string | null;
    averageResponseMs: number;
    usage: {
      decisionRecords: number;
      executionRecords: number;
      eventRecords: number;
    };
  };
};

export function MissionControlDashboard() {
  const [data, setData] = useState<MissionControlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/ai/mission-control");
      if (!response.ok) return;
      const json = await response.json();
      setData(json.data as MissionControlData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runCheck = async () => {
    setRunning(true);
    try {
      await fetch("/api/v1/ai/mission-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capability: "platform.audit",
          prompt: "Run mission control operational check",
          target: "qa",
        }),
      });
      await load();
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

  if (!data) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Mission Control indisponivel no momento.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-violet-500/5">
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Mission Control</p>
            <p className="text-2xl font-semibold">
              {data.agents.filter((agent) => agent.online).length}/{data.agents.length} agentes online
            </p>
            <p className="text-sm text-muted-foreground">
              Guardian: {data.guardian.state} ({data.guardian.blocked} bloqueios) - Ultimo evento: {data.lastEvent?.type ?? "n/a"}
            </p>
          </div>
          <Button onClick={() => void runCheck()} disabled={running} className="gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Executar verificacao
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Execucao atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Agente:</strong> {data.currentExecution?.responder ?? "n/a"}
            </p>
            <p>
              <strong>Status:</strong> {data.currentExecution?.status ?? "n/a"}
            </p>
            <p>
              <strong>Confianca:</strong>{" "}
              {data.currentExecution ? `${Math.round(data.currentExecution.confidence * 100)}%` : "n/a"}
            </p>
            <p>
              <strong>Tempo:</strong> {data.currentExecution?.durationMs ?? 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Steel Memory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Decisoes:</strong> {data.memory.totalDecisions}
            </p>
            <p>
              <strong>Execucoes:</strong> {data.memory.totalExecutions}
            </p>
            <p>
              <strong>Eventos:</strong> {data.memory.totalEvents}
            </p>
            <p>
              <strong>Tempo medio:</strong> {data.memory.averageResponseMs}ms
            </p>
            <p>
              <strong>Ultima gravacao:</strong>{" "}
              {data.memory.lastStoredAt ? new Date(data.memory.lastStoredAt).toLocaleString("pt-BR") : "n/a"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Saude operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.agents.slice(0, 6).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  {agent.name}
                </span>
                <Badge variant={agent.failures > 0 ? "destructive" : "secondary"}>
                  {agent.lastStatus ?? "idle"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ultimas decisoes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.recentDecisions.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma decisao registrada ainda.</p>
          )}
          {data.recentDecisions.slice(0, 8).map((decision) => (
            <div key={decision.requestId} className="rounded-lg border border-border/50 px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{decision.summary}</p>
                <Badge variant="secondary">{decision.trace.finalDecision.outcome}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {decision.trace.finalDecision.decidedBy} - {Math.round(decision.trace.finalDecision.confidence * 100)}% - {new Date(decision.storedAt).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Guardian</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>
            Estado: <strong>{data.guardian.state}</strong> ({data.guardian.checks} checks, {data.guardian.blocked} bloqueios)
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
