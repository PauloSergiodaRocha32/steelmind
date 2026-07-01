# Consolidated Risk Catalog

Consolidação de riscos estratégicos, técnicos e operacionais em uma visão única.

| ID | Risco | Probabilidade | Impacto | Mitigação | Fonte |
|----|-------|---------------|---------|-----------|-------|
| R-01 | Dados de calibração insuficientes | Alta | Alto | Definir pipeline de coleta e validação por domínio | [12-Roadmap/RiskRegister.md](../12-Roadmap/RiskRegister.md) |
| R-02 | Divergência entre documentação e código | Média | Alto | Índices automáticos + revisão em PR | [12-Roadmap/RiskRegister.md](../12-Roadmap/RiskRegister.md) |
| R-03 | Acoplamento indevido com ERP | Média | Médio | ACL estrita + testes de contrato | [12-Roadmap/RiskRegister.md](../12-Roadmap/RiskRegister.md) |
| R-04 | Regressão de qualidade sem gate | Baixa | Alto | CI quality gates obrigatórios | [12-Roadmap/RiskRegister.md](../12-Roadmap/RiskRegister.md) |
| R-05 | Crescimento documental sem navegação | Média | Médio | Índice global e índices por seção automatizados | [12-Roadmap/RiskRegister.md](../12-Roadmap/RiskRegister.md) |
| R-OPS-01 | Dependência externa Gestio indisponível | Média | Alto | Fallback local + avisos de fonte nas APIs | [app/api/v1/purchasing/requisitions/route.ts](../../app/api/v1/purchasing/requisitions/route.ts) |
| R-OPS-02 | Confirmação de orçamento sem dados críticos | Média | Alto | Readiness Gate com bloqueio seletivo | [app/api/v1/budget/chat/route.ts](../../app/api/v1/budget/chat/route.ts) |
| R-DOC-01 | Crescimento de docs sem rastreabilidade | Média | Médio | Wiki v2 com matriz doc->código->testes | [TraceabilityMatrix.md](TraceabilityMatrix.md) |

## Uso recomendado

1. Revisar este catálogo em cada ciclo de arquitetura.
2. Atualizar risco e mitigação quando houver mudança de contexto.
3. Abrir ADR quando mitigação exigir mudança estrutural.
