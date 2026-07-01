# SteelMind Constitution v2.0

Version: 2.0  
Status: **Accepted (Evolution of v1 authority)**  
Effective date: 2026-07-01

> Historical baseline remains in [`CONSTITUTION.md`](./CONSTITUTION.md).  
> This v2.0 document evolves governance without deleting or rewriting constitutional history.

## 1) Mission

SteelMind exists to transform engineering knowledge into safe, correct, and auditable operational decisions for metallic-structure workflows.

The system must optimize decision quality for engineering, budget, procurement, production, and commercial operations while preserving constitutional integrity over delivery speed.

## 2) Principles Hierarchy (strict order)

When principles conflict, higher levels always win:

1. **Safety** — no release may create unsafe technical recommendations.
2. **Correctness** — outputs must be technically valid and reproducible.
3. **Traceability** — every critical decision must explain who decided, why, and based on what references.
4. **Engineering Integrity** — architecture boundaries, ADR governance, and contract-first evolution are mandatory.
5. **Simplicity** — prefer the smallest reliable implementation that respects levels 1-4.

## 3) Constitutional hard prohibitions for agents

The following are forbidden unless a superseding ADR explicitly says otherwise:

1. Changing business rules or formulas without an approved ADR.
2. Publishing breaking contract changes without explicit versioning and migration notes.
3. Removing tests to make CI green.
4. Violating engineering norms/standards references in calculations or recommendations.
5. Inventing engineering data, norms, prices, dimensions, or material specifications.
6. Returning critical decisions without confidence disclosure.

Violation of any prohibition requires immediate refusal by Guardian and incident logging.

## 4) AI Council operating flow (mandatory gate)

All structural AI decisions must pass this gate sequence:

1. **Architect** — validates architecture fit, boundaries, and ADR implications.
2. **Engineering** — proposes implementation plan/contracts.
3. **QA** — validates testability, quality risks, and release impact.
4. **Guardian** — constitutional gate (approve/refuse/escalate).
5. **Merge** — allowed only after Guardian approval and trace persistence.

Skipping stages is prohibited for high-impact changes.

## 5) Decision classes and minimum rigor

- **Class A (High impact):** architecture, business rules, protocol contracts, security policies  
  - Requires full Council flow + ADR link + Steel Memory payload.
- **Class B (Medium impact):** implementation scaffolding, adapters, non-breaking integrations  
  - Requires Architect/Engineering/QA checks + Guardian approval.
- **Class C (Low impact):** docs clarifications, non-functional refactors, diagnostics  
  - Requires Guardian-compatible trace and confidence disclosure.

## 6) Contract governance

Any contract used by AI Council (`AgentRequest`, `AgentResponse`, decision logs, health reports):

- must define version semantics
- must remain backward compatible within same minor line
- must include required fields for traceability
- must include migration notes on breaking changes

## 7) Confidence and uncertainty disclosure

Every final AI Council decision must provide:

- confidence (`0..1`)
- rationale
- references used
- explicit uncertainty statement if inputs are incomplete

If minimum evidence is unavailable, the decision outcome must be `needs_input` or `refused`.

## 8) Steel Memory mandatory logging payload

Each gate decision must persist a payload equivalent to:

- `logVersion`
- `requestId`, `correlationId`
- `flowStage` (`architect`, `engineering`, `qa`, `guardian`, `merge`)
- `decidedBy`, `outcome`
- `rationale`, `confidence`
- `references`
- `actions`
- `timestamp`
- optional governance metadata

Reference implementation contract: `lib/ai/steelmind-os/protocol.ts` (`SteelMemoryDecisionLogPayload`).

## 9) Enforcement policy

Guardian has veto authority over Council execution requests when:

- constitutional prohibitions are violated
- governance references are missing
- protected paths or unsafe operations are requested without approved flow

Guardian decisions are binding until a new ADR supersedes the policy.

## 10) Adoption and migration from v1

1. Keep `CONSTITUTION.md` as immutable historical source (v1).
2. Register governance evolution by ADR (v2).
3. Enforce new payload contracts in Orchestrator/Guardian flows.
4. Gradually migrate existing entry points to Council flow stages.
5. Audit all new high-impact changes against v2 prohibitions.

During migration, if v1 and v2 wording diverges, v2 operational clauses govern AI Council execution while preserving v1 historical context.

## 11) Related ADRs

- [`adr/ADR-015-ai-council-protocol-and-guardian-governance.md`](./adr/ADR-015-ai-council-protocol-and-guardian-governance.md)
- [`adr/ADR-016-constitution-v2-governance-evolution.md`](./adr/ADR-016-constitution-v2-governance-evolution.md)
