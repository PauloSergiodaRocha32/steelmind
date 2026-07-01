# Risk Register

| ID | Risco | Probabilidade | Impacto | Mitigação |
|----|-------|---------------|---------|-----------|
| R-01 | Dados de calibração insuficientes | Alta | Alto | Definir pipeline de coleta e validação por domínio |
| R-02 | Divergência entre documentação e código | Média | Alto | Índices automáticos + revisão em PR |
| R-03 | Acoplamento indevido com ERP | Média | Médio | ACL estrita + testes de contrato |
| R-04 | Regressão de qualidade sem gate | Baixa | Alto | CI quality gates obrigatórios |
| R-05 | Crescimento documental sem navegação | Média | Médio | Índice global e índices por seção automatizados |
