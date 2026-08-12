# Zera PS — Housekeeping & Product Convergence Audit

Data: 2026-08-11
Status: EM ANDAMENTO
Branch de trabalho: `chore/housekeeping-product-convergence`

## Objetivo

Reduzir a entropia do produto e do repositório sem perder patrimônio funcional. Esta auditoria precede exclusões, merges conceituais, reorganização de navegação e recuperação de microfunções.

O alvo não é reescrever o Zera PS. É fazer arquitetura, interface e fluxo assistencial convergirem para um único produto.

## Regras de trabalho

1. Nenhuma capacidade é removida apenas porque a UI atual parece redundante.
2. Antes de reescrever, procurar implementação anterior no histórico e nos predecessores do produto.
3. Mudança funcional exige caracterização/teste antes e regressão depois.
4. Código interno pode manter conceitos técnicos que não devem aparecer como modelo mental para a médica.
5. Ausência de dado nunca pode virar afirmação clínica.
6. Priorizar redução de cliques, teclas, troca de contexto e tempo até texto copiável.
7. A interface clínica deve expressar o atendimento; não a árvore interna de engines.
8. Reavaliação, internação e alta não devem ser tratadas automaticamente como produtos independentes se forem etapas/desfechos do mesmo atendimento.
9. Preservar texto livre como caminho de primeira classe quando for mais rápido que uma interação estruturada.
10. Não importar código legado em bloco: minerar microfunções e contratos úteis, descartando pressupostos inseguros.

## Classificação

`KEEP`; `REFINE`; `MOVE`; `MERGE`; `RECOVER`; `REPLACE/ADAPT`; `DELETE`; `REWRITE`.

`REWRITE` é exceção e exige demonstração de que adaptação incremental é mais arriscada que substituição.

## Inventário inicial consolidado

| Capacidade | Estado observado | Classificação | Decisão / observação |
|---|---|---|---|
| Clinical state / proveniência | existe | KEEP | fundamento de segurança |
| Document engine | existe | KEEP/REFINE | preservar contratos documentais |
| Workflow temporal / Encounter v3 | existe | KEEP/REFINE | manter internamente; não competir visualmente com cenário |
| Infraestrutura declarativa de protocolos | existe | KEEP INTERNAL | boa separação técnica; “protocolo/workflow” não precisa aparecer para a médica |
| Roteiros + workflow contextual na UI | coexistem | MERGE | duas portas concorrentes para contexto clínico |
| Reavaliação como item primário da sidebar | existe | MOVE | etapa/evento temporal do mesmo atendimento |
| Internação como item primário da sidebar | existe | MOVE/REFINE | documento/desfecho do atendimento; preservar gerador |
| Alta como item primário da sidebar | existe | MOVE/REFINE | documento/desfecho do atendimento; preservar gerador |
| HDA integral editável | existe | KEEP/REFINE | núcleo de redução de digitação; texto livre first-class |
| Compositor da síndrome diarreica | existe | KEEP/REFINE | experimento útil; interação ainda precisa validação cognitiva |
| HPP / NEGA explícito | existe | KEEP | microfunção protegida |
| Exame normal confirmado | existe | KEEP | microfunção protegida |
| Scores | existem | KEEP/REFINE | contextualizar; não transformar em catálogo principal |
| HEART temporal | existe | KEEP | `available ≠ applicable ≠ calculable ≠ applied` |
| Exames complementares “um item por linha” | existe | REPLACE/ADAPT | correção técnica recente, mas não corresponde ao padrão compacto da Founder |
| Parser/organizador de exames brutos | LOCALIZADO EM LEGADO | RECOVER — P0 | recuperar do predecessor HMS e adaptar ao padrão atual `- LAB: ... / ...` |
| Ditado / entrada por voz | evidência no predecessor | RECOVER/ASSESS | confirmar implementação útil e compatibilidade antes de trazer |
| Justificativas de alto custo/internação | piloto | KEEP/ISOLATE | preservar motor; reavaliar localização na UI |
| PWA/offline | existe | KEEP/AUDIT | app shell atual explícito; manter gate de cache/registro/atualização |
| Rascunhos/autosave | existem | KEEP | essenciais para segurança operacional |
| `develop` / Novo Atendimento v0.2 | trabalho real não integrado | MINE | não fazer merge; extrair modelo de Atendimento e UX válida |
| Gráficos/dashboard/métricas | ainda não localizados de forma conclusiva | AUDIT | não remover sem identificar origem e finalidade |
| Documentação histórica | volumosa | AUDIT | separar canonical/audit/legacy/obsolete/duplicate |
| Branches remotas antigas | 24 refs observadas antes deste ciclo | CLEANUP CANDIDATE | auditoria de 09/08 já demonstrou integração de 22 refs; `develop` deve ser preservada até mineração |

## Achado 1 — o parser de exames NÃO estava perdido

A função que a Founder descreveu não é a alteração recente `9a8697d` (“um exame por linha”).

Foi localizada no repositório predecessor `drajoyceradis/HMS-Dra-Joyce-Radis`, commit:

`c3828267fd393d722af6cc99f137b8d442eac690` — **Melhora parser de exames e fluxo do gerador**.

O código legado continha `transformExams(raw)` e fazia arqueologia de texto bruto copiado do sistema, incluindo:

- limpeza de URLs, chave de acesso, assinatura eletrônica e responsável técnico;
- hemograma: HB, HT, leucócitos, bastões, segmentados, eosinófilos, basófilos, linfócitos, monócitos e plaquetas;
- função renal: creatinina, ureia, nitrogênio ureico e RFG;
- bioquímica: TGO, TGP, PCR, amilase e lipase;
- EAS;
- impressão de TC;
- interpretação de RX;
- conclusão/interpretação de ECG.

A saída antiga já usava composição compacta com `/`, mas agrupava em linhas como `- HEMOGRAMA:` / `- FUNÇÃO RENAL:` / `- BIOQUÍMICA:`.

### Contrato atual definido pela Founder

O comportamento a recuperar deve ser adaptado, não copiado literalmente. O padrão pretendido é compacto e orientado ao prontuário do PS, por exemplo:

```text
# EXAMES COMPLEMENTARES:
- LAB: HB: 13,2 / HT: 39,8 / LEUCO: 14.320 (NEUT: 86%) / PLAQ: 245.000 / PCR: 72 / UR: 38 / CR: 0,9 / NA: 138 / K: 4,1
- ECG: ...
- RX DE TÓRAX: ...
- TC DE ...: ...
```

O diferencial leucocitário entra quando clinicamente informativo no material de origem; o parser não deve inventar “predomínio” nem interpretar ausência de analito.

### Decisão

- preservar o commit `9a8697d` apenas até a substituição segura do renderer;
- recuperar o algoritmo do predecessor em módulo puro e testável;
- adaptar aliases, seleção de analitos e contrato de saída ao padrão atual;
- somente depois integrar ao `# EXAMES COMPLEMENTARES:`;
- criar casos sintéticos de laboratório bruto para regressão antes de substituir o comportamento vigente.

## Achado 2 — predecessores são parte da arqueologia oficial

Foram identificados como fontes históricas úteis:

- `drajoyceradis/HMS-Dra-Joyce-Radis`;
- `drajoyceradis/Acelerador-PS`.

O README histórico do Acelerador registrava explicitamente `Digitação por Voz` e `Parser de Exames Inteligente`. Esses repositórios não serão mesclados ao Zera. Serão usados como fonte de microfunções e decisões de UX que tenham sobrevivido ao teste da prática.

Código legado com diagnósticos/condutas automáticos ou pressupostos clínicos não será transplantado.

## Achado 3 — `develop` contém a melhor especificação antiga do Atendimento, não uma nova base de código

`develop` está muito atrás da `main`, mas mantém 10 commits próprios e quatro artefatos não integrados, entre eles `SPEC_NOVO_ATENDIMENTO_V0.2.md` e `assets/attendance.js`.

A especificação antiga já defendia:

- uma única tela de Atendimento;
- evolução com estrutura fixa;
- texto em construção e editável;
- cards progressivos;
- dados registrados uma vez;
- ferramentas contextuais;
- `COLAR LABORATÓRIO` dentro de Exames Complementares;
- scores que aproveitam dados já informados;
- reavaliação e desfecho ligados ao Atendimento.

`assets/attendance.js` modela `em_andamento`, `reavaliacao_pendente`, `finalizado`, `alta`, `internacao` e `transferencia` dentro da mesma entidade de Atendimento.

### Decisão

Não fazer merge de `develop`. Minerar seus contratos de produto e reconciliá-los com o Encounter v3 atual, que é tecnicamente mais maduro.

## Achado 4 — a duplicidade da UI é real e está no código atual

`app.html` apresenta simultaneamente:

1. `ROTEIROS DE DOCUMENTAÇÃO` / “Comece por um roteiro”;
2. `WORKFLOW CONTEXTUAL` / “Cenário do atendimento”.

Além disso, a sidebar apresenta `Reavaliação`, `Internação`, `Alta` e `Scores` como destinos de navegação independentes. `src/temporal-ui.js`, ao iniciar uma reavaliação, chega a clicar programaticamente no item `data-view="reavaliacao"`.

Isso confirma vazamento de arquitetura interna para o modelo mental da médica.

### Direção de convergência

A superfície clínica deve tender a:

```text
ATENDIMENTO
  → contexto/apresentação
  → QP
  → HDA
  → HPP
  → EXAME FÍSICO
  → EXAMES COMPLEMENTARES
  → HIPÓTESES
  → CONDUTA
  → REAVALIAR (quando necessário)
  → DESTINO / DOCUMENTO (alta, internação, transferência...)
```

Internamente, templates, protocolos, workflow engine, score engine e document engine continuam separados.

## Achado 5 — housekeeping de 09/08 foi principalmente documental

A limpeza anterior preservou deliberadamente `assets/`, `src/`, `protocols/`, UI e comportamento clínico. Por isso ela não resolveria — e não pretendia resolver — a fragmentação de produto vista agora.

A duplicação `assets/*` ↔ wrappers `src/*` foi reconhecida como migração incremental, não duplicação acidental. Não consolidar durante este ciclo sem teste de caracterização.

## PWA — baseline observado

O `service-worker.js` atual usa cache versionado (`zera-ps-v8`), APP_SHELL explícito, limpeza de caches antigos na ativação, fallback de navegação para `app.html` e cache de recursos same-origin.

Classificação: `KEEP/AUDIT`. A convergência de UI não deve remover offline-first.

## Norte do produto

```text
ATENDIMENTO
  ↓
DOCUMENTAÇÃO
  ↓
CONTEXTO CLÍNICO
  ↓
MICROFERRAMENTAS PERTINENTES
  ↓
TEXTO REVISÁVEL / COPIÁVEL
```

Métrica operacional de design:

```text
valor = informação relevante capturada / (cliques + teclas + carga cognitiva)
```

Gate absoluto:

```text
informação clínica fabricada = 0
```

## Ordem de execução deste ciclo

- [x] inventariar branches remotas atuais;
- [x] caracterizar duplicidade Roteiro × Workflow na UI atual;
- [x] minerar `develop` e confirmar Atendimento v0.2 como referência, não base de merge;
- [x] localizar parser de exames bruto no predecessor HMS;
- [x] localizar evidência histórica de entrada por voz;
- [x] auditar baseline do service worker / APP_SHELL;
- [ ] localizar e classificar gráficos/dashboard/métricas por origem e utilidade;
- [ ] classificar documentação vigente como canonical / audit / legacy-reference / obsolete / duplicate;
- [ ] escrever testes de caracterização para convergência da navegação antes de alterar a UI;
- [ ] unificar a porta clínica de contexto sem apagar engines internas;
- [ ] mover reavaliação para ação/etapa do Atendimento sem perder o contrato documental;
- [ ] reposicionar alta/internação como desfechos/documentos do Atendimento;
- [ ] recuperar parser laboratorial em módulo puro por TDD;
- [ ] auditar pós-mudança: regressão automatizada + diff + PWA + microfunções;

## Itens que não serão feitos por impulso

- rewrite integral;
- merge de `develop`;
- transplantar o predecessor HMS/Acelerador em bloco;
- apagar branch com trabalho único;
- apagar gráfico/métrica sem localizar sua finalidade;
- expor todos os scores em uma parede de calculadoras dentro do Atendimento;
- fazer diagnóstico/conduta nascer automaticamente de cenário;
- transformar ausência de resposta em negativa.
