# SteelMind — Roadmap

> **Audience:** Product owners, engineers, and AI coding agents.
> **Purpose:** Define phased delivery of platform capabilities — not business features.
> **Rule:** Do not implement items from future phases unless explicitly requested or the phase is marked as current.

---

## 1. Roadmap Philosophy

SteelMind grows in **platform layers**, not feature sprints. Each phase adds structural capability that enables the next. Business features (proposals, specifications, forecasts) are built **within** these phases once the platform supports them.

```
Foundation → SIP (Intelligence Platform) → Domain Structure → Data & API → Events & Integration → Scale
```

**AI agent rule:** Check the current phase before starting work. If a task belongs to a future phase, stop and confirm with the user.

---

## 2. Phase Overview

| Phase | Name | Status | Goal |
|-------|------|--------|------|
| 0 | Foundation | **Complete** | Project scaffold, layout, docs, Gest.io MVP, warehouse |
| **SIP** | **Intelligence Platform** | **Current** | Data (`providers/`), Knowledge (`knowledge/`), Agents (`agents/`) |
| 1 | Domain Structure | Planned | Module internals, domain/application layers |
| 2 | Data & API | Planned | Persistence, repositories, REST API |
| 3 | Events & Integration | Planned | Event bus, cross-context communication |
| 4 | Auth & Platform | In progress | Authentication, authorization (partial — local JWT + Supabase) |
| 5 | Scale & Observability | Planned | Performance, monitoring, optional service extraction |

See [SIP.md](./SIP.md) for SIP sub-phases (SIP-0 through SIP-4).

---

## 3. Phase 0 — Foundation ✅ Complete

**Goal:** Establish the project skeleton, documentation, development conventions, and first Gest.io integration.

### Deliverables

| Item | Status | Location |
|------|--------|----------|
| Next.js 15 + TypeScript + App Router | Done | Project root |
| Tailwind CSS + shadcn/ui | Done | `components/ui/`, `styles/` |
| Application shell (sidebar, header, dashboard) | Done | `components/layout/` |
| Responsive layout + dark mode | Done | `components/layout/`, `styles/` |
| Module placeholders + warehouse, purchasing, engineering | Done | `modules/` |
| Gest.io client, sync, taxonomy | Done | `services/gestio/`, `data/gestio/` |
| Project documentation | Done | `docs/` |
| Coding standards & Git strategy | Done | `docs/CODING_STANDARDS.md` |
| Auth (local JWT + Supabase path) | Done | `lib/auth/`, `supabase/migrations/` |

### Exit Criteria

- [x] Application runs locally with `npm run dev`
- [x] Documentation complete (MASTERPLAN, PRODUCT_VISION, ARCHITECTURE, CODING_STANDARDS, ROADMAP)
- [x] Layout navigates between module pages
- [x] Gest.io sync operational for warehouse catalog
- [x] Dark mode functional

---

## 4. SIP — SteelMind Intelligence Platform 🔵 Current

**Goal:** Transform SteelMind from application software into a knowledge-driven engineering intelligence platform.

Full specification: [SIP.md](./SIP.md)

### SIP Sub-Phases

| Sub-phase | Name | Status | Goal |
|-----------|------|--------|------|
| SIP-0 | Governance | **Complete** | Scaffold `knowledge/`, `providers/`, `agents/`; contracts; ADR |
| SIP-1 | Data Platform | **Complete** | `providers/gestio/`; `inventory/`; `materials/` |
| SIP-2 | Knowledge Platform | **Complete** | Seed: fachada ACM, ACM panels, product code mapping |
| SIP-3 | Agent Platform | **In progress** | Orchestrator MVP, engineering calculation, API routes |
| SIP-4 | Builder Loop | Planned | Intent → PR golden path with human review |

### SIP-0 Deliverables

| Item | Status | Location |
|------|--------|----------|
| SIP master document | Done | `docs/SIP.md` |
| ADR 0001 | Done | `docs/adr/0001-steelmind-intelligence-platform.md` |
| Knowledge scaffold | Done | `knowledge/` |
| Providers scaffold | Done | `providers/` |
| Agents scaffold | Done | `agents/` |
| ROADMAP + MASTERPLAN updated | Done | `docs/` |

### SIP-0 Exit Criteria

- [x] Four pillars documented
- [x] Top-level folders exist with README contracts
- [x] Migration path from `services/gestio/` documented
- [x] First provider cutover (`providers/gestio/`) — SIP-1
- [x] First knowledge articles (engineering + gestio mapping) — SIP-2
- [x] First agent charters + Orchestrator MVP — SIP-3

---

## 5. Phase 1 — Domain Structure

**Goal:** Introduce DDD layers inside each bounded context module.

### Deliverables

| Item | Description |
|------|-------------|
| Module internal structure | `domain/`, `application/`, `components/`, `hooks/`, `stores/`, `types/`, `events/` |
| Public module API | Each `modules/<context>/index.ts` exports only intentional surface |
| Shared types | `types/shared/` for Published Language (IDs, common value objects) |
| Domain entity templates | Base patterns for entities, value objects, domain events |
| Form infrastructure | shadcn Form component + react-hook-form + zod integration pattern |
| Testing setup | Vitest + Testing Library configured |
| Lint enforcement | Import boundary rules (no cross-module internals) |

### Module Structure Target

```
modules/commercial/
├── index.ts
├── components/
├── hooks/
├── stores/
├── types/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── services/
├── application/
│   ├── commands/
│   ├── queries/
│   ├── schemas/
│   └── handlers/
└── events/
    └── handlers/
```

### Explicitly Out of Scope for Phase 1

- Database / repositories with real persistence
- API endpoints
- Authentication
- Business feature screens (lists, forms, detail pages)
- Message broker

### Exit Criteria

- [ ] All three modules follow the internal structure
- [ ] At least one domain entity + value object template per module
- [ ] Public API exports documented in each `index.ts`
- [ ] Vitest runs with at least one domain unit test per module
- [ ] Import boundary lint rule active
- [ ] Form pattern documented and demonstrated with one example form

---

## 6. Phase 2 — Data & API

**Goal:** Add persistence layer and REST API following documented conventions.

### Deliverables

| Item | Description |
|------|-------------|
| Database selection | ADR required (PostgreSQL recommended) |
| ORM / query layer | ADR required (Drizzle or Prisma recommended) |
| Migration system | Version-controlled schema migrations |
| Repository pattern | Interfaces in domain, implementations in infrastructure |
| API route handlers | `app/api/v1/<context>/` following ARCHITECTURE.md conventions |
| Request validation | Zod schemas for all API inputs |
| Error handling | Standardized error envelope |
| Seed data | Development seed scripts (non-production) |
| API documentation | OpenAPI spec generation |

### API Conventions

Follow [ARCHITECTURE.md — Section 6](./ARCHITECTURE.md#6-api-conventions) exactly.

### Explicitly Out of Scope for Phase 2

- Authentication / authorization (endpoints are open in dev)
- Event bus (synchronous only in this phase)
- CQRS / read models
- Multi-tenancy enforcement
- Production deployment configuration

### Exit Criteria

- [ ] Database schema for at least one aggregate per context
- [ ] Repository interfaces defined in domain layer
- [ ] CRUD API endpoints for at least one resource per context
- [ ] All inputs validated with Zod
- [ ] Standard error responses implemented
- [ ] Migrations run cleanly from scratch
- [ ] OpenAPI spec generated and accurate

---

## 7. Phase 3 — Events & Integration

**Goal:** Enable loose coupling between bounded contexts via domain events.

### Deliverables

| Item | Description |
|------|-------------|
| In-process event bus | `lib/events/event-bus.ts` |
| Event type registry | `types/events.ts` shared envelope |
| Context event definitions | Each module defines its events |
| Event handlers | Cross-context handlers (e.g., Budget reacts to Commercial) |
| Event persistence | Append-only event log table |
| Idempotent handlers | Handler deduplication strategy |
| External integration adapters | `services/` adapters for ERP, email, etc. |
| Webhook support | Outbound event notifications (optional) |

### Event Naming

Follow [ARCHITECTURE.md — Section 5.3](./ARCHITECTURE.md#53-event-naming-convention).

### Explicitly Out of Scope for Phase 3

- Message broker (in-process only)
- Event sourcing as primary storage
- Real-time WebSocket push
- Saga / process manager patterns

### Exit Criteria

- [ ] Event bus publishes and dispatches in-process
- [ ] At least one cross-context event flow working (e.g., Commercial → Budget)
- [ ] Events persisted to event log
- [ ] Handlers are idempotent
- [ ] Event schemas versioned
- [ ] Integration adapter pattern established with one example

---

## 8. Phase 4 — Auth & Platform

**Goal:** Secure the application with authentication, authorization, and tenant isolation.

### Deliverables

| Item | Description |
|------|-------------|
| Authentication | OAuth 2.0 / OIDC (provider TBD — ADR required) |
| Session management | Secure cookies or JWT strategy |
| Authorization (RBAC) | Role-based permissions scoped to contexts |
| Multi-tenancy | Tenant isolation at repository layer |
| User management | Admin UI for users and roles (Platform context) |
| Middleware | Auth middleware for protected routes and API |
| Audit logging | User actions logged alongside domain events |
| Platform module | `modules/platform/` for cross-cutting concerns |

### Explicitly Out of Scope for Phase 4

- SSO / SAML enterprise integration (future ADR)
- Fine-grained ABAC policies
- Billing / subscription management

### Exit Criteria

- [ ] Users can sign in and sign out
- [ ] API routes require authentication
- [ ] RBAC enforced per context
- [ ] Tenant data isolated — no cross-tenant leakage
- [ ] Admin can manage users and roles
- [ ] All actions audit-logged

---

## 9. Phase 5 — Scale & Observability

**Goal:** Prepare for production scale, monitoring, and optional service extraction.

### Deliverables

| Item | Description |
|------|-------------|
| Structured logging | JSON logs with correlation IDs |
| Error tracking | Sentry or equivalent |
| Performance monitoring | OpenTelemetry + metrics dashboard |
| CI/CD pipeline | Automated lint, test, build, deploy |
| Message broker | Extract event bus to external broker (ADR) |
| CQRS read models | Optimized projections for dashboards |
| Caching layer | Redis for sessions and frequent queries |
| Load testing | Baseline performance benchmarks |
| Service extraction guide | Document how to extract a context to a microservice |
| Production deployment | Vercel / AWS / GCP (ADR required) |

### Explicitly Out of Scope for Phase 5

- Full microservices decomposition (only prepare, do not execute unless needed)
- Global CDN edge computing
- Machine learning / AI features

### Exit Criteria

- [ ] CI/CD deploys to staging on merge to main
- [ ] Error tracking captures and alerts on failures
- [ ] Dashboard queries use read models (not raw aggregates)
- [ ] Event broker handles cross-context events
- [ ] Load test baseline documented
- [ ] Runbook for production incidents

---

## 10. Business Feature Development

Business features (proposals, specifications, budgets, reports) are **not listed in this roadmap**. They are developed within the active platform phase:

| Platform Phase | Business Features Enabled |
|----------------|--------------------------|
| Phase 1 | UI components, forms, client-side workflows (no persistence) |
| Phase 2 | Full CRUD features with API and database |
| Phase 3 | Cross-context workflows (e.g., signed contract triggers budget allocation) |
| Phase 4 | Role-gated features, tenant-specific configuration |
| Phase 5 | Analytics, reporting, high-volume operations |

**AI agent rule:** When asked to build a business feature, implement it within the **current platform phase** capabilities. If the feature requires a future phase capability (e.g., persistence in Phase 0), inform the user and propose a mock/stub approach or request phase advancement.

---

## 11. Decision Log

Track major roadmap decisions here. Detailed rationale goes in `docs/adr/`.

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06 | Phase 0 complete — foundation only | Establish conventions before features |
| 2026-07 | Adopt SIP (Intelligence Platform) | Shift from building software to building knowledge-driven infrastructure |
| TBD | Database selection | ADR pending — Phase 2 |
| TBD | Auth provider selection | ADR pending — Phase 4 |
| TBD | Message broker selection | ADR pending — Phase 5 |
| TBD | Deployment target | ADR pending — Phase 5 |

---

## 12. How to Advance a Phase

1. All exit criteria of the current phase are met
2. Lead architect reviews and approves
3. Update this document: mark current phase as complete, set next phase as **Current**
4. Create ADRs for any new technology decisions
5. Update MASTERPLAN.md if governance changes

---

## 13. Related Documents

- [MASTERPLAN.md](./MASTERPLAN.md) — project governance
- [ARCHITECTURE.md](./ARCHITECTURE.md) — technical design per phase
- [PRODUCT_VISION.md](./PRODUCT_VISION.md) — domain boundaries for features
- [CODING_STANDARDS.md](./CODING_STANDARDS.md) — how to implement each phase
