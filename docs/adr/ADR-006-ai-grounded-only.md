# ADR-006: AI Grounded Reasoning Only

- Status: **Accepted**
- Date: 2026-07-01

## Context

Generative responses without grounded references can produce non-auditable technical statements.

## Decision

AI is restricted to grounded reasoning:

- select/apply known rules
- summarize known traces
- request missing data when confidence is insufficient

AI must not invent formulas, standards, or pricing assumptions.

## Consequences

- Higher trust and compliance
- Reduced hallucination risk
- Less “creative” output in ambiguous prompts
