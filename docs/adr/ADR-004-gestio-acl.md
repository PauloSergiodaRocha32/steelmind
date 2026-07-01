# ADR-004: Gestio Integration via Anti-Corruption Layer (ACL)

- Status: **Accepted**
- Date: 2026-07-01

## Context

Gestio DTOs and identifiers are currently close to business logic. This can leak ERP-specific concerns into the domain.

## Decision

Introduce a Gestio ACL with explicit ports and mappers:

- Domain consumes canonical catalog/material concepts
- Infrastructure adapters map Gestio DTOs to canonical models
- Domain must not depend directly on Gestio fields

## Alternatives considered

1. Direct Gestio coupling in core domain  
   Rejected: weak portability and vendor lock-in.

## Consequences

- Better decoupling for future ERP adapters
- Cleaner domain language
- Additional mapping layer to maintain
