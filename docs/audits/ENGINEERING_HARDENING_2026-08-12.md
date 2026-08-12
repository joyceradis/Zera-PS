# Engineering hardening — 2026-08-12

Status: checkpoint técnico não clínico da PR #30

## Escopo

Este bloco foi executado em paralelo à homologação clínica da Founder e deliberadamente não altera o comportamento clínico da interface em avaliação.

Trilhas cobertas:

- dívida técnica;
- PWA/cache;
- persistência local;
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
```

A ativação remove somente gerações antigas do próprio Zera PS:

```js
key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME
```

Nenhum cache sem prefixo `zera-ps-` é candidato à remoção.

Classificação: **FIX / PWA SAFETY**.

## Achado PWA: APP_SHELL podia divergir silenciosamente do grafo de imports

O teste anterior assegurava que cada caminho listado no APP_SHELL existia, mas não garantia o inverso: um módulo já cacheado poderia ganhar um novo `import './foo.js'` sem que `foo.js` fosse adicionado ao APP_SHELL.

Isso criava risco de aplicação funcionar online e quebrar apenas offline.

### Correção

Foi adicionado teste de **fechamento do APP_SHELL sobre imports ES locais**.

Para cada `.js` listado no shell:

1. lê os imports relativos;
2. resolve o caminho relativo ao módulo importador;
3. exige que o módulo resolvido também esteja no APP_SHELL.

Classificação: **TEST / PWA REGRESSION**.

## Achado de persistência: falhas de localStorage sem contexto técnico

`getItem`, `setItem` e `removeItem` podem falhar por quota, permissão, modo de navegação, política do navegador ou storage indisponível. Antes, a camada de storage dependia diretamente da exceção nativa; no autosave uma falha já produzia `NÃO SALVO`, porém outras rotas de persistência não tinham contrato comum de diagnóstico.

### Ciclo TDD

RED intencional:

- commit de teste `5fbc3187...` introduziu o contrato esperado antes da implementação;
- workflow `checks` run `31565550805` falhou como esperado porque `assets/storage-io.js` ainda não existia.

GREEN:

Foi criado `assets/storage-io.js` com:

- `StoragePersistenceError`;
- operação (`read`, `write`, `remove`);
- chave afetada;
- `cause` original do navegador;
- helpers únicos de I/O para storage documental e Encounter v3.

`assets/storage.js` e `src/storage.js` agora usam esse contrato. A falha não é silenciosamente transformada em sucesso.

Classificação: **FIX / STORAGE OBSERVABILITY**.

## Achado de persistência: JSON corrompido era tratado como ausência de dado

As funções anteriores faziam essencialmente:

```js
try { return JSON.parse(raw); }
catch { return fallback; }
```

Assim, uma chave existente mas corrompida podia se tornar indistinguível de uma chave inexistente. Para um produto que guarda rascunho clínico localmente, essa equivalência é inadequada.

### Ciclo TDD

RED intencional:

- commit `2224ac1b...` adicionou primeiro os testes de corrupção;
- workflow `checks` run `31565837839` falhou como esperado porque o contrato ainda não existia.

GREEN:

Foi introduzido `StorageCorruptionError` + `parseStoredJson(raw, key, fallback)`:

```text
chave ausente
→ fallback explícito

chave presente + JSON válido
→ dado parseado

chave presente + JSON inválido
→ StorageCorruptionError
```

O dado corrompido não é apagado, sobrescrito ou reinterpretado automaticamente. A exceção preserva chave, conteúdo bruto e `cause` para futura recuperação/diagnóstico.

`assets/storage.js` e `src/storage.js` usam o mesmo parser, portanto o contrato vale para autosave v2, drafts v2/legados e Encounter v3.

Classificação: **FIX / DATA INTEGRITY**.

## Achado de ownership: Resumo do Plantão contornava o storage canônico

Durante a auditoria das chamadas de persistência, `src/product-convergence.js` ainda lia diretamente:

```js
adapter.getItem('zera-ps:encounter:v3')
```

com `try/catch` que convertia qualquer erro ou JSON inválido em `[]`.

Isso criava uma inconsistência importante: o storage canônico distinguia ausência, falha e corrupção, mas o painel de produtividade poderia exibir **0 pacientes** nos três casos.

### Ciclo TDD

RED intencional:

- commit `4a81e73c...` adicionou testes exigindo que corrupção e falha de acesso não fossem convertidas em zero;
- workflow `checks` run `31566038072` falhou como esperado com a implementação antiga.

GREEN:

`readProductivityRecords()` agora passa por `createEncounterStorage(adapter).loadActiveEncounter()`, reutilizando o owner `src/storage.js` e o contrato `assets/storage-io.js`.

No comportamento normal nada muda. Somente no caso de falha real/corrupção o painel deixa de mentir com `0` e mostra estado operacional indisponível (`--` / `DADOS LOCAIS INDISPONÍVEIS`), preservando os dados e registrando o erro técnico no console.

Classificação: **FIX / OWNERSHIP + DATA INTEGRITY**.

## PWA após storage hardening

O módulo compartilhado `assets/storage-io.js` faz parte do APP_SHELL e a geração atual é:

```js
const CACHE_NAME = 'zera-ps-v14';
```

O teste de fechamento do shell garante que essa dependência não desapareça da instalação offline por esquecimento manual.

## Gate automatizado mais recente

GitHub Actions `checks`, run `31566187457`, head de código `1fe84508...`:

```text
npm run verify
211 tests
211 pass
0 fail
```

O gate cobre, entre outros:

- sintaxe JS da raiz, `assets/`, `src/` e `protocols/`;
- invariantes clínico-documentais existentes;
- existência de todos os arquivos do APP_SHELL;
- fechamento do APP_SHELL sobre imports ES locais;
- namespace seguro de cache;
- fallback offline limitado a navegações;
- falhas explícitas de read/write/remove do localStorage;
- corrupção JSON distinta de ausência de dado;
- migrações legadas existentes;
- Encounter v3 independente;
- produtividade sem bypass direto do storage canônico;
- produtividade sem converter corrupção/erro em zero atendimentos.

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

### 5. Feedback visual unificado de erro de persistência

O contrato técnico agora existe e erros não são silenciosamente convertidos em sucesso. O autosave legado já apresenta `NÃO SALVO`; o Resumo do Plantão agora distingue indisponibilidade de `0 pacientes`. Outras operações ainda podem precisar de apresentação visual coerente.

Estado: **TECHNICAL CONTRACT DONE / UX CONSOLIDATION DEFERRED**.

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
- altera cálculo normal de produtividade;
- cria informação clínica;
- faz merge na `main`.

## Próxima trilha de engenharia enquanto a Founder homologa

```text
1. continuar caracterização de adapters transitórios sem removê-los
2. auditar lifecycle/registro do service worker e observabilidade técnica sem mudar UX clínica
3. continuar procurando acessos diretos a APIs persistentes fora dos owners canônicos
4. manter documentação/PR sincronizadas com o head real
5. manter CI verde
6. não mudar interação clínica sem feedback da Founder
```
