# SteelMind Agent Guide

This repository is governed by the SteelMind Intelligence Platform (SIP).

## Required Reading

1. `docs/SIP.md`
2. `docs/DEPARTMENTS.md`
3. `knowledge/constitution/principles.md`
4. `knowledge/gestio/data-readiness-matrix.md` for Gest.io/data work
5. Relevant `knowledge/<domain>/` articles before implementing rules or calculations

## Operating Model

SteelMind is organized as:

```
CEO
├── Departments
│   └── Teams
│       └── Agents
└── Runtime / Data / Knowledge / Builder pillars
```

Agents execute tasks. Departments own answers.

## Gest.io Department

For company data, ask `departments/gestio` instead of importing Gest.io internals.

Examples:

- "Quanto custa uma hora de serralheiro?" → Workforce Team
- "Quanto custa o tubo 50x30?" → Materials Team
- "Qual fornecedor possui menor prazo?" → Purchasing Team
- "Existe capacidade de produção?" → Production Team

Code:

- `askGestioDepartment()`
- `getGestioDepartmentAudit()`

APIs:

- `POST /api/v1/departments/gestio/ask`
- `GET /api/v1/departments/gestio/audit`

## Boundaries

- `providers/` deliver data only.
- `knowledge/` stores versioned truth and formulas.
- `departments/` route accountability and answer business questions.
- `agents/` orchestrate and implement work.
- `app/` should stay thin.
- `modules/` should not call Gest.io directly.

## PR Rule

Commit atomic changes and open/update a PR. Do not merge to `main` without human review.
