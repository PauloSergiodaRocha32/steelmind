import { resolve } from "node:path";
import { FileCalibrationCaseRepository } from "@/modules/calibration/infrastructure/file-calibration-case.repository";
import { SupabaseCalibrationCaseRepository } from "@/modules/calibration/infrastructure/supabase-calibration-case.repository";
import { getSupabaseInfraClient } from "@/lib/persistence/supabase-client";
import type { CalibrationCaseRepository } from "@/modules/calibration/repository/calibration-case.repository";

class CompositeCalibrationCaseRepository implements CalibrationCaseRepository {
  constructor(private readonly delegates: CalibrationCaseRepository[]) {}

  async save(calibrationCase: Parameters<CalibrationCaseRepository["save"]>[0]): Promise<void> {
    await Promise.all(this.delegates.map((repo) => repo.save(calibrationCase)));
  }

  async getById(id: string) {
    for (const repo of this.delegates) {
      const item = await repo.getById(id);
      if (item) return item;
    }
    return null;
  }

  async list(filters?: Parameters<CalibrationCaseRepository["list"]>[0]) {
    const [primary] = this.delegates;
    return primary ? primary.list(filters) : [];
  }
}

export function getDefaultCalibrationCaseRepository(): CalibrationCaseRepository {
  const fileRepo = new FileCalibrationCaseRepository(
    resolve(process.cwd(), "data/steelmind/calibration/cases.json"),
  );

  if (!getSupabaseInfraClient()) return fileRepo;
  return new CompositeCalibrationCaseRepository([
    new SupabaseCalibrationCaseRepository(),
    fileRepo,
  ]);
}
