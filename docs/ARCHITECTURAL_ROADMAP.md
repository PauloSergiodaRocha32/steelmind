# SteelMind OS Architectural Roadmap

Status: Active planning artifact  
Scope: AI operating architecture (not product feature backlog)

## Roadmap status markers

- `DONE` — accepted and operating in production or governed rollout
- `IN_PROGRESS` — implementation in active cycle
- `PLANNED` — approved but not started
- `BLOCKED` — waiting dependency or governance decision

## Phase map

### Phase Foundation v1.0

- **Status:** `IN_PROGRESS`
- **Objective:** Establish contract-first AI Council foundation (protocol, Guardian, trace, memory scaffold) with minimal runtime risk.
- **Acceptance criteria:**
  - Shared protocol contracts adopted (`AgentRequest`, `AgentResponse`, `DecisionTrace`, `Action`)
  - Guardian policy gate blocks constitutional violations
  - Steel Memory decision payload contract defined
  - Unit tests cover normalization, policy refusal, trace assembly
  - ADRs and architecture docs cross-linked
- **Dependencies:**
  - Constitution v2 governance accepted
  - Existing engine boundaries preserved
- **Risks:**
  - Contract drift between docs and adapters
  - Partial adoption across legacy agent entry points

### Phase Intelligence v1.1

- **Status:** `PLANNED`
- **Objective:** Increase decision quality with richer specialist intelligence and memory feedback loops.
- **Acceptance criteria:**
  - Specialist capability registry with explicit routing contracts
  - Decision quality metrics (approval latency, refusal reasons, confidence trends)
  - Memory retrieval strategy for lessons and historical outcomes
  - CTO Agent report generated periodically with trend baselines
- **Dependencies:**
  - Foundation v1.0 contracts stable
  - QA metrics ingestion available
- **Risks:**
  - Hallucination risk if evidence constraints are weak
  - Increased orchestration complexity without observability discipline

### Phase Automation v1.2

- **Status:** `PLANNED`
- **Objective:** Automate recurring governance and release checks through policy-aware workflows.
- **Acceptance criteria:**
  - Council flow automation for Architect -> Engineering -> QA -> Guardian -> Merge
  - Policy-as-code checks integrated into CI gates
  - Auto-generated Steel Memory logs for each gate decision
  - Standardized escalation workflow for blocked/refused decisions
- **Dependencies:**
  - Intelligence v1.1 quality metrics in place
  - Stable CI pipeline and release gate ownership
- **Risks:**
  - Over-automation causing false positives
  - Teams bypassing process when automation is slow

### Phase Enterprise v2.0

- **Status:** `PLANNED`
- **Objective:** Operate SteelMind OS as an enterprise-grade decision platform with full traceability, auditability, and compliance posture.
- **Acceptance criteria:**
  - Full trace pipeline with immutable audit records
  - SLO/SLA definitions for council decisions and policy checks
  - Security/compliance controls mapped to governance artifacts
  - Multi-workflow orchestration with strict contract versioning lifecycle
  - Executive/CTO dashboards driving prioritization by risk and value
- **Dependencies:**
  - Automation v1.2 stable and adopted
  - Security, DevOps, and QA shared operating model defined
- **Risks:**
  - Governance overhead without clear ownership model
  - Enterprise controls implemented without sufficient developer ergonomics

## Execution notes

- No phase may skip constitutional controls.
- Engine logic remains decoupled from agent runtime across all phases.
- Breaking contract changes require ADR + migration plan.
