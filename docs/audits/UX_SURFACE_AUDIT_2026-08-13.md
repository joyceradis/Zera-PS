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

Essa dobra é a origem causal direta de quatro dos oito achados desta auditoria.

## 5. Escala de severidade

| Nível | Definição |
| --- | --- |
| **S1** | Produz afirmação clínica não confirmada em documento assinado ou de uso externo |
| **S2** | Funcionalidade especificada indisponível ou incorreta no fluxo real de uso |
| **S3** | Degradação de qualidade documental ou de fluxo, sem fabricação de conteúdo |
| **S4** | Dívida estrutural sem efeito observável pelo usuário |

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

A ausência de protetor para UX-01 e UX-02 é o achado metodológico mais relevante desta seção: são
os dois defeitos de maior impacto documental e nenhum teste da suíte os detectaria se fossem
introduzidos hoje.

## 9. Disposição proposta

Ordenada por severidade, não por esforço.

1. **UX-01** — decisão de redação pela Founder sobre a moldura da justificativa; em seguida,
   correção do mecanismo e protetor que reprove emissão de predicado clínico não derivado de
   entrada. Enquanto a decisão não vier, o defeito permanece ativo em documento de uso externo.
2. **UX-03** — reconciliação arquitetural entre a ocultação da camada temporal e a existência do
   Resumo do Plantão. Issue #44 aberta.
3. **UX-02** — correção da duplicação QP/HDA e protetor correspondente.
4. **UX-05** — decisão da Founder sobre o texto do aviso.
5. **UX-06**, **UX-07** — dívida estrutural, sem urgência.
6. **UX-04** — depende de especificação de produto.

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
