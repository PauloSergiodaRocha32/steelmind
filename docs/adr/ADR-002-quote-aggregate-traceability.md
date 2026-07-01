# ADR-002: Quote Aggregate + Immutable Versions + Mandatory Calculation Trace

- Status: **Accepted**
- Date: 2026-07-01

## Context

The legacy estimator generates totals and line items, but traceability is not sufficient for an auditable expert system.

## Decision

Adopt `Quote` as the aggregate root with immutable quote versions.

Every priced line item must include `CalculationTrace` with:

- formula id and version
- parameter values
- source references (rule, norm, catalog)
- assumptions and limitations
- units and confidence

## Alternatives considered

1. Continue mutable quote records  
   Rejected: poor auditability and revision safety.
2. Trace only quote-level summary  
   Rejected: insufficient forensic detail.

## Consequences

- Strong explainability and compliance posture
- Better debugging and QA calibration
- Larger schema and more write volume
