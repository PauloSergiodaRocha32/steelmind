# SteelMind — Architecture

> **Audience:** Software architects, senior engineers, and AI coding agents.
> **Purpose:** Define system structure, DDD boundaries, integration patterns, and scalability rules.

---

## 1. Architectural Style

SteelMind follows a **Modular Monolith** architecture with **Domain-Driven Design (DDD)** principles.

| Characteristic | Decision |
|----------------|----------|
| Deployment unit | Single Next.js application (initial phase) |
| Domain organization | Bounded contexts as modules |
| Frontend framework | Next.js 15 App Router (React Server Components + Client Components) |
| Styling | Tailwind CSS + shadcn/ui design tokens |
| State | Zustand (UI state), React Hook Form (forms), server state via services (future) |
| Communication | In-process events (initial), message broker (future scale phase) |
| Data | No persistence in foundation phase; repository pattern when added |

**Guiding rule:** Start as a modular monolith. Extract services only when a bounded context proves it needs independent scaling, deployment, or team ownership.

---

## 2. System Context Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         SteelMind (Next.js)                      │
│  ┌───────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐ │
│  │    app/   │  │  components/ │  │  modules/ │  │ services/ │ │
│  │  (routes) │  │   (shared    │  │  (domain  │  │ (infra    │ │
│  │           │  │    UI)       │  │  contexts)│  │  adapters)│ │
│  └─────┬─────┘  └──────┬───────┘  └─────┬─────┘  └─────┬─────┘ │
│        │               │                │              │        │
│        └───────────────┴────────────────┴──────────────┘        │
│                              │                                   │
│                     lib/ · hooks/ · types/ · styles/             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ REST/    │    │ Message  │    │ External │
        │ GraphQL  │    │ Broker   │    │ SaaS     │
        │ API      │    │ (future) │    │ APIs     │
        │ (future) │    │          │    │ (future) │
        └──────────┘    └──────────┘    └──────────┘
```

---

## 3. Folder Structure

### 3.1 Top-Level Layout

```
steelmind/
├── app/                          # Next.js App Router — routes only
├── components/                   # Shared presentation components
│   ├── layout/                   # Application shell (sidebar, header)
│   ├── dashboard/                # Cross-context dashboard widgets
│   └── ui/                       # shadcn/ui primitives (domain-agnostic)
├── modules/                      # Bounded contexts (DDD modules)
│   ├── commercial/
│   ├── engineering/
│   └── budget/
├── lib/                          # Shared utilities, constants, global stores
├── hooks/                        # Shared, domain-agnostic React hooks
├── services/                     # Infrastructure adapters & API clients
├── types/                        # Shared type definitions (Published Language)
├── styles/                       # Global CSS, design tokens
└── docs/                         # Project documentation
```

### 3.2 Module Internal Structure (Target)

When a module grows beyond a placeholder, adopt this structure:

```
modules/<context>/
├── index.ts                      # Public API — only exports meant for other modules
├── components/                   # Context-specific UI components
├── hooks/                        # Context-specific React hooks
├── stores/                       # Context-specific client state (Zustand)
├── types/                        # Context-internal types
├── domain/                       # Pure domain logic (no React, no fetch)
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── services/                 # Domain services (pure functions)
├── application/                  # Use cases & orchestration
│   ├── commands/
│   ├── queries/
│   └── handlers/
├── infrastructure/               # Module-specific adapters (optional)
│   └── mappers/
└── events/                       # Event definitions & handlers
    ├── <context>-events.ts
    └── handlers/
```

**Foundation phase rule:** Modules may contain only `index.ts` until business logic is explicitly requested. Do not scaffold empty folders prematurely.

### 3.3 App Router Structure

```
app/
├── layout.tsx                    # Root layout (providers, fonts, global styles)
├── page.tsx                      # Dashboard (cross-context entry)
├── commercial/
│   └── page.tsx                  # Thin — composes module components
├── engineering/
│   └── page.tsx
└── budget/
    └── page.tsx
```

**Rules for `app/`:**

- No business logic
- No direct API calls (delegate to modules/services)
- No domain type definitions
- Pages compose layout + module components
- Use `layout.tsx` per route group when shared layout is needed
- Server Components by default; add `"use client"` only when required

### 3.4 Future App Router Additions

```
app/
├── api/                          # Route handlers (REST BFF layer)
│   └── v1/
│       └── <context>/
├── (auth)/                       # Route group — auth pages (future)
└── (platform)/                   # Route group — admin (future)
```

---

## 4. Domain-Driven Design

### 4.1 Strategic Design

| DDD Concept | SteelMind Implementation |
|-------------|--------------------------|
| Bounded Context | `modules/<context>/` |
| Ubiquitous Language | Documented in PRODUCT_VISION.md; reflected in code naming |
| Context Map | Defined in PRODUCT_VISION.md |
| Shared Kernel | `types/`, `lib/`, `components/ui/` |
| Published Language | Shared IDs and value objects in `types/shared/` (future) |
| Anti-Corruption Layer | `services/` adapters for external systems |

### 4.2 Tactical Design

| DDD Pattern | Location | Rules |
|-------------|----------|-------|
| Entity | `modules/*/domain/entities/` | Has identity (ID), mutable state |
| Value Object | `modules/*/domain/value-objects/` | Immutable, equality by value |
| Aggregate Root | `modules/*/domain/entities/` | Controls access to cluster; emits events |
| Domain Event | `modules/*/domain/events/` or `modules/*/events/` | Past tense naming: `ProposalSubmitted` |
| Domain Service | `modules/*/domain/services/` | Stateless logic that doesn't fit an entity |
| Repository | `services/` or `modules/*/infrastructure/` | Data access abstraction (future) |
| Application Service | `modules/*/application/` | Orchestrates use cases, no business rules |
| Factory | `modules/*/domain/` | Complex object creation |

### 4.3 Aggregate Rules

1. One aggregate root per transactional boundary
2. References to other aggregates use **IDs only**
3. Cross-aggregate consistency via **domain events**, not synchronous calls
4. Aggregates emit events after state changes; events are immutable

### 4.4 Module Boundary Rules

```
✅ ALLOWED
  modules/commercial/index.ts → exports public API
  app/commercial/page.tsx → imports from modules/commercial
  modules/budget/application/ → imports types from types/shared/
  modules/budget/events/handlers/ → listens to CommercialProjectCreated

❌ FORBIDDEN
  modules/budget/ → imports modules/commercial/domain/entities/Contract.ts
  components/ui/button.tsx → imports anything from modules/
  app/page.tsx → contains validation logic or API calls
  services/ → imports React or JSX
```

---

## 5. Event-Driven Architecture

### 5.1 Principles

- Domain events express **facts that already happened** (past tense)
- Events are immutable once created
- Publishers do not know subscribers
- Handlers are idempotent where possible
- Cross-context communication prefers events over direct calls

### 5.2 Event Anatomy

```typescript
// modules/commercial/events/proposal-submitted.event.ts

interface ProposalSubmittedEvent {
  readonly type: "commercial.proposal.submitted";
  readonly payload: {
    readonly proposalId: string;
    readonly projectId: string;
    readonly submittedAt: string; // ISO 8601
    readonly submittedBy: string;
  };
  readonly metadata: {
    readonly correlationId: string;
    readonly causationId?: string;
    readonly version: 1;
  };
}
```

### 5.3 Event Naming Convention

```
<context>.<aggregate>.<action>

Examples:
  commercial.proposal.submitted
  commercial.contract.signed
  engineering.specification.approved
  engineering.revision.created
  budget.forecast.updated
  budget.allocation.exceeded
```

### 5.4 Event Flow (In-Process — Current Phase)

```
┌──────────────┐     emit      ┌──────────────┐    dispatch    ┌──────────────┐
│  Use Case    │ ────────────► │  Event Bus   │ ──────────────► │   Handler(s) │
│  (application)│              │  (lib/events)│                 │  (same or    │
└──────────────┘               └──────────────┘                 │  other module)│
                                                                 └──────────────┘
```

**Implementation location (when built):**

| Piece | Path |
|-------|------|
| Event bus | `lib/events/event-bus.ts` |
| Event types (shared envelope) | `types/events.ts` |
| Context event definitions | `modules/<context>/events/` |
| Event handlers | `modules/<context>/events/handlers/` |

### 5.5 Event Flow (Message Broker — Future Phase)

When scale requires it (see ROADMAP):

- Events published to a topic exchange (e.g., RabbitMQ, AWS SNS/SQS, Google Pub/Sub)
- Each context subscribes to relevant event types
- Dead-letter queues for failed handlers
- Schema registry for event versioning

### 5.6 Event Versioning

- Additive changes only in minor versions (new optional fields)
- Breaking changes require new event type with version suffix: `commercial.proposal.submitted.v2`
- Handlers declare which versions they support
- Never mutate an event schema in place

---

## 6. API Conventions

> APIs do not exist in the foundation phase. These conventions apply when `app/api/` or a separate backend is introduced.

### 6.1 Style

- **REST** as primary style for CRUD and resource operations
- **Commands** via `POST` for non-idempotent actions
- **Queries** via `GET` with explicit query parameters
- Future: GraphQL for complex cross-context reads (ADR required)

### 6.2 URL Structure

```
/api/v1/<context>/<resource>
/api/v1/<context>/<resource>/:id
/api/v1/<context>/<resource>/:id/<sub-resource>

Examples:
  GET    /api/v1/commercial/proposals
  GET    /api/v1/commercial/proposals/:id
  POST   /api/v1/commercial/proposals
  PATCH  /api/v1/commercial/proposals/:id
  POST   /api/v1/engineering/projects/:id/revisions
  GET    /api/v1/budget/forecasts?period=2026-Q2
```

### 6.3 Request / Response Envelope

```typescript
// Success response
{
  "data": T,
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO-8601"
  }
}

// Error response
{
  "error": {
    "code": "PROPOSAL_NOT_FOUND",
    "message": "Human-readable message",
    "details": []        // validation errors, field-level
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO-8601"
  }
}
```

### 6.4 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PATCH |
| 201 | Successful POST (created) |
| 204 | Successful DELETE |
| 400 | Validation error, malformed request |
| 401 | Unauthenticated (future) |
| 403 | Unauthorized (future) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, stale version) |
| 422 | Domain rule violation |
| 500 | Unexpected server error |

### 6.5 Pagination

```
GET /api/v1/commercial/proposals?page=1&limit=25&sort=createdAt:desc

Response meta:
{
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 142,
    "totalPages": 6
  }
}
```

### 6.6 API Route Handler Location

```
app/api/v1/<context>/<resource>/route.ts
```

Handlers are thin — delegate to `modules/<context>/application/` use cases.

### 6.7 Validation

- All inputs validated with **Zod** schemas
- Schemas live in `modules/<context>/application/schemas/` or `modules/<context>/types/`
- Route handlers parse → validate → execute → respond

---

## 7. Data Architecture (Future)

Not implemented in foundation phase. Design decisions for when persistence is added:

| Concern | Pattern |
|---------|---------|
| Database access | Repository pattern behind interfaces |
| Migrations | Version-controlled SQL or ORM migrations |
| Tenant isolation | Row-level security or schema-per-tenant (ADR required) |
| Read models | CQRS projections for dashboard/reporting (future) |
| Audit trail | Append-only event log |
| Caching | Redis for session and query cache (future) |

---

## 8. State Management

| State type | Tool | Location |
|------------|------|----------|
| UI chrome (sidebar, theme) | Zustand | `lib/stores/` |
| Context-specific UI | Zustand | `modules/<context>/stores/` |
| Form state | React Hook Form + Zod | Component-local or `modules/<context>/hooks/` |
| Server/async data | Services + RSC | `services/`, Server Components (future: TanStack Query for client) |
| Domain state | Domain entities | `modules/<context>/domain/` — never in global store |

**Rule:** Never put domain/business state in Zustand. Zustand is for UI state only.

---

## 9. Scalability Principles

### 9.1 Code Scalability

- **Module isolation** — contexts evolve independently
- **Public API per module** — `index.ts` exports only intentional surface
- **No circular dependencies** — enforce with lint rules (future: `eslint-plugin-import`)
- **Pure domain logic** — testable without React or network

### 9.2 Performance

- Server Components by default (less client JS)
- Dynamic imports for heavy client components: `next/dynamic`
- Route-level code splitting (automatic with App Router)
- Image optimization via `next/image`
- Turbopack for dev, production build via `next build`

### 9.3 Deployment Scalability Path

```
Phase 1: Single Next.js deployment (modular monolith)
Phase 2: Add API route handlers + database
Phase 3: Extract high-traffic context to separate service
Phase 4: Event broker for async cross-context workflows
Phase 5: Read replicas + CQRS for reporting
```

### 9.4 Multi-Tenancy (Future)

Design for but do not implement:

- `tenantId` on all aggregates and events
- Tenant context propagated via middleware (future auth)
- Data isolation enforced at repository layer

### 9.5 Observability (Future)

| Signal | Tool (proposed) |
|--------|-----------------|
| Logging | Structured JSON logs with `requestId`, `tenantId` |
| Tracing | OpenTelemetry |
| Metrics | Prometheus / Vercel Analytics |
| Error tracking | Sentry |

Hook points: event bus dispatch, API route handlers, service layer.

---

## 10. Security Architecture (Future)

Not implemented in foundation phase. Reserved decisions:

- Authentication: OAuth 2.0 / OIDC
- Authorization: RBAC with context-scoped permissions
- API security: JWT or session tokens, rate limiting
- Input sanitization: Zod validation + output encoding
- CSP headers via Next.js middleware
- Secrets: environment variables, never committed

---

## 11. Dependency Rules

```
app/  →  components/, modules/ (public API), lib/, hooks/, types/
components/  →  lib/, types/, components/ui/
components/ui/  →  lib/ only
modules/  →  lib/, types/, services/ (via interfaces), other modules/ (public API only)
services/  →  lib/, types/
lib/  →  types/ (minimal)
hooks/  →  lib/, types/
types/  →  (nothing — leaf node)
```

---

## 12. Technology Registry

| Category | Choice | Version policy |
|----------|--------|----------------|
| Framework | Next.js | 15.x, App Router |
| Language | TypeScript | Strict mode, latest stable |
| Styling | Tailwind CSS | 3.x |
| Components | shadcn/ui | Pin via components.json |
| Icons | lucide-react | Latest compatible |
| Forms | react-hook-form + zod | Latest compatible |
| Client state | zustand | Latest compatible |
| Themes | next-themes | Latest compatible |
| Dev server | Turbopack | Via `next dev --turbopack` |
| Linting | ESLint + eslint-config-next | Match Next.js version |

New dependencies require justification in PR description. Prefer existing stack over alternatives.

---

## 13. Architecture Checklist for PRs

Before merging, verify:

- [ ] Code lives in the correct bounded context
- [ ] No cross-module internal imports
- [ ] `app/` pages are thin compositors
- [ ] Domain logic is not in components or pages
- [ ] Events follow naming convention (if applicable)
- [ ] API routes follow URL conventions (if applicable)
- [ ] New folders match documented structure
- [ ] No auth/db implemented unless roadmap phase allows

---

## 14. Related Documents

- [MASTERPLAN.md](./MASTERPLAN.md) — governance and document map
- [PRODUCT_VISION.md](./PRODUCT_VISION.md) — domain boundaries and ubiquitous language
- [CODING_STANDARDS.md](./CODING_STANDARDS.md) — implementation conventions
- [ROADMAP.md](./ROADMAP.md) — phased delivery plan
