# Traceability Matrix

Rastreabilidade entre conhecimento, implementação e validação automatizada.

| ID | Tema | Documento(s) | Código | Testes |
|----|------|--------------|--------|--------|
| TRC-001 | Readiness Gate operacional no orçamento | [06-Domains/OrcamentoOperacionalInglesa.md](../06-Domains/OrcamentoOperacionalInglesa.md)<br>[11-ADRs/ADR-008-Readiness-Gate-Operacional.md](../11-ADRs/ADR-008-Readiness-Gate-Operacional.md)<br>[13-Research/Orcamentacao.md](../13-Research/Orcamentacao.md) | ✅ [domains/quoting/services/quote-readiness.ts](../../domains/quoting/services/quote-readiness.ts)<br>✅ [application/quoting/use-cases/assess-quote-readiness.ts](../../application/quoting/use-cases/assess-quote-readiness.ts)<br>✅ [app/api/v1/budget/chat/route.ts](../../app/api/v1/budget/chat/route.ts)<br>✅ [app/api/v1/budget/analyze/route.ts](../../app/api/v1/budget/analyze/route.ts)<br>✅ [modules/budget/components/budget-copilot.tsx](../../modules/budget/components/budget-copilot.tsx) | ✅ [domains/quoting/services/quote-readiness.test.ts](../../domains/quoting/services/quote-readiness.test.ts) |
| TRC-002 | Shadow mode e comparação de motores | [02-Architecture/ShadowMode.md](../02-Architecture/ShadowMode.md)<br>[11-ADRs/ADR-003-Shadow-Mode.md](../11-ADRs/ADR-003-Shadow-Mode.md)<br>[12-Roadmap/Milestones.md](../12-Roadmap/Milestones.md) | ✅ [application/quoting/use-cases/run-quote-engine-v2-shadow.ts](../../application/quoting/use-cases/run-quote-engine-v2-shadow.ts)<br>✅ [modules/shadow/application/services/difference-analyzer.ts](../../modules/shadow/application/services/difference-analyzer.ts)<br>✅ [modules/shadow/application/services/shadow-run-recorder.ts](../../modules/shadow/application/services/shadow-run-recorder.ts) | ✅ [modules/shadow/application/services/difference-analyzer.test.ts](../../modules/shadow/application/services/difference-analyzer.test.ts)<br>✅ [modules/shadow/infrastructure/file-shadow-run.repository.test.ts](../../modules/shadow/infrastructure/file-shadow-run.repository.test.ts) |
| TRC-003 | Knowledge Platform e automação da wiki | [14-Knowledge-Platform/PlatformArchitecture.md](../14-Knowledge-Platform/PlatformArchitecture.md)<br>[11-ADRs/ADR-009-Wiki-V2-CrossLinks-Rastreabilidade.md](../11-ADRs/ADR-009-Wiki-V2-CrossLinks-Rastreabilidade.md) | ✅ [scripts/create-engineering-bible.ts](../../scripts/create-engineering-bible.ts)<br>✅ [scripts/seed-engineering-bible-content.ts](../../scripts/seed-engineering-bible-content.ts)<br>✅ [scripts/update-engineering-bible-indexes.ts](../../scripts/update-engineering-bible-indexes.ts) | N/A |

## Política de rastreabilidade

- Toda mudança estrutural deve ter referência documental e evidência de validação.
- Priorizar cobertura de testes para fluxos críticos operacionais.
