# ADR-015: AI Council Protocol and Guardian Governance

- Status: **Accepted**
- Date: 2026-07-01
- Decision Makers: SteelMind Architecture Council

## Context

SteelMind evolved with multiple AI entry points but lacked a single protocol for:

- multi-agent decision orchestration
- constitutional policy enforcement authority
- consistent traceability of why decisions were made

This made operational audits and cross-team automation harder than necessary.

## Decision

Adopt the SteelMind OS V1 foundation with mandatory decisions:

1. **Multi-agent Council model** with layered responsibilities:
   - Core: Orchestrator, Guardian, Steel Memory
   - Specialists: Engineering, Budget, Commercial, Production, Procurement, Knowledge
   - Infra: QA, DevOps, Architect, Security
2. **Standard protocol contracts** (`AgentRequest`, `AgentResponse`, `Action`, `DecisionTrace`)
3. **Guardian authority** as constitutional gate before specialist execution
4. **Traceability-by-default** for every decision (`who`, `why`, `references`, `confidence`)
5. **Operating gate order** for high-impact requests:
   - Architect -> Engineering -> QA -> Guardian -> Merge
6. **Steel Memory decision logging payload** as mandatory output for gated decisions

## Alternatives considered

1. Keep each prompt/agent flow independent  
   Rejected: inconsistent governance and low auditability.

2. Full runtime rewrite before contracts  
   Rejected: high migration risk and no immediate production benefit.

## Consequences

### Positive

- Lower-risk path to enterprise-grade orchestration
- Strong contract compatibility for QA, observability, and governance
- Guardian refusal policy prevents unsafe execution requests
- Reusable trace model for audits and future memory/analytics layers

### Negative

- Additional protocol maintenance burden
- Requires adapters to progressively integrate existing flows

## Traceability requirements (mandatory)

Every AI Council response must include:

- `requestId` and correlation metadata
- action list and execution intent
- decision trace entries with references and confidence
- final accountable decision authority
- steel memory-compatible decision log payload fields per protocol contract

Requests missing governance references in execution context must be refused by Guardian.

## Migration / Adoption

1. Introduce protocol + core scaffolding in `lib/ai/steelmind-os`
2. Start integration through adapters in non-critical endpoints first
3. Expand specialist registry and telemetry in V2
4. Align governance clauses with `CONSTITUTION_V2.md`
