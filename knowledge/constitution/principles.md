# SteelMind Constitution

Non-negotiable principles for the Intelligence Platform. Agents and contributors must not violate these.

## 1. Knowledge Before Code

No engineering calculation or business rule ships without a corresponding `knowledge/` article that states inputs, norms, assumptions, and dependencies.

## 2. Data Without Logic

`providers/` deliver company truth. They do not encode engineering formulas, margin rules, or UI concerns.

## 3. Human Review on Merge

Agents may propose pull requests. No autonomous merge to `main` without human approval.

## 4. Gest.io Is System of Record

SteelMind does not replace Gest.io for transactional ERP data. Providers sync and expose; they do not fork master data silently.

## 5. Bounded Contexts Stay Bounded

Runtime modules communicate via IDs, events, and published types — not by importing another module's domain internals.

## 6. Transparency Over Magic

Every number shown to a user must be traceable to a provider snapshot or a documented knowledge rule.

## 7. Version Everything That Matters

Knowledge articles, calculation specs, and provider contracts are versioned in Git. Breaking changes require explicit migration notes.

---

*Last reviewed: 2026-07-01 — SIP-0*
