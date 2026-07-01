import type { CalibrationCase } from "@/modules/calibration/domain/entities/calibration-case";

export interface CalibrationCaseRepository {
  save(calibrationCase: CalibrationCase): Promise<void>;
  getById(id: string): Promise<CalibrationCase | null>;
  list(filters?: {
    status?: CalibrationCase["status"];
    categoria?: string;
    engineVersion?: string;
  }): Promise<CalibrationCase[]>;
}
