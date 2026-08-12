# Zera PS — Housekeeping & Product Convergence Audit

Data: 2026-08-11
Última atualização: 2026-08-12
Status: EM ANDAMENTO — convergência implementada incrementalmente; auditoria pós ainda aberta
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

A governança documental detalhada foi separada em [`DOCUMENT_CLASSIFICATION_2026-08-12.md`](DOCUMENT_CLASSIFICATION_2026-08-12.md).

## Inventário consolidado

| Capacidade | Estado observado | Classificação | Decisão / observação |
|---|---|---|---|
| Clinical state / proveniência | existe | KEEP | fundamento de segurança |
| Document engine | existe | KEEP/REFINE | preservar contratos documentais |
| Workflow temporal / Encounter v3 | existe | KEEP/REFINE | manter internamente; não competir visualmente com contexto |
| Infraestrutura declarativa de protocolos | existe | KEEP INTERNAL | boa separação técnica; “protocolo/workflow” não precisa aparecer para a médica |
| Roteiros + workflow contextual na UI | convergência incremental implementada | MERGE | uma porta clínica de contexto; engines internas preservadas |
| Reavaliação como item primário da sidebar | ocultada da navegação principal e reapresentada no Atendimento | MOVE | etapa/evento temporal do mesmo Atendimento; view antiga preservada como implementação transitória |
| Internação como item primário da sidebar | ocultada da navegação principal e reapresentada no Atendimento | MOVE/REFINE | documento/desfecho; gerador preservado |
| Alta como item primário da sidebar | ocultada da navegação principal e reapresentada no Atendimento | MOVE/REFINE | documento/desfecho; gerador preservado |
| HDA integral editável | existe | KEEP/REFINE | núcleo de redução de digitação; texto livre first-class |
| Compositor da síndrome diarreica | existe | KEEP/REFINE | experimento útil; interação ainda precisa validação cognitiva |
| HPP / NEGA explícito | existe | KEEP | microfunção protegida |
| Exame normal confirmado | existe | KEEP | microfunção protegida |
| Scores | existem | KEEP/REFINE | contextualizar; não transformar em catálogo principal |
| HEART temporal | existe | KEEP | `available ≠ applicable ≠ calculable ≠ applied` |
| Exames complementares | renderer convergido para uma lista única | REPLACE/ADAPT | compatível com linhas `- LAB:`, `- ECG:`, `- RX...`, `- TC...` |
| Parser/organizador de exames brutos | recuperado parcialmente em módulo puro | RECOVER — P0 | patrimônio extra é parseado sem ser exibido automaticamente quando a regra clínica ainda não foi definida |
| Ditado / entrada por voz | evidência histórica ainda insuficiente para transplantar | RECOVER/ASSESS | não implementar por memória; continuar arqueologia |
| Justificativas de alto custo/internação | piloto | KEEP/ISOLATE | preservar motor; reavaliar localização na UI |
| PWA/offline | existe | KEEP/AUDIT | app shell atualizado para novos módulos; manter gate de cache/registro/atualização |
| Rascunhos/autosave | existem | KEEP | essenciais para segurança operacional |
| `develop` / Novo Atendimento v0.2 | trabalho real não integrado | MINE | não fazer merge; extrair modelo de Atendimento e UX válida |
| Gráficos/dashboard/métricas | protótipo operacional localizado; motor mensal não localizado | AUDIT | não confundir números hardcoded com métrica real |
| Documentação histórica | classificada | AUDIT/LEGACY | canonical/audit/legacy-reference separados; sem deleção documental arbitrária |
| Branches remotas antigas | refs antigas reapareceram | CLEANUP CANDIDATE | auditoria de 09/08 já comprova integração de várias refs; ferramenta atual não expõe delete de branch; `develop` preservada |
| CI estático gerado/irrelevante | limpo em PR isolada #31 | DELETE | lintr/Puppet/ESLint-SARIF/OSSAR/CodeQL Advanced conflitante removidos; `checks.yml` preservado |

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

### Contrato atual

O comportamento é adaptado, não copiado literalmente. O padrão pretendido permanece:

```text
# EXAMES COMPLEMENTARES:
- LAB: HB: 13,2 / HT: 39,8 / LEUCO: 14.320 (NEUT: 86%) / PLAQ: 245.000 / PCR: 72 / UR: 38 / CR: 0,9 / NA: 138 / K: 4,1
- ECG: ...
- RX DE TÓRAX: ...
- TC DE ...: ...
```

O parser atual já reconhece o núcleo compacto e também preserva, em estrutura interna, patrimônio explícito do predecessor: bastonetes, eosinófilos, basófilos, linfócitos, monócitos, nitrogênio ureico, RFG, TGO, TGP, amilase e lipase. Esses campos adicionais **não entram automaticamente na linha compacta**. Assim, recuperação de patrimônio não é confundida com uma nova decisão clínica de apresentação.

O diferencial neutrofílico entra apenas quando o valor está explicitamente presente. Nenhum “predomínio” é inferido.

### Segurança da recuperação

- input não reconhecido retorna saída vazia, não texto fabricado;
- ausência de analito não produz placeholder clínico;
- aliases de prontuário (`HB`, `HT`, `LEUCO`, `SEG`, `PLAQ`, `PCR`, `UR`, `CR`, `NA`, `K`) possuem regressão própria;
- o texto cru colado pode ser restaurado enquanto o resultado organizado não tiver sido editado manualmente;
- após edição manual, o snapshot de restauração é invalidado para evitar retorno acidental a uma versão anterior;
- texto clínico cru não é armazenado em atributos `data-*` do DOM; o snapshot transitório fica em `WeakMap`.

## Achado 2 — predecessores são parte da arqueologia oficial

Foram identificados como fontes históricas úteis:

- `drajoyceradis/HMS-Dra-Joyce-Radis`;
- `drajoyceradis/Acelerador-PS`.

Esses repositórios não serão mesclados ao Zera. Servem como fonte de microfunções e decisões de UX que possam ser verificadas e adaptadas ao contrato atual.

Código legado com diagnósticos/condutas automáticos ou pressupostos clínicos não será transplantado.

## Achado 3 — `develop` contém uma especificação antiga útil do Atendimento, não uma nova base de código

`develop` está muito atrás da `main`, mas mantém trabalho próprio e artefatos que não existem na `main`, entre eles `SPEC_NOVO_ATENDIMENTO_V0.2.md`, `ROADMAP_V0.2.md`, `assets/attendance.js` e `prototype-novo-atendimento.html`.

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

## Achado 4 — a duplicidade da UI era real e a correção deve continuar incremental

A superfície anterior apresentava simultaneamente:

1. `ROTEIROS DE DOCUMENTAÇÃO` / “Comece por um roteiro”;
2. `WORKFLOW CONTEXTUAL` / “Cenário do atendimento”;
3. `Reavaliação`, `Internação`, `Alta` e `Scores` como destinos primários de sidebar.

A camada `src/product-convergence.js` passou a apresentar **Atendimento** como superfície principal, convergiu os launchers de contexto e oculta da navegação primária as páginas que representam etapa, desfecho ou microferramenta. As views e engines antigas permanecem funcionais por baixo dessa camada enquanto a migração não estiver integralmente validada.

Essa opção é deliberada: remover a implementação antiga antes de caracterizar equivalência destruiria patrimônio por estética arquitetural.

### Direção canônica

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

## Achado 6 — as “métricas” do protótipo não são um motor de métricas

A arqueologia de `develop/prototype-novo-atendimento.html` encontrou indicadores de interface como `2,4 atendimentos/h`, `1 ATENDIMENTO` e `0 altas · 0 reavaliações`. No protótipo esses valores estão hardcoded.

Até esta atualização, não foi encontrada implementação conclusiva de **gráfico mensal** com fonte de dados, agregação temporal e persistência próprias na árvore atual ou nos predecessores auditados. Portanto:

- esses números não serão recuperados como se fossem métricas reais;
- qualquer gráfico mensal que apareça em outra branch/commit continua patrimônio a localizar, não candidato a apagar;
- busca por origem do gráfico permanece aberta.

## Achado 7 — havia ruído de CI sem relação com o produto

A `main` recebeu workflows gerados para R (`lintr`), Puppet, ESLint/SARIF sem configuração compatível, OSSAR legado e CodeQL Advanced em paralelo ao CodeQL default. O CodeQL Advanced falhava no upload porque a configuração default já estava habilitada.

A limpeza foi isolada na PR #31, sem tocar código clínico. O gate canônico `.github/workflows/checks.yml` foi preservado e a PR foi integrada somente após `checks` verde.

## PWA — baseline e alteração controlada

O `service-worker.js` mantém APP_SHELL explícito, limpeza de caches antigos na ativação, fallback de navegação para `app.html` e cache de recursos same-origin.

A branch de convergência atualiza o cache para `zera-ps-v10` e inclui `src/product-convergence.js` e `src/lab-parser.js` no APP_SHELL. Classificação permanece `KEEP/AUDIT`.

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
- [x] auditar evidência histórica de entrada por voz sem transplantar implementação não comprovada;
- [x] auditar baseline do service worker / APP_SHELL;
- [~] localizar e classificar gráficos/dashboard/métricas por origem e utilidade — protótipo hardcoded localizado; gráfico mensal real ainda não localizado;
- [x] classificar documentação vigente como canonical / audit / legacy-reference / obsolete / duplicate;
- [x] escrever testes de caracterização para a camada de convergência e importabilidade fora do DOM;
- [x] unificar incrementalmente a porta clínica de contexto sem apagar engines internas;
- [x] mover reavaliação para ação/etapa do Atendimento na superfície, sem perder o contrato documental;
- [x] reposicionar alta/internação como ações/desfechos do Atendimento na superfície, preservando geradores;
- [x] recuperar parser laboratorial em módulo puro e ampliar a preservação de patrimônio sem ampliar automaticamente o renderer;
- [x] proteger restauração do texto cru contra estado obsoleto e exposição em `data-*`;
- [ ] executar auditoria pós-mudança: regressão automatizada fresca + diff + PWA + microfunções + status de segurança;
- [ ] executar regressão manual em navegador/PWA antes de considerar a experiência clínica homologada.

## Itens que não serão feitos por impulso

- rewrite integral;
- merge de `develop`;
- transplantar o predecessor HMS/Acelerador em bloco;
- apagar branch com trabalho único;
- apagar gráfico/métrica sem localizar sua finalidade;
- expor todos os scores em uma parede de calculadoras dentro do Atendimento;
- fazer diagnóstico/conduta nascer automaticamente de cenário;
- transformar ausência de resposta em negativa.
