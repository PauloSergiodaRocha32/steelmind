# SteelMind — Coding Standards

> **Audience:** All contributors and AI coding agents.
> **Purpose:** Enforce consistent, readable, and maintainable code across the SteelMind codebase.
> **Authority:** These standards are mandatory unless an ADR explicitly overrides them.

---

## 1. General Principles

1. **Read before you write** — locate existing patterns and follow them
2. **Minimal diff** — change only what the task requires
3. **Explicit over implicit** — no magic, no hidden side effects
4. **Type-safe by default** — leverage TypeScript strict mode fully
5. **No dead code** — do not commit commented-out blocks or unused exports
6. **No premature abstraction** — three similar lines beat a premature helper

---

## 2. TypeScript Standards

### 2.1 Compiler Settings

Strict mode is enabled and non-negotiable. Do not weaken `tsconfig.json`.

### 2.2 Type Rules

| Rule | Example |
|------|---------|
| Prefer `interface` for object shapes | `interface Proposal { id: string }` |
| Use `type` for unions, intersections, utilities | `type Status = "draft" \| "active"` |
| Avoid `any` | Use `unknown` + narrowing instead |
| Avoid non-null assertion (`!`) | Use optional chaining or guards |
| Use `readonly` for immutable fields | `readonly id: string` |
| Use `as const` for literal objects | Navigation config, enums |
| Export types from dedicated files | `types/` or `modules/*/types/` |

### 2.3 Naming — Types & Interfaces

```typescript
// Entities: PascalCase, singular noun
interface Proposal { ... }
interface BudgetForecast { ... }

// Value objects: PascalCase, descriptive
interface Money { amount: number; currency: string }

// DTOs: suffix with purpose
interface CreateProposalDto { ... }
interface ProposalResponseDto { ... }

// Event types: past tense + Event suffix
interface ProposalSubmittedEvent { ... }

// Props: ComponentName + Props
interface ProposalCardProps { ... }

// Zod schemas: camelCase + Schema suffix
const createProposalSchema = z.object({ ... });
```

### 2.4 Imports

Order imports in this sequence, separated by blank lines:

```typescript
// 1. React / Next.js
import { useState } from "react";
import Link from "next/link";

// 2. External libraries
import { z } from "zod";
import { useForm } from "react-hook-form";

// 3. Internal — absolute paths via @/
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 4. Relative (only within the same module)
import { ProposalCard } from "./proposal-card";
```

**Rules:**

- Always use `@/` alias for cross-folder imports
- Relative imports only within the same module directory
- No default exports except Next.js pages and config files
- Named exports everywhere else

---

## 3. Naming Conventions

### 3.1 Files & Folders

| Item | Convention | Example |
|------|------------|---------|
| Folders | kebab-case | `value-objects/`, `event-handlers/` |
| React components | kebab-case file | `proposal-card.tsx` |
| Hooks | kebab-case with `use-` prefix | `use-proposal-form.ts` |
| Utilities | kebab-case | `format-currency.ts` |
| Types file | kebab-case or `index.ts` | `proposal.types.ts` |
| Constants | kebab-case file | `constants.ts` |
| Stores | kebab-case with `-store` suffix | `ui-store.ts`, `proposal-store.ts` |
| Events | kebab-case with `.event.ts` suffix | `proposal-submitted.event.ts` |
| Schemas | kebab-case with `.schema.ts` suffix | `create-proposal.schema.ts` |
| Services | kebab-case with `-service` suffix | `commercial-service.ts` |
| Tests | same name + `.test.ts` / `.test.tsx` | `proposal-card.test.tsx` |

### 3.2 Code Identifiers

| Item | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `proposalId`, `isLoading` |
| Functions | camelCase, verb prefix | `getProposal`, `formatCurrency` |
| React components | PascalCase | `ProposalCard` |
| Constants (global) | SCREAMING_SNAKE_CASE | `MAX_PAGE_SIZE`, `APP_NAME` |
| Enum members | PascalCase | `Status.Draft` |
| Boolean variables | `is/has/can/should` prefix | `isActive`, `hasPermission` |
| Event handlers | `handle` prefix | `handleSubmit`, `handleDelete` |
| Callback props | `on` prefix | `onSubmit`, `onChange` |

### 3.3 Domain Language

Use **ubiquitous language** from [PRODUCT_VISION.md](./PRODUCT_VISION.md):

```
✅ proposal, contract, specification, revision, forecast, allocation
❌ item, record, data, obj, thing, entry (generic names in domain code)
```

---

## 4. React & Component Standards

### 4.1 Component Types

| Type | Location | Server/Client |
|------|----------|---------------|
| UI primitives | `components/ui/` | Client (interactive) |
| Layout chrome | `components/layout/` | Mixed — client only when needed |
| Dashboard widgets | `components/dashboard/` | Server by default |
| Domain components | `modules/<context>/components/` | Server by default |
| Pages | `app/` | Server by default |

### 4.2 Server vs Client Components

```
Default: Server Component (no directive)

Add "use client" ONLY when the component needs:
  - useState, useEffect, useRef, or other React hooks
  - Event handlers (onClick, onChange)
  - Browser APIs (window, localStorage)
  - Zustand stores
  - react-hook-form
```

Push `"use client"` as far down the tree as possible. Do not mark entire pages as client unless necessary.

### 4.3 Component Structure

```tsx
// 1. Directive (if client)
"use client";

// 2. Imports

// 3. Types / interfaces
interface ProposalCardProps {
  proposalId: string;
  title: string;
}

// 4. Component
export function ProposalCard({ proposalId, title }: ProposalCardProps) {
  // hooks
  // derived state
  // handlers
  // render
  return ( ... );
}
```

**Rules:**

- Named function exports: `export function ComponentName()`
- No `React.FC` — use explicit props interface
- Destructure props in the function signature
- One component per file (except tightly coupled sub-components)
- Keep components under ~150 lines; extract when larger

### 4.4 Component Composition

```
Page (app/)
  └── AppShell (components/layout/)
        └── ModuleFeature (modules/<context>/components/)
              └── UI Primitives (components/ui/)
```

- Pages compose; they do not implement
- Domain components receive data as props (RSC) or fetch via hooks (client)
- UI primitives never import from modules

### 4.5 Props & Defaults

```typescript
interface MetricCardProps {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";  // optional with sensible default in destructuring
}

export function MetricCard({
  label,
  value,
  trend = "neutral",
}: MetricCardProps) { ... }
```

---

## 5. UI & Styling Conventions

### 5.1 Tailwind CSS

| Rule | Detail |
|------|--------|
| Use `cn()` for conditional classes | From `@/lib/utils` |
| No arbitrary values unless necessary | Prefer design tokens |
| Use CSS variables for colors | Defined in `styles/globals.css` |
| Responsive mobile-first | `sm:`, `md:`, `lg:`, `xl:` breakpoints |
| Dark mode | `dark:` variant, class strategy via next-themes |
| Spacing | Use Tailwind scale (4, 6, 8) — no `p-[13px]` |

### 5.2 shadcn/ui

- Add components via CLI: `npx shadcn@latest add <name>`
- Do not modify `components/ui/` primitives unless fixing a bug
- Extend via wrapper components in `components/` or `modules/*/components/`
- Configuration lives in `components.json` — do not drift from it

### 5.3 Layout Standards

| Element | Convention |
|---------|-------------|
| Page padding | `p-4 md:p-6 lg:p-8` via AppShell container |
| Max content width | `max-w-7xl` |
| Card grid | `grid gap-4 sm:grid-cols-2 xl:grid-cols-4` |
| Section spacing | `space-y-6` or `space-y-8` |
| Page title | `text-2xl font-bold tracking-tight` |
| Subtitle | `text-muted-foreground` |

### 5.4 Icons

- Use **lucide-react** exclusively
- Size: `h-4 w-4` (inline), `h-5 w-5` (headers), `h-8 w-8` (empty states)
- Always set `aria-hidden="true"` on decorative icons
- Interactive icons need `aria-label` on the button, not the icon

### 5.5 Accessibility

- Semantic HTML: `<nav>`, `<main>`, `<header>`, `<section>`
- All interactive elements keyboard-accessible
- Form inputs must have associated labels
- Color contrast WCAG 2.1 AA minimum
- Loading states announced to screen readers (`aria-live`)

---

## 6. State Management

### 6.1 Zustand Stores

```typescript
// lib/stores/ui-store.ts or modules/<context>/stores/<name>-store.ts

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebarCollapsed: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
```

**Rules:**

- One store per concern
- UI state only — never domain data
- Actions defined in the store, not externally
- Use selectors to prevent unnecessary re-renders

### 6.2 Forms

```typescript
const schema = z.object({
  title: z.string().min(1, "Title is required"),
});

type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { title: "" },
});
```

- Zod schema is the single source of truth for validation
- Schema lives near the form or in `modules/*/application/schemas/`
- Display errors via shadcn Form components (when added)

---

## 7. Services & Data Access

```typescript
// services/commercial-service.ts

export async function getProposals(params: GetProposalsParams): Promise<Proposal[]> {
  // fetch logic
}
```

**Rules:**

- Services are async functions or classes with no React dependency
- Return typed data, never raw `Response`
- Throw typed errors or return `Result<T, E>` pattern
- One service file per context or resource group
- No UI imports in services

---

## 8. Error Handling

| Layer | Strategy |
|-------|----------|
| Domain | Throw domain-specific errors (`ProposalNotFoundError`) |
| Application | Catch domain errors, map to application responses |
| API routes | Map to HTTP status codes (see ARCHITECTURE.md) |
| UI | Error boundaries for unexpected; inline messages for validation |
| Services | Wrap network errors with context |

```typescript
// Domain error example
export class ProposalNotFoundError extends Error {
  constructor(public readonly proposalId: string) {
    super(`Proposal ${proposalId} not found`);
    this.name = "ProposalNotFoundError";
  }
}
```

---

## 9. Comments & Documentation

| Do | Don't |
|----|-------|
| Explain **why**, not what | Restate obvious code |
| JSDoc on public module APIs | Comment every line |
| Document non-obvious business rules | Leave TODO without issue reference |
| `@deprecated` with replacement | Comment out dead code |

```typescript
/**
 * Public API for the Commercial bounded context.
 * Import only from this file when crossing module boundaries.
 */
export { ProposalCard } from "./components/proposal-card";
```

---

## 10. Git Strategy

### 10.1 Repository

- Single monorepo for SteelMind
- Protected `main` branch
- All work via feature branches and pull requests
- No direct commits to `main`

### 10.2 Branch Strategy

```
main                          ← production-ready, always deployable
  └── feature/<context>/<short-description>
  └── fix/<context>/<short-description>
  └── chore/<short-description>
  └── docs/<short-description>
```

| Branch prefix | Use case | Example |
|---------------|----------|---------|
| `feature/` | New capability | `feature/commercial/proposal-list` |
| `fix/` | Bug fix | `fix/budget/forecast-calculation` |
| `chore/` | Tooling, deps, config | `chore/upgrade-next-15` |
| `docs/` | Documentation only | `docs/coding-standards` |
| `refactor/` | Code restructure, no behavior change | `refactor/engineering/extract-domain` |

**Rules:**

- Branch from latest `main`
- Keep branches short-lived (< 1 week)
- One logical change per branch
- Delete branch after merge

### 10.3 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

| Type | Usage |
|------|-------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Restructure, no behavior change |
| `test` | Adding or updating tests |
| `chore` | Tooling, dependencies, config |
| `perf` | Performance improvement |

**Scope:** Use bounded context name or area: `commercial`, `engineering`, `budget`, `layout`, `ui`, `deps`.

**Examples:**

```
feat(commercial): add proposal list component
fix(budget): correct variance percentage calculation
docs: add event-driven architecture guidelines
chore(deps): upgrade zod to 3.24
refactor(engineering): extract specification domain entity
```

**Rules:**

- Imperative mood: "add", not "added" or "adds"
- Max 72 characters for subject line
- Body explains **why**, not what (the diff shows what)
- Reference issues in footer: `Closes #42`

---

## 11. Pull Request Strategy

### 11.1 PR Size

| Size | Lines changed | Review time |
|------|---------------|-------------|
| Small (ideal) | < 200 | Same day |
| Medium | 200–500 | 1–2 days |
| Large (avoid) | 500+ | Split if possible |

One concern per PR. Split large features into stacked or sequential PRs.

### 11.2 PR Title

Same format as commit messages:

```
feat(commercial): add proposal submission form
```

### 11.3 PR Description Template

```markdown
## Summary
- Brief description of what and why (1–3 bullets)

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] Chore / tooling

## Bounded Context
- [ ] Commercial
- [ ] Engineering
- [ ] Budget
- [ ] Platform / shared

## Checklist
- [ ] Follows CODING_STANDARDS.md
- [ ] No cross-module internal imports
- [ ] TypeScript strict — no `any`
- [ ] Responsive layout verified
- [ ] Dark mode verified
- [ ] No unrelated changes

## Test Plan
- [ ] Step-by-step verification instructions
```

### 11.4 Review Rules

| Rule | Detail |
|------|--------|
| Minimum reviewers | 1 (2 for architectural changes) |
| CI must pass | Lint, type check, build |
| No merge with unresolved threads | All comments addressed |
| Squash merge preferred | Keeps `main` history clean |
| Author merges | After approval + green CI |

### 11.5 What Reviewers Check

1. Correct folder and module placement
2. Naming conventions followed
3. No domain logic in wrong layer
4. No cross-context coupling
5. Types are explicit and correct
6. UI handles loading/empty/error states
7. PR scope matches description
8. Documentation updated if conventions changed

---

## 12. Testing Standards (Future)

When testing is introduced:

| Layer | Tool | Location |
|-------|------|----------|
| Unit (domain) | Vitest | `modules/*/domain/**/*.test.ts` |
| Component | Vitest + Testing Library | `**/*.test.tsx` next to component |
| Integration | Vitest | `modules/*/application/**/*.test.ts` |
| E2E | Playwright | `e2e/` |

Naming: `describe("ProposalCard")` → `it("renders proposal title")`

---

## 13. Linting & Formatting

| Tool | Purpose |
|------|---------|
| ESLint | Code quality (`eslint-config-next`) |
| TypeScript | Type checking (`tsc --noEmit`) |
| Prettier | Formatting (add when team agrees — ADR) |

Run before committing:

```bash
npm run lint
npx tsc --noEmit
```

---

## 14. AI Agent Checklist

Before submitting code, an AI agent must verify:

- [ ] Files are in the correct bounded context folder
- [ ] No business logic in `app/` pages
- [ ] No cross-module internal imports
- [ ] `"use client"` only where required
- [ ] Types are explicit — no `any`
- [ ] Naming follows this document
- [ ] Imports use `@/` alias
- [ ] Components use shadcn/ui primitives, not raw HTML for interactive elements
- [ ] Dark mode classes applied where colors are used
- [ ] No auth, database, or out-of-scope features added
- [ ] Commit message follows Conventional Commits
- [ ] PR description uses the template

---

## 15. Related Documents

- [MASTERPLAN.md](./MASTERPLAN.md) — governance and document map
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design and DDD
- [PRODUCT_VISION.md](./PRODUCT_VISION.md) — domain language and boundaries
- [ROADMAP.md](./ROADMAP.md) — what to build and when
