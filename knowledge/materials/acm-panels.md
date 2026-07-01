# Painéis ACM (Aluminum Composite Material)

> **Contexto:** Materials / Knowledge Platform  
> **Versão:** 1.0  
> **Última revisão:** 2026-07-01

## Definição

ACM é um painel composto por duas chapas de alumínio e núcleo (geralmente polietileno). Usado em fachadas, revestimentos e sinalização.

## Variantes comuns

| Variante | Espessura total | Núcleo | Uso típico |
|----------|-----------------|--------|------------|
| ACM 3mm | 3 mm | PE | Fachadas até 10 m |
| ACM 4mm | 4 mm | PE / FR | Fachadas, marquises |
| ACM FR | 4–6 mm | Mineral FR | Edifícios altos, normas de incêndio |

## Código SteelMind sugerido

```
AL-CL-{espessura}
AB-ACM-{variante}
```

No Gest.io atual, painéis ACM costumam estar em **ALUMÍNIO** (grupo `624610`) ou **ACABAMENTOS** (`754025`), dependendo do cadastro.

## Propriedades para cálculo

| Propriedade | Unidade | Fonte |
|-------------|---------|-------|
| Espessura | mm | Especificação do projeto |
| Largura útil da chapa | mm | Fornecedor / `knowledge/suppliers/` |
| Peso específico | kg/m² | Tabela do fabricante |
| Área útil por chapa | m² | Derivado |

## Provider

- Produtos: `providers/materials/getProductsByMaterialPrefix("AL")`
- Estoque: `providers/inventory/getBalances()`
- Classificação: `providers/materials/classifyProduct()`

## Normas relacionadas

Ver `knowledge/engineering/fachada-acm.md` — NBR 14718 (guarda-corpos, quando aplicável), normas de incêndio do condomínio/AVCB para ACM FR.

## Dependências

- `knowledge/gestio/product-code-mapping.md`
- `knowledge/engineering/fachada-acm.md`
- `knowledge/budget/` (custos de instalação — futuro)
