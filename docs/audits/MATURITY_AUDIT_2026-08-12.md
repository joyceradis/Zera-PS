# Auditoria independente de maturidade — 2026-08-12

Auditoria de segunda leitura sobre a maturidade do Zera PS como PWA de uso real em plantão. Publicada no repositório a pedido da Founder, para leitura direta pelos demais agentes, sem retransmissão manual.

## Baseline efetivamente auditado

| Item | Valor |
| --- | --- |
| Branch auditada | `main` |
| SHA auditado | `276daf7e5568c750b8f09a8d8c7d68057afd9497` |
| Data da coleta | 2026-08-12 |
| Suíte no SHA auditado | 160 testes, 160 aprovados |
| Agente | Auditor independente (Claude) |
| Método | leitura integral + **execução** do código em Node; medição direta de bundle; comparação de branches por ancestralidade |

**Reconciliação contra a linha canônica.** Após a coleta, os achados foram reverificados contra `chore/housekeeping-product-convergence` @ `3577383` (PR #30), que **não** era a base auditada. A seção [Reconciliação com a PR #30](#reconciliação-com-a-pr-30) registra o que já está resolvido lá. Sem essa reverificação, este relatório descreveria um estado que a linha canônica já superou em parte.

### Critério de avaliação declarado pela Founder

> Médicos plantonistas operando sob produtividade, em máquinas que não aceitam sites com IAs pesadas.

Este critério orientou a priorização dos eixos. A Founder atua aqui como usuária técnica de teste, não como destinatária de relatório de conformidade.

## Como ler este documento

Cada achado é rotulado. A distinção é deliberada e não deve ser colapsada em leituras posteriores:

- **FATO** — verificado por execução ou medição direta neste SHA. Reproduzível pelo comando indicado.
- **INTERPRETAÇÃO** — leitura de risco/maturidade feita pelo auditor a partir dos fatos. Contestável.
- **PROPOSTA** — sugestão de ação. Não implementada por este documento; algumas dependem de decisão de domínio.

Nenhuma PROPOSTA deste documento foi executada como parte da sua publicação.

## Quadro de maturidade

| Eixo | Classificação | Base |
| --- | --- | --- |
| Peso e independência de IA/rede | Maduro | FATO 1, FATO 2 |
| Funcionamento offline (PWA) | Em desenvolvimento | FATO 3 |
| Segurança clínica — desenho | Maduro | FATO 8 |
| Segurança clínica — garantia efetiva | Lacuna real | FATO 9 |
| Fricção operacional / keyboard-first | Lacuna real | FATO 10, 11, 12, 13 |
| Cobertura de teste automatizada | Em desenvolvimento | FATO 14 |
| Compatibilidade de navegador | Em desenvolvimento | FATO 5, FATO 6 |
| Processo de revisão e governança | Lacuna real | FATO 15, FATO 16 |

Critério usado: `Maduro` = verificado por execução/medição, sustenta uso real. `Em desenvolvimento` = implementação existe, com lacuna concreta nomeada. `Lacuna real` = risco presente no SHA auditado.

---

## Eixo 1 — Peso e independência de IA

### FATO 1 — Nenhuma dependência de runtime e nenhuma chamada de rede externa

`package.json` no SHA auditado não declara `dependencies` nem `devDependencies`. A varredura por `fetch(`, `XMLHttpRequest`, SDK de IA e domínios externos em `assets/`, `src/`, `protocols/`, `app.html` e `index.html` não retornou nenhuma chamada a serviço externo. O único domínio contatado é a própria origem, pelo service worker.

```bash
grep -rn "fetch(\|XMLHttpRequest\|openai\|anthropic\|generativeai" assets/*.js src/*.js app.html index.html
grep -n "<script\|<link" app.html index.html
```

### FATO 2 — Transferência total de ~53 KB comprimido

| Categoria | Descomprimido |
| --- | --- |
| JavaScript (`assets/` + `src/` + `protocols/`) | ~144 KB |
| CSS | ~15 KB |
| HTML | ~23 KB |
| **Total gzip** | **~53 KB** |

```bash
for f in $(git ls-files '*.js' '*.css' '*.html' ':!:tests'); do gzip -c "$f"; done | wc -c
```

### INTERPRETAÇÃO 1 — Este eixo é o mais maduro do projeto, e a garantia é estrutural

A ausência de IA em runtime não é uma promessa de arquitetura sujeita a erosão: não existe nenhuma linha de código capaz de contatar um serviço de IA nesta versão. Para o critério declarado pela Founder — máquina de hospital que bloqueia sites com IA pesada — a resposta é afirmativa e verificável, não confiada.

### FATO 3 — O fallback de navegação offline não estava restrito à mesma origem

No SHA auditado, o handler de `navigate` cai para `./app.html` sem verificar `sameOrigin` primeiro. Cache de app shell com 34 entradas, versionamento ativo (`zera-ps-v8`) e limpeza de cache antigo no `activate` estavam corretos.

**Resolvido na PR #30** — ver reconciliação.

---

## Eixo 2 — Compatibilidade real da máquina de plantão

### FATO 5 — O código exige motor JS ES2020+ para carregar

Uso de `?.`, `??` e `Array.prototype.at` em módulos do app shell. Isso é requisito de *parse*, não degradação progressiva: num motor anterior a ~2020 (Chrome <91, Safari <15.4, Firefox <94) a página não carrega parcialmente — não carrega.

`structuredClone` tem fallback explícito para `JSON.parse(JSON.stringify(...))` em `src/workflow-engine.js` — esse ponto específico foi tratado.

### FATO 6 — `localStorage` é o único mecanismo de persistência

Nenhum uso de IndexedDB no SHA auditado.

### INTERPRETAÇÃO 2 — "Leve" e "compatível" não são a mesma propriedade, e só a primeira está demonstrada

O critério da Founder cita máquinas restritivas. Peso pequeno resolve rede lenta e proxy; não resolve navegador antigo nem política corporativa que bloqueia `localStorage` em sessão restrita. `localStorage` tem teto típico de 5–10 MB por origem e pode ser desabilitado em modos de navegação restritos — exatamente o perfil de máquina descrito. Hoje não há plano B: falha de storage e ausência de dado não são distinguíveis pela interface.

Este ponto conecta diretamente ao `INV-STOR-001` do registry ("Falha de persistência ≠ ausência de dado"), que é um invariante declarado mas cuja proteção efetiva não foi verificada por este auditor no SHA auditado.

### PROPOSTA 1 — Determinar o navegador real das máquinas-alvo antes de tratar "leve" como "compatível"

Decisão de domínio/ambiente, não técnica: qual navegador e qual versão rodam nas máquinas do plantão real. Sem esse dado, a compatibilidade permanece suposição.

---

## Eixo 3 — Segurança clínica: desenho versus garantia

### FATO 8 — O modelo de estado clínico é explícito e reaproveitado com consistência

Cada campo carrega valor, estado (`not_informed` / `denied` / `present` / `template_confirmed`...), fonte e timestamp. `canRenderClinicalField()` é portão único de entrada no documento, reaproveitado entre evolução, reavaliação e justificativa de exame.

### FATO 9 — A proteção automatizada de um invariante crítico foi removida junto com a regressão que ela impedia

Registrado como `AUD-2026-08-13-001`. O teste `syndrome templates do not preconfirm clinical negatives` (commit `19e7478`) foi apagado no commit `5233ad7`, que simultaneamente introduziu negativas clínicas pré-escritas em cinco roteiros. A suíte permaneceu verde durante todo o período.

Evidência reproduzível no SHA anterior à correção:

```
# HDA: PACIENTE COMPARECE AO PS COM QUEIXA DE CEFALEIA HÁ 2 DIAS...
NEGA INÍCIO SÚBITO, TRAUMA, FEBRE, RIGIDEZ DE NUCA, ALTERAÇÃO DO NÍVEL
DE CONSCIÊNCIA OU DÉFICIT NEUROLÓGICO FOCAL.
```

Corrigido por hotfix `b098235` (templates estáticos) e PR #34 (`defaultDiarrheaHdaState`, que o hotfix não alcançou).

### INTERPRETAÇÃO 3 — Este é o achado de maturidade mais importante do relatório, acima do bug em si

Suíte verde significa "os testes presentes passaram", não "os invariantes se mantêm". As duas proposições foram tratadas como equivalentes durante três dias, atravessando publicações e um hotfix parcial.

O risco estrutural não é o bug corrigido: é que a mesma classe de falha — apagar a trava junto com a regressão — permanece possível para qualquer outro invariante do registry enquanto a detecção depender exclusivamente de CI.

Esta interpretação foi incorporada à governança como `INV-GOV-001`. Este documento registra que a incorporação ocorreu **depois** do incidente, não antes; a eficácia da nova regra ainda não foi testada por um segundo incidente real.

---

## Eixo 4 — Fricção operacional

### FATO 10 — Nenhum atalho de teclado em todo o código

Zero ocorrências de `keydown`, `keyup` ou `keypress` em `assets/`, `src/` e `app.html`. README, `PRODUCT_SCOPE.md` e `ROADMAP.md` declaram "keyboard-first" como requisito.

### FATO 11 — Sete diálogos nativos do navegador em pontos de decisão

`confirm()` / `window.confirm()` em 7 pontos: troca de roteiro com dado digitado, troca de workflow (×2), limpar formulário, apagar rascunhos, substituir justificativa de internação.

### FATO 12 — Dois seletores de contexto concorrentes na mesma tela

"Roteiros de documentação" (cards) e "Workflow contextual" (dropdown "Cenário do atendimento") coexistem, respondendo a pergunta clínica equivalente com vocabulário e comportamento distintos.

### FATO 13 — Reavaliação com dois caminhos de resultado diferente

A navegação lateral expõe `Reavaliação` como destino independente (formulário isolado, sem HDA/QP/scores da admissão). O botão `Reavaliar atendimento`, disponível apenas dentro de um workflow ativo, entrega o fluxo temporal completo com preservação da admissão.

### INTERPRETAÇÃO 4 — O caminho mais visível é o que menos cumpre a finalidade declarada do produto

Para 4–5 atendimentos por hora, a combinação de FATO 10 a 13 significa navegação por mouse, interrupções modais sem contexto visual e uma rota de reavaliação padrão que obriga a reconstruir a narrativa — o oposto explícito de "o médico deve ser poupado de redigitar a mesma informação".

Classificação como fricção **técnica** ou **clínica**: a remoção de `confirm()` nativo e a adição de atalhos são técnicas. A unificação dos dois seletores (FATO 12) e da reavaliação (FATO 13) altera fluxo cognitivo do PS e **pertence à decisão de domínio da Founder**, não ao auditor.

---

## Eixo 5 — Cobertura de teste

### FATO 14 — 160 testes de lógica pura; nenhum de interação real

23 arquivos de teste no SHA auditado, todos executando sem navegador. Cobrem com rigor os motores puros: composição de HDA, validação de protocolo, coordenação de contexto, engine de justificativa e de documento.

Nenhum teste automatizado exercita clipboard, autosave real, navegação entre telas, instalação de PWA ou comportamento offline de fato. `TESTING.md` classifica todos esses como "regressão manual".

### INTERPRETAÇÃO 5 — A regressão manual é um gate declarado sem evidência de execução recente

Não localizei, nesta auditoria nem nas anteriores registradas em `docs/audits/`, registro de execução da regressão manual em navegador ou PWA instalado. Um gate declarado e não executado tem o efeito prático de gate ausente, com o custo adicional de aparentar cobertura.

---

## Eixo 6 — Processo e governança

### FATO 15 — O revisor automatizado externo está indisponível por falha de infraestrutura

Solicitações de revisão do GitHub Copilot em PRs desta sessão falharam antes de analisar código:

```
SessionModelError: Execution failed: CAPIError: 400 The requested model is not supported.
##[error]Process completed with exit code 1.
```

Erro do lado do GitHub, não do repositório. `verify` e CodeQL passaram normalmente nos mesmos PRs.

### FATO 16 — Duas frentes corrigiram o mesmo P0 em paralelo, sem estado compartilhado

Registrado como `AUD-2026-08-13-002`. Resultado: conflito de merge, retrabalho e uma janela em que o hotfix cobria apenas os templates estáticos, deixando `defaultDiarrheaHdaState` fabricando negativas por mais um ciclo.

### INTERPRETAÇÃO 6 — A infraestrutura de coordenação criada responde ao incidente, mas ainda não foi validada por uso

`ACTIVE_WORK.md`, `SHARED_AUDIT_LOG.md`, `INVARIANT_REGISTRY.md` e `AGENT_COORDINATION.md` endereçam diretamente o FATO 16. A publicação deste relatório é o primeiro uso real do fluxo por um segundo agente.

Duas observações estruturais registradas para leitura de Lead Engineering, não como bloqueio:

1. `ACTIVE_WORK.md` vive na linha canônica. Um agente operando em hotfix sobre `main` não encontra a tabela de leases na branch em que está trabalhando — precisa lembrar de consultá-la em outra ref. O incidente do FATO 16 ocorreu exatamente nesse cenário.
2. Dois agentes registrando leases simultaneamente colidem no próprio arquivo destinado a prevenir colisão. Leases estritamente aditivos (linha nova, nunca edição de linha alheia) reduzem, mas não eliminam, essa superfície.

### PROPOSTA 2 — Regra de revisão verificável por leitura, sem ferramenta nova

Nenhum PR reduz, renomeia ou remove teste que protege invariante numerado em `INVARIANT_REGISTRY.md` sem declarar isso explicitamente na descrição e sem segunda leitura. É checável em segundos por um humano ou por outro agente, e não depende do revisor automatizado que hoje está fora do ar (FATO 15).

---

## Reconciliação com a PR #30

Reverificação executada em `chore/housekeeping-product-convergence` @ `3577383`, posterior ao SHA auditado.

| Achado | Estado na PR #30 | Evidência |
| --- | --- | --- |
| FATO 3 — fallback offline sem restrição de origem | **Resolvido** | `if (!sameOrigin) return;` presente no handler de `navigate` |
| FATO 9 — P0 das negativas clínicas | **Resolvido e reconciliado** | Execução do compositor e dos 5 templates não produz negativa fabricada |
| Proteção do invariante `INV-CLIN-001` | **Superior à `main`** | `tests/clinical-safety-invariants.test.mjs` cobre templates *e* HDA de texto livre com flags condicionais |
| Normalizador laboratorial (patrimônio dado como perdido) | **Presente** | `src/lab-parser.js` |
| FATO 10 — atalhos de teclado | Permanece aberto | 0 ocorrências |
| FATO 11 — `confirm()` nativos | Permanece aberto | 7 ocorrências |
| FATO 12 — dois seletores concorrentes | Permanece aberto | ambos presentes em `app.html` |
| FATO 13 — reavaliação com dois caminhos | Permanece aberto | `data-view="reavaliacao"` ainda na navegação primária |
| Suíte | 231 testes, 231 aprovados | `npm run verify` |

**FATO 17** — a declaração `RECONCILED` de `AUD-2026-08-13-001` no `SHARED_AUDIT_LOG.md` foi **verificada por execução** por este auditor e está correta.

**FATO 18** — a PR #30 alterou o contrato de saída de `# EXAMES COMPLEMENTARES:` em relação à `main`: os sub-rótulos `LABORATORIAIS:` / `IMAGEM:` foram substituídos por lista contínua de itens. Divergência de comportamento documental entre as duas linhas, não regressão de invariante.

### INTERPRETAÇÃO 7 — A dívida de reconciliação cresce enquanto a PR #30 permanece bloqueada

O bloqueio da PR #30 até homologação clínica manual é legítimo e correto: o que está sendo homologado é superfície assistencial. O custo é que cada hotfix na `main` amplia a divergência entre as duas linhas — FATO 18 já é um exemplo de comportamento documental que difere sem que nenhuma das versões esteja errada.

Isso não é argumento para acelerar a homologação. É argumento para que a homologação seja tratada como caminho crítico do projeto, e para que hotfixes na `main` permaneçam tão raros quanto o protocolo já exige.

---

## O que o projeto declara sobre si mesmo

### FATO 19 — A autodescrição do projeto é precisa, e foi corrigida quando deixou de ser

`README.md` declara textualmente: *"O Zera PS permanece MVP em validação. CI verde não equivale a homologação assistencial."* O `ROADMAP.md` foi reclassificado após esta auditoria, separando "Segurança clínica — desenho" (forte) de "Segurança clínica — garantia efetiva" (em desenvolvimento), e movendo a fase antes marcada "Fundação de segurança: Concluída".

### INTERPRETAÇÃO 8 — A etiqueta "Concluída" precisa de reverificação periódica, não de confiança permanente

O P0 encontrado nesta auditoria vivia dentro de uma fase marcada como concluída. Nenhuma classificação de maturidade sobrevive automaticamente às mudanças posteriores ao momento em que foi atribuída.

---

## Limitações desta auditoria

1. Feita por leitura e execução em Node — **sem navegador real, sem PWA instalada, sem teste em rede hospitalar**. Todos os achados de fricção (FATO 10–13) são estruturais, não medidos em uso.
2. Não avalia mérito clínico do conteúdo dos roteiros, das negativas propostas ou do vocabulário documental. Onde este relatório menciona conteúdo clínico, a afirmação é sobre **procedência do dado** (confirmado ou fabricado), nunca sobre correção clínica.
3. `INV-STOR-001` e `INV-METRIC-001` do registry não foram verificados por execução neste ciclo.
4. A validação cognitiva do fluxo em plantão real — gate final pela doutrina do próprio projeto — permanece com a Founder e não é substituível por auditoria de código.
5. Nenhuma PROPOSTA deste documento foi implementada. As correções do FATO 9 foram feitas em PRs próprias (#33, #34) antes desta publicação e estão registradas separadamente.

## Rastreabilidade

| Item | Referência |
| --- | --- |
| SHA auditado | `276daf7` (`main`) |
| SHA de reconciliação | `3577383` (`chore/housekeeping-product-convergence`, PR #30) |
| Correções derivadas | PR #33, PR #34, hotfix `b098235` |
| Entradas no log compartilhado | `AUD-2026-08-13-001`, `AUD-2026-08-13-002`, `AUD-2026-08-13-003` |
| Invariantes tocados | `INV-CLIN-001`, `INV-GOV-001` |
| Decisão de domínio pendente | FATO 12 e FATO 13 (unificação de seletores e de reavaliação) |
