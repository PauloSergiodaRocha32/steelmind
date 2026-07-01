import type { ShadowRun } from "@/modules/shadow/domain/entities/shadow-run";
import type { ShadowRunRepository } from "@/modules/shadow/repository/shadow-run.repository";

export class CompositeShadowRunRepository implements ShadowRunRepository {
  constructor(private readonly delegates: ShadowRunRepository[]) {}

  async save(run: ShadowRun): Promise<void> {
    await Promise.all(this.delegates.map((repo) => repo.save(run)));
  }

  async getById(id: string): Promise<ShadowRun | null> {
    for (const repo of this.delegates) {
      const item = await repo.getById(id);
      if (item) return item;
    }
    return null;
  }

  async list(limit = 100): Promise<ShadowRun[]> {
    const [primary] = this.delegates;
    return primary ? primary.list(limit) : [];
  }
}
