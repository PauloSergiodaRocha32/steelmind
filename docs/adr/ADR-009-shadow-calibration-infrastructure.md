# ADR-009: Shadow Calibration and Benchmark Infrastructure

- Status: **Accepted**
- Date: 2026-07-01

## Context

To safely evolve Quote Engine V2 under ADR-008, SteelMind needs dedicated infrastructure to persist shadow executions, benchmark historical cases, and compute accuracy metrics without affecting the official budget engine behavior.

## Decision

Introduce two new bounded infrastructure modules:

- `modules/shadow`: shadow run entity, difference analyzer, and repository contracts/implementations
- `modules/calibration`: calibration dataset entities, benchmark repository contracts, and accuracy metrics services

Scope is infrastructure only:

- no AI implementation
- no official estimator behavior changes
- no rule or provider modifications

## Consequences

### Positive

- Enables controlled calibration loop toward ±5% target
- Creates auditable history for legacy-vs-v2 comparisons
- Supports future dashboards with typed DTO contracts

### Negative

- Adds repository and metrics code before full production data ingestion
- Requires future persistence wiring to database for full operational scale
