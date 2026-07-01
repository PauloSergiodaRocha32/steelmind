export const CORE_AGENT_IDS = ["orchestrator", "guardian", "steel-memory"] as const;
export const SPECIALIST_AGENT_IDS = [
  "engineering",
  "budget",
  "commercial",
  "production",
  "procurement",
  "knowledge",
] as const;
export const INFRA_AGENT_IDS = ["qa", "devops", "architect", "security"] as const;

export type CoreAgentId = (typeof CORE_AGENT_IDS)[number];
export type SpecialistAgentId = (typeof SPECIALIST_AGENT_IDS)[number];
export type InfraAgentId = (typeof INFRA_AGENT_IDS)[number];
export type CouncilAgentId = CoreAgentId | SpecialistAgentId | InfraAgentId;
export type CouncilTarget = CouncilAgentId | "ai-council";

export const ACTION_TYPES = [
  "analyze",
  "recommend",
  "execute",
  "escalate",
  "clarify",
  "record_lesson",
] as const;
export const ACTION_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "blocked",
  "cancelled",
] as const;
export const ACTION_PRIORITIES = ["low", "normal", "high", "critical"] as const;

export type ActionType = (typeof ACTION_TYPES)[number];
export type ActionStatus = (typeof ACTION_STATUSES)[number];
export type ActionPriority = (typeof ACTION_PRIORITIES)[number];

export interface Action {
  id: string;
  type: ActionType;
  description: string;
  owner: CouncilAgentId;
  status: ActionStatus;
  priority: ActionPriority;
  metadata?: Record<string, unknown>;
}

export const DECISION_REFERENCE_KINDS = [
  "constitution",
  "adr",
  "rule",
  "memory",
  "metric",
  "ticket",
  "code",
] as const;

export type DecisionReferenceKind = (typeof DECISION_REFERENCE_KINDS)[number];

export interface DecisionReference {
  kind: DecisionReferenceKind;
  ref: string;
  note?: string;
}

export const DECISION_OUTCOMES = [
  "approved",
  "refused",
  "needs_input",
  "delegated",
  "failed",
] as const;
export type DecisionOutcome = (typeof DECISION_OUTCOMES)[number];

export interface DecisionTraceEntry {
  decidedBy: CouncilAgentId;
  rationale: string;
  references: DecisionReference[];
  confidence: number;
  decidedAt: string;
  outcome: DecisionOutcome;
}

export interface FinalDecision {
  outcome: DecisionOutcome;
  decidedBy: CouncilAgentId;
  rationale: string;
  confidence: number;
}

export interface DecisionTrace {
  traceId: string;
  entries: DecisionTraceEntry[];
  finalDecision: FinalDecision;
  assembledAt: string;
}
export const EXECUTION_ENVIRONMENTS = ["local", "ci", "production"] as const;
export type ExecutionEnvironment = (typeof EXECUTION_ENVIRONMENTS)[number];

export interface ExecutionContext {
  environment: ExecutionEnvironment;
  triggeredBy: string;
  sourceRoute: string;
  correlationSource?: string;
  metadata?: Record<string, unknown>;
}

export const DECISION_CLASSES = ["A", "B", "C"] as const;
export type DecisionClass = (typeof DECISION_CLASSES)[number];

export interface DecisionContext {
  decisionClass: DecisionClass;
  requiresGuardian: boolean;
  minimumConfidence: number;
  constraints: string[];
  references: DecisionReference[];
}

export interface AgentRequestContext {
  constraints: string[];
  references: DecisionReference[];
  proposedChanges: string[];
  execution: ExecutionContext;
  decision: DecisionContext;
  payload?: Record<string, unknown>;
}

export interface AgentRequest {
  requestId: string;
  correlationId: string;
  requestedAt: string;
  requestedBy: string;
  target: CouncilTarget;
  capability: string;
  prompt: string;
  context: AgentRequestContext;
  actions: Action[];
}

export interface AgentResponse {
  requestId: string;
  responder: CouncilAgentId;
  status: DecisionOutcome;
  summary: string;
  actions: Action[];
  decisionTrace: DecisionTrace;
  executionContext?: ExecutionContext;
  decisionContext?: DecisionContext;
  createdAt: string;
  refusalReason?: string;
  payload?: Record<string, unknown>;
}

export interface NormalizeRequestOptions {
  now?: () => string;
  idGenerator?: () => string;
}

export interface AgentRequestInput {
  requestId?: string;
  correlationId?: string;
  requestedAt?: string;
  requestedBy: string;
  target?: CouncilTarget;
  capability: string;
  prompt: string;
  execution?: Partial<ExecutionContext>;
  decision?: Partial<DecisionContext>;
  context?: Partial<AgentRequestContext>;
  actions?: Array<Partial<Action> & Pick<Action, "type" | "description" | "owner">>;
}

const DEFAULT_TARGET: CouncilTarget = "ai-council";
const DEFAULT_ACTION_STATUS: ActionStatus = "pending";
const DEFAULT_ACTION_PRIORITY: ActionPriority = "normal";
const DEFAULT_EXECUTION_ENVIRONMENT: ExecutionEnvironment = "local";
const DEFAULT_DECISION_CLASS: DecisionClass = "C";

function fallbackId(): string {
  return crypto.randomUUID();
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeList(values: string[] | undefined): string[] {
  if (!values?.length) return [];
  const normalized = values.map((value) => normalizeText(value)).filter(Boolean);
  return [...new Set(normalized)];
}

function normalizeConfidence(confidence: number): number {
  if (Number.isNaN(confidence)) return 0;
  return Math.min(1, Math.max(0, confidence));
}

function normalizeReferences(references: DecisionReference[] | undefined): DecisionReference[] {
  if (!references?.length) return [];
  return references
    .map((item) => ({
      kind: item.kind,
      ref: normalizeText(item.ref),
      note: item.note ? normalizeText(item.note) : undefined,
    }))
    .filter((item) => item.ref.length > 0);
}

function normalizeAction(
  action: Partial<Action> & Pick<Action, "type" | "description" | "owner">,
  idGenerator: () => string,
): Action {
  return {
    id: action.id ?? idGenerator(),
    type: action.type,
    description: normalizeText(action.description),
    owner: action.owner,
    status: action.status ?? DEFAULT_ACTION_STATUS,
    priority: action.priority ?? DEFAULT_ACTION_PRIORITY,
    metadata: action.metadata,
  };
}

function normalizeExecutionContext(
  requestId: string,
  capability: string,
  input?: Partial<ExecutionContext>,
): ExecutionContext {
  return {
    environment: input?.environment ?? DEFAULT_EXECUTION_ENVIRONMENT,
    triggeredBy: normalizeText(input?.triggeredBy ?? "system"),
    sourceRoute: normalizeText(input?.sourceRoute ?? `runtime/${capability}`),
    correlationSource: input?.correlationSource
      ? normalizeText(input.correlationSource)
      : undefined,
    metadata: { requestId, ...(input?.metadata ?? {}) },
  };
}

function normalizeDecisionContext(
  references: DecisionReference[],
  constraints: string[],
  input?: Partial<DecisionContext>,
): DecisionContext {
  return {
    decisionClass: input?.decisionClass ?? DEFAULT_DECISION_CLASS,
    requiresGuardian: input?.requiresGuardian ?? true,
    minimumConfidence: normalizeConfidence(input?.minimumConfidence ?? 0.7),
    constraints,
    references: normalizeReferences(input?.references ?? references),
  };
}

export function normalizeAgentRequest(
  input: AgentRequestInput,
  options: NormalizeRequestOptions = {},
): AgentRequest {
  const now = options.now ?? (() => new Date().toISOString());
  const idGenerator = options.idGenerator ?? fallbackId;
  const requestId = input.requestId ?? idGenerator();
  const constraints = normalizeList(input.context?.constraints);
  const references = normalizeReferences(input.context?.references);
  const capability = normalizeText(input.capability);

  return {
    requestId,
    correlationId: input.correlationId ?? requestId,
    requestedAt: input.requestedAt ?? now(),
    requestedBy: normalizeText(input.requestedBy),
    target: input.target ?? DEFAULT_TARGET,
    capability,
    prompt: normalizeText(input.prompt),
    context: {
      constraints,
      references,
      proposedChanges: normalizeList(input.context?.proposedChanges),
      execution: normalizeExecutionContext(requestId, capability, {
        ...input.context?.execution,
        ...input.execution,
      }),
      decision: normalizeDecisionContext(references, constraints, {
        ...input.context?.decision,
        ...input.decision,
      }),
      payload: input.context?.payload,
    },
    actions: (input.actions ?? []).map((action) => normalizeAction(action, idGenerator)),
  };
}

export function createDecisionTraceEntry(
  entry: Omit<DecisionTraceEntry, "confidence"> & { confidence: number },
): DecisionTraceEntry {
  return {
    ...entry,
    confidence: normalizeConfidence(entry.confidence),
  };
}

export const COUNCIL_FLOW_STAGES = [
  "architect",
  "engineering",
  "qa",
  "guardian",
  "merge",
] as const;
export type CouncilFlowStage = (typeof COUNCIL_FLOW_STAGES)[number];

export interface SteelMemoryDecisionLogPayload {
  logVersion: "1.0";
  requestId: string;
  correlationId: string;
  flowStage: CouncilFlowStage;
  decidedBy: CouncilAgentId;
  outcome: DecisionOutcome;
  rationale: string;
  references: DecisionReference[];
  confidence: number;
  timestamp: string;
  actions: Action[];
  metadata?: Record<string, unknown>;
}

export interface BuildDecisionLogPayloadInput {
  request: AgentRequest;
  response: AgentResponse;
  flowStage: CouncilFlowStage;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export function buildDecisionLogPayload(
  input: BuildDecisionLogPayloadInput,
): SteelMemoryDecisionLogPayload {
  const finalDecision = input.response.decisionTrace.finalDecision;

  return {
    logVersion: "1.0",
    requestId: input.request.requestId,
    correlationId: input.request.correlationId,
    flowStage: input.flowStage,
    decidedBy: finalDecision.decidedBy,
    outcome: finalDecision.outcome,
    rationale: finalDecision.rationale,
    references: input.response.decisionTrace.entries.flatMap((entry) => entry.references),
    confidence: normalizeConfidence(finalDecision.confidence),
    timestamp: input.timestamp ?? input.response.createdAt,
    actions: input.response.actions,
    metadata: input.metadata,
  };
}

export const CTO_HEALTH_STATUSES = ["healthy", "warning", "critical"] as const;
export const CTO_TREND_DIRECTIONS = ["up", "down", "flat"] as const;
export const CTO_PRIORITY_EFFORT = ["low", "medium", "high"] as const;
export const CTO_PRIORITY_IMPACT = ["low", "medium", "high", "critical"] as const;

export type CtoHealthStatus = (typeof CTO_HEALTH_STATUSES)[number];
export type CtoTrendDirection = (typeof CTO_TREND_DIRECTIONS)[number];
export type CtoPriorityEffort = (typeof CTO_PRIORITY_EFFORT)[number];
export type CtoPriorityImpact = (typeof CTO_PRIORITY_IMPACT)[number];

export interface CtoGrade {
  score: number;
  grade: string;
  rationale: string;
}

export interface CtoTestCoverageSnapshot {
  lineCoverage: number;
  branchCoverage: number;
  status: CtoHealthStatus;
}

export interface CtoTechnicalDebtSnapshot {
  openItems: number;
  trend: CtoTrendDirection;
  hotspots: string[];
}

export interface CtoDuplicationSnapshot {
  duplicatedBlocks: number;
  hotspots: string[];
}

export interface CtoPerformanceSnapshot {
  p95LatencyMs: number;
  buildTimeMinutes: number;
  regressionDetected: boolean;
}

export interface CtoStandardsHealthSnapshot {
  violations: number;
  status: CtoHealthStatus;
  driftAreas: string[];
}

export interface CtoRiskEntry {
  id: string;
  level: CtoPriorityImpact;
  area: string;
  description: string;
  mitigation: string;
  references: DecisionReference[];
}

export interface CtoPriorityRecommendation {
  id: string;
  title: string;
  priorityRank: number;
  impact: CtoPriorityImpact;
  effort: CtoPriorityEffort;
  owner: CouncilTarget;
  rationale: string;
}

export interface CtoAgentHealthReport {
  reportId: string;
  generatedAt: string;
  generatedBy: "cto-agent";
  periodStart: string;
  periodEnd: string;
  architectureGrade: CtoGrade;
  qualityGrade: CtoGrade;
  testCoverage: CtoTestCoverageSnapshot;
  technicalDebt: CtoTechnicalDebtSnapshot;
  duplication: CtoDuplicationSnapshot;
  performance: CtoPerformanceSnapshot;
  standardsHealth: CtoStandardsHealthSnapshot;
  risks: CtoRiskEntry[];
  recommendedPriorities: CtoPriorityRecommendation[];
  executiveSummary: string;
  references: DecisionReference[];
}

export interface CtoAgentHealthReportInput {
  reportId?: string;
  generatedAt?: string;
  periodStart: string;
  periodEnd: string;
  architectureGrade: CtoGrade;
  qualityGrade: CtoGrade;
  testCoverage: Omit<CtoTestCoverageSnapshot, "status"> & { status?: CtoHealthStatus };
  technicalDebt: CtoTechnicalDebtSnapshot;
  duplication: CtoDuplicationSnapshot;
  performance: CtoPerformanceSnapshot;
  standardsHealth: CtoStandardsHealthSnapshot;
  risks: CtoRiskEntry[];
  recommendedPriorities: CtoPriorityRecommendation[];
  executiveSummary: string;
  references?: DecisionReference[];
}

function normalizePercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}

function normalizeNonNegative(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Number(value.toFixed(2)));
}

function normalizeGrade(grade: CtoGrade): CtoGrade {
  return {
    score: normalizePercent(grade.score),
    grade: normalizeText(grade.grade),
    rationale: normalizeText(grade.rationale),
  };
}

function normalizeStringArray(values: string[]): string[] {
  return [...new Set(values.map((item) => normalizeText(item)).filter(Boolean))];
}

export function normalizeCtoAgentHealthReport(
  input: CtoAgentHealthReportInput,
  options: NormalizeRequestOptions = {},
): CtoAgentHealthReport {
  const now = options.now ?? (() => new Date().toISOString());
  const idGenerator = options.idGenerator ?? fallbackId;

  return {
    reportId: input.reportId ?? idGenerator(),
    generatedAt: input.generatedAt ?? now(),
    generatedBy: "cto-agent",
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    architectureGrade: normalizeGrade(input.architectureGrade),
    qualityGrade: normalizeGrade(input.qualityGrade),
    testCoverage: {
      lineCoverage: normalizePercent(input.testCoverage.lineCoverage),
      branchCoverage: normalizePercent(input.testCoverage.branchCoverage),
      status: input.testCoverage.status ?? "warning",
    },
    technicalDebt: {
      openItems: Math.max(0, Math.round(input.technicalDebt.openItems)),
      trend: input.technicalDebt.trend,
      hotspots: normalizeStringArray(input.technicalDebt.hotspots),
    },
    duplication: {
      duplicatedBlocks: Math.max(0, Math.round(input.duplication.duplicatedBlocks)),
      hotspots: normalizeStringArray(input.duplication.hotspots),
    },
    performance: {
      p95LatencyMs: normalizeNonNegative(input.performance.p95LatencyMs),
      buildTimeMinutes: normalizeNonNegative(input.performance.buildTimeMinutes),
      regressionDetected: input.performance.regressionDetected,
    },
    standardsHealth: {
      violations: Math.max(0, Math.round(input.standardsHealth.violations)),
      status: input.standardsHealth.status,
      driftAreas: normalizeStringArray(input.standardsHealth.driftAreas),
    },
    risks: input.risks.map((risk) => ({
      ...risk,
      area: normalizeText(risk.area),
      description: normalizeText(risk.description),
      mitigation: normalizeText(risk.mitigation),
      references: normalizeReferences(risk.references),
    })),
    recommendedPriorities: input.recommendedPriorities
      .map((item) => ({
        ...item,
        title: normalizeText(item.title),
        rationale: normalizeText(item.rationale),
        priorityRank: Math.max(1, Math.round(item.priorityRank)),
      }))
      .sort((a, b) => a.priorityRank - b.priorityRank),
    executiveSummary: normalizeText(input.executiveSummary),
    references: normalizeReferences(input.references),
  };
}

