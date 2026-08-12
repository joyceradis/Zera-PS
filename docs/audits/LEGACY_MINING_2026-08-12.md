# Mineração de patrimônio legado — v0.2 / predecessores

Data: 2026-08-12

## Objetivo

Extrair capacidades úteis de `develop` e predecessores sem reintroduzir premissas clínicas inseguras nem voltar a uma arquitetura antiga.

## Fonte principal — `develop/SPEC_NOVO_ATENDIMENTO_V0.2.md`

A v0.2 já continha princípios que continuam válidos e hoje estão reincorporados no mapa canônico:

- Atendimento como entidade central;
- texto clínico editável;
- evitar questionário infinito;
- dado informado uma vez deve ser reutilizado;
- ferramentas contextuais;
- progressive disclosure;
- laboratório colado dentro de Exames Complementares;
- score usa dados já informados;
- reavaliação/desfecho pertencem ao mesmo Atendimento.

Classificação: `MINE / CONCEPT ALREADY RECONCILED`.

## `develop/assets/attendance.js`

Capacidades verificadas:

- persistência de uma lista de atendimentos;
- atendimento atual por id;
- numeração diária;
- `em_andamento`, `reavaliacao_pendente`, `finalizado`;
- desfechos `alta`, `internacao`, `transferencia`;
- reavaliações filhas do mesmo atendimento;
- metadados hospital/unidade/convênio/CID/alergias.

### Decisão

Não transplantar o módulo.

Motivos:

1. é schema v2 diferente do Encounter v3 vigente;
2. grava `clinical` como snapshot amplo sem o mesmo contrato atual de proveniência/temporalidade;
3. misturá-lo ao storage atual criaria três domínios locais concorrentes;
4. Encounter v3 é mais maduro em pendências, resultados seriados, snapshots e ferramentas.

### Patrimônio a recuperar futuramente por adaptação

- lista de atendimentos locais;
- `current encounter id`;
- retomar atendimento em andamento;
- status operacional do atendimento;
- finalização/desfecho sem apagar história;
- eventualmente numeração local de atendimento, se houver valor de UX.

Classificação: `RECOVER BY ADAPTATION`, não merge.

Essa recuperação só deve ocorrer quando a UI canônica de Atendimento estiver homologada; caso contrário, multiplicar atendimentos persistidos apenas multiplica uma UX ainda transitória.

## Cards progressivos da v0.2

A especificação antiga propunha cards QP/HDA/HPP/exame/exames/hipóteses/conduta, com resumo quando fechados e liberdade para abrir qualquer seção.

Classificação: `UX REFERENCE / REFINE LATER`.

Não há decisão para copiar literalmente. O princípio útil é:

```text
reduzir densidade visual
sem criar sequência rígida
sem exigir clique quando digitar é mais rápido
```

## QP e atalhos de apresentação

A v0.2 listava queixas como dor abdominal, dor torácica, cefaleia, dispneia, síndrome diarreica, náuseas/vômitos, lombalgia, síndrome gripal, sintomas urinários, tontura/síncope, palpitações, odinofagia e otalgia.

Classificação: `DOMAIN CANDIDATE / NOT AUTO-RECOVER`.

A lista antiga não vira automaticamente catálogo atual. Hoje `Contexto clínico` é a abstração de produto e novos contextos dependem de prioridade da Founder e especificação clínica própria.

## Exame físico pré-preenchido — conflito resolvido

A v0.2 dizia que o exame padrão deveria aparecer previamente preenchido.

Esse comportamento foi **explicitamente substituído** pela fundação de segurança atual:

```text
template disponível
→ ação médica explícita
→ template confirmado
→ texto autorizado
```

Portanto, qualquer parte do legado que trate exame normal como fato pré-confirmado está `OBSOLETE / DO NOT RECOVER`.

## Templates legados com hipótese e conduta automáticas — não recuperar

`develop/assets/templates.js` continha roteiros que, além da QP/HDA, já carregavam `hipoteses` e `conduta` prontas. Exemplos históricos incluíam diagnóstico presumido de rinossinusite/PAC e frases como analgesia, hidratação, exames, antibioticoterapia ou observação.

Esse comportamento conflita com a arquitetura vigente:

```text
contexto disponível
≠ hipótese confirmada
≠ conduta escolhida
```

Decisão:

- **HDA pronta/editável:** patrimônio útil, já reconciliado;
- **hipótese automática:** `OBSOLETE / DO NOT RECOVER`;
- **conduta automática por template:** `OBSOLETE / DO NOT RECOVER`;
- frases históricas podem servir, no máximo, como referência de linguagem após decisão explícita da Founder — nunca como defaults clínicos.

A remoção dessas automações não é perda funcional a recuperar; é correção de segurança e de responsabilidade clínica.

## Scores legados — nenhuma calculadora escondida adicional encontrada em `develop`

`develop/assets/scores.js` contém apenas CRB-65, qSOFA, CURB-65 e Glasgow simplificado — todos já possuem equivalentes vigentes. Não foram encontrados Wells, PERC, SNNOOP10 ou outro catálogo oculto nessa branch.

Classificação: `HERITAGE ALREADY ABSORBED`.

Isso não impede novos scores futuramente; apenas evita atribuir ao histórico uma implementação que não existia.

## HPP quick choices

A v0.2 propunha opções rápidas para comorbidades, MUC, alergias, hábitos e cirurgias.

Classificação: `POTENTIAL UX MICROFUNCTION`.

Pode reduzir digitação, mas exige desenho que preserve:

- NEGA explícito;
- edição livre;
- não transformar opção disponível em fato;
- custo de clique menor que digitação.

Não é prioridade técnica deste housekeeping.

## Laboratório — patrimônio recuperado

A v0.2 já especificava `COLAR LABORATÓRIO` e saída compacta. O predecessor HMS continha parser real de texto bruto.

Essa linhagem foi reconciliada no módulo atual `src/lab-parser.js`.

Classificação: `RECOVERED`.

O contrato vigente é o da Founder, não o texto literal da v0.2.

## CID

A v0.2 previa sugestões múltiplas de CID e confirmação médica antes de inserir.

Classificação: `DOMAIN/PRODUCT REVIEW BEFORE RECOVER`.

Motivos para não recuperar automaticamente:

- sugestão de CID já se aproxima de apoio à decisão semântica;
- precisa de fonte/catalogação e tratamento de versões;
- pode aumentar cliques se a QP/HD livre for mais rápida;
- qualquer reutilização em métricas futuras depende de modelo de dados estável.

## Métricas

A v0.2 mencionava que CID poderia alimentar métricas e o protótipo exibia números operacionais. O protótipo encontrado usa valores hardcoded e não prova motor longitudinal.

Classificação: `UNRESOLVED / DO NOT RECREATE FROM SPEC`.

## Conclusão de mineração

O maior patrimônio de `develop` não é código pronto. É confirmação histórica de decisões de produto que agora reaparecem de forma mais segura:

```text
Atendimento único
+ documentação como eixo
+ ferramentas no contexto
+ reutilização de dados
+ temporalidade
+ liberdade de texto
```

A única macrofunção estrutural claramente ausente da `main` e ainda valiosa é **persistência de múltiplos atendimentos locais / retomada de atendimento**. Ela deve ser reconstruída sobre Encounter v3 em ciclo posterior, nunca pela incorporação direta de `attendance.js`.
