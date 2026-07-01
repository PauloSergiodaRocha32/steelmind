# Cálculo — Fachada ACM

> **Contexto:** Engineering / Knowledge Platform  
> **Versão:** 1.0  
> **Última revisão:** 2026-07-01  
> **Status:** Especificação inicial (SIP-2 golden path)

## Escopo

Dimensionamento de quantitativos para fachada em painel ACM: área de revestimento, chapas, subestrutura e fixações.

## Inputs

| Input | Tipo | Obrigatório | Fonte |
|-------|------|-------------|-------|
| `areaBruta` | m² | Sim | Projeto / planta |
| `perdas` | % | Sim | Padrão 8% (ajustável) |
| `espessuraAcm` | mm | Sim | Especificação (3 ou 4) |
| `moduloChapa` | mm | Não | Default 1220×2440 |
| `tipoSubestrutura` | enum | Sim | `cantoneira` \| `perfil-u` |
| `alturaFachada` | m | Condicional | Obrigatório se > 10 m (ACM FR) |

## Fórmulas

### Área líquida de material

```
areaLiquida = areaBruta × (1 + perdas/100)
```

### Quantidade de chapas

```
areaChapa = (moduloChapa.largura / 1000) × (moduloChapa.altura / 1000)
qtdChapas = ceil(areaLiquida / areaChapa)
```

### Peso estimado

```
pesoEspecifico = lookup(espessuraAcm)  // ver knowledge/materials/acm-panels.md
pesoTotal = areaLiquida × pesoEspecifico
```

### Subestrutura (cantoneira)

```
perimetro = sqrt(areaBruta) × 4   // aproximação retangular
qtdCantoneira = perimetro / comprimentoBarraPadrao
```

## Regras de negócio

1. Fachada > 10 m de altura → exigir ACM FR (registrar justificativa no memorial)
2. Perdas mínimas: 5%; recomendadas: 8%; complexidade alta: 12%
3. Toda alteração de `perdas` deve registrar versão do orçamento afetado

## Normas de referência

| Norma | Aplicação |
|-------|-----------|
| NBR 14718 | Guarda-corpos em varandas (quando fachada inclui) |
| Normas AVCB / bombeiros | ACM FR em edificações altas |
| Manual do fabricante | Fixação, dilatação, vãos máximos |

## Providers consultados

| Provider | Dado |
|----------|------|
| `providers/materials/` | Produtos AL/AB, classificação |
| `providers/inventory/` | Saldo disponível |
| `providers/gestio/` | Projetos vinculados |

## Módulos dependentes

- `modules/engineering/` — memorial e especificação
- `modules/budget/` — custo de material e instalação
- `modules/warehouse/` — disponibilidade de chapas

## Saídas esperadas

```typescript
interface FachadaAcmResult {
  areaLiquida: number;
  qtdChapas: number;
  pesoTotalKg: number;
  subestrutura: { tipo: string; quantidade: number; unidade: string };
  normasAplicaveis: string[];
  alertas: string[];
}
```

## Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-07-01 | Especificação inicial SIP-2 |
