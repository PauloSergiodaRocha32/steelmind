import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { CalibrationCase } from "@/modules/calibration/domain/entities/calibration-case";
import type { CalibrationCaseRepository } from "@/modules/calibration/repository/calibration-case.repository";

async function ensureDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

async function readCases(filePath: string): Promise<CalibrationCase[]> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as CalibrationCase[];
  } catch {
    return [];
  }
}

export class FileCalibrationCaseRepository implements CalibrationCaseRepository {
  constructor(private readonly filePath: string) {}

  async save(calibrationCase: CalibrationCase): Promise<void> {
    await ensureDir(this.filePath);
    const items = await readCases(this.filePath);
    const next = [
      calibrationCase,
      ...items.filter((item) => item.id !== calibrationCase.id),
    ];
    await writeFile(this.filePath, JSON.stringify(next, null, 2), "utf-8");
  }

  async getById(id: string): Promise<CalibrationCase | null> {
    const items = await readCases(this.filePath);
    return items.find((item) => item.id === id) ?? null;
  }

  async list(filters?: {
    status?: CalibrationCase["status"];
    categoria?: string;
    engineVersion?: string;
  }): Promise<CalibrationCase[]> {
    const items = await readCases(this.filePath);
    return items.filter((item) => {
      if (filters?.status && item.status !== filters.status) return false;
      if (filters?.categoria && item.categoria !== filters.categoria) return false;
      if (filters?.engineVersion && item.engineVersion !== filters.engineVersion) {
        return false;
      }
      return true;
    });
  }
}
