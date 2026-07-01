# Knowledge Platform

Versioned technical truth for SteelMind. Every agent and every calculation consults this tree before acting.

## Contract

- Git is the source of truth (Phase 1)
- Documents state scope, owning context, dependencies, and review date
- No live ERP data — use `providers/` for company state
- Calculations reference norms and inputs explicitly

## Domains

| Path | Purpose |
|------|---------|
| `engineering/` | Design rules, structural logic, deliverable standards |
| `materials/` | Material specs, grades, compatibility |
| `gestio/` | Gest.io field mapping and SteelMind concepts |
| `workforce/` | Labor categories, productivity assumptions |
| `budget/` | Cost structures, margin rules, escalation |
| `manufacturing/` | PCP, routing, shop constraints |
| `suppliers/` | Qualification criteria, scoring rules |
| `pricing/` | Pricing models and commercial rules |
| `production/` | Production standards and KPIs |
| `agents/` | Agent charters, capabilities, guardrails |
| `architecture/` | System design, module boundaries |
| `constitution/` | Non-negotiable platform principles |

See [docs/SIP.md](../docs/SIP.md).
