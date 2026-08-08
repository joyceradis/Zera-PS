# Auditoria pós-implementação — Workflow temporal

Data: 2026-08-08

## Escopo auditado

Atendimento temporal, progressive disclosure, HEART com estados independentes e reavaliação vinculada à admissão.

## Achados intermediários

A auditoria após a primeira integração revelou dois defeitos sutis de estado: o contexto SCA/HEART não era integralmente restaurado após reload e o snapshot da admissão podia ser congelado cedo demais. Ambos foram corrigidos antes do encerramento do bloco.

## Correções

- Atendimento v3 passou a possuir `context` explícito;
- suspeita de SCA, ECG, troponina e componentes utilizados pelo HEART passaram a ser persistidos/restaurados;
- snapshot de admissão pode ser atualizado durante a admissão;
- após a primeira reavaliação, o snapshot deixa de ser sobrescrito;
- CI foi ampliado para branches e pull requests.

## Microfunções preservadas

Foram preservados: NEGA explícito em HPP, edição individual, template de exame normal, quick choices, roteiros sindrômicos, autosave/rascunhos v2, clipboard, internação, alta, navegação, scores incompletos e PWA/offline.

## Limitações conscientemente mantidas

SCA permanece cenário de referência; HEART ainda exige validação cognitiva da UX; há um Atendimento temporal ativo por vez; internação e alta ainda não são estados formais do Atendimento v3; o renderer específico de cenário ainda precisa evoluir antes da multiplicação de cenários; regressão manual continua obrigatória.

## Evidência automatizada

O marco final registrou `npm run verify` verde com 52 testes aprovados e nenhuma falha.

Este arquivo é evidência histórica. A especificação vigente está em `docs/architecture/`, `docs/safety/` e `docs/testing/`.