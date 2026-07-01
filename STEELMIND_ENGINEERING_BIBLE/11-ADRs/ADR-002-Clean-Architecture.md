# ADR-002: Clean Architecture aplicada aos fluxos críticos

- Status: Accepted
- Data: 2026-07-01

## Contexto

O motor de orçamento precisa sobreviver a mudanças de framework, banco e integrações externas.

## Decisão

Adotar dependência direcionada para dentro:

- UI e APIs dependem de application/domain
- domínio não depende de frameworks
- adapters implementam portas

## Consequências

- Reuso do core para múltiplos canais
- Menor lock-in tecnológico
