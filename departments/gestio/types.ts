export type GestioTeamId =
  | "workforce"
  | "materials"
  | "purchasing"
  | "production"
  | "finance"
  | "crm"
  | "engineering-knowledge";

export type DataAvailability = "yes" | "partial" | "no" | "unknown";

export type DataRequirementLevel = "required" | "ideal" | "optional";

export type SystemOfRecord = "gestio" | "steelmind";

export interface GestioTeamDefinition {
  id: GestioTeamId;
  name: string;
  responsibility: string;
  questionExamples: string[];
  providerPaths: string[];
  knowledgePaths: string[];
}

export interface GestioDataRequirement {
  information: string;
  existsInGestio: DataAvailability;
  required: DataRequirementLevel;
  responsibleTeam: GestioTeamId;
  systemOfRecord: SystemOfRecord;
  providerPath: string;
  gap: string;
}

export interface GestioAuditSummary {
  total: number;
  byAvailability: Record<DataAvailability, number>;
  byTeam: Record<GestioTeamId, number>;
  requiredGaps: GestioDataRequirement[];
}

export interface GestioDepartmentQuestion {
  question: string;
  preferredTeam?: GestioTeamId;
}

export interface GestioDepartmentAnswer {
  department: "gestio";
  team: GestioTeamDefinition;
  question: string;
  confidence: "high" | "medium" | "low";
  answer: string;
  providerPaths: string[];
  knowledgePaths: string[];
  readiness: GestioDataRequirement[];
  missingInformation: string[];
  nextActions: string[];
}
