# ADR-010: Persistent Calibration Repositories and CI Quality Gates

- Status: **Accepted**
- Date: 2026-07-01

## Context

Shadow/calibration infrastructure exists, but persistent benchmark history and automated quality gates are still weak points for enterprise reliability.

## Decision

1. Add PostgreSQL-backed repository implementations for:
   - Shadow runs
   - Calibration cases
   - Benchmark cases/runs/results
2. Keep safe fallback repositories (file/in-memory) for local/offline development.
3. Add CI quality gates for lint, unit tests with coverage, and production build.

## Alternatives considered

1. Keep only file and in-memory repositories  
   Rejected: insufficient durability and audit history.
2. Force Supabase-only runtime  
   Rejected: reduces local development resilience.

## Consequences

### Positive

- Durable calibration history aligned with ADR-005
- Better release safety through automated checks
- Maintains developer ergonomics with fallback paths

### Negative

- More repository code paths to validate
- Additional migration and policy maintenance
