import fs from "node:fs";
import path from "node:path";

const ROOT = "STEELMIND_ENGINEERING_BIBLE";

const docs: Record<string, string> = {
  "00-Foundation/07-BibleQualityReview.md": `# Bible Quality Review

## Objetivo

Registrar revisão contínua de consistência documental da Engineering Bible.

## Revisão 2026-07-01

### Pontos fortes

- Estrutura completa por frentes estratégicas (00 a 13)
- Índice global automático e índices por seção
- ADRs iniciais documentadas com processo explícito

### Inconsistências identificadas

- 84 arquivos ainda contêm TODO (principalmente nas seções 00–10)
- Falta matriz de links cruzados capítulo->módulo de código
- Falta convenção de nível de maturidade por documento (Draft/Reviewed/Approved)

### Ações recomendadas

1. Priorizar preenchimento profundo de:
   - 02-Architecture
   - 06-Domains
   - 07-Knowledge
2. Adicionar cabeçalho de maturidade em cada capítulo
3. Criar mapa de rastreabilidade (doc -> código -> teste)

## Próxima revisão

- Agendada para próximo ciclo após primeiros capítulos de domínio completos.
`,

  "11-ADRs/README.md": `# ADRs — SteelMind Engineering Bible

## Objetivo

Definir o processo de decisões arquiteturais dentro da Engineering Bible, mantendo rastreabilidade entre estratégia, implementação e operação.

## Processo ADR

1. Identificar decisão estrutural relevante
2. Registrar contexto técnico e de negócio
3. Listar alternativas avaliadas
4. Documentar decisão, impactos e riscos
5. Definir plano de migração e testes
6. Classificar status: Proposed, Accepted, Deprecated, Superseded

## Convenções

- Prefixo: \`ADR-XXX-Titulo.md\`
- Status obrigatório no topo do documento
- Decisões aceitas são imutáveis (mudanças via nova ADR)
- Cada ADR deve linkar para módulos/arquivos afetados

## Navegação

- [_INDEX.md](_INDEX.md) (índice automático)
- [TEMPLATE.md](TEMPLATE.md)
- [Accepted.md](Accepted.md)
- [Proposed.md](Proposed.md)
- [Deprecated.md](Deprecated.md)
- [Superseded.md](Superseded.md)
`,

  "11-ADRs/TEMPLATE.md": `# ADR-XXX: Título da decisão

- Status: Proposed | Accepted | Deprecated | Superseded
- Data: YYYY-MM-DD
- Responsáveis: Arquitetura / Engenharia / Produto

## Contexto

Descreva o problema, restrições e drivers.

## Alternativas avaliadas

1. Alternativa A
2. Alternativa B
3. Alternativa C

## Decisão

Descreva a decisão escolhida.

## Consequências

### Positivas
- ...

### Negativas
- ...

## Plano de migração

Passos seguros de adoção.

## Estratégia de testes

Como validar não regressão funcional e arquitetural.

## Referências

Links para capítulos da Bible, PRs, diagramas, tickets.
`,

  "11-ADRs/ADR-000-Constituicao-v1.md": `# ADR-000: Constituição v1.0 como autoridade máxima

- Status: Accepted
- Data: 2026-07-01

## Contexto

O SteelMind precisava de uma regra única para evitar decisões locais conflitantes entre código, arquitetura e produto.

## Decisão

A Constituição v1.0 é a autoridade máxima. Toda decisão técnica deve respeitar:

- domínio como produto
- rastreabilidade de cálculo
- IA grounded
- documentação obrigatória

## Consequências

### Positivas
- Coerência de longo prazo
- Redução de decisões ad-hoc
- Base sólida para escala internacional

### Negativas
- Mais disciplina de documentação
- Maior rigor antes de implementar
`,

  "11-ADRs/ADR-001-Arquitetura-Modular.md": `# ADR-001: Arquitetura modular com isolamento de domínio

- Status: Accepted
- Data: 2026-07-01

## Contexto

As regras de negócio estavam dispersas e acopladas ao delivery web.

## Decisão

Adotar monólito modular com separação explícita:

- \`domains/*\` (núcleo)
- \`application/*\` (casos de uso)
- \`infrastructure/*\` (adapters)
- \`app/*\` (delivery)

## Consequências

- Maior testabilidade e clareza de fronteiras
- Migração incremental (strangler) sem big bang
`,

  "11-ADRs/ADR-002-Clean-Architecture.md": `# ADR-002: Clean Architecture aplicada aos fluxos críticos

- Status: Accepted
- Data: 2026-07-01

## Contexto

O motor de orçamento precisa sobreviver a mudanças de framework, banco e integrações externas.

## Decisão

Adotar dependência direcionada para dentro:

- UI e APIs dependem de application/domain
- domínio não depende de frameworks
- adapters implementam portas

## Consequências

- Reuso do core para múltiplos canais
- Menor lock-in tecnológico
`,

  "11-ADRs/ADR-003-Shadow-Mode.md": `# ADR-003: Shadow Mode obrigatório para evolução do motor

- Status: Accepted
- Data: 2026-07-01

## Contexto

A substituição direta do motor oficial criaria alto risco operacional.

## Decisão

Todo motor novo entra em shadow mode:

- execução paralela
- comparação oficial vs SteelMind
- persistência dos resultados
- calibração antes do cutover

## Consequências

- Segurança de migração
- Evidência quantitativa para decisões de release
`,

  "11-ADRs/ADR-004-ACL-Gestio.md": `# ADR-004: ACL Gestio para isolamento do domínio

- Status: Accepted
- Data: 2026-07-01

## Contexto

DTOs e IDs do Gestio vazavam para regras internas.

## Decisão

Aplicar Anti-Corruption Layer:

- portas canônicas de catálogo e integração
- mapeadores Gestio -> modelo interno
- domínio independente de semântica de ERP específico

## Consequências

- Menor acoplamento externo
- Base para multi-ERP no futuro
`,

  "11-ADRs/ADR-005-Knowledge-Base-Rule-Engine.md": `# ADR-005: Knowledge Base + Rule Engine versionados

- Status: Accepted
- Data: 2026-07-01

## Contexto

Regras técnicas hardcoded dificultam auditoria, evolução e calibração.

## Decisão

Regras e fórmulas passam a ser ativos versionados:

- origem técnica
- versão
- premissas
- limitações
- rastros de cálculo

## Consequências

- Preservação de conhecimento da empresa
- Capacidade de auditoria técnica e comercial
`,

  "11-ADRs/ADR-006-Bible-Navegavel.md": `# ADR-006: Engineering Bible como base navegável e operacional

- Status: Accepted
- Data: 2026-07-01

## Contexto

A documentação cresceu rapidamente e corria risco de virar acervo estático sem navegação e governança.

## Decisão

Transformar a Engineering Bible em base navegável:

- índice global automático
- índice automático por seção
- atualização de índices via script padronizado
- revisão periódica de qualidade documental

## Consequências

### Positivas
- Navegação rápida por qualquer desenvolvedor/IA
- Redução de documentação órfã
- Melhor capacidade de onboarding técnico

### Negativas
- Exige disciplina para executar scripts de índice
- Introduz manutenção adicional em automações de documentação
`,

  "11-ADRs/Accepted.md": `# ADRs Aceitas

| ADR | Título | Status |
|-----|--------|--------|
| [ADR-000-Constituicao-v1](ADR-000-Constituicao-v1.md) | Constituição v1.0 | Accepted |
| [ADR-001-Arquitetura-Modular](ADR-001-Arquitetura-Modular.md) | Arquitetura modular | Accepted |
| [ADR-002-Clean-Architecture](ADR-002-Clean-Architecture.md) | Clean Architecture | Accepted |
| [ADR-003-Shadow-Mode](ADR-003-Shadow-Mode.md) | Shadow Mode | Accepted |
| [ADR-004-ACL-Gestio](ADR-004-ACL-Gestio.md) | ACL Gestio | Accepted |
| [ADR-005-Knowledge-Base-Rule-Engine](ADR-005-Knowledge-Base-Rule-Engine.md) | Knowledge Base + Rule Engine | Accepted |
| [ADR-006-Bible-Navegavel](ADR-006-Bible-Navegavel.md) | Bible navegável e operacional | Accepted |
`,

  "11-ADRs/CatalogoDecisoes.md": `# Catálogo de decisões arquiteturais

## Objetivo

Consolidar visão executiva das decisões já aceitas e seus impactos diretos na arquitetura.

| Decisão | Problema atacado | Impacto principal |
|---------|------------------|-------------------|
| Constituição v1.0 | falta de governança | alinhamento técnico de longo prazo |
| Arquitetura modular | acoplamento excessivo | isolamento de domínio |
| Clean Architecture | dependência de framework | portabilidade e testabilidade |
| Shadow Mode | risco de migração | rollout seguro por evidência |
| ACL Gestio | lock-in de ERP | domínio canônico e extensível |
| Knowledge Base + Rule Engine | regra hardcoded | versionamento e auditoria |
| Bible navegável | baixa encontrabilidade | onboarding e operação de conhecimento |
`,

  "11-ADRs/Proposed.md": `# ADRs Propostas

## Regras

- Toda ADR proposta deve apontar problema mensurável
- Deve incluir trade-offs e plano de reversão
- Só pode mudar para Accepted após validação técnica

## Backlog inicial

- Estratégia de portal navegável da Engineering Bible
- Política de versionamento semântico da Knowledge Base
- Estratégia de benchmark externo contínuo
`,

  "11-ADRs/Deprecated.md": `# ADRs Deprecadas

Sem ADRs deprecadas no momento.

Quando houver:

- registrar motivo
- registrar impacto
- apontar ADR substituta
`,

  "11-ADRs/Superseded.md": `# ADRs Superseded

Sem ADRs superseded no momento.

Fluxo recomendado:

1. Criar nova ADR
2. Marcar ADR antiga como Superseded
3. Atualizar índices e dependências
`,

  "12-Roadmap/README.md": `# Roadmap — SteelMind

## Objetivo

Consolidar evolução do SteelMind por versões, com critérios de aceite claros, riscos e dependências explícitas.

## Status Legend

- ✅ Concluído
- 🔄 Em andamento
- 🟡 Planejado
- 🔴 Bloqueado

## Navegação

- [MasterRoadmap.md](MasterRoadmap.md)
- [QuarterlyPlan.md](QuarterlyPlan.md)
- [Milestones.md](Milestones.md)
- [Dependencies.md](Dependencies.md)
- [RiskRegister.md](RiskRegister.md)
- [Timeline.md](Timeline.md)
- [TechDebtCatalog.md](TechDebtCatalog.md)
- [_INDEX.md](_INDEX.md) (índice automático)
`,

  "12-Roadmap/MasterRoadmap.md": `# Master Roadmap

## Visão por versões

| Versão | Foco | Status |
|--------|------|--------|
| V1 | Plataforma operacional integrada (comercial + orçamento + engenharia + compras + almox) | ✅ |
| V1.5 | Fundação constitucional + shadow/calibration/benchmark infra | 🔄 |
| V2 | Rule Engine + Knowledge Base versionada + domínio guarda-corpo completo | 🟡 |
| V3 | Expansão de domínios (escadas, pergolados, mezaninos, portões, corrimãos) | 🟡 |
| V4 | Plataforma industrial ampliada (PCP, financeiro técnico, CRM industrial, simulação) | 🟡 |

## Fases estratégicas

1. Fundação e Governança (Constituição + ADRs)
2. Motor de conhecimento e rastreabilidade
3. Escala de domínios técnicos
4. Escala de plataforma e internacionalização

## Critério de progresso

Cada versão só avança quando:

- qualidade de build/lint/test estável
- regressão de benchmark controlada
- documentação técnica atualizada
`,

  "12-Roadmap/QuarterlyPlan.md": `# Quarterly Plan

## Q3 2026 (execução atual)

### Objetivos

- consolidar Engineering Bible
- fechar persistência canônica de shadow/calibration/benchmark
- estruturar quality gates de CI

### Critérios de aceite

- ADRs atualizadas
- cobertura de testes para novos módulos
- pipeline de qualidade executando em PR

## Q4 2026 (próximo)

### Objetivos

- iniciar ingestão formal de casos de calibração reais
- implementar governance de Rule Engine (publish/review)
- primeiro ciclo de benchmark comparativo recorrente

### Dependências

- base de dados real validada
- revisão técnica de engenharia de produção
`,

  "12-Roadmap/Milestones.md": `# Milestones

## M1 — Constituição e Governança
- Status: ✅
- Aceite: Constituição ativa + ADR baseline publicada

## M2 — Shadow/Calibration Foundation
- Status: ✅
- Aceite: módulos + testes + persistência + métricas

## M3 — Guardrail Domain Full Traceability
- Status: 🔄
- Aceite: quote versionado + traces completos + benchmark dataset inicial

## M4 — Multi-domain rollout
- Status: 🟡
- Aceite: pelo menos 4 domínios técnicos com rulebook versionado
`,

  "12-Roadmap/Dependencies.md": `# Dependencies Matrix

| Entrega | Depende de | Risco |
|---------|------------|-------|
| Rule Engine V2 | Knowledge Base versionada | Médio |
| Cutover do motor oficial | Shadow history + benchmark estável | Alto |
| Expansão para novos domínios | Rulebook governance + catálogo técnico | Médio |
| Escala multiempresa | RLS + tenancy + observabilidade madura | Alto |

## Observações

- Dependências de dados reais têm maior impacto no cronograma.
- Dependências de governança (ADRs, revisão técnica) reduzem retrabalho.
`,

  "12-Roadmap/RiskRegister.md": `# Risk Register

| ID | Risco | Probabilidade | Impacto | Mitigação |
|----|-------|---------------|---------|-----------|
| R-01 | Dados de calibração insuficientes | Alta | Alto | Definir pipeline de coleta e validação por domínio |
| R-02 | Divergência entre documentação e código | Média | Alto | Índices automáticos + revisão em PR |
| R-03 | Acoplamento indevido com ERP | Média | Médio | ACL estrita + testes de contrato |
| R-04 | Regressão de qualidade sem gate | Baixa | Alto | CI quality gates obrigatórios |
| R-05 | Crescimento documental sem navegação | Média | Médio | Índice global e índices por seção automatizados |
`,

  "12-Roadmap/Timeline.md": `# Timeline do programa

\`\`\`mermaid
timeline
    title SteelMind — Linha do tempo macro
    2026 Q1 : Versão operacional inicial
    2026 Q2 : Constituição + ADR baseline
    2026 Q3 : Shadow/Calibration/Benchmark foundation
    2026 Q4 : Rule Engine governance + dataset real
    2027 Q1 : Guardrail v2 com cutover controlado
    2027 Q2 : Escadas/Pergolados/Mezaninos em rollout
\`\`\`
`,

  "12-Roadmap/TechDebtCatalog.md": `# Catálogo de dívida técnica

## Dívida ativa

| Item | Tipo | Severidade | Plano |
|------|------|------------|-------|
| Capítulos placeholder (00–10) | Documentação | Alta | preenchimento progressivo por prioridade de domínio |
| Falta de testes de contrato ACL | Qualidade | Média | adicionar suíte dedicada para adapters Gestio |
| Benchmark sem dados reais contínuos | Dados | Alta | pipeline de coleta e curadoria de casos reais |

## Regra de evolução

- toda dívida deve ter dono
- toda dívida deve ter próximo passo concreto
`,

  "13-Research/README.md": `# Research — Linhas estratégicas

## Objetivo

Organizar trilhas de pesquisa que alimentam decisões técnicas, regras de engenharia e evolução do produto.

## Trilhas prioritárias

1. [NormasABNT](NormasABNT.md)
2. [CatalogosFabricantes](CatalogosFabricantes.md)
3. [EngenhariaEstruturasMetalicas](EngenhariaEstruturasMetalicas.md)
4. [Orcamentacao](Orcamentacao.md)
5. [IAAplicadaEngenharia](IAAplicadaEngenharia.md)
6. [BenchmarkSoftwaresMercado](BenchmarkSoftwaresMercado.md)
7. [TendenciasTecnologicas](TendenciasTecnologicas.md)

## Regras de pesquisa

- toda pesquisa deve registrar fontes sugeridas
- hipóteses precisam de pergunta aberta associada
- achados relevantes devem gerar ADR ou update de roadmap
`,

  "13-Research/NormasABNT.md": `# Normas ABNT

## Objetivo

Mapear normas brasileiras aplicáveis às tipologias da serralheria técnica para estruturar validações e rastreabilidade no Rule Engine.

## Escopo inicial

- NBR 14718 (guarda-corpos)
- NBR 8800 (estruturas de aço)
- normas de pintura/galvanização aplicáveis

## Fontes sugeridas

- Catálogo ABNT
- publicações técnicas setoriais
- registros internos de engenharia da empresa

## Perguntas em aberto

- quais normas serão mandatórias por tipologia no V2?
- quais regras exigem parametrização por cliente/projeto?
`,

  "13-Research/CatalogosFabricantes.md": `# Catálogos de fabricantes

## Objetivo

Definir estratégia de ingestão e versionamento de catálogos técnicos para materiais, perfis e componentes.

## Escopo inicial

- perfis metálicos (aço/inox/alumínio)
- fixadores e chumbadores
- consumíveis de solda e acabamento

## Fontes sugeridas

- catálogos oficiais de fabricantes
- planilhas internas de compras e engenharia
- integração com ERP (via ACL)

## Perguntas em aberto

- qual granularidade mínima por item para orçamento rastreável?
- como validar obsolescência de catálogo?
`,

  "13-Research/EngenhariaEstruturasMetalicas.md": `# Engenharia de estruturas metálicas

## Objetivo

Transformar conhecimento técnico de projeto/fabricação/montagem em ativos explícitos para domínio e Rule Engine.

## Escopo inicial

- guarda-corpo (vertical slice)
- ligações, soldagem e montagem
- perdas e produtividade por processo

## Fontes sugeridas

- documentação técnica interna
- normas e manuais de engenharia
- revisão com especialistas de produção

## Perguntas em aberto

- quais parâmetros variam por cenário (obra, oficina, material)?
- quais limites definem casos inválidos automaticamente?
`,

  "13-Research/Orcamentacao.md": `# Orçamentação industrial

## Objetivo

Evoluir de estimativa heurística para orçamento técnico explicável, auditável e calibrável por histórico real.

## Escopo inicial

- composição de custo por categoria
- margens e políticas de aprovação
- baseline para meta de ±5%

## Fontes sugeridas

- histórico de projetos concluídos
- apontamentos de produção e compras
- análises de variação planejado vs realizado

## Perguntas em aberto

- como definir baseline confiável por tipologia?
- qual estratégia de recalibração por versão de regra?
`,

  "13-Research/IAAplicadaEngenharia.md": `# IA aplicada à engenharia

## Objetivo

Definir uso de IA como suporte de raciocínio grounded, sem substituir regras técnicas validadas.

## Escopo inicial

- extração assistida de dados de entrada
- justificativas baseadas em trace
- detecção de lacunas de informação

## Fontes sugeridas

- ADR-006 (AI grounded only)
- benchmarks internos de prompts
- publicações técnicas sobre LLMs em engenharia

## Perguntas em aberto

- quais tasks podem ser automatizadas sem risco de alucinação?
- como medir confiabilidade da IA por domínio?
`,

  "13-Research/BenchmarkSoftwaresMercado.md": `# Benchmark com softwares de mercado

## Objetivo

Comparar posicionamento do SteelMind com soluções de orçamento e gestão industrial para identificar gaps e diferenciais estratégicos.

## Escopo inicial

- funcionalidades de orçamento técnico
- rastreabilidade e auditoria
- integração ERP/CAD/BIM

## Fontes sugeridas

- análise pública de produtos concorrentes
- materiais de vendas e documentação técnica
- entrevistas com usuários especialistas

## Perguntas em aberto

- qual diferencial competitivo sustentável do SteelMind?
- quais capacidades devem entrar no V2 vs V3?
`,

  "13-Research/TendenciasTecnologicas.md": `# Tendências tecnológicas relevantes

## Objetivo

Monitorar tecnologias que impactam diretamente arquitetura, performance e vantagem competitiva do SteelMind.

## Escopo inicial

- rule engines versionáveis
- observabilidade de sistemas críticos
- pipelines de benchmark contínuo
- integração com CAD/BIM/OCR

## Fontes sugeridas

- relatórios técnicos e conferências
- comunidades de arquitetura e engenharia de software
- casos de uso industriais publicados

## Perguntas em aberto

- quais tendências já são maduras para adoção no ciclo atual?
- quais devem ficar em radar para V3/V4?
`,

  "13-Research/NormasXFuncionalidades.md": `# Matriz de normas x funcionalidades

## Objetivo

Relacionar funcionalidades críticas do produto às referências normativas e regras técnicas correspondentes.

| Funcionalidade | Norma/Referência | Estado |
|----------------|------------------|--------|
| Cálculo guarda-corpo | NBR 14718 | Em consolidação |
| Estruturas metálicas gerais | NBR 8800 | Pesquisa inicial |
| Rastreabilidade de cálculo | Constituição v1.0 + ADR-002 | Ativo |
| Regras de IA grounded | Constituição v1.0 + ADR-006 | Ativo |
| Versionamento de regra | ADR-003 + ADR-005 | Em implementação |

## Próximo passo

Expandir matriz por domínio (escadas, pergolados, portões, corrimãos, coberturas).
`,
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

for (const [relativePath, content] of Object.entries(docs)) {
  const fullPath = path.join(ROOT, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, "utf-8");
}

console.log("Engineering Bible preenchida com conteúdo base real.");
