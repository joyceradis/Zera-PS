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

## Camadas

```text
protocols/
→ configuração clínica declarativa

src/workflow-engine.js
→ etapas, transições, pendências e progressive disclosure

src/score-engine.js
→ disponibilidade, aplicabilidade, calculabilidade e cálculo

assets/clinical-state.js
→ estado, proveniência e confirmação clínica

src/document-engine.js
→ documento temporal e bloco de scores

src/storage.js
→ persistência do Atendimento v3

src/temporal-ui.js
→ integração temporal com a interface atual

assets/
→ fundação documental estabilizada durante migração incremental
```

## Regra de isolamento

O motor de workflow não deve conhecer SCA. O arquivo `protocols/sca.js` não manipula DOM. O document engine não decide conduta clínica. A UI não deve fabricar regra clínica.

## Estado clínico

Campos clínicos podem registrar valor, estado, fonte, confirmação e timestamp. Ausência de informação permanece ausência de informação; não é convertida em negativa.

## Atendimento temporal

O schema v3 mantém `workflowId`, `currentStage`, `stageHistory`, `context`, `admissionSnapshot`, `pendingItems`, `reassessments` e `documents`. O snapshot pode ser atualizado durante a admissão e fica protegido após o início das reavaliações.

## Persistência

Nesta etapa coexistem dois domínios locais:

```text
schema v2
→ evolução, autosave e rascunhos

schema v3
→ Atendimento temporal ativo
```

Essa separação é intencional para evitar reinterpretação silenciosa de dados existentes.

## Migração incremental

A pasta `assets/` permanece enquanto a camada temporal em `src/` amadurece. O objetivo é evitar uma reconstrução ampla que elimine microfunções já estabilizadas.

## Referências internas

- [Workflow temporal](TEMPORAL_WORKFLOW.md)
- [Segurança clínica](../safety/CLINICAL_SAFETY.md)
- [Invariantes](../safety/INVARIANTS.md)
- [Testes](../testing/TESTING.md)