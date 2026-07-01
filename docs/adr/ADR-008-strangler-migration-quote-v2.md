# ADR-008: Strangler Migration from Legacy Estimator to Quote Engine V2

- Status: **Accepted**
- Date: 2026-07-01

## Context

Legacy estimator is operational and supports current workflows. A hard cutover would create high regression risk.

## Decision

Adopt strangler migration with feature flags:

- `QUOTE_ENGINE_V2_SHADOW_MODE`: run v2 in parallel, do not affect outputs
- `QUOTE_ENGINE_V2_ENABLED`: controlled cutover path

Shadow runs compare totals and confidence before full replacement.

## Consequences

- Lower migration risk
- Enables empirical calibration
- Temporary duplicated compute and complexity during transition
