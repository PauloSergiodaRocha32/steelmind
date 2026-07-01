# ADR-003: Shadow Mode obrigatório para evolução do motor

- Status: Accepted
- Data: 2026-07-01

## Contexto

A substituição direta do motor oficial criaria alto risco operacional.

## Decisão

Todo motor novo entra em shadow mode:

- execução paralela
- comparação oficial vs SteelMind
- persistência dos resultados
- calibração antes do cutover

## Consequências

- Segurança de migração
- Evidência quantitativa para decisões de release
