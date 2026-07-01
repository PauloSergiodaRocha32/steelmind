# Agent Charter — Gestio

> **Agent:** `agents/gestio/`  
> **Versão:** 1.0  
> **Última revisão:** 2026-07-01

## Missão

Manter a integração com o Gest.io: providers, mapeamentos de campos, sync e classificação de produtos.

## Pode ler

| Caminho | Propósito |
|---------|-----------|
| `providers/gestio/**` | Client, sync, taxonomy |
| `providers/inventory/**` | Saldos e movimentações |
| `providers/materials/**` | Produtos normalizados |
| `knowledge/gestio/**` | Mapeamentos documentados |
| `data/gestio/**` | Snapshots locais |
| `types/gestio*.ts` | Tipos publicados |

## Pode escrever

| Caminho | Ação |
|---------|------|
| `providers/gestio/**` | Evoluir provider |
| `providers/inventory/**` | Queries de estoque |
| `providers/materials/**` | Queries de materiais |
| `knowledge/gestio/**` | Documentar mapeamentos |
| `scripts/gestio-sync.ts` | Scripts de sync |

## Não pode

- Colocar fórmulas de engenharia em providers
- Alterar módulos de Runtime diretamente (via PR coordenado)
- Gravar no Gest.io sem flag `--apply` explícito

## Tarefas típicas

- Adicionar endpoint Gest.io a um provider
- Documentar novo campo em `knowledge/gestio/`
- Executar sync e classificação
- Responder: "De onde vem esse dado?"

## Contrato do provider

Providers **entregam dados**. Não calculam orçamento, não aplicam normas.
