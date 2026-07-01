# SteelMind Architecture Addendum — Shadow, Calibration, Benchmark, Accuracy

Status: Active addendum for Phase 0 infrastructure  
Canonical base: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## 1. Scope

This addendum documents infrastructure-only modules introduced for calibration and validation of Quote Engine V2 in shadow mode.

Constraints respected:

- Official budget engine remains unchanged
- No estimator replacement
- No AI implementation in this module set
- No technical rule mutation

## 2. Shadow Mode Architecture

Module: `modules/shadow`

### Responsibilities

- Persist every shadow execution (`ShadowRun`)
- Compare official and SteelMind outputs (`Difference Analyzer`)
- Provide repository contracts for future DB adapters

### Internal structure

```text
modules/shadow/
  domain/
    entities/shadow-run.ts
    value-objects/budget-breakdown.ts
  application/
    services/difference-analyzer.ts
  repository/
    shadow-run.repository.ts
  infrastructure/
    file-shadow-run.repository.ts
    memory-shadow-run.repository.ts
    supabase-shadow-run.repository.ts
    default-shadow-run.repository.ts
```

### Comparison categories

- materiais
- mão de obra
- consumíveis
- pintura
- logística
- margem
- preço final

Generated outputs:

- erro absoluto
- erro percentual
- erro acumulado

## 3. Calibration Dataset Architecture

Module: `modules/calibration`

### Responsibilities

- Persist calibration cases (`CalibrationCase`)
- Register and execute benchmark runs
- Compare benchmark executions
- Generate benchmark summary and accuracy metrics

### Internal structure

```text
modules/calibration/
  domain/
    entities/calibration-case.ts
  repository/
    calibration-case.repository.ts
    benchmark.repository.ts
  infrastructure/
    file-calibration-case.repository.ts
    in-memory-benchmark.repository.ts
    supabase-calibration-case.repository.ts
    supabase-benchmark.repository.ts
    default-calibration-case.repository.ts
    default-benchmark.repository.ts
  application/
    services/accuracy-metrics.ts
    dto/dashboard-dtos.ts
```

## 4. Benchmark Suite Contracts

`BenchmarkRepository` exposes:

- `registerCase()`
- `runBenchmark()`
- `compareResults()`
- `generateSummary()`

Current implementation:

- in-memory benchmark repository for deterministic tests
- supabase benchmark repository for persistent runs when configured

## 5. Accuracy Metrics Contracts

`calculateAccuracyMetrics(cases)` returns:

- Precisão Global
- Precisão por produto
- Precisão por categoria
- Precisão por versão
- Erro Médio
- Erro Máximo
- Erro Mínimo
- RMSE
- MAPE

## 6. Dashboard DTO Layer (No UI)

Prepared DTOs:

- `CalibrationDashboardDTO`
- `BenchmarkDashboardDTO`
- `AccuracyDashboardDTO`

These objects are delivery contracts only; no interface rendering is included in this phase.

## 7. Governance

This addendum follows:

- `CONSTITUTION.md`
- ADR-008 (strangler shadow migration)
- ADR-009 (shadow calibration infrastructure)
- ADR-010 (persistent repositories + CI quality gates)
- ADR-011 (engineering bible as navigable knowledge system)
- ADR-012 (knowledge platform information architecture and governance)

## 8. Quality Gates (CI)

Automated gate pipeline validates:

- lint
- unit tests
- coverage generation
- production build

This enforces non-regression for infrastructure evolution while preserving official runtime behavior.
