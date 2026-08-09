# Clinical Context Coherence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Impedir combinações incompatíveis entre roteiro documental e workflow clínico, corrigindo também os dois débitos P2 incorporados pela PR #14.

**Architecture:** Um módulo puro calcula compatibilidade, significância do encounter e decisões de troca. Os dois controladores existentes coordenam mudanças por eventos síncronos canceláveis, preservando seus armazenamentos e responsabilidades.

**Tech Stack:** JavaScript ES modules, DOM CustomEvent, localStorage, Node.js test runner.

## Global Constraints

- Não adicionar protocolos nem dependências.
- Não inferir protocolo ou diagnóstico pelo texto clínico.
- Não apagar silenciosamente campos clínicos nem estado temporal significativo.
- Registry deve continuar exatamente `['sca']`.
- Sem redesign amplo e sem merge automático.

---

### Task 1: Decisões puras de coordenação

**Files:**
- Create: `src/context-coordination.js`
- Create: `tests/context-coordination.test.mjs`
- Modify: `package.json`
- Modify: `service-worker.js`

**Interfaces:**
- Produces: `CONTEXT_EVENTS`, `isTemplateWorkflowCompatible(template, workflowId)`, `hasSignificantEncounter(encounter)`, `decideTemplateSelection(input)`, `decideWorkflowSelection(input)`.

- [ ] Escrever testes falhando para compatibilidade explícita, ausência de inferência pela QP, encounter vazio/significativo, cancelamento e confirmação.
- [ ] Executar `node --test tests/context-coordination.test.mjs` e confirmar falhas por módulo ausente.
- [ ] Implementar somente as decisões puras necessárias.
- [ ] Executar novamente o teste e confirmar aprovação.
- [ ] Adicionar o módulo ao syntax check e ao app shell offline.

### Task 2: Persistência explícita do roteiro e coordenação bidirecional

**Files:**
- Modify: `assets/app.js`
- Modify: `assets/storage.js`
- Modify: `src/temporal-ui.js`
- Modify: `app.html`
- Modify: `tests/storage.test.mjs`
- Modify: `tests/temporal-ui-static.test.mjs`
- Modify: `tests/templates.test.mjs`

**Interfaces:**
- Consumes: decisões e eventos de `src/context-coordination.js`.
- Produces: snapshots com `templateSelection`, troca cancelável e restauração reconciliada.

- [ ] Escrever regressões falhando para persistência do roteiro, microcópia correta e presença do contrato de coordenação nos dois controladores.
- [ ] Executar os testes focados e confirmar as falhas esperadas.
- [ ] Persistir seleção explícita do roteiro e restaurar associação visual sem inferir pela QP.
- [ ] Coordenar roteiro → workflow e workflow → roteiro com confirmação conservadora e preservação dos campos.
- [ ] Reconciliar reload incompatível antes da exibição do workflow.
- [ ] Executar os testes focados e confirmar aprovação.

### Task 3: Hardening dos dois P2

**Files:**
- Modify: `src/protocol-schema.js`
- Modify: `src/temporal-ui.js`
- Modify: `tests/protocol-schema.test.mjs`
- Modify: `tests/temporal-ui-static.test.mjs`

**Interfaces:**
- Produces: validação estrita de `stages` e apresentação inequívoca de ferramenta indisponível.

- [ ] Escrever teste falhando que rejeita `stages` textual e preserva `stage` textual.
- [ ] Escrever teste falhando que exige tratamento de `availability` antes de `applicability` e botão oculto.
- [ ] Executar testes focados e confirmar as falhas esperadas.
- [ ] Implementar as duas correções mínimas.
- [ ] Executar testes focados e confirmar aprovação.

### Task 4: Gate completo e publicação

**Files:**
- Modify: `docs/architecture/PROTOCOL_CONTRACT.md` se necessário para refletir o contrato estrito.

- [ ] Executar `npm run verify` e exigir zero falhas.
- [ ] Executar `git diff --check main...HEAD`.
- [ ] Fazer smoke test desktop/mobile com SCA → Rinossinusite, cancelamento, confirmação e reload.
- [ ] Revisar o diff por escopo, dados clínicos e persistência.
- [ ] Commitar, publicar a branch e abrir Draft PR vinculada à issue #15.
