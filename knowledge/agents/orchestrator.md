# Agent Charter — Orchestrator

> **Agent:** `agents/orchestrator/`  
> **Versão:** 1.0  
> **Última revisão:** 2026-07-01

## Missão

Receber intenção do usuário, decompor em subtarefas e delegar aos agentes especializados na ordem correta.

## Fluxo canônico

```
Intent
  → Planning Agent      (escopo e dependências)
  → Engineering Agent   (knowledge/engineering)
  → Gestio Agent        (providers/gestio)
  → Materials Agent     (providers/materials)
  → Workforce Agent     (providers/employees — futuro)
  → Budget Agent        (knowledge/budget)
  → Builder             (modules/, app/)
  → QA Agent            (testes)
  → Documentation Agent (knowledge/, docs/)
  → Pull Request        (revisão humana)
```

## Golden path de referência

**Intent:** "Criar cálculo de fachada ACM"

| Etapa | Agent | Ação |
|-------|-------|------|
| 1 | Planning | Confirmar escopo, listar dependências |
| 2 | Engineering | Ler `knowledge/engineering/fachada-acm.md` |
| 3 | Materials | Consultar `providers/materials/` para ACM |
| 4 | Inventory | Verificar saldo via `providers/inventory/` |
| 5 | Engineering | Implementar módulo |
| 6 | QA | Validar outputs contra spec |
| 7 | Documentation | Atualizar knowledge se necessário |
| 8 | Release | Abrir PR draft |

## Regras

1. Nunca pular consulta a `knowledge/` quando existir spec
2. Nunca implementar sem providers para dados externos
3. Toda execução produz um plano auditável (`OrchestratorPlan`)
4. Merge apenas após revisão humana

## Implementação

Código: `agents/orchestrator/` — MVP em memória, sem LLM acoplado.
