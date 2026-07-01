# ADR-012: Knowledge Platform Information Architecture and Governance

- Status: **Accepted**
- Date: 2026-07-01

## Context

The Engineering Bible has become a strategic asset for architecture, product, domain knowledge, and AI grounding. As content volume grows, static directory indexing is insufficient to preserve discoverability, consistency, and long-term maintainability.

## Decision

Adopt a dedicated Knowledge Platform architecture with:

1. A platform section (`14-Knowledge-Platform`) for navigation and governance assets
2. Structured taxonomy by purpose, audience, and section relationships
3. Auto-generated navigation artifacts:
   - enhanced global and section indexes
   - knowledge inventory
   - quality dashboard
   - mermaid knowledge graph
4. Root wiki entrypoints:
   - `HOME.md`
   - `ContribuindoNaBible.md`

## Alternatives considered

1. Keep only basic indexes  
   Rejected: weak discoverability for cross-functional and AI usage.

2. Use external docs tooling immediately  
   Rejected: early operational overhead and migration complexity.

## Consequences

### Positive

- Faster onboarding and knowledge retrieval
- Better anti-duplication discipline through canonical catalogs
- Sustainable governance model for long-term documentation growth

### Negative

- More documentation automation to maintain
- Requires contribution discipline in every docs-related change

## Migration / Adoption

1. Extend generator and seeding scripts for platform layer
2. Generate indexes and quality artifacts in CI/local workflows
3. Use dashboard priorities to gradually replace placeholders in sections 00-10
