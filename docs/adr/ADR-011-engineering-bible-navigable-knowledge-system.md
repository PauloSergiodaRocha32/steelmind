# ADR-011: Engineering Bible as Navigable Knowledge System

- Status: **Accepted**
- Date: 2026-07-01

## Context

The project documentation has grown into a strategic asset, but it was mostly static and placeholder-driven. Without navigation and quality governance, knowledge discoverability degrades and architecture decisions become disconnected from implementation.

## Decision

Adopt Engineering Bible as an operational knowledge system with:

1. Real content baseline for strategic sections (`11-ADRs`, `12-Roadmap`, `13-Research`)
2. Automatic index generation:
   - global index (`STEELMIND_ENGINEERING_BIBLE/_INDEX.md`)
   - per-section indexes (`*/_INDEX.md`)
3. Standard scripts for docs lifecycle:
   - `npm run bible:init`
   - `npm run bible:seed`
   - `npm run bible:index`
4. Periodic quality review documented in Bible (`00-Foundation/07-BibleQualityReview.md`)

## Alternatives considered

1. Keep manual indexes  
   Rejected: high drift risk and poor scalability.

2. Keep placeholders and defer content work  
   Rejected: weak operational value and low onboarding usability.

## Consequences

### Positive

- Faster onboarding for engineers and AI agents
- Better traceability between ADRs, roadmap, and research
- Reduced risk of orphan documentation

### Negative

- Additional maintenance for documentation scripts
- Requires discipline to run index update in docs-related changes

## Migration / Adoption

1. Seed strategic content in sections 11/12/13
2. Generate indexes and include them in version control
3. Add docs quality review cadence in architecture governance
