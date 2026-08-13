# Auditoria técnica da superfície de uso — Zera PS

```text
OBJETIVO:          auditar a superfície clínica efetivamente entregue ao usuário e verificar
                   os achados de homologação da Founder contra o código
AGENTE/SETOR:      Quality / Verification Engineering (Claude)
BASE:              chore/housekeeping-product-convergence @ da03213
BRANCH:            audit/founder-homologation-verification
DATA:              2026-08-13
SUÍTE NA BASE:     267/267
CLASSIFICAÇÃO:     auditoria independente — não é homologação clínica
```

---

## 1. Escopo

Objeto da auditoria: a interface que o usuário opera no preview publicado, incluindo o texto
efetivamente produzido pelos motores de documento e de justificativa.

Fora de escopo: correção de arquitetura, alteração de UX ou de semântica clínica. Este setor
caracteriza e evidencia; a correção pertence ao owner arquitetural ou à Founder, conforme o caso.

## 2. Método

1. Leitura integral da cadeia de montagem da interface: `app.html`, `assets/app.js`,
   `src/product-convergence.js`, `src/temporal-ui.js`.
2. Execução dos motores puros (`document-engine`, `justification-engine`, `clinical-intake`,
   `hda-composer`, `lab-parser`, `productivity`) com entradas representativas, registrando a
   **saída literal**, não a saída esperada.
3. Rastreamento de cadeia causal por referência de arquivo e linha para cada achado.
4. Teste de mutação sobre os protetores construídos, para confirmar que detectam a regressão
   que declaram cobrir.

## 3. Limites de validade

Esta auditoria **não** estabelece:

- comportamento de DOM real, foco, ordem de tabulação ou resposta a evento de interface — não há
  navegador nem harness de interação neste repositório;
- comportamento de PWA/offline real;
- tempo real até um registro copiável, que é o critério operacional definido pela Founder no
  achado 2 de homologação;
- adequação clínica de qualquer texto produzido.

Onde o relatório afirma que o usuário obtém determinada saída, a afirmação é sustentada por
execução do motor correspondente. Onde a afirmação é inferência a partir da montagem do DOM,
está marcada como tal.

## 4. Arquitetura da superfície avaliada

A interface operada pelo usuário não corresponde ao documento estático. `app.html` é o esqueleto
herdado; a superfície real é montada em tempo de execução por `src/product-convergence.js`, que
executa em `DOMContentLoaded` e opera por **ocultação do original e injeção do substituto**
(`initProductConvergence`, `src/product-convergence.js:557`).

Dezessete pontos de ocultação foram identificados no módulo. Os elementos originais permanecem
no documento com o atributo `hidden`; não são removidos, e parte deles conserva listeners
registrados por `assets/app.js`.

Essa dobra é a origem causal direta de sete dos quinze achados desta auditoria (UX-02, UX-03,
UX-05, UX-07, UX-10, UX-12 e UX-15).

## 5. Escala de severidade

| Nível | Definição |
| --- | --- |
| **S1** | Produz afirmação clínica não confirmada em documento assinado ou de uso externo, **ou destrói de forma irreversível registro clínico já produzido pelo usuário** |
| **S2** | Funcionalidade especificada indisponível ou incorreta no fluxo real de uso |
| **S3** | Degradação de qualidade documental ou de fluxo, sem fabricação de conteúdo |
| **S4** | Dívida estrutural sem efeito observável pelo usuário |

**Nota sobre a escala.** A definição de S1 foi estendida na segunda rodada desta auditoria para
abranger destruição irreversível de registro. A extensão decorre do achado UX-09 e está declarada
aqui para que a mudança de critério não fique implícita. A justificativa é que perda irreversível
do texto clínico durante o plantão tem impacto operacional equivalente ao de conteúdo fabricado.

---

## 6. Achados

### UX-01 — Justificativa de exame afirma urgência e gravidade não confirmadas

**Severidade:** S1
**Local:** `src/justification-engine.js:108-123`
**Owner da correção:** Platform/Core quanto ao mecanismo; **redação pertence à Founder**

`assembleFreeExamJustification` monta o texto sobre uma moldura fixa. Três asserções clínicas
são emitidas **independentemente de qualquer entrada**:

- `EM CARÁTER DE URGÊNCIA`
- `PARA DEFINIÇÃO DE CONDUTA IMEDIATA`
- `EXCLUSÃO DE COMPLICAÇÕES POTENCIALMENTE GRAVES`

Evidência — saída literal com todos os campos vazios:

```text
SOLICITO [COMPLETAR: NOME DO EXAME] PARA PACIENTE EM QUESTÃO QUE DÁ ENTRADA NESTE
PRONTO-SOCORRO COM QUADRO DE [COMPLETAR: QUADRO CLÍNICO]. AO EXAME FÍSICO, DESTACA-SE:
[COMPLETAR: ACHADOS RELEVANTES DO EXAME FÍSICO]. DIANTE DO QUADRO CLÍNICO APRESENTADO E DA
HIPÓTESE DIAGNÓSTICA DE [COMPLETAR: HIPÓTESE DIAGNÓSTICA], FAZ-SE NECESSÁRIA A REALIZAÇÃO DO
EXAME SOLICITADO EM CARÁTER DE URGÊNCIA PARA DEFINIÇÃO DE CONDUTA IMEDIATA E EXCLUSÃO DE
COMPLICAÇÕES POTENCIALMENTE GRAVES.
```

O mecanismo de `[COMPLETAR: ...]` protege corretamente os campos **variáveis**. Não protege a
moldura: os predicados de urgência e gravidade não são derivados de entrada alguma e não podem
ser removidos pelo usuário exceto por edição manual do texto gerado.

**Contraste interno.** A implementação anterior, `assembleJustification`
(`src/justification-engine.js:95-106`), ainda presente no módulo mas desconectada da interface,
não emite predicado de urgência: monta blocos rotulados e marca ausência com `[COMPLETAR: ...]`.
A convergência substituiu uma implementação conservadora por uma menos conservadora.

**Mitigação existente e insuficiente.** `src/product-convergence.js:518` exibe aviso pedindo
confirmação de urgência, hipótese e achados antes de copiar. O aviso não impede que o documento
nasça afirmando.

**Relevância normativa.** O documento destina-se a autorização junto a operadora de saúde. A
regra do projeto — ausência de confirmação não vira afirmação clínica — aplica-se com peso maior
aqui do que em uma evolução interna.

---

### UX-02 — QP e HDA são emitidos com conteúdo idêntico no documento

**Severidade:** S3
**Local:** `src/product-convergence.js:166-172` → `src/clinical-intake.js:19-25` →
`assets/document-engine.js:42-43`
**Owner da correção:** Platform/Core

Cadeia:

```text
syncDocumentState() escreve o texto livre em #qp
  e escreve composeHdaFromQp(textoLivre, flagsSelecionadas) em #hda
     → composeHdaFromQp devolve `base` sem alteração quando nenhuma flag está marcada
        (src/clinical-intake.js:23)
        → renderEvolution emite `# QP:` e `# HDA:` separadamente
           (assets/document-engine.js:42-43)
```

Evidência — saída literal, nenhuma flag marcada:

```text
## EVOLUÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##

# QP: DOR ABDOMINAL EM FLANCO DIREITO HA 6 HORAS, NAUSEAS, SEM FEBRE

# HDA: DOR ABDOMINAL EM FLANCO DIREITO HA 6 HORAS, NAUSEAS, SEM FEBRE
```

A duplicação desaparece somente quando ao menos um ponto de atenção é selecionado, caso em que a
HDA recebe o sufixo `SINAIS DE ALERTA PRESENTES: ...`. O percurso sem seleção é o percurso
nominal do intake de texto livre.

Não há fabricação de conteúdo. O defeito é de qualidade documental em registro assinado.

---

### UX-03 — Camada temporal inalcançável; Resumo do Plantão sem fonte de dados

**Severidade:** S2
**Local:** `src/temporal-ui.js:298`, `:409`, `:328`; `app.html:42`;
`src/product-convergence.js:124`, `:322-326`
**Owner da correção:** Platform/Core
**Rastreamento:** issue #44

Cadeia verificada:

```text
createEncounter() tem um único chamador de produto
  src/temporal-ui.js:298   handleScenarioChange
que dispara apenas no evento change de #workflow-scenario
  src/temporal-ui.js:409
#workflow-scenario é descendente de .workflow-card
  app.html:42-51
.workflow-card recebe hidden = true na convergência
  src/product-convergence.js:124   hideLegacyContextSelectors()
o caminho alternativo não cria encounter
  src/temporal-ui.js:328   handleStartReassessment() → if (!encounter) return;

⇒ a chave zera-ps:encounter:v3 nunca é escrita
⇒ readProductivityRecords() (src/product-convergence.js:322) devolve sempre []
⇒ Resumo do Plantão exibe ATENDIDOS: 0 e Pacientes/Hora "--"
```

O motor de cálculo está correto e é coberto por teste. O defeito é de **alcance**, não de
cálculo: nenhum caminho do produto produz o dado que o motor consome. Os testes existentes
passavam porque alimentavam `summarizeProductivity` com um snapshot construído no próprio teste.

**Consequência de escopo maior.** A mesma ocultação retira do alcance do usuário toda a camada
temporal e de protocolo — etapas, ferramentas clínicas e progressive disclosure de protocolo.
Isso delimita o alcance prático do invariante `INV-CLIN-003`: o espaço exercitado exaustivamente
pelos protetores não é acessível pela interface convergida. A cobertura permanece correta como
propriedade do código e **não** deve ser lida como propriedade do produto entregue.

Não é possível determinar por leitura de código se a ocultação foi deliberada. Ela é compatível
com o achado 2 de homologação (redução de caminhos concorrentes). A reconciliação entre a
ocultação e a existência do Resumo do Plantão é decisão de arquitetura e de produto.

---

### UX-04 — Nenhum recurso de operação por teclado

**Severidade:** S3
**Local:** superfície clínica completa
**Owner da correção:** Platform/Core, mediante especificação da Founder

Varredura por `accesskey`, `keydown`, `key ===`, `ctrlKey`, `metaKey` em `app.html`,
`src/product-convergence.js` e `src/temporal-ui.js`: nenhuma ocorrência.

O achado 2 de homologação classifica keyboard-first como P1. Não há implementação parcial.

---

### UX-05 — O aviso legal foi substituído, não apenas reposicionado

**Severidade:** S3
**Local:** `app.html:36` → `src/product-convergence.js:525-533`
**Owner da decisão:** Founder (linguagem documental)

Texto original em `app.html:36`:

> O Zera PS organiza a documentação. Dados não confirmados não devem ser convertidos em
> afirmações clínicas.

Texto após `compactLegalNotice` (`src/product-convergence.js:531`):

> Revise e valide clinicamente o texto antes de registrar no prontuário.

O achado 9 de homologação solicita redução de poluição visual e reposicionamento. A implementação
também **trocou o conteúdo**, removendo da interface o enunciado do invariante nº 1 do projeto e
substituindo-o por instrução de revisão genérica.

Registrado como achado por divergir do pedido, não por juízo sobre qual texto é preferível. A
escolha de linguagem documental pertence à Founder.

---

### UX-06 — Contorno do portão de proveniência na justificativa

**Severidade:** S3 (risco latente; não há fabricação no estado atual)
**Local:** `src/product-convergence.js:475-478`, consumido em `:500-514`
**Owner da correção:** Platform/Core

`observedFieldFromInput` constrói o estado clínico diretamente a partir do valor do input:

```js
return value ? { value, state: 'present', source: 'physician_observation', confirmed: true, ... } : null;
```

Dois efeitos:

1. **Reetiquetagem de proveniência.** Achado confirmado por modelo de exame normal — que o estado
   canônico registra como `TEMPLATE_CONFIRMED` com `source: physician_action` — chega à
   justificativa rotulado como observação direta do médico.
2. **Portão satisfeito por construção.** `canRenderClinicalField` exige `confirmed === true`;
   como o valor é fixado nesse ponto, o portão não exerce filtragem alguma neste caminho.

No estado atual todo conteúdo desses campos é digitado ou confirmado por ação explícita, portanto
**não há fabricação hoje**. O risco é de composição futura: qualquer preenchimento automático que
alcance esses inputs passa a integrar a justificativa como achado confirmado, sem verificação.

---

### UX-07 — Dois caminhos de justificativa coexistem no documento

**Severidade:** S4
**Local:** `app.html:146-152`; `assets/app.js:593-631`, `:720-721`;
`src/product-convergence.js:480-523`
**Owner da correção:** Platform/Core

O seletor `#justification-profile` e o campo de variante permanecem no documento com `hidden`.
`assets/app.js` continua populando o seletor e mantém listener de `change` sobre ele.

O caminho legado de **geração** está corretamente desconectado: `refactorHighCostJustification`
clona o botão (`cloneNode` não transporta listeners) e o substitui, de modo que apenas o handler
da convergência permanece ativo. Não há duplicação de comportamento observável.

Permanece como superfície morta e trabalho redundante em cada carregamento — contrário ao
objetivo de redução de caminhos concorrentes do achado 2.

---

### UX-08 — Justificativa não considera resultados laboratoriais e de imagem

**Classificação:** questão de produto, não achado técnico
**Local:** `src/product-convergence.js:500-514`

O caminho ativo compõe a justificativa a partir de QP, HDA, exame físico e hipóteses. Isso
corresponde exatamente ao especificado no achado 7 de homologação.

Registra-se para decisão da Founder que a implementação anterior (`assembleJustification`,
`src/justification-engine.js:101`) incluía a seção de exames complementares, e que resultado
laboratorial ou de imagem prévia costuma integrar a fundamentação exigida por operadora em pedido
de exame de alto custo.

Nenhuma ação foi tomada. A decisão é de domínio.

---

### UX-09 — Sobrescrita irreversível da edição manual do documento final

**Severidade:** S1
**Local:** `app.html:163`; `assets/app.js:458-463`, `:713`
**Owner da correção:** Platform/Core
**Origem:** observação direta da Founder em uso real. **Não havia sido detectada pela primeira
rodada desta auditoria** — ver seção 12.

`#evolution-output` é `textarea` editável, sem `readonly`. O documento final é, por desenho, um
campo de trabalho: o médico gera, revisa e ajusta ali.

Cadeia:

```text
1. edição manual no documento final dispara autosave()
   assets/app.js:713   $('evolution-output').addEventListener('input', autosave)
   → o texto editado passa a ser o conteúdo persistido

2. "Atualizar evolução" sobrescreve sem condição e sem confirmação
   assets/app.js:461   $('evolution-output').value = text;
   → nenhuma comparação com o conteúdo atual, nenhum aviso

3. autosave() imediatamente a seguir persiste a sobrescrita
   assets/app.js:463
   → a versão editada também é destruída no armazenamento

⇒ não há desfazer, histórico ou restauração
⇒ recuperação possível apenas por rascunho salvo manualmente ANTES do evento
```

**O que torna isto um defeito e não uma escolha de desenho:** o mecanismo de proteção já existe
no repositório e foi aplicado a **quatro** ações menos destrutivas:

| Ação | Proteção | Local |
| --- | --- | --- |
| Limpar campos | `confirm()` | `assets/app.js:559` |
| Puxar dados para justificativa de internação | `confirm()` quando há conteúdo | `assets/app.js:640` |
| Trocar de roteiro | `decideTemplateReplacement` + `confirm()` | `assets/app.js:417-421` |
| Organizar laboratório | **desfazer real** — "Restaurar texto colado" | `src/product-convergence.js:420-445` |
| **Atualizar evolução** | **nenhuma** | `assets/app.js:458-463` |

A ação com maior potencial de perda é a única sem guarda. `hasFormContentBeyondTemplate`
(`src/context-coordination.js:90`) já implementa exatamente a distinção necessária — conteúdo real
versus conteúdo gerado — e não é consultada neste caminho.

**Agravante de disposição.** `Atualizar evolução`, `Copiar evolução completa`, `Salvar rascunho` e
`Limpar` ocupam a mesma fileira de ações (`app.html:164`), sem separação entre operação rotineira
e operação destrutiva. O rótulo "Atualizar" não comunica sobrescrita.

---

### UX-10 — Superfície sem estado inicial, sem rótulo de orientação e sem indicação de posição

**Severidade:** S2
**Local:** `src/product-convergence.js:118-129`, `:235-285`; `assets/app.js:462-463`
**Owner da correção:** Platform/Core, mediante especificação da Founder
**Origem:** observação direta da Founder — *"fiquei perdida na interface, onde clicar e por quê"*

Quatro condições concorrentes, todas verificáveis no código:

1. **A superfície abre sem título.** `hideLegacyContextSelectors` oculta
   `#view-evolucao .form-panel > .section-heading` (`src/product-convergence.js:128`), que era o
   único cabeçalho de topo do painel ("ROTEIROS DE DOCUMENTAÇÃO / Comece por um roteiro"). Após a
   convergência, a tela inicia sem enunciado de onde começar. Os cabeçalhos remanescentes são de
   seções internas — HISTÓRIA, HPP, EXAME FÍSICO, INVESTIGAÇÃO E PLANO, JUSTIFICATIVA — nenhum
   deles orienta a primeira ação.

2. **Nenhuma ação vem pré-selecionada.** `createEncounterContinuationWorkspace`
   (`src/product-convergence.js:254-279`) cria quatro botões — Reavaliar atendimento, Internação,
   Alta, Ferramentas — com todos os painéis `hidden = true` e `aria-pressed = 'false'`. O usuário
   vê quatro botões, nenhum ativo, e nenhuma descrição do que cada um abre antes de clicar.

3. **Não há indicação de etapa ou progresso.** O componente que cumpriria esse papel é o cartão de
   workflow, ocultado pela mesma função — ver UX-03. A superfície não informa em que ponto do
   atendimento o usuário está.

4. **O indicador de estado tem quatro valores sem legenda, e um deles é inalcançável.**
   `#save-status` assume `NÃO SALVO`, `AUTOSSALVO`, `GERADO` e `SALVO`. A distinção entre
   `AUTOSSALVO` e `SALVO` não é explicada em lugar algum. `GERADO` é atribuído em
   `assets/app.js:462` e imediatamente substituído por `AUTOSSALVO` na chamada de `autosave()` da
   linha seguinte — é estado morto, nunca visível ao usuário.

Os itens 1 a 3 decorrem da mesma decisão de ocultação analisada em UX-03. O item 4 é independente.

Este achado não é reproduzível por execução de motor: sustenta-se na leitura da montagem do DOM e
na observação de uso da Founder. Está classificado como caracterizado, não como demonstrado.

---

### UX-11 — Abrir um rascunho dessincroniza o campo de texto livre; a tecla seguinte destrói o rascunho

**Severidade:** S1
**Local:** `src/product-convergence.js:134`, `:150-153`, `:166-172`, `:208`; `assets/app.js:536`
**Owner da correção:** Platform/Core

O campo visível de queixa e contexto (`#qp-free`) é criado **uma única vez**, em
`createZeroFrictionIntake`. A função retorna imediatamente em qualquer reentrada
(`src/product-convergence.js:134`) e semeia o valor inicial a partir dos campos ocultos no momento
da criação (`:153`). **Nada o ressincroniza depois.**

Restaurar autosave na carga funciona, porque `loadAutosave` (`assets/app.js:680`) executa antes da
convergência e o campo é semeado já com o conteúdo correto.

Abrir um rascunho, não:

```text
1. usuário abre um rascunho em Rascunhos
   assets/app.js:536   restoreForm(snapshot.form)
   → escreve nos campos OCULTOS #qp e #hda
   → não há recarga de página: activateView('evolucao') apenas troca a visão
   → #qp-free continua exibindo o conteúdo anterior, ou vazio

2. estado inconsistente e silencioso
   → o documento é gerado a partir de #qp/#hda (corretos)
   → a tela mostra #qp-free (errado)
   → nada sinaliza a divergência

3. qualquer tecla digitada no campo visível dispara a sincronização
   src/product-convergence.js:166-172   syncDocumentState()
   → qpInput.value = free.value
   → hdaInput.value = composeHdaFromQp(free.value, flags)
   → a QP e a HDA do rascunho restaurado são substituídas pelo conteúdo obsoleto

4. o evento de input propagado dispara autosave
   → a substituição é persistida
```

Resultado: **abrir um rascunho e digitar destrói a QP e a HDA daquele rascunho.** Rascunho existe
justamente para retomar um paciente; este é o percurso em que o defeito ocorre.

Mesma família do UX-09 — um escritor sobrescreve conteúdo clínico existente sem consultar seu
estado — e mesma correção conceitual.

---

### UX-12 — "Reavaliar atendimento" abre o painel mas não inicia a reavaliação temporal

**Severidade:** S2
**Local:** `src/product-convergence.js:261-263`; `src/temporal-ui.js:328`, `:410`
**Owner da correção:** Platform/Core
**Relação:** decorre de UX-03 / issue #44

O botão executa duas ações em sequência:

```js
if (action.id === 'reavaliacao') document.getElementById('reassess-encounter')?.click();
openEncounterPanel(action.id);
```

O clique encaminhado atinge `handleStartReassessment`, que retorna na primeira linha por não
existir encounter (`src/temporal-ui.js:328`) — consequência direta de UX-03. O painel abre de
qualquer forma.

O usuário obtém um formulário funcional e um documento de reavaliação. Não obtém: captura de
snapshot de admissão, registro da reavaliação no encounter, nem o evento
`zera:reassessment-started`.

**Falha parcial silenciosa:** a ação aparenta ter funcionado. Metade dela não executou, e não há
sinalização.

---

### UX-13 — Rascunhos são descartados em silêncio a partir do 31º

**Severidade:** S3
**Local:** `assets/app.js:309`, `:506`
**Owner da correção:** Platform/Core

```js
storage.saveDrafts(drafts.slice(0, 30));
```

O 31º rascunho salvo descarta o mais antigo, sem aviso, sem confirmação e sem registro. Em plantão
de alto volume o limite é alcançável, e o descarte atinge exatamente os atendimentos mais antigos
— os que o usuário tem menos chance de perceber que perdeu.

Truncamento silencioso é indistinguível, para o usuário, de dado que nunca existiu.

---

### UX-14 — `INV-STOR-001` vale no motor e não vale no ponto de chamada

**Severidade:** S3
**Local:** `assets/app.js:493-511` versus `assets/storage-io.js`
**Owner da correção:** Platform/Core

O invariante `INV-STOR-001` — falha de persistência não equivale a ausência de dado — está
declarado `FULL`, protegido por três testes, **todos em `storage-io.test.mjs`**, incluindo
`storage writes never fail silently`. A propriedade é verdadeira: `writeStorageItem` lança
`StoragePersistenceError`.

No ponto de chamada, não é:

| Caminho | Tratamento |
| --- | --- |
| `autosave()` (`assets/app.js:219-227`) | `try/catch`, degrada para `NÃO SALVO` |
| `loadAutosave()` (`assets/app.js:680`) | `try/catch`, degrada para `NÃO SALVO` |
| **`saveDraft()` (`assets/app.js:493`)** | **nenhum** |

Em `saveDraft`, a exceção interrompe a execução antes de `renderDrafts()`, antes de
`save-status = 'SALVO'` e antes da mensagem de confirmação. O usuário clica em "Salvar rascunho" e
**nada acontece na tela** — sem confirmação e sem erro.

O invariante é honrado pelo motor e perdido na borda. Nenhum protetor cobre a borda.

---

### UX-15 — Dois caminhos concorrentes de reavaliação no mesmo botão; o contrato documental do README é inalcançável

**Severidade:** S2
**Local:** `assets/app.js:715`; `src/temporal-ui.js:412`, `:343`; `src/document-engine.js:63-95`
**Owner da correção:** Platform/Core
**Relação:** decorre de UX-03; agrava UX-12

O botão `#generate-reassessment` tem **dois** listeners registrados por módulos diferentes:

```text
assets/app.js:715      → generateReassessment
                         → renderReassessment  (assets/document-engine.js:82)
                         → emite # EVOLUÇÃO / # EXAMES DISPONIBILIZADOS / # CONDUTA

src/temporal-ui.js:412 → queueMicrotask(handleReassessmentGenerated)
                         → src/temporal-ui.js:343   if (!encounter) return;
                         → nunca executa, por UX-03
```

Existem, portanto, dois renderizadores de reavaliação no repositório:

| Renderizador | Conteúdo | Alcançável |
| --- | --- | --- |
| `renderReassessment` (`assets/document-engine.js:82`) | evolução, exames, conduta | **sim** |
| `renderTemporalReassessment` (`src/document-engine.js:63`) | `# HDA (ADMISSÃO):`, `# SCORES:`, carry-forward da admissão | **não** |

**Consequência documental.** O `README.md:74` declara como contrato vigente:

> O contrato documental atual mantém, entre outras regras, `# QP: "..."` inline, `# SCORES:` abaixo
> da QP somente quando houver ferramenta aplicada/documentada e `# HDA (ADMISSÃO):` preservando o
> contexto inicial.

Esse contrato está implementado apenas em `src/document-engine.js`, chamado apenas por
`src/temporal-ui.js`, cujos caminhos exigem encounter. **Nenhuma dessas regras alcança o documento
que o usuário obtém hoje.** A reavaliação efetivamente produzida descarta o contexto de admissão.

Isso viola diretamente o gate declarado no `ROADMAP.md:45` — *"Reavaliação única deve preservar
admissão e funcionar sem caminhos concorrentes"* — nos dois termos simultaneamente.

---

## 6.1 Padrão sistêmico

Os quinze achados desta auditoria não são independentes. Todos têm a mesma forma:

```text
o motor está correto e protegido por teste
   ↓
o ponto de chamada que liga o motor ao usuário não está
```

| Achado | Motor correto | Borda não coberta |
| --- | --- | --- |
| UX-01 | `renderEvolution` não fabrica; `[COMPLETAR: ...]` funciona | a moldura da justificativa afirma urgência |
| UX-03 | `summarizeProductivity` calcula certo | nada produz o encounter que ele consome |
| UX-09 | `renderEvolution` gera o texto correto | quem a chama destrói a edição manual |
| UX-11 | `restoreForm` restaura corretamente | o campo visível não é ressincronizado |
| UX-12 | `handleStartReassessment` protege-se corretamente | o chamador ignora que ela não executou |
| UX-14 | `writeStorageItem` lança, nunca falha em silêncio | `saveDraft` não captura |
| UX-15 | `renderTemporalReassessment` implementa o contrato do README | o botão executa o renderizador legado |

O mesmo se aplica ao `INV-CLIN-003`: a propriedade é verdadeira no código e o espaço que ela
protege está fora do alcance do usuário (UX-03).

**Conclusão metodológica.** A suíte deste repositório é forte na camada de motores e ausente na
camada de bordas. Não é questão de quantidade de testes — 267 casos não moveriam nenhum destes
achados. É questão de **onde** a fronteira de verificação foi colocada. Toda cobertura declarada
neste projeto deve ser lida como propriedade de motor até que exista evidência de borda.

---

## 7. Matriz de verificação dos achados de homologação

Verificação item a item contra o código, conforme a instrução registrada em
`docs/coordination/active/founder.md`: *"Não marcar como resolvido apenas porque consta nesta
lista."*

| # | Achado | Resultado | Referência |
| --- | --- | --- | --- |
| 1 | `[CHAVES]` / HDA rígida | **Implementado por ocultação.** Intake livre substitui QP/HDA; grid de roteiros oculto. Placeholders persistem nos dados (`hdaDraft`, rascunho do composer), sem alcance pela interface | `src/product-convergence.js:131` |
| 2 | Tempo/fricção, keyboard-first | **Não implementado** | UX-04 |
| 3 | Hidratação em cruzes | **Implementado.** `HIPOHIDRATADO` removido; `HIDRATADO` + `DESIDRATADO +/4+` a `++++/4+` | `assets/data.js:40` |
| 4 | Diferencial leucocitário | **Implementado.** Referências conforme fornecidas (S 70, B 5, L 45, M 10, E 5, Bas 1); emissão restrita a frações acima do limite superior | `src/lab-parser.js:101-116` |
| 5 | Conduta em UPPERCASE com prefixo `- ` | **Implementado** | `assets/document-engine.js:20-24` |
| 6 | `Formatar Imagem` | **Implementado.** Colapsa quebras e normaliza para maiúsculas | `src/text-formatters.js:1-3` |
| 7 | Justificativa sem dropdown | **Implementado**, com ressalva UX-01 sobre a moldura textual | `src/product-convergence.js:480` |
| 8 | Resumo do plantão sem falso `ATENDIDOS: 0` | **Não resolvido** | UX-03 / issue #44 |
| 9 | Aviso legal discreto | **Implementado com divergência**: conteúdo substituído além do reposicionamento | UX-05 |
| 10 | Princípio transversal | Não é item de código |

## 8. Cobertura de teste dos achados

| Achado | Protetor | Situação |
| --- | --- | --- |
| UX-01 | — | **Sem cobertura.** Nenhum teste verifica ausência de predicado clínico não derivado de entrada |
| UX-02 | — | **Sem cobertura.** Nenhum teste verifica não duplicação entre QP e HDA no documento |
| UX-03 | `tests/converged-surface-reachability.test.mjs` | Fixado. Duas correções simuladas verificadas, ambas detectadas |
| UX-04 | `tests/converged-surface-reachability.test.mjs` | Fixado |
| UX-05 | — | Sem cobertura |
| UX-06 | — | Sem cobertura |
| UX-07 | — | Sem cobertura |
| UX-09 | — | **Sem cobertura.** Nenhum teste verifica proteção do documento final contra sobrescrita |
| UX-10 | — | Sem cobertura; parcialmente não testável sem harness de interação |
| UX-11 | — | **Sem cobertura.** Nenhum teste verifica sincronia entre campo visível e campos espelhados |
| UX-12 | — | Sem cobertura |
| UX-13 | — | Sem cobertura |
| UX-14 | — | Motor coberto (`storage-io.test.mjs`); **borda não coberta** |
| UX-15 | — | Motor coberto (`reassessment-document.test.mjs`); **o renderizador coberto é o inalcançável** |

Doze dos quinze achados não têm protetor algum. Entre eles estão os quatro de maior severidade
(UX-01, UX-09, UX-11 e UX-03). Nenhum seria detectado pela suíte se fosse introduzido hoje.

UX-15 é o caso mais nítido do padrão da seção 6.1: `reassessment-document.test.mjs` cobre
`renderTemporalReassessment` com rigor — e é justamente o renderizador que o usuário nunca alcança.

Isso delimita o significado da contagem 267/267: a suíte protege propriedades de motores puros e
de composição entre módulos. Ela não observa a superfície de uso, e por construção não observaria
nenhum dos defeitos que o usuário efetivamente encontra.

## 9. Disposição proposta

Ordenada por severidade, não por esforço.

1. **UX-09 e UX-11 em conjunto** — guarda contra sobrescrita de conteúdo clínico existente. São
   o mesmo defeito conceitual em dois pontos de chamada: um escritor substitui conteúdo do usuário
   sem consultar seu estado. Maior risco operacional imediato: destroem trabalho já feito, durante
   o plantão, sem recuperação. É o item de maior risco operacional
   imediato: destrói trabalho já feito, durante o plantão, sem recuperação. O mecanismo necessário
   O mecanismo necessário já existe no repositório (`hasFormContentBeyondTemplate`) e basta ser
   consultado nesses caminhos. Não dependem de decisão de domínio.
2. **UX-01** — decisão de redação pela Founder sobre a moldura da justificativa; em seguida,
   correção do mecanismo e protetor que reprove emissão de predicado clínico não derivado de
   entrada. Enquanto a decisão não vier, o defeito permanece ativo em documento de uso externo.
3. **UX-03 e UX-15 em conjunto** — reconciliação arquitetural entre a ocultação da camada temporal,
   a existência do Resumo do Plantão e os dois caminhos concorrentes de reavaliação. Ocupam o mesmo
   gate do roadmap (`:45`, `:53`). Issue #44 aberta.
4. **UX-10** — restituição de estado inicial, rótulo de orientação e indicação de posição.
   Sobrepõe-se parcialmente a UX-03 e deve ser tratado junto com ele.
5. **UX-02** — correção da duplicação QP/HDA e protetor correspondente.
6. **UX-05** — decisão da Founder sobre o texto do aviso.
7. **UX-12** — resolvido junto com UX-03; enquanto isso, a ação não deve aparentar sucesso.
8. **UX-14** — captura de falha em `saveDraft`, alinhando a borda ao invariante já declarado.
9. **UX-13** — sinalizar o descarte no 31º rascunho, ou elevar/remover o limite.
10. **UX-06**, **UX-07** — dívida estrutural, sem urgência.
11. **UX-04** — depende de especificação de produto.

Nenhum destes itens está dentro do owner de Quality/Verification para correção autônoma. Todos
foram caracterizados com evidência executável ou saída literal, e estão prontos para handoff.

## 10. Rastreabilidade

- Verificação de composição do `INV-CLIN-003`: PR #43, `tests/context-composition-bridge.test.mjs`
- Alcance da superfície convergida: issue #44, `tests/converged-surface-reachability.test.mjs`
- Registro de checkpoint:
  `docs/audits/entries/2026-08-13T054500Z-quality-composition-bridge-and-founder-verification.md`
- Correção de rota sobre a rodada anterior do `INV-CLIN-003`: issue #39

## 11. Declaração de limites

Esta auditoria não constitui homologação clínica. Cobertura de invariante estabelece que
propriedades declaradas do código possuem protetor que reprova quando violadas; não estabelece
adequação clínica, alcance pelo usuário nem comportamento em uso real. O achado UX-03 é a
demonstração concreta dessa distinção dentro deste próprio repositório.

O gate de homologação permanece aberto e pertence à Founder.

## 12. Reconciliação com `ROADMAP.md` e `README.md`

Leitura obrigatória executada após a segunda varredura. Três consequências.

### 12.1 Correção de uma recomendação deste próprio relatório

A disposição inicialmente proposta para UX-09 e UX-11 — acrescentar guarda no padrão dos
`confirm()` já existentes — **contraria o roadmap**:

- `ROADMAP.md:50` — *"UX operacional / keyboard-first | **Lacuna real** | atalhos, **remoção de
  `confirm()` nativo** e eliminação de caminhos/seletores concorrentes"*;
- `README.md:37` — *"a interface deve ser previsível, keyboard-first e **parcimoniosa em cliques,
  confirmações** e mudanças de tela"*.

Acrescentar diálogo nativo resolveria a perda de dado às custas de uma fricção que o roadmap
classifica como lacuna P1. **A disposição correta é desfazer, não confirmar** — o padrão que o
organizador de laboratório já implementa em `src/product-convergence.js:420-445` ("Restaurar texto
colado"), listado no roadmap entre o patrimônio preservado.

Recomendação revista para UX-09 e UX-11: preservar a versão anterior e oferecer restauração
não bloqueante, sem modal. A distinção conteúdo real versus conteúdo gerado
(`hasFormContentBeyondTemplate`) continua sendo o mecanismo que decide **quando** oferecer.

Registrado como correção porque a recomendação errada já havia sido publicada nas issues #47 e #49.

### 12.2 Achados mapeados aos gates já declarados no roadmap

Nenhum achado desta auditoria exige gate novo. Todos caem em gates existentes, o que indica que o
roadmap está correto e que o que falta é evidência, não planejamento.

| Gate do `ROADMAP.md` | Achados que o ocupam |
| --- | --- |
| Invariant coverage — `INV-CLIN-003` parcial até teste da composição real (`:44`) | endereçado pela PR #43 |
| Workflow temporal — reavaliação preserva admissão, sem caminhos concorrentes (`:45`) | **UX-15**, UX-12, UX-03 |
| Progressive disclosure — validar que reduz carga cognitiva (`:46`) | UX-10 |
| Ferramentas clínicas — contexto real (`:47`) | UX-03 |
| Persistência/histórico — sem perda/reinterpretação (`:49`) | UX-13, UX-14, UX-09, UX-11 |
| UX operacional / keyboard-first (`:50`) | UX-04, UX-07, UX-10 |
| Testes de interação real (`:52`) | seção 12 deste relatório |
| Housekeeping/Convergence — sem perda de microfunções (`:53`) | UX-03, UX-12, UX-15 |

Alimentam também o item 2 do Gate da PR #30 (`ROADMAP.md:149`): *"achados do Quality/Verification
estiverem reconciliados contra a PR #30"*.

### 12.3 Divergências entre `README.md` e o comportamento verificado

O README descreve capacidades atuais que não são alcançáveis na superfície convergida. Registradas
para o owner de documentação canônica (Platform/Core); **não corrigidas por este setor**.

| `README.md` | Afirmação | Estado verificado |
| --- | --- | --- |
| `:48` | "reavaliação vinculada ao mesmo Atendimento e sem sobrescrever a admissão" | UX-15 — a reavaliação alcançável não vincula nem preserva admissão |
| `:51` | "contexto temporal declarativo, com progressive disclosure por cenário + etapa + estado" | UX-03 — inalcançável |
| `:52` | "pendências e resultados seriados no workflow de referência" | UX-03 — inalcançável |
| `:56` | "justificativas piloto derivadas de dados já confirmados" | UX-01 — a moldura afirma urgência não derivada de dado algum |
| `:74` | contrato documental com `# HDA (ADMISSÃO):` e `# SCORES:` | UX-15 — implementado apenas no renderizador inalcançável |
| `:78` | "A superfície canônica apresenta **Contexto clínico**" | UX-03 — o seletor de contexto está oculto; não há superfície de contexto clínico |
| `:41` | "sem apagar as implementações anteriores antes de comprovar equivalência de UX" | UX-03 — a ocultação removeu alcance sem equivalência demonstrada |

O item `:53` — HEART com `disponível ≠ aplicável ≠ calculável ≠ aplicado` — **não foi verificado**
quanto a alcance e não é afirmado aqui em nenhum sentido. Os scores independentes de protocolo
(CRB-65, CURB-65, qSOFA, Glasgow) permanecem alcançáveis pelo painel Ferramentas.

## 13. Falha de método na primeira rodada

Os achados UX-09 e UX-10 foram incorporados após observação direta da Founder em uso real. **A
primeira rodada desta auditoria não os detectou**, e o motivo é estrutural, não acidental.

O método aplicado — leitura de código somada à execução de motores puros com entradas
representativas — é adequado para verificar o que o sistema **produz**. É cego para o que o
sistema **permite que o usuário perca** e para o que o sistema **deixa de comunicar**. Nenhuma
quantidade de execução de `renderEvolution` revelaria que o botão que a invoca destrói o texto
editado, porque a função faz exatamente o que deve fazer; o defeito está em quem a chama e sob
que condição.

Consequência para o processo, e não apenas para este relatório:

- a declaração de limites da seção 3 estava correta e mesmo assim foi insuficiente, porque
  descrevia o que não fora testado sem afirmar que **classes inteiras de defeito** ficavam fora do
  alcance;
- auditoria sem harness de interação não deve ser apresentada como cobertura da superfície de uso.
  Este relatório passa a declarar que cobre a **produção documental** da superfície, não a sua
  **operação**;
- observação da Founder em uso real não é complemento à auditoria técnica neste domínio: é a única
  fonte disponível para uma classe de defeito que o ferramental atual não alcança. O contrato de
  interface entre setores já previa isso; a primeira rodada não o honrou na prática.

Registrado aqui, e não apenas corrigido em silêncio, porque o erro é de método e reaparece na
próxima auditoria se não ficar escrito.
