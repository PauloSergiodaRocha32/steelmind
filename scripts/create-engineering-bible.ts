import fs from "node:fs";
import path from "node:path";

const ROOT = "STEELMIND_ENGINEERING_BIBLE";

const tree: Record<string, string[]> = {
  "00-Foundation": [
    "00-README.md",
    "01-Mission.md",
    "02-Vision.md",
    "03-Manifesto.md",
    "04-Constitution.md",
    "05-CorePrinciples.md",
    "06-Glossary.md",
    "07-BibleQualityReview.md",
  ],

  "01-Product": [
    "PRD.md",
    "Roadmap.md",
    "Modules.md",
    "Personas.md",
    "UserFlows.md",
    "BusinessRules.md",
  ],

  "02-Architecture": [
    "Overview.md",
    "DDD.md",
    "CleanArchitecture.md",
    "Modules.md",
    "Repositories.md",
    "Providers.md",
    "ACL.md",
    "Events.md",
    "RuleEngine.md",
    "KnowledgeBase.md",
    "ShadowMode.md",
    "Calibration.md",
    "Benchmark.md",
    "Observability.md",
  ],

  "03-Frontend": [
    "DesignSystem.md",
    "Colors.md",
    "Typography.md",
    "Spacing.md",
    "Components.md",
    "Navigation.md",
    "Accessibility.md",
    "Motion.md",
  ],

  "04-Backend": [
    "API.md",
    "Authentication.md",
    "Authorization.md",
    "Database.md",
    "Caching.md",
    "Queues.md",
    "Performance.md",
  ],

  "05-Engineering": [
    "CodingStandard.md",
    "Testing.md",
    "Security.md",
    "Performance.md",
    "DevOps.md",
    "CI-CD.md",
    "ReleaseProcess.md",
    "ArchitectureDecisionRecords.md",
  ],

  "06-Domains": [
    "GuardaCorpo.md",
    "Escadas.md",
    "Pergolados.md",
    "EstruturasMetalicas.md",
    "Mezaninos.md",
    "Coberturas.md",
    "Portoes.md",
    "Corrimaos.md",
    "Fachadas.md",
  ],

  "07-Knowledge": [
    "ABNT.md",
    "Catalogos.md",
    "Materiais.md",
    "Consumiveis.md",
    "Soldagem.md",
    "Pintura.md",
    "Galvanizacao.md",
    "Logistica.md",
  ],

  "08-AI": [
    "AIConstitution.md",
    "PromptStandards.md",
    "Agents.md",
    "Validation.md",
    "Reasoning.md",
    "Guardrails.md",
  ],

  "09-Templates": [
    "ADR.md",
    "RFC.md",
    "Feature.md",
    "Bugfix.md",
    "Release.md",
    "Benchmark.md",
  ],

  "10-Playbooks": [
    "NewFeature.md",
    "Refactor.md",
    "Migration.md",
    "Incident.md",
    "ProductionIssue.md",
  ],

  "11-ADRs": [
    "README.md",
    "TEMPLATE.md",
    "ADR-000-Constituicao-v1.md",
    "ADR-001-Arquitetura-Modular.md",
    "ADR-002-Clean-Architecture.md",
    "ADR-003-Shadow-Mode.md",
    "ADR-004-ACL-Gestio.md",
    "ADR-005-Knowledge-Base-Rule-Engine.md",
    "ADR-006-Bible-Navegavel.md",
    "CatalogoDecisoes.md",
    "Accepted.md",
    "Proposed.md",
    "Deprecated.md",
    "Superseded.md",
  ],

  "12-Roadmap": [
    "README.md",
    "MasterRoadmap.md",
    "QuarterlyPlan.md",
    "Milestones.md",
    "Dependencies.md",
    "RiskRegister.md",
    "Timeline.md",
    "TechDebtCatalog.md",
  ],

  "13-Research": [
    "README.md",
    "NormasABNT.md",
    "CatalogosFabricantes.md",
    "EngenhariaEstruturasMetalicas.md",
    "Orcamentacao.md",
    "IAAplicadaEngenharia.md",
    "BenchmarkSoftwaresMercado.md",
    "TendenciasTecnologicas.md",
    "NormasXFuncionalidades.md",
  ],
};

function ensure(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensure(ROOT);

for (const [folder, files] of Object.entries(tree)) {
  const folderPath = path.join(ROOT, folder);
  ensure(folderPath);

  for (const file of files) {
    const full = path.join(folderPath, file);
    if (fs.existsSync(full)) continue;

    const title = file.replace(".md", "");

    fs.writeFileSync(
      full,
      `# ${title}

## Objetivo

TODO

---

## Contexto

TODO

---

## Regras

TODO

---

## Arquitetura

TODO

---

## Exemplos

TODO

---

## Referencias

TODO
`,
    );
  }
}

console.log("Engineering Bible criada com sucesso.");
