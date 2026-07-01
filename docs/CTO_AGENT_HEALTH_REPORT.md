# CTO Agent Health Report Playbook

Status: Operational artifact (non-coding agent)  
Cadence: Weekly (tactical) + Monthly (strategic)

## 1) Purpose

The CTO Agent is a governance observer, not a code author.  
Its role is to generate periodic health intelligence so engineering leadership can prioritize the next cycle with evidence.

## 2) Required report sections

Every report must include:

1. Architecture grade
2. Quality grade
3. Test coverage snapshot
4. Technical debt status
5. Code duplication hotspots
6. Performance health
7. Standards/constitution health
8. Top risks
9. Recommended priorities for next cycle

## 3) Grading model (recommended baseline)

- **Architecture Grade (0-100 + letter):**
  - Boundary integrity
  - Contract consistency
  - ADR compliance
- **Quality Grade (0-100 + letter):**
  - Defect trend
  - Lint/type hygiene
  - Release stability

## 4) Minimum data sources

- CI results (lint/test/build)
- Unit/integration coverage reports
- Static analysis signals (duplication, complexity)
- Runtime performance indicators (latency/build duration)
- ADR and constitution compliance checks
- Steel Memory decision logs

If data is missing, the report must explicitly mark uncertainty and downgrade confidence.

## 5) Output contract

TypeScript protocol contract:

- `CtoAgentHealthReport` in `lib/ai/steelmind-os/protocol.ts`

Mandatory summary fields:

- `executiveSummary`
- `risks[]` with mitigation
- `recommendedPriorities[]` ranked by impact/effort
- references to Constitution/ADR/rules when relevant

## 6) Recommended priority rubric

For each priority:

- **Impact:** low/medium/high/critical
- **Effort:** low/medium/high
- **Owner:** council target role/team
- **Rationale:** why this is top priority now

Always rank priorities in deterministic order (`priorityRank` ascending).

## 7) Delivery template

Use this structure in every period:

1. Executive summary
2. Grades (architecture + quality)
3. Metrics (coverage, debt, duplication, performance, standards)
4. Risks (top 3-5)
5. Recommended priorities (top 3-7)
6. Confidence and data quality notes

## 8) Governance rules

- CTO Agent cannot approve merges.
- CTO Agent cannot bypass Guardian.
- CTO Agent cannot suppress risks for schedule reasons.
- Any recommendation affecting business rules must reference ADR requirements.
