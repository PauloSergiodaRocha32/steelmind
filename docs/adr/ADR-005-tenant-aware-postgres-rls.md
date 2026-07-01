# ADR-005: Tenant-Aware PostgreSQL Canonical Model + Strict RLS

- Status: **Accepted**
- Date: 2026-07-01

## Context

Current persistence mixes local JSON and permissive RLS models. Multi-company scale requires canonical data isolation.

## Decision

Use PostgreSQL as canonical store for quote-v2 and knowledge-v2 with mandatory `tenant_id` and strict RLS policies.

Key constraints:

- `tenant_id` required on all core records
- RLS enforces tenant isolation from JWT claims
- JSON local mode remains dev fallback only

## Consequences

- Enables secure multi-tenant SaaS scaling
- Improves analytical and audit capabilities
- Requires careful migration and policy testing
