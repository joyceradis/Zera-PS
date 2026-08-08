# Auditoria de baseline — Zera PS

Data: 2026-08-08
Branch de referência: `main`

## Achados prévios à intervenção

### P0 — segurança clínico-documental

1. HPP vazio era convertido em `NEGA` por fallback durante a geração da evolução.
2. O botão de negativas preenchia cinco campos em massa sem separar intenção clínica de simples valor textual.
3. O modelo de exame normal preenchia achados completos sem registrar metadado de confirmação.
4. Templates sindrômicos continham negativas clínicas pré-escritas.
5. CRB-65, CURB-65 e qSOFA iniciavam visualmente em zero sem todas as variáveis respondidas.
6. Glasgow iniciava em 15 por valores default nos selects.

### P1 — arquitetura

1. `data.js` misturava configuração clínica, CSS, DOM, eventos e sincronização.
2. `app.js` concentrava documentação, persistência, scores, PWA e UI.
3. `localStorage` v1 não possuía schema clínico explícito.
4. Não havia test harness automatizado ou CI.

### P2 — PWA

O Service Worker existia e era registrado, mas o fallback offline era amplo: uma falha em qualquer GET podia terminar em `app.html`.

## Invariantes definidos

- ausência de informação não gera conteúdo clínico;
- nenhuma transformação aumenta certeza ou altera polaridade;
- atalho só produz afirmação quando representa ação explícita;
- template normal exige confirmação médica;
- score incompleto não produz valor ou interpretação;
- migração de dados não fabrica confirmação clínica.

## Escopo da refatoração

A intervenção desta branch foi estrutural e incremental. Não incluiu backend, autenticação, integração institucional, decisão clínica autônoma ou módulo genérico de autorização de exames.