# Mapeamento de Código de Produto (Gest.io)

> **Contexto:** Data Platform / Gest.io  
> **Versão:** 1.0  
> **Última revisão:** 2026-07-01

## Objetivo

Documentar como o SteelMind interpreta `codigoInterno` do Gest.io para classificação de materiais — sem lógica de negócio no Runtime.

## Formato canônico

```
{MATERIAL}-{FORMA}-{dimensões...}
```

Exemplos:

| Código | Material | Forma |
|--------|----------|-------|
| `AC-CL-3.00` | Aço Carbono | Chapa Lisa |
| `I304-TR-40x20x2.0` | Inox 304 | Tubo Retangular |
| `AL-CL-2.00` | Alumínio | Chapa Lisa |
| `FX-PAR-M8x25` | Fixadores | Parafuso |

## Prefixos de material

Implementação: `providers/gestio/taxonomy.ts` → `MATERIAL_PREFIX_TO_GROUP`

| Prefixo | Grupo Gest.io | Label |
|---------|---------------|-------|
| AC | 918393 | Aço Carbono |
| I304 | 240868 | AÇO INOX 304 |
| I316 | 089693 | AÇO INOX 316 |
| AL | 624610 | ALUMÍNIO |
| FX | 583788 | FIXADORES |
| AB | 754025 | ACABAMENTOS |
| VD | 627788 | VIDROS |

## Códigos de forma

Implementação: `SHAPE_CODE_TO_TAXONOMY`

| Código | Categoria | Tipo |
|--------|-----------|------|
| CL | Chapas Lisas | Chapa |
| TR | Tubos Retangulares | TUBO |
| PAR | Parafusos | Parafuso |
| CAN | Cantoneiras | Cantoneiras |

## Códigos legados

| Padrão | Tratamento |
|--------|------------|
| `G1234` ou `2024.0` | Orçamento legado → grupo ORÇAMENTO; material inferido da descrição |
| `A123` | Consumível → grupo Consumíveis |

## Provider

- **Leitura ao vivo:** `providers/gestio/` (`GestioClient`)
- **Snapshot local:** `data/gestio/catalog.json` via `providers/gestio/snapshot.ts`
- **Classificação:** `providers/materials/` → `classifyProduct()`, `normalizeProduct()`

## Dependências

- `knowledge/materials/` — especificações por família de material
- `knowledge/engineering/` — cálculos que consomem códigos de produto
