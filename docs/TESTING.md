# Verificação do Zera PS

## Testes automatizados

Requer Node.js 24 ou superior.

```bash
npm run verify
```

Esse comando executa:

```bash
npm run check
npm test
```

A suíte usa `node --test tests/*.test.mjs`.

## P0 — segurança documental do núcleo

1. Abrir evolução sem preencher HPP e gerar texto: nenhuma linha pode virar `NEGA`.
2. Clicar **Confirmar NEGA em HPP**: negativas passam a ser renderizadas por ação explícita.
3. Editar HPP após o atalho: a edição manual deve prevalecer.
4. Não tocar no exame físico: a seção não pode ser fabricada.
5. Clicar **Usar modelo de exame normal**: a seção aparece e continua editável.
6. Abrir score sem responder: estado `INCOMPLETO`, sem score numérico.
7. Responder parcialmente: continua incompleto.
8. Completar variáveis: somente então calcular.
9. Glasgow incompleto: não mostrar 15 implicitamente.
10. Autosave/rascunhos v2 devem continuar funcionando após introdução do workflow temporal.

## P0 — workflow temporal

1. Selecionar **Dor torácica / suspeita de SCA**: criar Atendimento v3 sem alterar autosave v2.
2. Sem marcar suspeita de SCA: HEART pode estar disponível, mas não aplicável.
3. Marcar suspeita: revelar campos contextuais sem gerar diagnóstico ou conduta.
4. Marcar ECG como pendente: criar pendência e refletir etapa `pending_results` quando aplicável.
5. Marcar troponina como pendente: HEART permanece não calculável.
6. Informar os demais componentes do HEART sem troponina: mensagem deve indicar a variável faltante.
7. Informar troponina e completar dados: somente então HEART pode ser calculado.
8. Gerar evolução com HEART calculado: `# SCORES:` deve aparecer abaixo da QP.
9. Sem score calculado: seção `# SCORES:` deve desaparecer.
10. Recarregar página durante atendimento: cenário, suspeita, status de ECG/troponina e campos HEART devem ser restaurados.
11. Gerar novamente a evolução antes da primeira reavaliação: snapshot da admissão deve ser atualizado.
12. Clicar **Reavaliar atendimento**: criar evento filho e preservar snapshot de admissão.
13. Depois da primeira reavaliação, alterações posteriores não podem sobrescrever a HDA da admissão usada no histórico.
14. Gerar reavaliação e conferir exatamente:

```text
## REAVALIAÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##

# QP: "..."

# SCORES:
- ...

# HDA (ADMISSÃO): ...

... EM TEMPO (REAVALIAÇÃO): ...

[CONTINUIDADE DAS SEÇÕES CLÍNICAS]

# CONDUTA:
- ...
```

15. A conduta antiga não pode reaparecer automaticamente como conduta atual.
16. Nova reavaliação deve ser adicionada sem apagar a anterior.

## Regressão de microfunções

Verificar em navegador real após mudanças de arquitetura:

- quick choices de HPP;
- quick choices de exame físico;
- NEGA em massa;
- modelo de exame normal;
- templates sindrômicos;
- edição livre;
- `EM TEMPO` da evolução tradicional;
- copiar com Clipboard API;
- fallback de cópia;
- salvar/abrir/excluir rascunho;
- limpar formulário;
- internação;
- alta;
- navegação lateral;
- menu mobile;
- feedback visual;
- status online/offline.

## Regressão PWA

- carregar online;
- instalar quando o navegador oferecer;
- abrir offline após cache;
- validar root `app.js`, `src/`, `assets/` e `protocols/` no cache;
- confirmar atualização do cache após nova versão;
- confirmar que falha de recurso estático não retorna HTML do app;
- testar atualização da aplicação com versão antiga do Service Worker já instalada.

## Auditoria estrutural

Antes de merge:

- `protocols/sca.js` não manipula DOM;
- `src/workflow-engine.js` não contém regra específica de HEART/SCA;
- `src/score-engine.js` não manipula DOM;
- `src/document-engine.js` não acessa storage;
- `src/storage.js` não altera as chaves v2;
- todos os IDs estáticos usados pela aplicação existem no HTML;
- todos os caminhos do app shell existem;
- README/ROADMAP refletem o código efetivamente entregue.

## Gate

Não fazer merge se:

- `npm run verify` falhar;
- houver regressão P0 conhecida;
- qualquer ausência de informação for convertida em afirmação clínica;
- reavaliação sobrescrever admissão;
- ferramenta não calculável produzir score;
- documentação afirmar comportamento não sustentado pelo código.

CI verde é condição necessária, mas não é homologação assistencial. A regressão manual em navegador e a validação cognitiva do fluxo continuam obrigatórias.
