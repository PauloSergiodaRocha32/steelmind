# SteelMind Intelligence Platform (SIP)

> **Audience:** Product owners, architects, engineers, and AI coding agents.
> **Purpose:** Define the post-Foundation phase that transforms SteelMind from application software into a knowledge-driven engineering intelligence platform.
> **Status:** Active — Phase 1 of SIP (scaffolding and governance).

---

## 1. Why SIP Exists

Until the Foundation milestone, SteelMind was built as **software** — routes, modules, Gest.io integration, warehouse flows.

From SIP onward, SteelMind is built as **infrastructure for software** — a platform where:

- **Data** comes from Gest.io and company systems without business logic mixed in
- **Knowledge** encodes norms, materials, calculations, rules, and components as versioned truth
- **Agents** use both layers to answer engineering and business questions — not only to generate code

The goal is not "AI that writes code." The goal is a platform that develops software **based on engineering knowledge** and can answer questions like:

- Which norm influences this calculation?
- Which supplier has the best track record for this material?
- If we raise welder cost by 8%, how does the budget change?
- Does this change break a previous budget?
- Which modules depend on this rule?

---

## 2. Four Pillars

```
SteelMind
├── Runtime          ← what users operate daily
├── Data Platform    ← company truth from Gest.io (read-only delivery)
├── Knowledge Platform ← technical brain (norms, rules, calculations)
└── Builder          ← orchestration that constructs and evolves the system
```

| Pillar | Responsibility | Does | Does not |
|--------|----------------|------|----------|
| **Runtime** | User-facing product | Budget, engineering, CRM, PCP, production, warehouse UI | Own canonical company data or technical rules |
| **Data Platform** | Company data layer | Sync Gest.io, expose typed providers, feed agents and Runtime | Calculate, infer, or encode engineering rules |
| **Knowledge Platform** | Technical brain | Norms, materials, calculations, components, memorial, architecture rules | Fetch live ERP data or render UI |
| **Builder** | Construction layer | Orchestrate agents, scaffold modules, test, document, open PRs | Replace human review or bypass Knowledge/Data contracts |

---

## 3. SIP Deliverables

SIP has three primary deliverables. Each maps to top-level repository areas.

### 3.1 Data Platform → `providers/`

Providers are the **only** sanctioned path from SteelMind to Gest.io (and future company systems).

```
providers/
├── gestio/           # ERP core — products, stock, branches
├── employees/        # workforce, roles, labor rates
├── materials/        # material catalog views (may compose gestio + knowledge)
├── suppliers/        # supplier master and history
├── inventory/        # stock movements, balances
├── production/       # shop floor, orders, PCP
├── finance/          # cost centers, payables context
├── crm/              # customers, opportunities, pipeline
└── documents/        # attachments, memorials, technical files
```

**Provider contract:**

1. One provider per Gest.io domain (or external system)
2. Returns **typed, normalized data** — no UI, no domain calculations
3. Implements sync + query interfaces; caching strategy documented per provider
4. Runtime and agents consume providers — never call Gest.io API directly

**Migration note:** `services/gestio/` is the Foundation-era adapter. SIP migrates it into `providers/gestio/` without breaking existing imports until cutover (see ROADMAP).

### 3.2 Knowledge Platform → `knowledge/`

The Wikipedia of SteelMind. Every agent and every calculation consults it.

```
knowledge/
├── engineering/      # design rules, structural logic, deliverable standards
├── materials/        # material specs, grades, compatibility
├── gestio/           # how Gest.io fields map to SteelMind concepts
├── workforce/        # labor categories, productivity assumptions
├── budget/           # cost structures, margin rules, escalation
├── manufacturing/    # PCP, routing, shop constraints
├── suppliers/        # qualification criteria, scoring rules
├── pricing/          # pricing models and commercial rules
├── production/       # production standards and KPIs
├── agents/           # agent charters, capabilities, guardrails
├── architecture/     # system design decisions, module boundaries
└── constitution/     # non-negotiable platform principles
```

**Knowledge contract:**

1. Content is **versioned** (Git is the source of truth in Phase 1)
2. Each document states: scope, owner context, last reviewed, dependencies
3. Calculations reference norms and inputs explicitly — no hidden assumptions
4. Agents read Knowledge before acting; Builder agents write back documentation PRs

### 3.3 Agent Platform → `agents/`

Specialized agents that compose Data + Knowledge to build and evolve SteelMind.

```
agents/
├── engineering/
├── budget/
├── materials/
├── workforce/
├── gestio/
├── production/
├── qa/
├── architecture/
├── release/
├── documentation/
├── knowledge/
├── product/
└── planning/
```

Plus a future **Orchestrator** (lives under `agents/` or `builder/`) that routes tasks:

```
User intent: "Create ACM facade calculation"
        │
        ▼
   Orchestrator
        │
        ├── Engineering Agent  → knowledge/engineering, knowledge/materials
        ├── Gestio Agent       → providers/gestio, providers/materials
        ├── Workforce Agent    → providers/employees, knowledge/workforce
        ├── Budget Agent       → knowledge/budget, providers/finance
        ├── Builder            → modules/, app/, tests
        ├── QA Agent           → test suites, regression checks
        └── Documentation Agent → knowledge/, docs/, PR description
```

**Agent contract:**

1. Each agent has a charter in `knowledge/agents/<name>.md`
2. Agents declare which providers and knowledge paths they may read
3. Agents do not bypass provider or knowledge boundaries
4. Code changes flow through Git — agents propose PRs; humans approve

### 3.4 Department Platform → `departments/`

Departments organize agents like a company. Agents execute, but departments own accountability for answers.

```
departments/
└── gestio/
    ├── workforce    # employees, salaries, benefits, hourly cost
    ├── materials    # materials, inventory, weight, category
    ├── purchasing   # suppliers, purchase history, lead time
    ├── production   # machines, sectors, capacity, standard time
    ├── finance      # overhead, markup, taxes, fixed costs
    └── crm          # customers, jobs, contracts, history
```

**Department contract:**

1. Agents ask departments for business/ERP data questions.
2. Departments route questions to the responsible team.
3. Answers include confidence, provider paths, knowledge paths, missing information, and next actions.
4. Missing information becomes an audit backlog instead of an invented value.

See [DEPARTMENTS.md](./DEPARTMENTS.md).

---

## 4. Relationship to Runtime

Runtime remains the existing application surface:

| Runtime area | Current location | SIP relationship |
|--------------|------------------|------------------|
| Warehouse / inventory UI | `modules/warehouse/`, `app/warehouse/` | Consumes `providers/inventory`, `providers/gestio` |
| Engineering | `modules/engineering/`, `app/engineering/` | Consumes `knowledge/engineering`, `providers/gestio` |
| Budget | `modules/budget/`, `app/budget/` | Consumes `knowledge/budget`, `providers/finance` |
| Purchasing | `modules/purchasing/` | Consumes `providers/gestio`, `providers/suppliers` |
| Platform / auth | `modules/platform/`, `lib/auth/` | Cross-cutting Runtime concern |
| Knowledge UI | `app/knowledge/` | Browse/search Knowledge Platform (future) |
| AI console | `app/ai/` | Agent orchestration UI (future) |

Runtime **must not** embed Gest.io field mapping or engineering rules inline — those belong in providers and knowledge respectively.

---

## 5. SIP Phases

| SIP Phase | Name | Goal |
|-----------|------|------|
| SIP-0 | **Governance** (current) | Docs, folder scaffold, contracts, migration plan |
| SIP-1 | **Data Platform** | `providers/gestio` complete; inventory + materials providers |
| SIP-2 | **Knowledge Platform** | Seed knowledge tree; versioned calculation specs |
| SIP-3 | **Agent Platform** | Agent charters, Orchestrator MVP, first end-to-end flow |
| SIP-4 | **Builder Loop** | Intent → PR pipeline with human review gate |

Foundation (`v1.0-foundation`) is complete. SIP-0 begins immediately after.

---

## 6. Non-Goals (SIP)

- Replacing Gest.io as system of record
- Autonomous merge without human review
- LLM-generated engineering rules without Knowledge documentation
- Microservices extraction (modular monolith continues)
- Real-time agent execution in production (MVP is dev-time / assisted)

---

## 7. Success Criteria

SIP is successful when:

1. A new contributor can answer "where does this data come from?" → `providers/`
2. A new contributor can answer "what rule governs this calculation?" → `knowledge/`
3. An agent can complete a scoped task using only declared provider + knowledge paths
4. Runtime modules contain orchestration and UI — not ERP mapping or norm encoding
5. The Orchestrator can run a documented golden path (e.g., facade ACM) end-to-end as a PR

---

## 8. Read Order

1. [PRODUCT_VISION.md](./PRODUCT_VISION.md) — product intent
2. [SIP.md](./SIP.md) — this document
3. [ROADMAP.md](./ROADMAP.md) — Foundation + SIP phase tracking
4. [ARCHITECTURE.md](./ARCHITECTURE.md) — technical patterns
5. `knowledge/constitution/` — platform non-negotiables
6. `knowledge/agents/` — agent charters (as they are added)

---

## 9. Related Documents

- [MASTERPLAN.md](./MASTERPLAN.md) — governance
- [ROADMAP.md](./ROADMAP.md) — phased delivery
- [ARCHITECTURE.md](./ARCHITECTURE.md) — folder and DDD rules (updated for SIP)
- [adr/0001-steelmind-intelligence-platform.md](./adr/0001-steelmind-intelligence-platform.md) — ADR
