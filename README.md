# SteelMind

Enterprise SaaS platform for steel industry operations.

## Tech Stack

- **Next.js 15** — App Router, Turbopack
- **TypeScript** — Strict mode
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Accessible component primitives
- **Zustand** — Client state management
- **React Hook Form + Zod** — Forms and validation (ready to use)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

| Document | Description |
|----------|-------------|
| [docs/SIP.md](docs/SIP.md) | SteelMind Intelligence Platform — Data, Knowledge, Agents |
| [docs/DEPARTMENTS.md](docs/DEPARTMENTS.md) | Department model — CEO, teams, agents, Gest.io audit |
| [docs/MASTERPLAN.md](docs/MASTERPLAN.md) | Project governance and document map |
| [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md) | Product philosophy and domain boundaries |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, DDD, events, API conventions |
| [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) | Code style, naming, Git, and PR strategy |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phased platform delivery plan |

## Cursor Integration

Project-level Cursor rules live in `.cursor/rules/*.mdc`.

When this repository is opened in Cursor Desktop, the agent/chat context includes:

- SIP governance
- Department/team model
- Gest.io data readiness matrix
- Provider/Knowledge/Agent boundaries

See [AGENTS.md](AGENTS.md) for the root agent guide.

## License

Private — All rights reserved.
