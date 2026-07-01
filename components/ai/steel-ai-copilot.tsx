"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bot,
  Cloud,
  Loader2,
  Minimize2,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SteelAIMessage } from "@/types/ai-agents";

const SUGGESTIONS = [
  "Status do Gestio",
  "Como fazer orçamento?",
  "Rodar agentes cloud",
  "Minhas permissões",
];

interface ChatContext {
  lastAgentRun: { score: number; status: string } | null;
  openaiConfigured: boolean;
}

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageBubble({ msg }: { msg: SteelAIMessage }) {
  const isUser = msg.role === "user";
  const isAgent = msg.role === "agent";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser && "bg-primary text-primary-foreground",
          !isUser && !isAgent && "border border-border/60 bg-muted/40",
          isAgent && "border border-violet-500/30 bg-violet-500/10",
        )}
      >
        {isAgent && (
          <Badge
            variant="secondary"
            className="mb-1.5 bg-violet-500/20 text-[10px] text-violet-300"
          >
            <Cloud className="mr-1 h-3 w-3" />
            Cloud Agents
          </Badge>
        )}
        <div className="whitespace-pre-wrap">{renderContent(msg.content)}</div>
        <p className="mt-1 text-[10px] opacity-50">
          {new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export function SteelAICopilot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SteelAIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [context, setContext] = useState<ChatContext | null>(null);
  const [canRunAgents, setCanRunAgents] = useState(false);
  const [agentsRunning, setAgentsRunning] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const loadConversation = useCallback(async () => {
    setBooting(true);
    try {
      const [chatRes, meRes] = await Promise.all([
        fetch(`/api/v1/ai/chat?path=${encodeURIComponent(pathname)}`),
        fetch("/api/auth/me"),
      ]);

      if (chatRes.ok) {
        const json = await chatRes.json();
        setMessages(json.data.conversation?.messages ?? []);
        setContext({
          lastAgentRun: json.data.context?.lastAgentRun ?? null,
          openaiConfigured: json.data.context?.openaiConfigured ?? false,
        });
      }

      if (meRes.ok) {
        const me = await meRes.json();
        const perms: string[] = me.data?.permissions ?? [];
        const role = me.data?.role ?? "";
        setCanRunAgents(perms.includes("platform:admin") || role === "manager");
      }
    } finally {
      setBooting(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (open) void loadConversation();
  }, [open, loadConversation]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    setInput("");
    setLoading(true);

    const optimistic: SteelAIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, path: pathname }),
      });
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data.conversation?.messages ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  const runCloudAgents = async () => {
    if (agentsRunning) return;
    setAgentsRunning(true);
    try {
      const res = await fetch("/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyUser: true }),
      });
      if (res.ok) {
        const json = await res.json();
        setContext((c) => ({
          lastAgentRun: {
            score: json.data.report.score,
            status: json.data.report.status,
          },
          openaiConfigured: c?.openaiConfigured ?? false,
        }));
        await loadConversation();
      }
    } finally {
      setAgentsRunning(false);
    }
  };

  const score = context?.lastAgentRun?.score;
  const scoreColor =
    score == null
      ? "bg-primary"
      : score >= 85
        ? "bg-emerald-500"
        : score >= 65
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
            "bg-gradient-to-br from-primary to-violet-600 hover:scale-105 hover:shadow-[0_0_30px_hsl(var(--primary)/0.45)]",
            "animate-fade-in",
          )}
          aria-label="Abrir Steel AI"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <Bot className="relative h-6 w-6 text-white" />
          {score != null && (
            <span
              className={cn(
                "absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                scoreColor,
              )}
            >
              {score}
            </span>
          )}
        </button>
      )}

      {open && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border/60",
            "bg-background/95 shadow-2xl backdrop-blur-xl animate-fade-in",
            "h-[min(640px,calc(100vh-3rem))]",
          )}
        >
          <header className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/10 via-violet-500/5 to-transparent px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Steel AI</p>
                <p className="text-[10px] text-muted-foreground">
                  Copilot permanente · {pathname}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {context?.openaiConfigured && (
                <Badge variant="secondary" className="text-[10px]">
                  GPT
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {context?.lastAgentRun && (
            <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-2">
              <span className="text-xs text-muted-foreground">
                Último scan cloud:{" "}
                <strong className="text-foreground">
                  {context.lastAgentRun.score}/100
                </strong>{" "}
                ({context.lastAgentRun.status})
              </span>
              {canRunAgents && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  disabled={agentsRunning}
                  onClick={() => void runCloudAgents()}
                >
                  {agentsRunning ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Cloud className="h-3 w-3" />
                  )}
                  Scan
                </Button>
              )}
            </div>
          )}

          <ScrollArea className="flex-1 px-4 py-3">
            {booting ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3 pb-2">
                {messages
                  .filter((m) => m.role !== "system")
                  .map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Steel AI pensando…
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </ScrollArea>

          <div className="border-t border-border/50 p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void sendMessage(s)}
                  className="rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre Gestio, orçamentos, estoque…"
                className="min-h-[44px] max-h-24 resize-none text-sm"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <Button
                size="icon"
                className="h-11 w-11 shrink-0"
                disabled={loading || !input.trim()}
                onClick={() => void sendMessage()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
