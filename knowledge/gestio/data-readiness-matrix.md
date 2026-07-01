# Gest.io Data Readiness Matrix

> **Context:** Gest.io Department / SIP Data Platform  
> **Version:** 1.0  
> **Last reviewed:** 2026-07-01  
> **Purpose:** Decide what Gest.io still needs so SteelMind can generate reliable budgets, engineering outputs, and production plans.

---

## 1. Principle

SteelMind should not develop features in the dark. Before a calculation, budget, or agent workflow becomes "intelligent", the required data must be classified:

1. Exists in Gest.io
2. Missing from Gest.io
3. Belongs in Gest.io
4. Belongs in SteelMind Knowledge
5. Needs a provider
6. Needs enrichment/backfill

---

## 2. Matrix

| Information | Exists in Gest.io? | Required? | Responsible team | System of record | Provider | Gap / action |
|-------------|--------------------|-----------|------------------|------------------|----------|--------------|
| Funcionário | yes | required | Workforce | gestio | `providers/employees` | Implement provider |
| Salário | yes | required | Workforce | gestio | `providers/employees` | Confirm field mapping |
| Encargos | yes | required | Workforce | gestio | `providers/employees` | Confirm calculation vs stored values |
| Centro de custo | yes | required | Workforce | gestio | `providers/finance` | Map cost center relation |
| Custo hora | partial | required | Workforce | gestio | `providers/employees` | Derive from salary + benefits + charges if not stored |
| Material | yes | required | Materials | gestio | `providers/materials` | Implemented for catalog/taxonomy |
| Peso | partial | ideal | Materials | gestio | `providers/materials` | Audit products missing weight |
| Categoria | yes | required | Materials | gestio | `providers/materials` | Implemented via taxonomy |
| Estoque | yes | required | Materials | gestio | `providers/inventory` | Implemented for balances |
| Fornecedor | yes | required | Purchasing | gestio | `providers/suppliers` | Implement provider |
| Histórico de compra | unknown | ideal | Purchasing | gestio | `providers/suppliers` | Audit API endpoints |
| Lead time | partial | ideal | Purchasing | gestio | `providers/suppliers` | Create/enrich field if absent |
| Máquina | yes | required | Production | gestio | `providers/production` | Implement provider |
| Setor produtivo | yes | required | Production | gestio | `providers/production` | Map sectors |
| Capacidade | partial | required | Production | gestio | `providers/production` | Confirm source of capacity |
| Tempo padrão | partial | required | Production | steelmind | `providers/production` + `knowledge/production` | If absent in Gest.io, model in SteelMind |
| Despesas indiretas | partial | required | Finance | gestio | `providers/finance` | Audit source tables |
| Markup | partial | required | Finance | steelmind | `knowledge/pricing` | Define rule/version |
| Impostos | yes | required | Finance | gestio | `providers/finance` | Confirm tax fields |
| Custos fixos | partial | required | Finance | gestio | `providers/finance` | Audit completeness |
| Cliente | yes | required | CRM | gestio | `providers/crm` | Implement provider |
| Obra / projeto | yes | required | CRM | gestio | `providers/crm` + `providers/gestio` | Map project linkage |
| Contrato | partial | required | CRM | gestio | `providers/crm` | Audit contract endpoints |
| Norma ABNT | no | required | Engineering Knowledge | steelmind | `knowledge/engineering` | Must live in Knowledge |
| Fórmulas | no | required | Engineering Knowledge | steelmind | `knowledge/engineering` | Must live in Knowledge |

---

## 3. Audit Backlog Categories

| Category | Meaning |
|----------|---------|
| Field creation | Gest.io needs a new field |
| Field mapping | Field exists but SteelMind has not mapped it |
| Data enrichment | Field exists but values are incomplete |
| Provider implementation | SteelMind lacks provider code |
| Knowledge article | Data does not belong in Gest.io; document in `knowledge/` |
| Validation rule | Data exists but needs quality checks |

---

## 4. First Audit Questions

1. Which employee fields exist for salary, benefits, charges, schedule, and cost center?
2. Which material fields contain weight, density, standard dimensions, cost, and supplier?
3. Does Gest.io store purchase lead time or must it be inferred from history?
4. Where are machines, sectors, capacity, and standard times stored?
5. Which finance values are ERP data vs pricing policy?
6. Which customer/project/contract relationships are reliable enough for budget traceability?

---

## 5. Runtime Contract

The code representation lives in `departments/gestio/registry.ts`. APIs expose the same matrix:

- `GET /api/v1/departments/gestio/audit`
- `POST /api/v1/departments/gestio/ask`

Agents should use the department API or department functions instead of importing Gest.io provider details directly.
