# Mineração de patrimônio legado — v0.2 / `develop`

Data: 2026-08-12

Status: **patrimônio catalogado; `develop` preservada apenas como mina temporária; nenhum transplante cego autorizado.**

## Objetivo

Extrair capacidades úteis de `develop` e predecessores sem reintroduzir premissas clínicas inseguras, arquitetura monolítica ou atrito de UI já superado.

A regra é:

```text
comportamento útil
→ classificar
→ verificar se já existe na arquitetura atual
→ RECOVER / REFINE somente se ainda faltar
→ implementar pelo contrato atual

código legado
→ nunca copiar em bloco
```

A superfície clínica da PR #30 permanece congelada enquanto a Founder executa a homologação do Ciclo 2.

## Fontes verificadas

- `develop/SPEC_NOVO_ATENDIMENTO_V0.2.md`;
- `develop/ROADMAP_V0.2.md`;
- `develop/assets/attendance.js`;
- `develop/prototype-novo-atendimento.html`;
- assets históricos relacionados a templates/scores.

## Achado estrutural principal

A `develop` não é uma segunda linha moderna do produto. É um protótipo operacional anterior com ideias válidas de pronto-socorro, porém apoiadas em storage v2, `window.ZERA_ATTENDANCE` e UI monolítica.

O patrimônio relevante é **comportamental**, não estrutural.

## Matriz consolidada de patrimônio

| Capacidade antiga | Classificação | Decisão |
| --- | --- | --- |
| múltiplos atendimentos locais | **RECOVER** | reconstruir sobre Encounter v3 após homologação do núcleo |
| retomar/trocar atendimento | **RECOVER** | preservar contexto sem reutilizar `attendance.js` diretamente |
| status `em andamento / reavaliação pendente / finalizado` | **REFINE / RECOVER** | virar estado formal do Encounter atual |
| desfecho `alta / internação / transferência` | **RECOVER** | integrar ao mesmo Atendimento |
| número diário do atendimento | **HOLD / OPTIONAL** | potencialmente útil para orientação local; sem prioridade atual |
| resumo de altas/reavaliações | **RECOVER LATER** | integrar ao Resumo do Plantão pelo storage canônico |
| autosave `SALVANDO / AUTOSSALVO / NÃO SALVO` | **RECOVER** | importante para confiança; depende de contrato visual de erro |
| evolução em construção no topo | **REFINE** | preservar visibilidade sem duplicar output |
| formulário ↔ texto | **RECOVERED / REFINE** | conceito já reapareceu; manter um único documento canônico |
| cards recolhíveis | **REFINE** | usar somente se reduzir densidade sem criar sequência rígida |
| abrir qualquer seção sem perda | **KEEP AS CONTRACT** | requisito operacional válido |
| QP por chips obrigatórios | **DO NOT RECOVER AS GATE** | intake atual começa por texto livre |
| QP/termos acionando contexto | **RECOVERED / REFINE** | listener/gatilhos condicionais substituem seleção obrigatória |
| segunda queixa independente | **HOLD / DOMAIN** | só implementar se houver ganho real no PS |
| HDA semipronta por síndrome | **REFINE** | patrimônio conceitual; não reintroduzir lacunas rígidas |
| sinais de alarme contextuais | **KEEP** | princípio central preservado |
| HPP quick choices | **POTENTIAL UX MICROFUNCTION** | só se clique for mais barato que digitação e NEGA seguir explícito |
| modelo de exame normal | **KEEP** | somente após ação médica explícita |
| `HIPOHIDRATADO` | **DO NOT RECOVER** | substituído por graduação em cruzes definida pela Founder |
| `COLAR LABORATÓRIO` | **RECOVERED** | parser bruto/compactador atual é o contrato vigente |
| laudo de imagem colado | **RECOVERED / REFINE** | `Formatar Imagem`: UPPERCASE + parágrafo único |
| score contextual | **RECOVERED** | `available ≠ applicable ≠ calculable ≠ applied` |
| HEART contextual | **RECOVERED / GENERALIZED** | engine atual é mais geral que o protótipo |
| sugestões de CID | **HOLD / DOMAIN** | exige confirmação, fonte/catalogação e validação de custo cognitivo |
| condutas rápidas | **HOLD / DOMAIN** | não assumir que mais botões reduzem atrito |
| reavaliação como pendência | **KEEP / RECOVER** | temporalidade existe; falta multi-Encounter/fila operacional |
| justificativa reutilizando dados | **RECOVERED / REFINE** | PR #30 já gera texto contextual editável/copíavel |
| impressão A4 | **FUTURE** | somente após estabilização documental |
| drawer `Ferramentas / Histórico` | **DO NOT COPY** | não expor arquitetura interna como produto |

## `develop/assets/attendance.js`

Capacidades verificadas:

```text
list()
create()
save()
start()
get()
current()
setCurrent()
clearCurrent()
updateClinical()
addReassessment()
finish()
```

O schema guardava:

- `startedAt`, `updatedAt`, `finishedAt`;
- `status`;
- `outcome`;
- `clinical`;
- `reassessments[]`;
- `reports[]`;
- hospital/unidade/convênio/CID/alergias;
- lista de atendimentos e atendimento atual por id.

### Patrimônio a recuperar

- lista de atendimentos locais;
- current encounter id;
- retomar atendimento em andamento;
- status operacional;
- finalização/desfecho sem apagar história;
- eventualmente numeração local, se houver valor de UX.

### Implementação que não será recuperada

O módulo antigo:

1. acessa `localStorage` diretamente;
2. engole falhas de leitura/escrita e converte erro em fallback silencioso;
3. usa schema v2 incompatível com Encounter v3;
4. grava snapshot clínico amplo sem o contrato atual de estado/proveniência/temporalidade;
5. duplicaria ownership de persistência.

A reconstrução futura deve seguir:

```text
UI
→ Encounter repository/store canônico
→ storage.js
→ storage-io.js
→ Web Storage / IndexedDB
```

Classificação do módulo: **RECOVER BY ADAPTATION, NEVER MERGE**.

## Confiança do autosave

O protótipo distinguia:

```text
SALVANDO
AUTOSSALVO
NÃO SALVO
```

Isso é patrimônio importante porque reduz incerteza operacional. A engenharia atual já diferencia ausência, corrupção, quota e falha de acesso; portanto o próximo passo correto é um **contrato explícito de persistência + estado visual de falha**, e não `try/catch` silencioso.

Classificação: **RECOVER após gate de UI**.

## Destino, pendências e Resumo do Plantão

A especificação antiga acerta ao evitar taxonomia administrativa excessiva. Para o médico, os conceitos úteis são:

```text
ATENDIMENTO ATIVO
REAVALIAÇÃO / PENDÊNCIA
FINALIZADO

DESFECHO
ALTA
INTERNAÇÃO
TRANSFERÊNCIA
```

Espera de exame, resposta à medicação e parecer são eventos/pendências dentro do mesmo Atendimento.

Esse patrimônio deverá alimentar futuramente:

- lista de atendimentos ativos;
- retomada;
- fila de reavaliações;
- desfecho;
- Resumo do Plantão.

## Evolução em construção

O protótipo mantinha o documento em posição visual forte com `ATUALIZAR / EDITAR / COPIAR`.

O patrimônio real não são esses botões específicos. É o princípio:

> o médico deve conseguir ver rapidamente o documento que está sendo construído sem abandonar o atendimento.

A implementação moderna deve manter **um único output canônico**, evitando documento duplicado entre formulário, preview e reavaliação.

## Cards progressivos

A v0.2 propunha cards QP/HDA/HPP/exame/exames/hipóteses/conduta, resumo fechado e liberdade para abrir qualquer seção.

Classificação: **UX REFERENCE / REFINE LATER**.

Princípio preservável:

```text
reduzir densidade visual
sem criar sequência rígida
sem exigir clique quando digitar é mais rápido
```

## QP e HDA

A antiga lista de QPs não vira catálogo obrigatório atual. O intake aprovado na PR #30 inicia por texto livre e revela contexto progressivamente.

A HDA semipronta continua sendo patrimônio conceitual quando realmente reduz trabalho, mas templates com lacunas rígidas ou seleção obrigatória não devem voltar.

## Exame físico — conflito resolvido

A v0.2 propunha exame padrão previamente preenchido. O comportamento vigente é:

```text
template disponível
→ ação médica explícita
→ template confirmado
→ texto autorizado
```

Portanto:

- template normal disponível: **KEEP**;
- template tratado como fato: **DO NOT RECOVER**;
- `HIPOHIDRATADO`: **DO NOT RECOVER**;
- graduação de desidratação em cruzes: contrato atual.

## Templates com hipótese/conduta automáticas

Templates históricos carregavam hipóteses e condutas prontas.

Contrato atual:

```text
contexto disponível
≠ hipótese confirmada
≠ conduta escolhida
```

Decisão:

- HDA pronta/editável quando útil: patrimônio;
- hipótese automática: **OBSOLETE**;
- conduta automática: **OBSOLETE**.

## Scores legados

A `develop` contém apenas CRB-65, qSOFA, CURB-65 e Glasgow simplificado, todos já absorvidos. Não há Wells/PERC/SNNOOP10 escondidos nessa branch.

Classificação: **HERITAGE ALREADY ABSORBED**.

## Laboratório

A v0.2 já previa `COLAR LABORATÓRIO` e saída compacta; o predecessor HMS continha parser real.

Essa linhagem já foi recuperada no módulo atual. O contrato vigente é o da Founder, inclusive diferencial leucocitário condicional.

Classificação: **RECOVERED**.

## CID

Sugestões múltiplas com confirmação explícita são uma possibilidade futura, não patrimônio a reativar automaticamente.

Classificação: **DOMAIN / PRODUCT REVIEW BEFORE RECOVER**.

## Métricas

Os números operacionais encontrados no protótipo eram hardcoded e não comprovam um motor longitudinal. O painel `Resumo do Plantão` atual é implementação nova baseada no Encounter atual.

Classificação do suposto gráfico histórico: **UNRESOLVED / DO NOT RECREATE FROM SPEC**.

## Regras antigas bloqueadas

Não podem voltar por arqueologia:

- QP obrigatoriamente escolhida por botão antes de começar;
- `HIPOHIDRATADO`;
- exame normal como fato não confirmado;
- fallback silencioso de storage;
- vazio → `NEGA`;
- hipótese/conduta injetadas por template;
- navegação `Ferramentas / Histórico` apenas porque existia no protótipo;
- módulo monolítico `window.ZERA_ATTENDANCE`.

## Gate para apagar `develop`

`develop` só poderá ser removida quando:

- multi-Encounter/retomada estiver especificado no modelo atual ou arquivado como requisito canônico;
- status/desfecho estiver mapeado no Encounter atual;
- contrato de autosave/erro de persistência estiver documentado canonicamente;
- nenhum comportamento exclusivo restante depender do protótipo para ser lembrado.

Até lá:

```text
develop
→ MINE
→ NÃO MERGEAR
→ NÃO USAR COMO BASE
→ NÃO APAGAR AINDA
```

## Conclusão

O maior patrimônio da `develop` não é código pronto. É a confirmação histórica de decisões de produto úteis, agora implementáveis com arquitetura mais segura:

```text
Atendimento central
+ documentação como eixo
+ ferramentas no contexto
+ reutilização de dados
+ temporalidade
+ liberdade de texto
+ multi-Encounter futuro
+ confiança operacional de salvamento
```

Toda recuperação permanece subordinada ao objetivo principal:

> **reduzir o atrito entre escuta/raciocínio clínico e registro seguro no pronto-socorro.**

Uma microfunção não será recuperada porque existia. Ela precisa reduzir digitação, cliques, reconstrução de contexto ou incerteza operacional sem fabricar informação clínica.
