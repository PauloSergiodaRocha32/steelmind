import {
  GESTIO_DATA_REQUIREMENTS,
  GESTIO_TEAMS,
  getRequirementsForTeam,
  summarizeGestioAudit,
} from "./registry";
import type {
  GestioDepartmentAnswer,
  GestioDepartmentQuestion,
  GestioTeamDefinition,
  GestioTeamId,
} from "./types";

const TEAM_PATTERNS: Array<{ team: GestioTeamId; patterns: RegExp[] }> = [
  {
    team: "workforce",
    patterns: [
      /funcion[aá]rio|sal[aá]rio|f[eé]rias|benef[ií]cio|encargo/i,
      /custo\s*hora|serralheiro|soldador|produtividade/i,
    ],
  },
  {
    team: "materials",
    patterns: [
      /material|tubo|chapa|perfil|peso|estoque|categoria/i,
      /alum[ií]nio|inox|a[cç]o|acm/i,
    ],
  },
  {
    team: "purchasing",
    patterns: [/compra|fornecedor|lead\s*time|prazo|hist[oó]rico/i],
  },
  {
    team: "production",
    patterns: [/produ[cç][aã]o|m[aá]quina|setor|capacidade|tempo\s*padr[aã]o/i],
  },
  {
    team: "finance",
    patterns: [/financeiro|imposto|markup|despesa|custo\s*fixo|centro\s*de\s*custo/i],
  },
  {
    team: "crm",
    patterns: [/cliente|obra|contrato|crm|hist[oó]rico\s+do\s+cliente/i],
  },
  {
    team: "engineering-knowledge",
    patterns: [/norma|abnt|f[oó]rmula|c[aá]lculo|regra\s+t[eé]cnica/i],
  },
];

export function routeGestioQuestion(question: string): GestioTeamDefinition {
  const normalized = question.trim();

  for (const route of TEAM_PATTERNS) {
    if (route.patterns.some((pattern) => pattern.test(normalized))) {
      return GESTIO_TEAMS[route.team];
    }
  }

  return GESTIO_TEAMS.materials;
}

export function askGestioDepartment(
  input: GestioDepartmentQuestion,
): GestioDepartmentAnswer {
  const team = input.preferredTeam
    ? GESTIO_TEAMS[input.preferredTeam]
    : routeGestioQuestion(input.question);
  const readiness = getRequirementsForTeam(team.id);
  const missingInformation = readiness
    .filter((item) => item.existsInGestio !== "yes")
    .map((item) => `${item.information}: ${item.gap}`);
  const providerPaths = Array.from(
    new Set([...team.providerPaths, ...readiness.map((item) => item.providerPath)]),
  );

  return {
    department: "gestio",
    team,
    question: input.question,
    confidence: confidenceFor(readiness),
    answer: buildAnswer(team, input.question, readiness),
    providerPaths,
    knowledgePaths: team.knowledgePaths,
    readiness,
    missingInformation,
    nextActions: buildNextActions(readiness),
  };
}

export function getGestioDepartmentAudit() {
  return {
    teams: Object.values(GESTIO_TEAMS),
    matrix: GESTIO_DATA_REQUIREMENTS,
    summary: summarizeGestioAudit(),
  };
}

function confidenceFor(
  readiness: GestioDepartmentAnswer["readiness"],
): GestioDepartmentAnswer["confidence"] {
  const required = readiness.filter((item) => item.required === "required");
  if (required.every((item) => item.existsInGestio === "yes")) return "high";
  if (required.every((item) => item.existsInGestio !== "unknown")) return "medium";
  return "low";
}

function buildAnswer(
  team: GestioTeamDefinition,
  question: string,
  readiness: GestioDepartmentAnswer["readiness"],
): string {
  const ready = readiness.filter((item) => item.existsInGestio === "yes");
  const gaps = readiness.filter((item) => item.existsInGestio !== "yes");

  return [
    `${team.name} is responsible for: ${team.responsibility}`,
    `Question: ${question}`,
    `Ready data: ${ready.map((item) => item.information).join(", ") || "none"}.`,
    `Gaps: ${gaps.map((item) => item.information).join(", ") || "none"}.`,
  ].join(" ");
}

function buildNextActions(
  readiness: GestioDepartmentAnswer["readiness"],
): string[] {
  return readiness
    .filter((item) => item.existsInGestio !== "yes" || item.gap.includes("Implement"))
    .map((item) => `${item.information}: ${item.gap}`);
}
