# Architecture Context Map

```mermaid
graph LR
    Comercial["Comercial"] --> Orcamento["Orçamento"]
    Orcamento --> Engenharia["Engenharia"]
    Orcamento --> Compras["Compras"]
    Orcamento --> Producao["Produção"]
    Orcamento --> Financeiro["Financeiro"]
    Orcamento --> Conhecimento["Knowledge Engine"]
    Orcamento --> Shadow["Shadow/Calibration"]
    Conhecimento --> IA["IA Grounded"]
    Integracao["ACL Gestio"] --> Orcamento
    Integracao --> Compras
    Integracao --> Engenharia
```

## Referências de contexto

- [02-Architecture/DDD.md](../02-Architecture/DDD.md)
- [02-Architecture/ACL.md](../02-Architecture/ACL.md)
- [06-Domains/OrcamentoOperacionalInglesa.md](../06-Domains/OrcamentoOperacionalInglesa.md)
- [11-ADRs/_INDEX.md](../11-ADRs/_INDEX.md)
