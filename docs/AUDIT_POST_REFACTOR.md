# Auditoria pós-refatoração — checklist

Este documento não substitui a execução dos testes e a regressão manual. Ele registra o que deve ser confirmado antes de merge.

## Segurança clínico-documental

- [ ] Campo HPP vazio não gera `NEGA`.
- [ ] `Confirmar NEGA em HPP` registra ação explícita e gera negativas somente após o clique.
- [ ] Campo HPP informado manualmente gera apenas o valor informado.
- [ ] `Usar modelo de exame normal` registra template confirmado e mantém edição livre.
- [ ] Exame físico não confirmado é omitido.
- [ ] Templates sindrômicos não contêm negativas clínicas pré-confirmadas.
- [ ] Campo de exames complementares vazio é omitido, não transformado em `NA`.
- [ ] Texto gerado permanece editável.

## Scores

- [ ] CRB-65 inicia incompleto.
- [ ] CURB-65 inicia incompleto.
- [ ] qSOFA inicia incompleto.
- [ ] Glasgow inicia incompleto.
- [ ] Resultado só aparece com todas as variáveis respondidas.
- [ ] Alterar uma resposta recalcula o resultado.

## Persistência

- [ ] Autosave v2 salva formulário + estado clínico.
- [ ] Migração de v1 não marca campos antigos como confirmados.
- [ ] Rascunho v2 recupera formulário, estado e saída.
- [ ] Limpar evolução remove o autosave atual.

## PWA

- [ ] Todos os módulos ES fazem parte do app shell.
- [ ] Navegação offline cai em `app.html`.
- [ ] Recurso estático ausente não é mascarado por HTML de fallback.
- [ ] Cache antigo é removido no `activate`.

## Arquitetura

- [ ] `data.js` contém somente configuração declarativa.
- [ ] `clinical-state.js` não depende de DOM.
- [ ] `document-engine.js` não depende de DOM/storage.
- [ ] `scores.js` não depende de DOM.
- [ ] `storage.js` recebe adapter testável.
- [ ] `ui.js` concentra renderização/DOM.
- [ ] `app.js` coordena os módulos.

## Gate de merge

Merge proibido enquanto houver:

- teste automatizado falhando;
- regressão manual P0 não verificada;
- transformação que fabrique fato clínico;
- diferença entre README/ROADMAP e comportamento implementado.
