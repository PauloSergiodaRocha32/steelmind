# ADR-001: Modular Monolith with Domain Core Isolation

- Status: **Accepted**
- Date: 2026-07-01

## Context

SteelMind currently runs as a Next.js modular monolith. Domain and infrastructure concerns are partially mixed in `lib/`.

## Decision

Keep a modular monolith deployment model, but isolate domain logic into framework-agnostic `domains/*` packages.

Target boundaries:

- `domains/*`: entities, value objects, rules, domain services
- `application/*`: use cases and orchestration
- `infrastructure/*`: adapters (ERP, DB, AI providers)
- `app/*`: delivery only (HTTP/UI composition)

## Alternatives considered

1. Keep current structure only  
   Rejected: weak domain boundaries.
2. Immediate microservices split  
   Rejected: high operational complexity too early.

## Consequences

- Enables high-confidence testing of the core engine
- Reduces framework lock-in for domain logic
- Requires migration from legacy `lib/*` modules over time
