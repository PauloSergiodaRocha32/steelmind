import type { ShadowRun } from "@/modules/shadow/domain/entities/shadow-run";

export interface ShadowRunRepository {
  save(run: ShadowRun): Promise<void>;
  getById(id: string): Promise<ShadowRun | null>;
  list(limit?: number): Promise<ShadowRun[]>;
}
