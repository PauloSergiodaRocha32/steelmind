import type { ShadowRun } from "@/modules/shadow/domain/entities/shadow-run";
import type { ShadowRunRepository } from "@/modules/shadow/repository/shadow-run.repository";

export class MemoryShadowRunRepository implements ShadowRunRepository {
  private readonly items = new Map<string, ShadowRun>();

  async save(run: ShadowRun): Promise<void> {
    this.items.set(run.id, run);
  }

  async getById(id: string): Promise<ShadowRun | null> {
    return this.items.get(id) ?? null;
  }

  async list(limit = 100): Promise<ShadowRun[]> {
    return [...this.items.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}
