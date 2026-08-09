# Arquitetura do Zera PS

## Princípio central

O Zera PS transforma dados clínicos em documentação sem aumentar certeza, alterar polaridade ou fabricar fatos ausentes.

```text
ação médica
→ dado clínico
→ estado + proveniência
→ contexto + etapa temporal
→ transformação documental
→ saída revisável
```

O sistema possui duas superfícies semanticamente distintas:

```text
workspace operacional
→ etapa, pendências, dados faltantes, ferramentas e status

documento clínico
→ somente conteúdo autorizado para registro
```

**Estado operacional não é conteúdo documental.**

## Camadas

```text
protocols/
→ configuração clínica declarativa

src/protocol-schema.js
→ contrato de protocolo e validador determinístico

src/protocol-registry.js
→ ponto único de registro e resolução de cenários

src/protocol-engine.js
→ derivações puras: plano de renderização, variáveis de ferramenta e pendências

src/protocol-renderer.js
→ renderização declarativa do contexto clínico no DOM

src/workflow-engine.js
→ etapas, transições, pendências, resultados temporais e progressive disclosure

src/score-engine.js
→ disponibilidade, aplicabilidade, calculabilidade, cálculo e aplicação documental

assets/clinical-state.js
→ estado, proveniência e confirmação clínica

src/document-engine.js
→ documento temporal e bloco de scores autorizados

src/justification-engine.js
→ montagem de justificativas (exame de alto custo, internação) a partir de dado já confirmado

src/storage.js
→ persistência do Atendimento v3

src/temporal-ui.js
→ integração temporal com a interface atual

assets/
→ fundação documental estabilizada durante migração incremental
```

## Regra de isolamento

O motor de workflow não deve conhecer SCA. O arquivo `protocols/sca.js` não manipula DOM. O document engine não decide conduta clínica. A UI não deve fabricar regra clínica.

A interface temporal resolve o cenário pelo registry e renderiza a partir da declaração. Não existem ramos `if (scenario === '...')` na aplicação, e nenhuma camada genérica importa uma ferramenta clínica concreta. O contrato completo está em [Contrato de protocolos](PROTOCOL_CONTRACT.md).

```text
protocolo declara   → campos, seções, regras, ferramentas e resultados temporais
motor interpreta    → etapa, visibilidade, variáveis, pendências e estados
médica decide       → aplicação documental e revisão final
```

## Estado clínico

Campos clínicos podem registrar valor, estado, fonte, confirmação e timestamp. Ausência de informação permanece ausência de informação; não é convertida em negativa.

## Atendimento temporal

O schema v3 mantém `workflowId`, `currentStage`, `stageHistory`, `context`, `admissionSnapshot`, `pendingItems`, `results`, `reassessments` e `documents`. O snapshot pode ser atualizado durante a admissão e fica protegido após o início das reavaliações.

`results[]` preserva eventos seriados sem sobrescrever o valor inicial. Um resultado de troponina 0h e um resultado de controle são entidades temporais distintas.

## Ferramentas clínicas

O contrato é:

```text
available
≠ applicable
≠ calculable
≠ applied
```

O motor pode calcular deterministicamente quando todos os dados estão presentes, mas o document engine só renderiza a ferramenta quando ela foi explicitamente aplicada/documentada.

## Justificativas

`src/justification-engine.js` monta justificativa de exame de alto custo ou de internação a partir do formulário e do estado clínico já confirmados — mesma fonte de dado que `renderEvolution`, reaproveitando `renderField`/`renderListSection`/`renderExamComplementSection` de `assets/document-engine.js` em vez de reler o DOM ou duplicar a lógica de confirmação.

O motor não sabe qual exame é "mais grave" nem aplica critério de convênio/ANS — apenas reorganiza o que já foi digitado na estrutura declarada em `JUSTIFICATION_PROFILES`. Um bloco que dependeria de dado ausente (tipicamente a hipótese/risco que justifica o pedido) vira um marcador `[COMPLETAR: ...]` visível, nunca um texto fabricado nem uma omissão silenciosa — mesmo princípio de `canRenderClinicalField`, aplicado a um documento com peso de autorização, onde fabricar é mais grave do que numa evolução comum.

A saída nunca é inserida automaticamente na Conduta ou na Evolução: para exame, abre um documento avulso (`<dialog>`) que a médica revisa e copia; para internação, preenche o campo "Justificativa clínica" da Internação somente após confirmação explícita se o campo já tiver conteúdo digitado.

## Persistência

Nesta etapa coexistem dois domínios locais:

```text
schema v2
→ evolução, autosave e rascunhos

schema v3
→ Atendimento temporal ativo
```

Essa separação é intencional para evitar reinterpretação silenciosa de dados existentes.

O `context` do Atendimento v3 continua indexado pelos ids dos campos do protocolo, sem migração. A aplicação de ferramentas passou a ser persistida em `context.appliedTools[<ferramenta>] = { applied, appliedAt }`. Contextos anteriores que gravaram `heartApplied` continuam sendo lidos como intenção legada, e essa intenção só é restaurada quando a ferramenta é aplicável e calculável no reload — migração técnica não fabrica confirmação clínica.

## Migração incremental

A pasta `assets/` permanece enquanto a camada temporal em `src/` amadurece. O objetivo é evitar uma reconstrução ampla que elimine microfunções já estabilizadas.

## Referências internas

- [Contrato de protocolos](PROTOCOL_CONTRACT.md)
- [Workflow temporal](TEMPORAL_WORKFLOW.md)
- [Segurança clínica](../safety/CLINICAL_SAFETY.md)
- [Invariantes](../safety/INVARIANTS.md)
- [Testes](../testing/TESTING.md)
