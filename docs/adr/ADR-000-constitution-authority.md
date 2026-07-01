# ADR-000: Constitution as Supreme Authority

- Status: **Accepted**
- Date: 2026-07-01
- Decision Makers: SteelMind Architecture Council

## Context

The project requires a stable governance layer to prevent short-term trade-offs from compromising the long-term mission.

## Decision

`docs/CONSTITUTION.md` is the supreme authority for architecture and product-engineering decisions.

All significant technical changes must align with constitutional principles.

## Consequences

### Positive

- Consistent long-term direction
- Better technical coherence across teams and agents
- Clear escalation path for conflicting decisions

### Negative

- Additional documentation overhead
- More explicit justification required for implementation changes

## Migration / Adoption

- Add constitutional checks to architecture reviews
- Reference this ADR in future structural ADRs
