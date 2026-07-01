# ADR-003: Knowledge Engine as First-Class Domain

- Status: **Accepted**
- Date: 2026-07-01

## Context

Technical rules currently live across code and heuristics, making evolution and traceability difficult.

## Decision

Create a dedicated `knowledge` domain for:

- formulas and decision rules
- constructive systems
- standards references
- parameter sets
- versioning metadata

Rules are treated as managed assets, not ad-hoc constants.

## Consequences

- Preserves organizational engineering knowledge
- Enables controlled evolution and calibration
- Requires governance process for rule publication
