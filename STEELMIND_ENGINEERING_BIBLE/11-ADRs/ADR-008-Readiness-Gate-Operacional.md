# ADR-008: Readiness Gate operacional antes da confirmação do orçamento

- Status: Accepted
- Data: 2026-07-01

## Contexto

O orçamento estava sendo confirmado sem validação explícita de pendências críticas, comprometendo compras e produção.

## Decisão

Introduzir camada de prontidão operacional:

- score de prontidão
- alertas e bloqueios críticos
- explicação objetiva de pendências
- bloqueio apenas para riscos críticos (sem travar warnings)

## Consequências

### Positivas
- redução de erros de handoff
- maior previsibilidade operacional
- aumento de confiança da diretoria e engenharia

### Negativas
- necessidade de calibrar regras de prontidão ao longo do uso real
