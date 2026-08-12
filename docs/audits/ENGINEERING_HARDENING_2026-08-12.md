# Engineering hardening — 2026-08-12

Status: checkpoint técnico não clínico da PR #30

## Escopo

Este bloco foi executado em paralelo à homologação clínica da Founder e deliberadamente não altera o comportamento clínico da interface em avaliação.

Trilhas cobertas:

- dívida técnica;
- PWA/cache;
- testes de integração estática;
- documentação/ownership;
- segurança operacional do shell offline.

## Baseline

Antes deste bloco, a PR #30 estava com:

- `201` testes aprovados;
- `0` falhas;
- `service-worker.js` em `zera-ps-v12`;
- APP_SHELL explícito e testado apenas quanto à existência física dos arquivos;
- ativação do service worker removendo todo cache do mesmo origin cujo nome fosse diferente do cache atual.

## Achado PWA: limpeza de cache excessivamente ampla

Comportamento anterior:

```js
keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
```

Caches pertencem ao origin. Portanto, apagar qualquer cache cujo nome não fosse o atual excedia o ownership do Zera PS e poderia remover cache estrangeiro no mesmo origin/scope operacional.

### Correção

O cache passou a ter namespace explícito:

```js
const CACHE_PREFIX = 'zera-ps-';
const CACHE_NAME = 'zera-ps-v13';
```

A ativação agora remove somente gerações antigas do próprio Zera PS:

```js
key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME
```

Nenhum cache sem prefixo `zera-ps-` é candidato à remoção.

Classificação: **FIX / PWA SAFETY**.

## Achado PWA: APP_SHELL podia divergir silenciosamente do grafo de imports

O teste anterior assegurava que cada caminho listado no APP_SHELL existia, mas não garantia o inverso: um módulo já cacheado poderia ganhar um novo `import './foo.js'` sem que `foo.js` fosse adicionado ao APP_SHELL.

Isso criava risco de:

- aplicação funcionar online;
- CI permanecer verde;
- um fluxo quebrar somente offline após instalação/atualização.

### Correção

Foi adicionado teste de **fechamento do APP_SHELL sobre imports ES locais**.

Para cada `.js` listado no shell:

1. lê os imports relativos;
2. resolve o caminho relativo ao módulo importador;
3. exige que o módulo resolvido também esteja no APP_SHELL.

Assim o shell explícito continua simples, mas deixa de depender apenas de disciplina manual.

Classificação: **TEST / PWA REGRESSION**.

## Gate pós-hardening

GitHub Actions `checks`, run `31565133486`:

```text
npm run verify
203 tests
203 pass
0 fail
```

O gate inclui:

- sintaxe de JS da raiz, `assets/`, `src/` e `protocols/`;
- regressão clínica/documental existente;
- existência de todos os arquivos do APP_SHELL;
- fechamento do APP_SHELL sobre imports locais;
- namespace seguro de cache;
- fallback offline limitado a navegações.

## Dívida técnica mantida conscientemente

### 1. `assets/app.js`

Ainda concentra coordenação legada. Não será extraído durante homologação clínica sem testes de caracterização adicionais.

Estado: **DEFER UNTIL UI ACCEPTANCE**.

### 2. `src/product-convergence.js`

É adapter transitório e não deve virar owner permanente do produto.

Estado: **DEFER UNTIL UI ACCEPTANCE**.

### 3. `src/temporal-ui.js`

Ainda divide coordenação de superfície com a camada de convergência.

Estado: **DEFER UNTIL UI ACCEPTANCE**.

### 4. Persistência local multi-Encounter

`develop` contém patrimônio de múltiplos atendimentos (`assets/attendance.js`), mas o schema vigente é Encounter v3. Não fazer merge da implementação antiga.

Estado: **MINE BY BEHAVIOR AFTER CURRENT UI GATE**.

### 5. Falha de escrita no storage

`assets/storage.js` e `src/storage.js` fazem `setItem()` diretamente. Erros como quota excedida, storage indisponível ou bloqueio de permissão podem propagar até a UI.

Não foi aplicado `try/catch` silencioso, porque isso criaria um risco pior: a médica acreditar que o rascunho/autosave foi persistido quando não foi.

A correção futura deve criar um contrato explícito de erro de persistência e feedback operacional observável na interface antes de capturar essas exceções.

Estado: **REQUIRES UX ERROR CONTRACT; DO NOT SILENCE**.

### 6. Teste real de PWA

CI estático não substitui:

- instalação em navegador;
- atualização de service worker;
- reload com cache ativo;
- abertura offline;
- persistência real via localStorage;
- comportamento mobile/Safari.

Estado: **MANUAL HOMOLOGATION REQUIRED**.

## Regras preservadas

Nenhuma mudança deste bloco:

- altera QP/HDA;
- altera red flags;
- altera exame físico;
- altera LAB/imagem;
- altera justificativas;
- altera scores;
- altera reavaliação;
- altera produtividade;
- cria informação clínica;
- faz merge na `main`.

## Próxima trilha de engenharia enquanto a Founder homologa

```text
1. continuar caracterização de adapters transitórios sem removê-los
2. desenhar contrato observável para erros de persistência, sem aplicar durante homologação
3. auditar atualização real do service worker no preview/PWA
4. reconciliar documentação canônica com estado da PR
5. manter CI verde
6. não mudar interação clínica sem feedback da Founder
```
