import {
  createDecisionTraceEntry,
  type AgentRequest,
  type DecisionReference,
  type DecisionTraceEntry,
} from "@/lib/ai/steelmind-os/protocol";

export const PROTECTED_PATH_PREFIXES = [
  "features/budget/engine/",
  "features/rules/",
  "features/budget/engine/pricing/",
] as const;

export const GUARDIAN_VIOLATION_CODES = [
  "INVALID_REQUEST",
  "MISSING_GOVERNANCE_REFERENCES",
  "PROTECTED_PATH_WRITE",
  "BYPASS_ATTEMPT",
  "LOW_CONFIDENCE",
  "INTEGRITY_FAILURE",
  "BUSINESS_CONSTRAINT_VIOLATION",
] as const;

export type GuardianViolationCode = (typeof GUARDIAN_VIOLATION_CODES)[number];

export interface GuardianViolation {
  code: GuardianViolationCode;
  message: string;
  references: DecisionReference[];
}

export interface GuardianDecision {
  allowed: boolean;
  authority: "guardian";
  confidence: number;
  checkedAt: string;
  violations: GuardianViolation[];
}

export interface GuardianRule {
  id: string;
  description: string;
  evaluate(request: AgentRequest): GuardianViolation[];
}

function hasGovernanceReference(request: AgentRequest): boolean {
  return request.context.references.some(
    (item) => item.kind === "constitution" || item.kind === "adr" || item.kind === "rule",
  );
}

function hasProtectedPathWrite(request: AgentRequest): string | null {
  for (const path of request.context.proposedChanges) {
    const normalized = path.toLowerCase().replace(/\\/g, "/");
    const matches = PROTECTED_PATH_PREFIXES.find((prefix) =>
      normalized.startsWith(prefix.toLowerCase()),
    );
    if (matches) return path;
  }
  return null;
}

function hasBypassAttempt(request: AgentRequest): boolean {
  const text = `${request.capability} ${request.prompt}`.toLowerCase();
  return (
    text.includes("ignore constitution") ||
    text.includes("bypass guardian") ||
    text.includes("skip policy") ||
    text.includes("disable guardian")
  );
}

function hasIntegrityFailure(request: AgentRequest): boolean {
  const text = `${request.prompt} ${request.actions.map((action) => action.description).join(" ")}`
    .toLowerCase();

  return (
    text.includes("invent data") ||
    text.includes("fabricate") ||
    text.includes("skip tests") ||
    text.includes("disable lint")
  );
}

function hasBusinessConstraintViolation(request: AgentRequest): boolean {
  const text = `${request.capability} ${request.prompt}`.toLowerCase();
  if (!text.includes("business rule") && !text.includes("formula") && !text.includes("pricing")) {
    return false;
  }

  return !request.context.references.some((item) => item.kind === "adr");
}

export const DEFAULT_GUARDIAN_RULES: GuardianRule[] = [
  {
    id: "guardian.valid-request",
    description: "Request must have requester, capability and prompt",
    evaluate: (request) => {
      if (request.requestedBy && request.capability && request.prompt) return [];
      return [
        {
          code: "INVALID_REQUEST",
          message: "Request missing mandatory fields: requestedBy, capability or prompt.",
          references: [{ kind: "constitution", ref: "CONSTITUTION.md#7-architecture-governance" }],
        },
      ];
    },
  },
  {
    id: "guardian.governance-reference",
    description: "Execute actions require governance references",
    evaluate: (request) => {
      const requiresGovernance =
        request.actions.some((action) => action.type === "execute") ||
        request.capability.toLowerCase().includes("execute");
      if (!requiresGovernance || hasGovernanceReference(request)) return [];
      return [
        {
          code: "MISSING_GOVERNANCE_REFERENCES",
          message: "Execution request missing Constitution/ADR/rule references.",
          references: [{ kind: "constitution", ref: "CONSTITUTION.md#9-enforcement" }],
        },
      ];
    },
  },
  {
    id: "guardian.protected-paths",
    description: "Protected engine/rules paths cannot be changed by council requests",
    evaluate: (request) => {
      const protectedPath = hasProtectedPathWrite(request);
      if (!protectedPath) return [];
      return [
        {
          code: "PROTECTED_PATH_WRITE",
          message: `Protected path detected in request context: ${protectedPath}`,
          references: [{ kind: "rule", ref: "protected-paths" }],
        },
      ];
    },
  },
  {
    id: "guardian.no-bypass",
    description: "Constitution bypass attempts must be refused",
    evaluate: (request) => {
      if (!hasBypassAttempt(request)) return [];
      return [
        {
          code: "BYPASS_ATTEMPT",
          message: "Request attempts to bypass Constitution or Guardian policies.",
          references: [{ kind: "constitution", ref: "CONSTITUTION.md#1-purpose" }],
        },
      ];
    },
  },
  {
    id: "guardian.minimum-confidence",
    description: "Decision context must demand minimum confidence floor",
    evaluate: (request) => {
      if (request.context.decision.minimumConfidence >= 0.6) return [];
      return [
        {
          code: "LOW_CONFIDENCE",
          message: "Decision minimum confidence below Guardian floor (0.6).",
          references: [{ kind: "constitution", ref: "CONSTITUTION_V2.md#7" }],
        },
      ];
    },
  },
  {
    id: "guardian.integrity",
    description: "Integrity violations are refused",
    evaluate: (request) => {
      if (!hasIntegrityFailure(request)) return [];
      return [
        {
          code: "INTEGRITY_FAILURE",
          message: "Request violates integrity constraints (fabricated data or disabled quality checks).",
          references: [{ kind: "constitution", ref: "CONSTITUTION_V2.md#3" }],
        },
      ];
    },
  },
  {
    id: "guardian.business-constraints",
    description: "Business-rule and pricing mutation needs ADR references",
    evaluate: (request) => {
      if (!hasBusinessConstraintViolation(request)) return [];
      return [
        {
          code: "BUSINESS_CONSTRAINT_VIOLATION",
          message: "Business-rule/pricing modification requested without ADR governance reference.",
          references: [{ kind: "adr", ref: "ADR-required-business-rule-change" }],
        },
      ];
    },
  },
];

export function evaluateGuardianPolicies(
  request: AgentRequest,
  options: { now?: () => string; rules?: GuardianRule[] } = {},
): GuardianDecision {
  const now = options.now ?? (() => new Date().toISOString());
  const rules = options.rules ?? DEFAULT_GUARDIAN_RULES;
  const violations = rules.flatMap((rule) => rule.evaluate(request));

  return {
    allowed: violations.length === 0,
    authority: "guardian",
    confidence: violations.length === 0 ? 0.96 : 0.99,
    checkedAt: now(),
    violations,
  };
}

export function buildGuardianTraceEntry(decision: GuardianDecision): DecisionTraceEntry {
  const rationale = decision.allowed
    ? "Request complies with Constitution-bound Guardian policy checks."
    : `Request refused by Guardian (${decision.violations.map((item) => item.code).join(", ")}).`;

  const references = decision.violations.flatMap((item) => item.references);

  return createDecisionTraceEntry({
    decidedBy: "guardian",
    decidedAt: decision.checkedAt,
    outcome: decision.allowed ? "approved" : "refused",
    rationale,
    references,
    confidence: decision.confidence,
  });
}
