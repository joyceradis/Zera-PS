# Fronteira entre pacientes, verificação dos achados anteriores e prontidão para API

```text
OBJETIVO:          reauditar o Zera PS após 51 commits, verificar por execução o destino dos
                   15 achados anteriores e avaliar prontidão para o passo de API
AGENTE/SETOR:      Quality / Verification Engineering (Claude)
BASE:              chore/housekeeping-product-convergence @ 652de53
BRANCH:            audit/v2-full-review
SUÍTE:             pré 300/300 · pós 311/311
COBERTURA:         9 integral / 1 parcial → 10 integral / 0 parcial (proposto)
SEVERIDADE MÁXIMA: S1 — contaminação entre pacientes, encontrada e corrigida
MERGE:             não realizado
```

---

## 1. Delta desde a última auditoria

51 commits na linha canônica. Platform/Core endereçou a maior parte dos achados registrados.
**Nada foi aceito por mensagem de commit** — cada item abaixo foi reverificado por execução do
motor real ou por leitura da cadeia de chamada.

| Achado | Estado verificado | Evidência |
| --- | --- | --- |
| UX-01 — justificativa fabricava urgência | **FECHADO** | saída literal com campos vazios não contém mais `EM CARÁTER DE URGÊNCIA` nem `COMPLICAÇÕES POTENCIALMENTE GRAVES` |
| UX-02 — QP e HDA idênticos | **FECHADO** | `assets/document-engine.js:48` suprime `# QP:` quando idêntico à HDA |
| UX-03 — camada temporal inalcançável | **FECHADO** | `handleClinicalActivity` ligado a `input` do `#evolution-form` (`src/temporal-ui.js:500`) cria o encounter a partir de atividade clínica |
| UX-09 — sobrescrita destrutiva | **FECHADO** com ressalva | `synchronizeGeneratedText` + confirmação; ver §4.1 |
| UX-11 — rascunho dessincronizado | **FECHADO** | evento `DOCUMENTATION_RESTORED` + `restoreVisibleIntake` |
| UX-12 — reavaliação silenciosamente parcial | **FECHADO** | decorre de UX-03 |
| UX-13 — 30 rascunhos truncados | **FECHADO** | `slice(0, 30)` removido |
| UX-14 — `saveDraft` engolia falha | **FECHADO** | `readDrafts`/`persistDrafts` com retorno observável |
| UX-15 — dois listeners na reavaliação | **FECHADO** | único owner em `src/temporal-ui.js:504` |
| README divergente | **FECHADO** | `a1d495f` |
| UX-04 — keyboard-first | **ABERTO** | nenhum `accesskey`/`keydown` na superfície |
| UX-05 — texto do aviso legal substituído | **ABERTO** | decisão da Founder |
| UX-06 — proveniência contornada na justificativa | **ABERTO** | `observedFieldFromInput` inalterado |
| UX-07 — seletor legado de justificativa no DOM | **ABERTO** | S4 |
| UX-10 — desorientação | **PARCIAL** | `atendimento-state` acrescentado; etapa e teclado seguem ausentes |

Dez de quinze fechados.

---

## 2. Achado novo — S1: contaminação entre pacientes na justificativa

`652de53` corrigiu um vazamento real: reavaliação, internação, alta e scores do paciente anterior
permaneciam após limpar o Atendimento. A correção é boa. **Ficou um campo de fora.**

### Evidência por execução

```text
Após limpar o Atendimento, campos que ainda carregam o paciente anterior:
  VAZOU → justification-output = PACIENTE-ANTERIOR:justification-output
```

`#justification-output` vive dentro de `<dialog>`, fora do `#evolution-form`, logo `form.reset()`
nunca o alcança; e não constava de `CONTINUATION_TEXT_IDS`. Consequência: a justificativa clínica
do paciente anterior — documento destinado a operadora de saúde — reaparecia ao abrir o diálogo
no paciente seguinte.

### Causa de fundo: o protetor era auto-referente

```js
for (const id of mod.CONTINUATION_TEXT_IDS) assert.equal(nodes[id].value, '');
```

O teste iterava a própria lista do módulo. Campo removido da lista mantinha o teste verde sobre um
universo menor; campo **nunca adicionado** jamais era coberto. É o mesmo defeito de desenho já
registrado duas vezes neste projeto — no gate original de `INV-GOV-001` e na primeira versão da
minha própria guarda de exaustão.

### Correção

`tests/patient-boundary.test.mjs` deriva a exigência do **próprio `app.html`**: todo elemento que
carrega valor e vive fora do formulário precisa estar em `CONTINUATION_TEXT_IDS` ou declarado em
`ACCOUNTED_ELSEWHERE` com razão verificada contra o código-fonte. Campo novo entra na exigência
sozinho. Piso ancorado impede encolhimento silencioso.

| Mutação | Resultado |
| --- | --- |
| remover `justification-output` da lista | detectada |
| acrescentar campo novo fora do formulário sem contabilizar | detectada |
| `clearForm` deixa de limpar o documento final | detectada **após correção da própria guarda** |

A terceira mutação expôs fraqueza no meu teste: a asserção varria o arquivo inteiro e casava com
`resetDocumentationSurface`, que contém a mesma expressão como subcadeia. Corrigida com asserção
**escopada ao corpo de `clearForm`**. Registro porque a guarda passou a detectar só depois disso.

### Cruzamento de owner declarado

A correção é **uma linha** em `src/product-coherence.js` — acrescentar o id à lista congelada.
`src/` é owner de Platform/Core. Cruzei a fronteira deliberadamente: é contaminação entre
pacientes em produto em vias de comercialização, a mudança não toca arquitetura, estado nem
semântica clínica, e está demonstrada por teste com mutação. Platform/Core pode realocar a
correção sem prejuízo — a guarda continua valendo onde quer que o campo seja limpo.

---

## 3. `INV-CLIN-003` — última cobertura parcial fechada

O `gap` declarado exigia literalmente um protetor que atravessasse
`contexto/disclosure → coordenador real → estado/formulário → documento final`.

`tests/context-composition-bridge.test.mjs` — construído em resposta à revisão bloqueante de
`7a947f4` e nunca integrado — foi reexecutado sobre a canônica atual, **51 commits depois**, e
passa sem alteração. A propriedade se manteve durante toda a refatoração da convergência.

Cobertura proposta: **10 integral / 0 parcial**. Vale somente após handshake.

---

## 4. Observações consequentes desta rodada

### 4.1 A guarda de sobrescrita usa `confirm()` nativo

`generateEvolution` passou a confirmar antes de substituir edição manual. A condição é correta —
só pergunta quando há edição real, comparada com `lastGeneratedEvolution`. A segurança está
resolvida.

O mecanismo, porém, é o que `ROADMAP.md:50` lista como lacuna P1 a remover (*"remoção de
`confirm()` nativo"*) e `README.md:37` pede evitar. A disposição alternativa registrada na
auditoria anterior — preservar a versão e oferecer restauração não bloqueante, no padrão
"Restaurar texto colado" — continua disponível e não foi aplicada.

Não é regressão. É dívida de fricção assumida em troca de segurança, e deve ser visível como tal.

### 4.2 O documento perdeu a seção `# QP:` no percurso nominal

A deduplicação de UX-02 preserva a HDA e suprime a QP quando são idênticas. No intake de texto
livre sem ponto de atenção selecionado — o percurso mais comum — as duas **são** idênticas, logo o
documento sai sem `# QP:`.

A regra está comentada no código e é deliberada. O que se registra é a consequência: a evolução
gerada no caminho nominal não tem seção de queixa principal. Se isso é aceitável em documento de
pronto-socorro é decisão de domínio, não técnica.

### 4.3 `innerHTML` sem escape alimentado por estado restaurado

`src/temporal-ui.js:229-231` interpola `item.label` sem escape. Hoje esses rótulos são constantes
declarativas de protocolo, e o encounter é restaurado de `localStorage`, de origem local. **Não é
vetor hoje.** Entra na §5 porque deixa de ser inofensivo assim que um servidor alimentar esse dado.

---

## 5. Prontidão para o passo de API

Avaliação do setor de verificação. Não é decisão de produto nem parecer jurídico.

### 5.1 Ponto de partida favorável

Varredura por `fetch`, `XMLHttpRequest`, `WebSocket` e clientes HTTP em `src/`, `assets/`,
`app.js` e `service-worker.js`: **nenhuma chamada de rede da aplicação**. Todo dado clínico
permanece no dispositivo, como o `README.md:185` declara. A superfície de ataque atual é mínima, e
isso é uma vantagem real de ponto de partida — não há dívida de segurança de rede a desfazer.

### 5.2 O que muda, e o que a cobertura atual **não** cobre

| Dimensão | Estado hoje | Efeito de introduzir API |
| --- | --- | --- |
| Invariantes clínicos | 10/10 verificados **no cliente** | Nenhuma dessas provas atravessa para um servidor. Toda garantia teria de ser reestabelecida do outro lado |
| Identidade / autenticação | inexistente | pré-requisito; nada no repositório para reaproveitar |
| Autorização entre pacientes | fronteira de **sessão local**, testada nesta rodada | vira fronteira **entre usuários**; o bug da §2 seria vazamento entre contas, não entre atendimentos |
| Trilha de acesso | inexistente | registro clínico acessado remotamente exige quem-leu-o-quê |
| Dado não confiável | `parseStoredJson` trata corrupção local | passa a tratar entrada remota; a §4.3 vira XSS real |
| Privacidade / LGPD | dado nunca sai do dispositivo | dado pessoal sensível em trânsito e em repouso; base legal, contrato e retenção passam a existir |

O ponto central para este setor: **cobertura de invariante no cliente não transfere para o
servidor.** A afirmação "10 integral / 0 parcial" descreve o motor que roda no navegador. Um
backend duplica cada superfície onde fabricação, proveniência e allow-list precisam valer, e
nenhuma linha de evidência atual se aplica lá.

### 5.3 Posição relativa ao roadmap

`ROADMAP.md` ordena `Piloto → Produção/assinatura`, e o Gate da PR #30 tem dez itens dos quais
seguem abertos: homologação clínica da Founder, interação desktop/mobile validada, PWA/offline com
evidência real, fricções P1 tratadas ou deferidas com justificativa. A PR #30 permanece sem merge.

Comercializar com API antecipa duas casas na ordem declarada. Isso é decisão da Founder; o que
este setor registra é que a antecipação não está acompanhada de evidência equivalente.

### 5.4 A pergunta que decide o escopo

"API" cobre três produtos muito diferentes, com custos de verificação incomparáveis:

```text
(a) licença / ativação          → sem dado de paciente; superfície pequena; viável cedo
(b) sincronização / backup      → dado sensível em trânsito e repouso; LGPD integral
(c) integração com HIS/prontuário → maior superfície; interoperabilidade e contrato hospitalar
```

Este relatório não presume qual. A escolha altera materialmente o que precisa ser construído e
verificado, e pertence à Founder.

---

## 6. Fronteira e limites

Owner tocado: `tests/` integralmente, mais **uma linha** em `src/product-coherence.js`, declarada
na §2. Nenhum arquivo de `assets/`, `protocols/` ou `app.html` modificado.

Esta auditoria continua **sem harness de interação**: não cobre DOM real, foco, ordem de tabulação,
PWA/offline real nem tempo até registro copiável. A limitação está registrada desde a rodada
anterior e permanece o maior buraco de evidência do projeto — agora com peso maior, porque
comercialização transforma ausência de evidência em risco contratual.
