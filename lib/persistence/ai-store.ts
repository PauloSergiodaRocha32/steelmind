import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  OrchestratorReport,
  SteelAIConversation,
  SteelAIMessage,
} from "@/types/ai-agents";

const AI_DIR = resolve(process.cwd(), "data/steelmind/ai");
const REPORTS_PATH = resolve(AI_DIR, "agent-reports.json");
const CONVERSATIONS_PATH = resolve(AI_DIR, "conversations.json");

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function ensureDir() {
  if (!existsSync(AI_DIR)) mkdirSync(AI_DIR, { recursive: true });
}

function readJson<T>(path: string, fallback: T): T {
  ensureDir();
  if (!existsSync(path)) {
    writeFileSync(path, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

function writeJson(path: string, data: unknown) {
  ensureDir();
  writeFileSync(path, JSON.stringify(data, null, 2));
}

export async function saveAgentReport(report: OrchestratorReport): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.from("agent_reports").insert({
      id: report.id,
      status: report.status,
      score: report.score,
      summary: report.summary,
      agents: report.agents,
      started_at: report.startedAt,
      finished_at: report.finishedAt,
      triggered_by: report.triggeredBy,
    });
  }
  const reports = readJson<OrchestratorReport[]>(REPORTS_PATH, []);
  reports.unshift(report);
  writeJson(REPORTS_PATH, reports.slice(0, 50));
}

export async function getLatestAgentReport(): Promise<OrchestratorReport | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("agent_reports")
      .select("*")
      .order("finished_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      return {
        id: data.id,
        status: data.status,
        score: data.score,
        summary: data.summary,
        agents: data.agents,
        startedAt: data.started_at,
        finishedAt: data.finished_at,
        triggeredBy: data.triggered_by,
      };
    }
  }
  const reports = readJson<OrchestratorReport[]>(REPORTS_PATH, []);
  return reports[0] ?? null;
}

export async function getAgentReportHistory(limit = 10): Promise<OrchestratorReport[]> {
  const reports = readJson<OrchestratorReport[]>(REPORTS_PATH, []);
  return reports.slice(0, limit);
}

export async function getOrCreateConversation(
  userId: string,
): Promise<SteelAIConversation> {
  const all = readJson<SteelAIConversation[]>(CONVERSATIONS_PATH, []);
  let conv = all.find((c) => c.userId === userId);
  if (!conv) {
    conv = {
      id: crypto.randomUUID(),
      userId,
      messages: [
        {
          id: crypto.randomUUID(),
          role: "system",
          content:
            "Steel AI permanente ativo. Sou seu copilot operacional — pergunte sobre Gestio, orçamentos, estoque, permissões ou peça para rodar os agentes cloud.",
          timestamp: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    all.unshift(conv);
    writeJson(CONVERSATIONS_PATH, all.slice(0, 100));
  }
  return conv;
}

export async function appendMessage(
  userId: string,
  message: SteelAIMessage,
  contextPath?: string,
): Promise<SteelAIConversation> {
  const all = readJson<SteelAIConversation[]>(CONVERSATIONS_PATH, []);
  let conv = all.find((c) => c.userId === userId);
  if (!conv) {
    conv = await getOrCreateConversation(userId);
  }
  conv.messages.push(message);
  if (conv.messages.length > 80) conv.messages = conv.messages.slice(-80);
  conv.updatedAt = new Date().toISOString();
  conv.contextPath = contextPath ?? conv.contextPath;
  const idx = all.findIndex((c) => c.userId === userId);
  if (idx >= 0) all[idx] = conv;
  else all.unshift(conv);
  writeJson(CONVERSATIONS_PATH, all.slice(0, 100));
  return conv;
}

export function aiBackend(): string {
  return getSupabase() ? "supabase" : "local-json";
}
