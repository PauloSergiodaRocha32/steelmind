# Data Platform — Providers

Typed, read-only adapters to company systems. Providers **deliver data** — they do not calculate engineering rules or render UI.

## Contract

1. One provider per external domain (Gest.io module or future system)
2. Returns normalized TypeScript types — no React, no business formulas
3. Runtime and agents consume providers; **never** call Gest.io API directly from `modules/` or `app/`
4. Sync strategy documented per provider

## Providers

| Path | Gest.io / source domain | Status |
|------|-------------------------|--------|
| `gestio/` | ERP core — products, taxonomy, branches | **Done** (migrated from `services/gestio/`) |
| `employees/` | Workforce, roles, labor rates | Scaffold |
| `materials/` | Material catalog views | **Done** |
| `suppliers/` | Supplier master and history | Scaffold |
| `inventory/` | Stock movements, balances | **Done** |
| `production/` | Shop floor, orders, PCP | Scaffold |
| `finance/` | Cost centers, financial context | Scaffold |
| `crm/` | Customers, opportunities | Scaffold |
| `documents/` | Attachments, memorials | Scaffold |

## Migration

Foundation code lives in `services/gestio/`. SIP-1 moves it here with re-exports for backward compatibility.

See [docs/SIP.md](../docs/SIP.md).
