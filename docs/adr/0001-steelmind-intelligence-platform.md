# ADR 0001 — SteelMind Intelligence Platform (SIP)

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Product / Architecture  

## Context

Foundation MVP established Runtime scaffolding, Gest.io integration (`services/gestio/`), warehouse module, auth, and platform documentation. The project is ready to shift from building features to building **infrastructure** that enables knowledge-driven development.

## Decision

Adopt **SteelMind Intelligence Platform (SIP)** as the official post-Foundation phase, organized in four pillars:

1. **Runtime** — user-facing application (existing `app/`, `modules/`)
2. **Data Platform** — `providers/` for Gest.io and company data (read-only delivery)
3. **Knowledge Platform** — `knowledge/` for versioned technical truth
4. **Builder** — agent orchestration for constructing and evolving the codebase

SIP deliverables:

- Data Platform via `providers/`
- Knowledge Platform via `knowledge/`
- Agent Platform via `agents/`

## Consequences

### Positive

- Clear separation: data delivery vs. technical knowledge vs. UI
- Agents and humans share the same source of truth
- Engineering and business questions become answerable from documented knowledge
- Gest.io coupling isolated to providers

### Negative / trade-offs

- Short-term duplication: `services/gestio/` coexists with `providers/gestio/` during migration
- Documentation overhead before visible user features
- Agent platform requires governance to avoid unreviewed changes

### Migration

- `services/gestio/` → `providers/gestio/` in SIP-1 (re-export for backward compatibility)
- `app/knowledge/` and `app/ai/` become Runtime views over Knowledge and Agent platforms
- ROADMAP updated: Foundation complete; SIP-0 current

## References

- [docs/SIP.md](../SIP.md)
- [docs/ROADMAP.md](../ROADMAP.md)
