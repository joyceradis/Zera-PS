# Resultado da auditoria pós-refatoração

Data: 2026-08-08

## Evidência automatizada

A refatoração foi submetida ao workflow `checks` em pull request. O job executa:

```bash
npm run verify
```

que, por sua vez, executa:

```bash
npm run check
npm test
```

### Verificação de sintaxe

`node --check` é executado sobre:

- `assets/app.js`
- `assets/ui.js`
- `assets/data.js`
- `assets/templates.js`
- `assets/scores.js`
- `assets/clinical-state.js`
- `assets/document-engine.js`
- `assets/storage.js`
- `service-worker.js`

### Regressão automatizada

O conjunto cobre:

- estado clínico inicial não confirmado;
- negativa explícita;
- origem paciente vs observação médica;
- confirmação de template;
- proibição de `vazio → NEGA`;
- omissão de exame não confirmado;
- renderização de exame confirmado;
- score incompleto e completo;
- Glasgow incompleto e completo;
- armazenamento v2;
- migração conservadora de autosave e rascunhos v1;
- templates sem negativas pré-confirmadas;
- templates sem hipótese/conduta injetadas;
- vínculo da cefaleia ao SNNOOP10 como ferramenta estruturada;
- integração estática entre IDs usados por `app.js` e `app.html`;
- existência dos arquivos do PWA app shell;
- fallback offline restrito a requisições de navegação.

## Auditoria arquitetural

### Confirmado por inspeção de código

- `data.js` tornou-se declarativo;
- `clinical-state.js` não depende de DOM;
- `document-engine.js` não depende de DOM ou armazenamento;
- `scores.js` não depende de DOM;
- `storage.js` aceita adapter testável;
- `ui.js` concentra operações de DOM;
- `app.js` coordena os módulos;
- Service Worker foi atualizado para cache v3 e inclui os novos módulos.

## Riscos removidos

1. HPP vazio não possui mais fallback automático para `NEGA`.
2. Negativas em massa exigem ação explícita.
3. Exame normal possui confirmação explícita de template.
4. Templates sindrômicos não carregam negativas clínicas como fatos.
5. Templates não injetam hipótese ou conduta na saída.
6. Scores não possuem resultado inicial implícito.
7. Glasgow não inicia em 15.
8. Migração de dados legados não fabrica confirmação clínica.
9. Fallback PWA não mascara recurso estático ausente com HTML do aplicativo.

## Verificação ainda humana

Permanece necessária regressão manual em navegador real para:

- fluxo completo de evolução;
- seleção rápida e edição livre;
- autosave/reload;
- copiar para clipboard;
- instalação PWA;
- abertura offline;
- comportamento mobile;
- ergonomia dos scores no ritmo de plantão.

A ausência dessa regressão manual impede declarar a interface como homologada para uso assistencial, mesmo com CI verde.
