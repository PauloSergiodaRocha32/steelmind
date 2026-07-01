# ADR-004: ACL Gestio para isolamento do domínio

- Status: Accepted
- Data: 2026-07-01

## Contexto

DTOs e IDs do Gestio vazavam para regras internas.

## Decisão

Aplicar Anti-Corruption Layer:

- portas canônicas de catálogo e integração
- mapeadores Gestio -> modelo interno
- domínio independente de semântica de ERP específico

## Consequências

- Menor acoplamento externo
- Base para multi-ERP no futuro
