# SteelMind — Product Vision

> **Audience:** Product owners, engineers, designers, and AI coding agents.
> **Purpose:** Define what SteelMind is, why it exists, and the philosophy that guides every technical decision.

---

## 1. Vision Statement

**SteelMind is the operational intelligence platform for steel industry enterprises** — unifying commercial, engineering, and financial workflows into a single coherent system that reduces friction, improves visibility, and scales with organizational complexity.

---

## 2. Problem Space

Steel industry operations are characterized by:

- **Long project lifecycles** spanning sales, engineering design, procurement, and delivery
- **Cross-functional dependencies** between commercial teams, engineering, and finance
- **High cost of errors** in specifications, budgets, and contract terms
- **Fragmented tooling** — spreadsheets, legacy ERP modules, and disconnected point solutions
- **Compliance and traceability requirements** for contracts, revisions, and financial approvals

SteelMind addresses the **coordination and visibility gap**, not the full ERP replacement problem.

---

## 3. Product Philosophy

### 3.1 Clarity Over Cleverness

Interfaces and code must be immediately understandable. Prefer explicit naming, predictable navigation, and visible system state over hidden automation or magic behavior.

### 3.2 Operations-First Design

Users are operators — sales managers, project engineers, financial planners. The product optimizes for **daily workflows**, not demo aesthetics. Every screen must answer: *What do I need to do next?*

### 3.3 Single Source of Truth

Each piece of operational data has one authoritative home within its bounded context. Duplication is explicit (projections, snapshots), never accidental.

### 3.4 Progressive Disclosure

Show summary first, detail on demand. Dashboard → list → record → audit trail. Do not overwhelm users with full complexity on first load.

### 3.5 Trust Through Transparency

Users must always understand **why** the system shows a number, status, or recommendation. Audit trails and event history are first-class concerns, not afterthoughts.

### 3.6 Enterprise-Grade from Day One

Security posture, accessibility, observability, and scalability are designed in from the foundation — even when features are not yet implemented.

### 3.7 AI-Native Development

The codebase and documentation are structured so AI agents can contribute safely. Human and AI contributors follow the same conventions and boundaries.

---

## 4. Target Users (Personas)

These personas inform UX and domain boundaries. **Do not implement persona-specific features until the roadmap phase allows.**

| Persona | Primary Context | Core Needs |
|---------|-----------------|------------|
| **Commercial Manager** | Commercial | Pipeline visibility, proposal tracking, contract status |
| **Project Engineer** | Engineering | Specifications, revisions, technical approvals |
| **Financial Planner** | Budget | Cost tracking, forecasts, budget vs. actual |
| **Operations Director** | Cross-context | Dashboard, KPIs, cross-module reporting |
| **System Administrator** | Platform | Configuration, user management (future) |

---

## 5. Domain Boundaries

SteelMind is divided into three bounded contexts. Each owns its vocabulary, rules, and lifecycle.

### 5.1 Commercial Context

**Responsibility:** Everything related to revenue-side operations before and during contract execution.

**Owns:**

- Customer and prospect relationships
- Proposals and quotations
- Contract lifecycle and terms
- Commercial pipeline and forecasting

**Does not own:**

- Technical specifications (Engineering)
- Cost structures and budgets (Budget)
- User identity and permissions (Platform — future)

**Ubiquitous language (examples):** Proposal, Contract, Customer, Pipeline, Quotation, Amendment

---

### 5.2 Engineering Context

**Responsibility:** Technical design, project execution, and specification management.

**Owns:**

- Engineering projects and work packages
- Technical specifications and drawings metadata
- Design revisions and approval workflows
- Engineering resource allocation

**Does not own:**

- Contract terms and pricing (Commercial)
- Financial forecasts (Budget)
- Procurement orders (future context — not yet defined)

**Ubiquitous language (examples):** Project, Specification, Revision, Work Package, Approval, Deliverable

---

### 5.3 Budget Context

**Responsibility:** Financial planning, cost control, and economic visibility.

**Owns:**

- Budget plans and versions
- Cost categories and allocations
- Forecasts and variance analysis
- Financial reporting inputs

**Does not own:**

- Contract pricing (Commercial)
- Engineering deliverables (Engineering)
- General ledger entries (external ERP integration — future)

**Ubiquitous language (examples):** Budget, Forecast, Cost Center, Variance, Allocation, Fiscal Period

---

## 6. Context Map

Relationships between contexts:

```
                    ┌─────────────┐
                    │  Platform   │  (shared: auth, tenants, notifications)
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │ Commercial  │  │ Engineering │  │   Budget    │
  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
         │                │                │
         │    Customer-Supplier (C/S)     │
         │◄──────────────────────────────►│
         │                                │
         │    Conformist (Engineering     │
         │    follows Commercial project  │
         │    identifiers)                │
         │◄──────────────────────────────►│
                         │
              Published Language:
              ProjectId, ContractId,
              OrganizationId (future)
```

| Relationship | From | To | Pattern |
|--------------|------|-----|---------|
| Project linkage | Commercial | Engineering | Customer-Supplier — Commercial publishes project identifiers; Engineering consumes |
| Cost linkage | Engineering | Budget | Customer-Supplier — Engineering publishes cost drivers; Budget consumes |
| Revenue linkage | Commercial | Budget | Customer-Supplier — Commercial publishes contract values; Budget consumes |
| Shared identifiers | All | All | Published Language — shared value objects in `types/shared/` (future) |

**Rule for AI agents:** Cross-context references use **IDs and events**, never direct imports of another module's internal domain objects.

---

## 7. Product Principles → Technical Mapping

| Product Principle | Technical Expression |
|-------------------|---------------------|
| Single source of truth | One bounded context owns each aggregate root |
| Progressive disclosure | Route → list page → detail page → tabs/panels |
| Trust through transparency | Domain events, audit log, immutable event store (future) |
| Enterprise-grade | TypeScript strict mode, RBAC-ready routes, observability hooks |
| Operations-first | Module-first folder structure, task-oriented navigation |
| AI-native | Documented conventions, explicit boundaries, predictable naming |

---

## 8. UX Philosophy (Guidelines, Not Screens)

These are constraints for future UI work. **Do not build screens unless explicitly requested.**

### 8.1 Navigation

- Primary navigation reflects **bounded contexts** (Commercial, Engineering, Budget)
- Dashboard is the cross-context entry point
- Breadcrumbs reflect context → section → entity

### 8.2 Layout

- Persistent left sidebar (desktop), sheet drawer (mobile)
- Sticky top header with context title and global actions
- Content area with consistent max-width and padding

### 8.3 Visual Identity

- Professional, neutral palette (slate base via shadcn/ui)
- Primary accent for actions and active states
- Dark mode as a first-class citizen
- Data-dense layouts preferred over decorative whitespace

### 8.4 Feedback & States

Every data-driven view must handle: loading, empty, error, and success states explicitly. No silent failures.

### 8.5 Accessibility

- WCAG 2.1 AA minimum
- shadcn/ui + Radix primitives for keyboard and screen reader support
- Visible focus rings, semantic HTML, ARIA where required

---

## 9. Anti-Patterns (Product Level)

| Anti-pattern | Why it is forbidden |
|--------------|---------------------|
| "God module" that imports everything | Breaks bounded contexts, prevents independent scaling |
| Business logic in page components | Untestable, unmaintainable, breaks DDD layers |
| Context-specific logic in `components/ui/` | UI primitives must remain domain-agnostic |
| Hard-coded strings for domain terms | Use constants or i18n keys; domain language must be consistent |
| Feature flags without documentation | Every flag must be recorded in ROADMAP or an ADR |
| Building auth/db "just in case" | Violates incremental delivery; see ROADMAP phases |

---

## 10. Future Contexts (Not Yet Defined)

The following may become bounded contexts in later phases. **Do not create modules for them without updating this document and MASTERPLAN.md.**

- **Procurement** — purchasing, supplier management
- **Production** — manufacturing execution, shop floor
- **Quality** — inspections, certifications, non-conformance
- **Platform** — tenants, users, roles, system configuration

---

## 11. Glossary

| Term | Definition |
|------|------------|
| **Bounded Context** | A logical boundary within which a domain model is defined and applicable |
| **Aggregate** | A cluster of domain objects treated as a single unit for data changes |
| **Published Language** | Shared identifiers and value objects agreed upon between contexts |
| **Domain Event** | A record of something meaningful that happened in the domain |
| **Module** | Code representation of a bounded context under `modules/` |
| **Shared Kernel** | Common types, utilities, and UI primitives used across contexts |
