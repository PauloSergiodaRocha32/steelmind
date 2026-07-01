import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { ShadowRun } from "@/modules/shadow/domain/entities/shadow-run";
import type { ShadowRunRepository } from "@/modules/shadow/repository/shadow-run.repository";

async function ensureParentDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

async function readRuns(filePath: string): Promise<ShadowRun[]> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as ShadowRun[];
  } catch {
    return [];
  }
}

export class FileShadowRunRepository implements ShadowRunRepository {
  constructor(private readonly filePath: string) {}

  async save(run: ShadowRun): Promise<void> {
    await ensureParentDir(this.filePath);
    const runs = await readRuns(this.filePath);
    const next = [run, ...runs.filter((item) => item.id !== run.id)];
    await writeFile(this.filePath, JSON.stringify(next, null, 2), "utf-8");
  }

  async getById(id: string): Promise<ShadowRun | null> {
    const runs = await readRuns(this.filePath);
    return runs.find((item) => item.id === id) ?? null;
  }

  async list(limit = 100): Promise<ShadowRun[]> {
    const runs = await readRuns(this.filePath);
    return runs.slice(0, limit);
  }
}
