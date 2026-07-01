# SteelMind — Master Plan

> **Audience:** Lead engineers, architects, and AI coding agents.
> **Purpose:** Single source of truth for how SteelMind is built, extended, and governed.
> **Status:** Living document — update when architectural decisions change.

---

## 1. Document Map

| Document | Scope |
|----------|-------|
| [PRODUCT_VISION.md](./PRODUCT_VISION.md) | Why SteelMind exists, product philosophy, domain boundaries |
| [SIP.md](./SIP.md) | SteelMind Intelligence Platform — Data, Knowledge, Agent pillars |
| [DEPARTMENTS.md](./DEPARTMENTS.md) | CEO → departments → teams → agents operating model |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, DDD, folder structure, events, API, scalability |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | Code style, naming, components, Git, PRs, branches |
| [ROADMAP.md](./ROADMAP.md) | Phased delivery plan (infrastructure & platform, not features) |
| [../AGENTS.md](../AGENTS.md) | Root instructions for Cursor and AI agents |

**Read order for new contributors and AI agents:**

1. PRODUCT_VISION → understand intent and boundaries
2. SIP → understand the four pillars and Intelligence Platform direction
3. DEPARTMENTS → understand department/team accountability
4. ARCHITECTURE → understand structure and patterns
5. CODING_STANDARDS → understand how to write code
6. ROADMAP → understand what to build next and what to defer
7. AGENTS → understand Cursor/agent operating instructions

---

## 2. Project Identity

| Attribute | Value |
|-----------|-------|
| **Name** | SteelMind |
| **Type** | Enterprise B2B SaaS |
| **Industry** | Steel / heavy manufacturing operations |
| **Stack** | Next.js 15, TypeScript, App Router, Tailwind CSS, shadcn/ui |
| **Architecture** | Domain-Driven Design (DDD) with modular monolith front-end |

SteelMind is a **platform**, not a collection of screens. Every decision must favor long-term maintainability, clear domain boundaries, and agent-friendly conventions over short-term velocity.

---

## 3. Core Principles

These principles override individual preferences. When in doubt, choose the option that best satisfies them in order:

### 3.1 Domain First

Business concepts live in **bounded contexts** (`commercial`, `engineering`, `budget`). Code organization mirrors the domain, not technical layers alone.

### 3.2 Thin Routing Layer

The `app/` directory handles routing and composition only. It must not contain business logic, data fetching strategies, or domain rules.

### 3.3 Explicit Boundaries

Modules communicate through **defined interfaces** (types, services, events). Direct cross-module imports of internal implementation files are forbidden.

### 3.4 Convention Over Configuration

Follow established patterns before inventing new ones. If a pattern does not exist, propose it in a PR and update these docs.

### 3.5 AI-Agent Compatibility

All code and docs must be written so an AI agent can:

- Locate the correct folder on the first attempt
- Infer naming from existing examples
- Avoid breaking domain boundaries
- Produce PRs that pass review without architectural debate

### 3.6 No Premature Complexity

Do not add infrastructure (message brokers, microservices, ORMs) until the roadmap phase that requires it. Design for scale; implement incrementally.

---

## 4. Bounded Contexts

SteelMind is organized into three primary domains:

```
┌─────────────────────────────────────────────────────────────┐
│                        SteelMind Platform                    │
├─────────────────┬─────────────────────┬─────────────────────┤
│   Commercial    │    Engineering      │       Budget        │
│                 │                     │                     │
│  Sales,         │  Projects,          │  Planning,          │
│  contracts,     │  specifications,    │  cost tracking,     │
│  customers      │  technical design   │  forecasting        │
└─────────────────┴─────────────────────┴─────────────────────┘
```

Each context is implemented as a **module** under `modules/<context>/`. Contexts must remain loosely coupled. Shared concepts use the **Shared Kernel** (`types/`, `lib/`, `components/ui/`).

---

## 5. Layer Model

```
┌──────────────────────────────────────────┐
│  Presentation   app/, components/          │  ← Routes, layout, UI composition
├──────────────────────────────────────────┤
│  Application    modules/*/application/   │  ← Use cases, orchestration (future)
├──────────────────────────────────────────┤
│  Domain         modules/*/domain/        │  ← Entities, value objects, rules (future)
├──────────────────────────────────────────┤
│  Infrastructure services/, lib/            │  ← API clients, adapters, utilities
└──────────────────────────────────────────┘
```

**Current state (foundation phase):** Only Presentation and Infrastructure layers exist. Application and Domain layers will be introduced per module as business logic is added. See [ROADMAP.md](./ROADMAP.md).

---

## 6. What Belongs Where — Quick Reference

| I need to… | Put it in… |
|------------|------------|
| Add a new page/route | `app/<route>/page.tsx` |
| Add domain-specific UI | `modules/<context>/components/` |
| Add domain business rules | `modules/<context>/domain/` |
| Add a use case / orchestrator | `modules/<context>/application/` |
| Call an external API | `services/<context>-service.ts` |
| Share a UI primitive | `components/ui/` |
| Share layout chrome | `components/layout/` |
| Share a React hook (generic) | `hooks/` |
| Share a React hook (domain) | `modules/<context>/hooks/` |
| Define a shared type | `types/` or `modules/<context>/types/` |
| Define a domain event | `modules/<context>/events/` |
| Add global CSS / tokens | `styles/` |
| Add client UI state | `lib/stores/` or `modules/<context>/stores/` |

---

## 7. Governance

### 7.1 Architectural Decision Records (ADRs)

Significant decisions (new library, pattern change, boundary shift) must be recorded as:

```
docs/adr/NNNN-short-title.md
```

Use sequential numbering. ADRs are immutable once accepted; supersede with a new ADR.

### 7.2 Changing These Documents

| Change type | Required action |
|-------------|-----------------|
| Typo / clarification | Direct PR, one reviewer |
| New convention | PR + update CODING_STANDARDS.md |
| New domain / module | PR + update ARCHITECTURE.md, PRODUCT_VISION.md, ROADMAP.md |
| Breaking boundary change | PR + ADR + lead architect approval |

### 7.3 AI Agent Instructions

When an AI agent is tasked with SteelMind work, it **must**:

1. Read relevant docs before writing code
2. Stay within the requested bounded context
3. Not create files outside the folder structure defined in [ARCHITECTURE.md](./ARCHITECTURE.md)
4. Not implement features listed as out-of-scope in [ROADMAP.md](./ROADMAP.md) unless explicitly requested
5. Follow [CODING_STANDARDS.md](./CODING_STANDARDS.md) for naming, Git, and PR format
6. Prefer extending existing patterns over introducing new abstractions

When an AI agent **must stop and ask**:

- A task requires cross-context data sharing with no existing interface
- A task requires a new top-level folder or dependency
- A task contradicts documented boundaries
- A task requires auth, database, or payment integration before the roadmap phase allows it

---

## 8. Non-Goals (Global)

The following are explicitly **out of scope** unless a future roadmap phase or explicit user request says otherwise:

- Authentication and authorization implementation
- Database schema and persistence layer
- Business feature logic (CRUD, workflows, calculations)
- Third-party payment or billing integration
- Mobile native applications
- Multi-tenancy implementation (design for it; do not build yet)

---

## 9. Success Criteria

SteelMind documentation and architecture are successful when:

- A new engineer or AI agent can implement a module feature without asking where files go
- Pull requests are reviewable by checking against docs, not tribal knowledge
- Domains can evolve independently without cascade refactors
- The codebase remains deployable as a single Next.js application through all growth phases

---

## 10. Related Files

- Project README: [`../README.md`](../README.md)
- shadcn config: [`../components.json`](../components.json)
- TypeScript config: [`../tsconfig.json`](../tsconfig.json)
