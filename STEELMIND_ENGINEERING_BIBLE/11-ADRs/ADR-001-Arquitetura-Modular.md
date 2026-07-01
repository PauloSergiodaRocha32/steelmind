# ADR-001: Arquitetura modular com isolamento de domínio

- Status: Accepted
- Data: 2026-07-01

## Contexto

As regras de negócio estavam dispersas e acopladas ao delivery web.

## Decisão

Adotar monólito modular com separação explícita:

- `domains/*` (núcleo)
- `application/*` (casos de uso)
- `infrastructure/*` (adapters)
- `app/*` (delivery)

## Consequências

- Maior testabilidade e clareza de fronteiras
- Migração incremental (strangler) sem big bang
