# Auditoria pós-implementação — Workflow temporal

Data: 2026-08-08

## Escopo auditado

Auditoria posterior à introdução do Atendimento temporal, progressive disclosure, ferramenta HEART com estados independentes e reavaliação vinculada à admissão.

## Achados da auditoria intermediária

A primeira entrega temporal foi auditada após integração e revelou dois defeitos sutis de estado:

1. o contexto do workflow existia apenas no DOM; após reload, cenário e pendências podiam permanecer, mas suspeita de SCA, status/resultados e variáveis HEART não eram integralmente restaurados;
2. o snapshot da admissão era congelado na primeira geração da evolução, podendo ficar desatualizado caso a médica corrigisse/regenerasse a admissão antes da primeira reavaliação.

Esses pontos foram tratados neste ciclo antes de considerar o bloco encerrado.

## Correções implementadas

### Contexto temporal persistente

O Atendimento v3 passa a possuir `context` explícito. A UI serializa e restaura:

- suspeita de SCA / equivalente anginoso;
- status e descrição do ECG;
- status, valor e relação da troponina;
- componentes atualmente usados pela interface do HEART.

Ausência continua representada por valores nulos/estado não informado; reload não fabrica resposta.

### Snapshot da admissão

O snapshot pode ser atualizado durante a fase de admissão. Depois da primeira reavaliação, `updateAdmissionSnapshot` deixa de substituí-lo.

Isso preserva simultaneamente:

- correções legítimas feitas antes da reavaliação;
- estabilidade histórica depois que a linha temporal de reavaliações começou.

### CI

O workflow `checks` foi ampliado para branches de desenvolvimento e pull requests, evitando depender exclusivamente da abertura de PR para descobrir regressões.

## Microfunções preservadas

Nenhuma das correções deste ciclo remove ou redefine deliberadamente:

- confirmação explícita de NEGA em HPP;
- edição individual de HPP;
- template de exame normal confirmado;
- edição individual do exame;
- quick choices;
- templates sindrômicos;
- autosave e rascunhos v2;
- clipboard e fallback;
- internação;
- alta;
- navegação;
- feedback de ações;
- score incompleto sem resultado;
- PWA/offline.

A regressão automatizada existente permanece responsável por detectar quebra de parte desses contratos; microfunções dependentes de navegador ainda exigem regressão manual.

## Arquitetura após o ciclo

```text
protocols/sca.js
        ↓
src/workflow-engine.js
        ↓
encounter v3 + context + stage + pendingItems
        ↓
src/score-engine.js
        ↓
src/document-engine.js
        ↓
src/temporal-ui.js
```

A fundação anterior permanece sob `assets/` e é carregada pelo novo entrypoint durante a migração incremental.

## Limitações conscientemente mantidas

1. SCA é cenário de referência; ainda não é um sistema completo de protocolo institucional.
2. A UX atual do HEART usa entradas de pontos para alguns componentes e precisa de validação clínica/cognitiva antes de ser tratada como desenho final.
3. Há apenas um Atendimento temporal ativo persistido por vez.
4. Internação e alta ainda não são estados formais do Atendimento v3.
5. O renderer de cenário ainda contém integração específica em `temporal-ui.js`; antes de multiplicar cenários, essa parte deve evoluir para rendering declarativo.
6. Regressão manual desktop/mobile, PWA instalado e offline real continuam pendentes.
7. CI não equivale a homologação assistencial.

## Evidência automatizada

Pull request #10, workflow `checks`, execução `npm run verify`:

```text
syntax checks: success
tests: 52
pass: 52
fail: 0
skipped: 0
```

A execução cobriu a regressão anterior e acrescentou contratos para:

- persistência explícita do contexto temporal;
- atualização imutável do contexto;
- atualização do snapshot durante a admissão;
- proteção do snapshot após o início da reavaliação.

Como este documento faz parte do mesmo PR, qualquer alteração posterior ao commit auditado exige nova execução verde antes da integração.

## Decisão

O bloco pode ser integrado somente se:

- a execução final do CI após esta atualização documental permanecer verde;
- a branch estiver baseada na `main` sem divergência inesperada;
- o diff final permanecer limitado às correções de persistência/arquitetura/documentação declaradas;
- não houver regressão automatizada conhecida.

Após integração, o próximo gate é humano: regressão cognitiva e operacional do fluxo real no navegador.
