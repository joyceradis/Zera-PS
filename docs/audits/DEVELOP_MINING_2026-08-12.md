# Mineração da branch `develop` — 2026-08-12

Status: **patrimônio catalogado; branch preservada temporariamente; nenhum transplante cego autorizado.**

## Objetivo

Extrair da `develop` comportamentos que ainda tenham valor para o Zera PS atual sem reintroduzir arquitetura, semântica clínica ou atrito de UI já superados.

A regra aplicada é:

```text
comportamento útil
→ classificar
→ verificar se já existe na PR #30/main
→ RECOVER / REFINE somente se ainda faltar
→ implementar depois por contrato atual

código legado
→ nunca copiar em bloco
```

A superfície clínica da PR #30 permanece congelada enquanto a Founder homologa o Ciclo 2.

## Fontes mineradas

- `develop/assets/attendance.js`;
- `develop/prototype-novo-atendimento.html`;
- `develop/SPEC_NOVO_ATENDIMENTO_V0.2.md`;
- `develop/ROADMAP_V0.2.md`.

## Achado estrutural principal

A `develop` não representa uma segunda arquitetura moderna do Zera. Ela contém um **protótipo operacional anterior** com ideias úteis de pronto-socorro, porém implementadas sobre storage v2 e UI monolítica.

O patrimônio relevante é comportamental, não estrutural.

## Matriz de patrimônio

| Capacidade antiga | Classificação | Decisão atual |
| --- | --- | --- |
| múltiplos atendimentos locais | **RECOVER** | ainda útil; adaptar ao Encounter v3 depois da homologação do núcleo |
| retomar/trocar atendimento | **RECOVER** | precisa existir sem perda de contexto; não reutilizar `attendance.js` diretamente |
| status `em andamento / reavaliação pendente / finalizado` | **REFINE / RECOVER** | conceito útil; deve virar estado formal do Encounter atual |
| desfecho `alta / internação / transferência` | **RECOVER** | integrar ao mesmo Atendimento; sem criar produto paralelo |
| contador/número diário do atendimento | **HOLD / OPTIONAL** | potencialmente útil para orientação local; não é prioridade de domínio |
| resumo de altas/reavaliações pendentes | **RECOVER LATER** | conversa com `Resumo do Plantão`; implementar pelo storage canônico atual |
| autosave com estados `SALVANDO / AUTOSSALVO / NÃO SALVO` | **RECOVER** | importante para confiança; depende do contrato visual de erro de persistência |
| evolução visível em construção no topo | **REFINE** | valor alto; preservar sem duplicar documento canônico |
| toggle/alternância formulário ↔ texto | **RECOVERED/REFINED** | conceito já reapareceu na convergência mobile; manter um único output |
| cards recolhíveis | **REFINE** | útil apenas se reduzir carga cognitiva; não impor sequência rígida |
| abrir qualquer card sem perder dados | **KEEP AS CONTRACT** | requisito operacional válido |
| QP por chips obrigatórios | **DO NOT RECOVER AS GATE** | contradiz intake zero-friction aprovado; QP livre é entrada principal |
| QP/termos acionando campos contextuais | **RECOVERED/REFINED** | hoje implementado por listener/gatilhos condicionais, sem seleção obrigatória |
| segunda queixa independente | **HOLD / DOMAIN** | só implementar se provar valor no PS real |
| HDA semipronta por síndrome | **REFINE** | patrimônio conceitual, mas a PR #30 prioriza texto livre + gatilhos; não reintroduzir lacunas rígidas |
| sinais de alarme discretos/contextuais | **KEEP** | princípio central já preservado no intake atual |
| HPP com atalhos | **KEEP/REFINE** | confirmação explícita continua obrigatória; vazio nunca vira `NEGA` |
| modelo de exame normal | **KEEP** | somente após ação médica explícita; nunca presumir exame realizado |
| `HIPOHIDRATADO` | **DELETE / DO NOT RECOVER** | substituído por graduação clínica em cruzes definida pela Founder |
| `COLAR LABORATÓRIO` | **RECOVERED** | parser bruto/compactador já recuperado e endurecido por testes |
| laudo de imagem colado/normalizado | **RECOVERED/REFINED** | microfunção `Formatar Imagem` faz UPPERCASE + parágrafo único |
| score contextual | **RECOVERED** | `available ≠ applicable ≠ calculable ≠ applied` |
| HEART contextual | **RECOVERED/GENERALIZED** | engine/renderer atual é mais geral que o protótipo |
| sugestões de CID | **HOLD** | ferramenta possível, mas confirmação médica é invariante |
| condutas rápidas por ação | **HOLD / DOMAIN** | não assumir que mais botões reduzem atrito; depende de validação clínica |
| reavaliação como estado pendente | **KEEP/RECOVER** | já existe temporalidade; falta convergir fila/múltiplos atendimentos |
| justificativa de exame a partir de dados já registrados | **RECOVERED/REFINED** | PR #30 possui campo livre de exame + geração contextual + copiar |
| impressão A4 de justificativa | **FUTURE** | só após estabilização documental e requisitos reais |
| drawer `Ferramentas` / `Histórico` | **DO NOT COPY** | organização visual antiga; produto atual não deve expor arquitetura interna |

## Microfunção: múltiplos atendimentos

`assets/attendance.js` confirma que o protótipo já possuía:

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

E mantinha:

- `startedAt`, `updatedAt`, `finishedAt`;
- `status`;
- `outcome`;
- `clinical`;
- `reassessments[]`;
- `reports[]`.

### O que será recuperado

O **comportamento** de ter vários casos locais e poder retomar um deles.

### O que não será recuperado

A implementação v2 inteira, porque:

1. acessa `localStorage` diretamente;
2. engole falhas de leitura/escrita e converte erro em fallback silencioso;
3. possui schema diferente do Encounter v3;
4. não modela proveniência/estado clínico atual;
5. duplicaria ownership de persistência já consolidado.

A implementação futura deverá passar por:

```text
UI
→ Encounter repository/store canônico
→ storage.js
→ storage-io.js
→ Web Storage/IndexedDB
```

## Microfunção: confiança de salvamento

O protótipo distingue visualmente:

```text
SALVANDO
AUTOSSALVO
NÃO SALVO
```

Isso é patrimônio importante porque reduz a incerteza operacional do médico.

Hoje a engenharia já diferencia falha de acesso, quota, dado ausente e JSON corrompido. O próximo passo técnico futuro não é colocar `try/catch` silencioso: é criar um **contrato explícito de persistência + estado visual de falha**, sem modificar a interface durante a homologação atual.

Classificação: **RECOVER após gate de UI**.

## Microfunção: destino e plantão

A especificação antiga registra corretamente que o médico não precisa de taxonomia administrativa excessiva para pendência.

Para o fluxo operacional, os conceitos úteis são:

```text
ATENDIMENTO ATIVO
REAVALIAÇÃO / PENDÊNCIA
FINALIZADO

DESFECHO
ALTA
INTERNAÇÃO
TRANSFERÊNCIA
```

`PARECER` e espera de exame/medicação são eventos/pendências dentro do mesmo Atendimento, e não novos produtos.

Esse patrimônio é compatível com a convergência atual e deve alimentar futuramente:

- lista de atendimentos ativos;
- retomada;
- fila de reavaliações;
- desfecho;
- Resumo do Plantão.

## Microfunção: evolução em construção

O protótipo mantinha a evolução em posição visual forte, com ações `ATUALIZAR / EDITAR / COPIAR`.

O valor não está nesses três botões especificamente; está no princípio:

> o médico deve conseguir ver rapidamente o documento que está sendo construído sem abandonar o atendimento.

Qualquer implementação deve preservar **um único output canônico**, evitando duplicação de documento entre formulário, preview e reavaliação.

## Inconsistências antigas que ficam bloqueadas

A mineração também identificou regras que não podem voltar:

- QP obrigatoriamente escolhida por botão antes de começar;
- `HIPOHIDRATADO`;
- exame normal tratado como fato sem confirmação;
- fallback silencioso de storage;
- `NEGA` como preenchimento implícito;
- excesso de sugestões de hipótese/conduta como se fossem fluxo clínico obrigatório;
- navegação `Ferramentas / Histórico` como expressão da arquitetura interna;
- implementação monolítica dependente de `window.ZERA_ATTENDANCE`.

## Resultado da mineração

A branch `develop` contém patrimônio relevante em quatro grupos:

1. **multi-Encounter e retomada**;
2. **estado/desfecho do atendimento**;
3. **confiança operacional do autosave**;
4. **princípios de baixa fricção já compatíveis com a direção atual**.

Não foi identificado motivo para mergear `develop` ou manter seu código como segunda linha do produto.

## Gate para apagar `develop`

`develop` só poderá ser removida quando:

- multi-Encounter/retomada estiver especificado no modelo atual ou arquivado como requisito canônico;
- status/desfecho estiver mapeado no Encounter atual;
- contrato de autosave/erro de persistência estiver registrado na documentação canônica;
- nenhum comportamento exclusivo restante depender do protótipo para ser lembrado.

Até lá:

```text
develop
→ MINE
→ NÃO MERGEAR
→ NÃO USAR COMO BASE
→ NÃO APAGAR AINDA
```

## Âncora de produto

Toda recuperação continuará subordinada ao objetivo principal:

> **reduzir o atrito entre escuta/raciocínio clínico e registro seguro no pronto-socorro.**

Uma microfunção não será recuperada apenas porque existia. Ela precisa demonstrar que reduz digitação, cliques, reconstrução de contexto ou incerteza operacional sem fabricar informação clínica.
