# ADR-013: Quote Readiness Gate for Operational Confirmation

- Status: **Accepted**
- Date: 2026-07-01

## Context

The current quote flow allows confirmation even when critical inputs are missing (material, length, empty BOM, invalid pricing). This creates operational risk for purchasing, production, and margin control in a real metalworking company workflow.

## Decision

Introduce an operational readiness assessment before quote confirmation:

1. Compute a `QuoteReadinessReport` with:
   - level (`ready`, `review_required`, `blocked`)
   - score (0-100)
   - checks and blockers
2. Expose readiness in:
   - `POST /api/v1/budget/analyze`
   - `POST /api/v1/budget/chat`
   - `GET /api/v1/budget/quotes?id=...`
3. Enforce gate on confirmation:
   - if level is `blocked`, return `422` with readiness details
   - if `review_required`, allow confirmation (non-blocking support model)
4. Surface readiness in UI (`BudgetCopilot`) with explicit actionable alerts.

## Alternatives considered

1. Keep confirmation fully manual  
   Rejected: high variance and hidden risk at operation handoff.

2. Block for all warnings  
   Rejected: harms throughput and violates assistive-only principle.

## Consequences

### Positive

- Improves quote reliability before commercial/engineering handoff
- Reduces forgotten assumptions and incomplete inputs
- Increases trust through explainable readiness checks

### Negative

- Adds one more evaluation step in quote lifecycle
- Requires ongoing tuning of readiness rules by domain feedback

## Migration / Adoption

1. Start with rule-based checks using existing v1 + v2 signals
2. Keep shadow mode independent and non-blocking
3. Calibrate thresholds (confidence, margin bounds) with real operation data
