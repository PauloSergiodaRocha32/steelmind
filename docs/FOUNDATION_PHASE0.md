# SteelMind Foundation Phase 0

Status: In Progress  
Date: 2026-07-01

This document captures the approved foundation scope for the constitutional rebuild.

## Scope

- Guardrail (`Guarda-corpo`) as first full constructive-system domain
- Gestio integration through Anti-Corruption Layer (ACL)
- Initial precision target: maximum ±5% error versus real cost baseline
- Shadow-mode migration before Quote Engine V2 cutover

## Architectural Map

```text
Experience (Next.js)
  -> Application use cases
    -> Domain core (quoting, knowledge, catalog, production costing)
      -> Infrastructure adapters (DB, Gestio ACL, AI grounded adapter)
```

## Bounded Contexts

1. Quoting (core)
2. Knowledge (core)
3. Catalog
4. Production Costing
5. Commercial
6. Integration (ACL)
7. Platform

## Migration Strategy

1. Document ADRs and constitutional governance
2. Add domain skeleton and typed contracts
3. Enable shadow-mode execution for v2 quote engine
4. Introduce v2 canonical schema in PostgreSQL
5. Measure legacy vs v2 divergence
6. Calibrate until target precision gate is reached

## Initial Risk Register

- Missing real-world calibration dataset
- ERP data quality and field inconsistency
- Temporary dual-engine complexity
- Policy misconfiguration in tenant-aware RLS
- Domain drift if rule ownership process is not enforced
