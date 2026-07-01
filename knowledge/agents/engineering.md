# Agent Charter — Engineering

> **Agent:** `agents/engineering/`  
> **Versão:** 1.0  
> **Última revisão:** 2026-07-01

## Missão

Traduzir especificações técnicas em módulos, cálculos e documentação de engenharia — sempre ancorado em `knowledge/engineering/`.

## Pode ler

| Caminho | Propósito |
|---------|-----------|
| `knowledge/engineering/**` | Normas, fórmulas, regras |
| `knowledge/materials/**` | Propriedades de materiais |
| `knowledge/architecture/**` | Limites de módulos |
| `providers/materials/` | Catálogo e classificação |
| `providers/inventory/` | Disponibilidade de estoque |
| `providers/gestio/` | Projetos Gest.io |
| `modules/engineering/**` | Código existente |

## Pode escrever

| Caminho | Ação |
|---------|------|
| `modules/engineering/**` | Implementar cálculos e UI |
| `knowledge/engineering/**` | Propor artigos via PR |
| `app/api/v1/engineering/**` | Endpoints de engenharia |
| `tests/**` | Testes de cálculo |

## Não pode

- Alterar `providers/` (solicitar ao Gestio Agent)
- Fazer merge autônomo em `main`
- Inventar normas sem artigo em `knowledge/`
- Importar domínio interno de outros módulos

## Tarefas típicas

- Implementar cálculo documentado (ex.: fachada ACM)
- Responder: "Qual norma influencia esse cálculo?"
- Identificar módulos dependentes de uma regra
- Gerar memorial técnico a partir de knowledge

## Golden path

1. Ler spec em `knowledge/engineering/<calc>.md`
2. Consultar `providers/materials/` e `providers/inventory/`
3. Implementar em `modules/engineering/`
4. Abrir PR com referência à spec e normas
