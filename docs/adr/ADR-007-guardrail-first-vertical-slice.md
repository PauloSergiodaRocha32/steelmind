# ADR-007: Guardrail as First Complete Vertical Slice

- Status: **Accepted**
- Date: 2026-07-01

## Context

SteelMind needs a high-confidence pilot domain to validate the new architecture end-to-end.

## Decision

Implement `Guarda-corpo` as the first complete constructive system in Quote Engine V2.

Initial KPI:

- estimation error within ±5% against real cost baseline

## Consequences

- Focused domain depth before breadth
- Faster validation loop with engineering and production stakeholders
- Other systems remain temporarily legacy or partial
