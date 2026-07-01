# SteelMind Departments

> **Audience:** Product owners, architects, AI agents, and department maintainers.
> **Purpose:** Define SteelMind's organizational model for AI work: departments own decisions, teams own answers, agents execute work.
> **Status:** Active — SIP department layer.

---

## 1. Why Departments Exist

SIP introduced specialized agents. The next maturity step is to stop treating agents as isolated workers and organize them like a company:

```
                     SteelMind
                         CEO
                          |
        +-----------------+------------------+
        |                 |                  |
  Engineering         Product          Platform
        |                 |                  |
   several agents    several agents    several agents
```

Agents still exist, but they do not own every question. Departments provide accountability:

- **Departments** own a business or technical area.
- **Teams** inside departments answer domain questions.
- **Agents** ask teams and use the answers to build, test, document, and open PRs.

This prevents every agent from learning every ERP detail and keeps Gest.io knowledge in one governed place.

---

## 2. Department Model

| Layer | Responsibility | Example |
|-------|----------------|---------|
| CEO | System-level prioritization and final product direction | "Build perfect budget generation" |
| Department | Owns a broad business capability | Gest.io, Engineering, Product, Platform |
| Team | Owns a specific data/knowledge domain | Workforce, Materials, Finance |
| Agent | Executes a task using department/team answers | Budget Agent, Engineering Agent |
| Provider | Delivers raw/normalized data from systems | `providers/gestio`, `providers/inventory` |
| Knowledge | Versioned rules and technical truth | `knowledge/engineering`, `knowledge/gestio` |

---

## 3. Gest.io Department

The first department is **Gest.io** because SteelMind's intelligence depends on knowing which operational data exists, which data is missing, and where each fact should live.

```
departments/
└── gestio/
    ├── Workforce Team   # employees, salaries, benefits, productivity
    ├── Materials Team   # materials, stock, weight, cost, category
    ├── Purchasing Team  # purchase history, lead time, supplier
    ├── Production Team  # machines, sectors, capacity, productivity
    ├── Finance Team     # overhead, taxes, markup, fixed costs
    └── CRM Team         # customers, jobs, contracts, history
```

### Principle

Agents do not need to know how to query Gest.io.

They ask department teams:

```
Budget Agent: Quanto custa uma hora de serralheiro?
Workforce Team: Responde com fonte, status, campos faltantes e provider responsável.

Budget Agent: Quanto custa o tubo 50x30?
Materials Team: Responde usando material/provider.

Budget Agent: Qual fornecedor tem menor prazo?
Purchasing Team: Responde usando histórico/lead time.

Budget Agent: Existe capacidade de produção?
Production Team: Responde capacidade ou aponta lacunas.
```

---

## 4. Data Readiness Matrix

The matrix answers:

> "What does Gest.io still need so SteelMind can generate a perfect budget?"

Each row defines:

| Column | Meaning |
|--------|---------|
| Information | Business fact needed by SteelMind |
| Exists in Gest.io? | `yes`, `partial`, `no`, or `unknown` |
| Required? | `required`, `ideal`, or `optional` |
| Responsible team | Gest.io department team accountable for the answer |
| System of record | `gestio` or `steelmind` |
| Provider | Provider that should expose the fact |
| Gap | What must be created/enriched/audited |

The canonical matrix lives in code at `departments/gestio/registry.ts` and is documented at `knowledge/gestio/data-readiness-matrix.md`.

---

## 5. Question Flow

```
Agent intent
   |
   v
Department router
   |
   +--> Workforce Team
   +--> Materials Team
   +--> Purchasing Team
   +--> Production Team
   +--> Finance Team
   +--> CRM Team
   |
   v
Answer with:
   - team
   - confidence
   - source provider
   - readiness rows
   - missing information
   - next action
```

Runtime APIs:

- `POST /api/v1/departments/gestio/ask`
- `GET /api/v1/departments/gestio/audit`

---

## 6. Rules

1. Agents ask departments for business data instead of importing Gest.io details.
2. Departments may use providers, but providers do not calculate.
3. Missing data becomes backlog, not guesswork.
4. If the data belongs in Gest.io, enrich Gest.io.
5. If the data belongs in SteelMind, document it in `knowledge/` and expose it through a SteelMind module/provider.
6. Every team answer must state confidence and gaps.

---

## 7. Related Documents

- [SIP.md](./SIP.md)
- [ROADMAP.md](./ROADMAP.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [../knowledge/gestio/data-readiness-matrix.md](../knowledge/gestio/data-readiness-matrix.md)
