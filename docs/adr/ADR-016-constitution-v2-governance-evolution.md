# ADR-016: Constitution v2 Governance Evolution

- Status: **Accepted**
- Date: 2026-07-01
- Decision Makers: SteelMind Architecture Council

## Context

Constitution v1 established supreme authority, but enterprise operation now requires explicit law-level governance for:

- principle hierarchy and conflict resolution
- hard prohibitions for AI agents
- mandatory AI Council gate flow
- consistent Steel Memory decision logging payload

Without this evolution, governance remained conceptually correct but operationally inconsistent across workflows.

## Decision

Adopt `CONSTITUTION_V2.md` as the active governance evolution while preserving `CONSTITUTION.md` as historical baseline.

Constitution v2 introduces:

1. strict principle hierarchy (Safety -> Correctness -> Traceability -> Engineering Integrity -> Simplicity)
2. hard prohibitions (no business-rule mutation without ADR, no unversioned contract breaks, no test removal, no fabricated engineering data, no norm violations, mandatory confidence disclosure)
3. mandatory AI Council gate order for high-impact decisions:
   - Architect -> Engineering -> QA -> Guardian -> Merge
4. mandatory Steel Memory decision log payload requirements

## Alternatives considered

1. Keep v1 only and encode details in ADRs  
   Rejected: governance remained fragmented and less discoverable.

2. Replace v1 entirely  
   Rejected: would lose historical traceability and break governance continuity.

## Consequences

### Positive

- Governance becomes enforceable in daily operations
- Easier audits and incident analysis due to standardized decision logs
- Stronger protection against unsafe or ungrounded AI decisions

### Negative

- More process rigor for high-impact changes
- Additional maintenance of governance docs and policy checks

## Migration / Adoption

1. Keep `CONSTITUTION.md` unchanged as historical source
2. Cross-link v2 in Masterplan, Architecture, and ADR index
3. Enforce v2 clauses in Guardian policy and orchestration contracts
4. Require ADR for any future constitutional or contract-breaking update
