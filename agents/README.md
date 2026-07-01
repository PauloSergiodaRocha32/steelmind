# Agent Platform

Specialized agents that compose **providers** (data) and **knowledge** (rules) to build and evolve SteelMind.

## Contract

1. Each agent has a charter in `knowledge/agents/<name>.md`
2. Agents declare allowed `providers/` and `knowledge/` paths
3. Code changes flow through Git PRs — humans review and merge
4. Agents do not bypass provider or knowledge boundaries

## Agents

| Agent | Primary responsibility |
|-------|---------------------|
| `engineering/` | Calculations, specs, technical modules |
| `budget/` | Cost impact, variance, budget rules |
| `materials/` | Material selection, compatibility |
| `workforce/` | Labor rates, productivity, crew planning |
| `gestio/` | ERP data alignment, field mapping |
| `production/` | PCP, routing, shop floor logic |
| `qa/` | Tests, regression, acceptance criteria |
| `architecture/` | Boundaries, ADRs, structure |
| `release/` | Versioning, changelog, tags |
| `documentation/` | Docs, knowledge articles, PR descriptions |
| `knowledge/` | Curate and version knowledge tree |
| `product/` | Scope, personas, feature intent |
| `planning/` | Roadmap, sequencing, dependencies |

## Orchestrator (future)

Routes user intent to the agent chain. Example golden path: facade ACM calculation → Engineering → Knowledge → Providers → Builder → QA → Documentation → PR.

See [docs/SIP.md](../docs/SIP.md).
