# Ponte de composição do INV-CLIN-003 e verificação dos achados de homologação

```text
OBJETIVO:          fechar a lacuna apontada pela revisão de composição e verificar os 10 achados da Founder contra o código
AGENTE/SETOR:      Quality / Verification Engineering (Claude)
BRANCH:            audit/founder-homologation-verification
BASE:              chore/housekeeping-product-convergence @ da03213
ARQUIVOS/OWNERS:   tests/ (próprio) + lane do próprio setor
TESTES/EVIDÊNCIA:  267/267; 8 mutações comportamentais + 2 de enforcement + 2 de correção simulada
INVARIANTS:        INV-CLIN-003 PARTIAL → FULL (proposto, sujeito a handshake)
MERGE:             não realizado
IMPACTO CLÍNICO:   nenhuma linha de assets/, src/, protocols/ ou app.html alterada
```

## Parte 1 — a revisão bloqueante estava certa

`7a947f4` reverteu `INV-CLIN-003` para `PARTIAL` com este motivo:

> os vetores atuais calculam plan/visible/context e depois chamam `renderEvolution(emptyForm(), {})`
> sem transportar esse estado pela fronteira real de coordenação.

**Está correto, e a afirmação de cobertura integral que publiquei era superestimada.** Renderizar
um formulário vazio e concluir que contexto não vira diagnóstico prova quase nada: o formulário
nunca recebeu o que o contexto produziu. O erro não foi de execução, foi de escopo — confundi
"enumerei exaustivamente o espaço declarativo" com "provei a propriedade sobre a composição".
São coisas diferentes, e a segunda é a que o invariante afirma.

### O que foi construído

`tests/context-composition-bridge.test.mjs` — 7 vetores. O par `(form, clinicalState)` entregue
ao document engine é **produzido pelos escritores reais**: seleção de template passando pelo
coordenador (`decideTemplateReplacement`), intake livre com progressive disclosure
(`matchTriggerGroups` → `composeHdaFromQp`), composer estruturado de HDA
(`composeDiarrheaHda` + `synchronizeGeneratedHda`) e as funções de confirmação de proveniência
(`confirmObserved`/`confirmDenied`/`confirmTemplate`). Nada de regra clínica é reimplementado
no teste.

O primeiro vetor é uma **âncora anti-trivialidade**: reprova se o formulário composto voltar a
chegar vazio ao document engine. É a guarda que faltava — sem ela, todo o arquivo poderia
regredir para o mesmo defeito silenciosamente.

### Mutações verificadas antes de propor

| Mutação | Resultado |
| --- | --- |
| `composeHdaFromQp` devolve vazio | detectada — 2 vetores (âncora anti-trivialidade) |
| disclosure selecionado não chega na HDA | detectada |
| composer emite `NEGA` para achado `UNKNOWN` | detectada |
| documento emite `# CONDUTA:` incondicionalmente | detectada — 5 vetores |
| renderizador para de emitir hipóteses | detectada (contraprova) |
| template escreve direto em `conduta` via app.js | detectada (guarda estrutural) |
| renomear protetor mapeado | gate reprova |
| apagar o arquivo inteiro | gate reprova |

### Limite honesto desta ponte

Um template que **declare** `conduta` como campo próprio **não** é detectado por este arquivo
sozinho — a composição só copia `qp`/`hdaDraft`. Verifiquei por mutação: esse caso é pego por
dois protetores irmãos (`templates.test.mjs` e `context-never-diagnoses.test.mjs`). A cobertura
do invariante é do **conjunto** de protetores, não de um arquivo. Registro porque a diferença
importa para quem for reler o mapeamento.

Também não cobre: DOM real, evento real de interface, PWA/offline real. Esses gates continuam
abertos e não são reivindicados aqui.

### Guarda estrutural adicional

Além do comportamento, o arquivo prova algo mais durável sobre o código real: os nós
`hipoteses` e `conduta` são **somente lidos** em `assets/app.js`, `src/product-convergence.js`
e `src/temporal-ui.js`. O único escritor é a restauração de rascunho, que devolve o que a
própria médica digitou. Um caminho novo de escrita nesses campos passa a reprovar a suíte.

## Parte 2 — verificação dos 10 achados da Founder

`docs/coordination/active/founder.md` instrui: *"Não marcar como resolvido apenas porque consta
nesta lista."* Verificação item a item contra o código, não contra a lista.

| # | Achado | Estado verificado |
| --- | --- | --- |
| 1 | `[CHAVES]`/HDA rígida | **Implementado por ocultação.** `createZeroFrictionIntake` substitui QP/HDA por texto livre + chips condicionais. Os placeholders continuam existindo nos dados (`hdaDraft`, rascunho do composer), mas o grid de roteiros está oculto, então não são alcançáveis. |
| 2 | Tempo/fricção, keyboard-first | **Não implementado.** Nenhum `accesskey`, `keydown` ou atalho na superfície clínica. Fixado por teste. |
| 3 | Hidratação em cruzes | **Implementado.** `HIPOHIDRATADO` não existe mais; `assets/data.js` traz `HIDRATADO` + `DESIDRATADO +/4+` a `++++/4+`. |
| 4 | Diferencial leucocitário | **Implementado.** `DIFFERENTIAL_OUTPUT_RULES` usa exatamente as referências fornecidas (S 70, B 5, L 45, M 10, E 5, Bas 1) e só emite fração acima do limite. Coberto por 10 testes. |
| 5 | Conduta UPPERCASE + prefixo `- ` | **Implementado.** `renderListSection` normaliza e prefixa. |
| 6 | `Formatar Imagem` | **Implementado.** `formatImageReport` condensa quebras e sobe para UPPERCASE. |
| 7 | Justificativa sem dropdown | **Implementado.** `refactorHighCostJustification` substitui o seletor por campo livre; `assembleFreeExamJustification` gera texto corrido em UPPERCASE; diálogo tem botão Copiar. O seletor antigo continua no `app.html`, apenas oculto. |
| 8 | Resumo do plantão sem falso `ATENDIDOS: 0` | **NÃO resolvido.** Ver abaixo. |
| 9 | Poluição visual do aviso legal | **Implementado.** `compactLegalNotice` reduz e move para depois do grid. |
| 10 | Princípio transversal | Não é item de código. |

### Achado 8 — cadeia verificada, defeito real

Os testes unitários de produtividade passam porque alimentam `summarizeProductivity` com um
snapshot construído à mão. Nenhum teste verificava se **algum caminho do produto chega a
produzir esse snapshot**. Não chega:

```text
createEncounter() é chamado em um único ponto de produto: handleScenarioChange
→ que só dispara no change de #workflow-scenario
→ que é filho de .workflow-card
→ que hideLegacyContextSelectors() marca como hidden
→ e handleStartReassessment() retorna cedo sem encounter
⇒ zera-ps:encounter:v3 nunca é escrito
⇒ readProductivityRecords() devolve sempre []
⇒ Resumo do Plantão exibe ATENDIDOS: 0 com atendimento em curso
```

O motor puro está correto; o defeito é de **alcance**, não de cálculo. É o caso exato que a
governança nomeia: cobertura local promovida a garantia sistêmica sem evidência de composição.

**Consequência maior que o item 8:** a mesma ocultação tira do alcance da médica toda a camada
temporal/protocolo — etapas, ferramentas clínicas e progressive disclosure de protocolo. Isso
**limita o alcance prático do próprio INV-CLIN-003**: o espaço que meus vetores exercitam
exaustivamente não é hoje acessível pela interface convergida. A cobertura do invariante
continua correta como propriedade do código; ela não deve ser lida como propriedade de algo
que a médica consegue fazer hoje.

Fixado em `tests/converged-surface-reachability.test.mjs`, com pin que **reprova quando a
correção chegar** — verifiquei por duas correções simuladas (desocultar o cartão; passar a ler
o rascunho do Atendimento), ambas detectadas. Owner da correção: Platform/Core.

## O que este bloco não prova

Cobertura integral significa que cada invariante tem protetor que reprova quando a propriedade
é violada **no código**. Não significa homologação clínica, teste de interação real, PWA/offline
real, nem que a funcionalidade esteja alcançável pela médica — o achado 8 é a demonstração
concreta dessa diferença. O gate de homologação continua aberto e é da Founder.

A reclassificação `INV-CLIN-003 → FULL` é **proposta**, não aplicada por decisão própria: vale
somente após `INTEGRATION READY — <HEAD SHA>` do setor revisor, conforme o handshake que o
incidente da PR #41 originou.
