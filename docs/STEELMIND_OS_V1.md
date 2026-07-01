# SteelMind OS V1 Foundation

Status: Proposed foundation, low-risk scaffolding  
Last updated: 2026-07-01

## 1. Why this structure

SteelMind already has specialized modules and guardrails, but decisions are still fragmented across isolated prompts.  
V1 introduces a shared operating contract so every AI request can be routed, audited, and constrained by Constitution authority without rewriting business engines.

## 2. Layered architecture (V1)

```text
SteelMind OS
├─ Core Layer
│  ├─ AI Orchestrator (routing + trace assembly)
│  ├─ Guardian (constitution-bound policy authority)
│  └─ Steel Memory (decision history + lessons learned)
├─ Specialist Layer
│  ├─ Engineering
│  ├─ Budget
│  ├─ Commercial
│  ├─ Production
│  ├─ Procurement
│  └─ Knowledge
├─ Infrastructure Layer
│  ├─ QA
│  ├─ DevOps
│  ├─ Architect
│  └─ Security
└─ Engine Layer
   └─ Existing business engines (decoupled, unchanged in V1)
```

Key principle: agents coordinate decisions; engines keep deterministic business logic.

## 3. AI Council decision flow

1. Request enters Orchestrator using a standard protocol (`AgentRequest`).
2. For high-impact decisions, gate order follows: Architect -> Engineering -> QA -> Guardian -> Merge.
3. Guardian evaluates constitutional/rule compliance before merge authorization.
4. If refused, Guardian decision is final and traceable.
5. If approved, Orchestrator routes to the target specialist or best-match specialist.
6. Specialist returns decision + actions with confidence.
7. Orchestrator assembles full decision trace (`who`, `why`, `references`, `confidence`).
8. Steel Memory stores decision record for future retrieval and continuous learning.

## 4. Standard protocol requirements

Every decision must include:

- Request identity and correlation (`requestId`, `correlationId`)
- Intent + action plan (`capability`, `actions`)
- Governance references (Constitution, ADRs, rules)
- Decision trace entries with actor, rationale, references, confidence
- Final decision outcome and accountable authority

This enables consistent logs, QA validation, and future observability pipelines.

Constitutional source of truth: [`CONSTITUTION_V2.md`](./CONSTITUTION_V2.md)
Phase progression reference: [`ARCHITECTURAL_ROADMAP.md`](./ARCHITECTURAL_ROADMAP.md)

## 5. Guardian authority boundaries

Guardian can refuse requests when:

- Mandatory request contract is invalid
- Governance references are missing in execution contexts
- Protected code paths are targeted without explicit approval flow
- Prompt attempts to bypass Constitution or Guardian checks

Guardian never mutates business logic directly; it only approves/refuses routing authority.

## 6. V1 implementation boundary

In scope:

- Shared protocol contracts
- Core orchestrator/guardian/memory interfaces and skeletons
- Unit tests for protocol, policy refusal, and trace assembly

Out of scope for V1:

- Replacing current app orchestration
- Engine rewrites
- New runtime infrastructure (queues, distributed tracing, workflows)

V2 can add adapter implementations, specialist registries, and production telemetry.
