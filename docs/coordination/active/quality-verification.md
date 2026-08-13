# Quality / Verification Engineering — Active Work

## Setor
Claude / Quality & Verification Engineering.

## Responsabilidades
Auditoria independente, testes de regressão, invariant coverage, testes adversariais, investigação de bugs, arqueologia complementar, análise de PR, compatibilidade, revisão de segurança, detecção de teste removido/enfraquecido, testes de interação, observabilidade de CI e análise de maturidade.

## Estado atual

- **PR #37: INTEGRADA** por Platform/Core em `a5a5ade`. Gate de invariantes na linha canônica; branch removida. Lease encerrado.
- **PR #38: INTEGRADA** por Platform/Core em `3a23402`; branch removida. `INV-DOC-001` fechado na linha canônica.
- **PR #36:** auditoria de maturidade; PAUSADA em draft por instrução da Founder. Base `3577383`, desatualizada — rebase pendente quando a Founder liberar.
- **PR #33:** fechada por este setor. Apontava para `main` e ficou obsoleta: o mesmo P0 foi resolvido por outro caminho (hotfix `b098235` + PR #34). Verificado na `main` antes de fechar — 0 negativas fabricadas nos roteiros e `defaultDiarrheaHdaState` já corrigido. PR aberta sem trabalho pendente é ruído na memória compartilhada.
- **Gap `INV-DOC-001`: FECHADO.** A propriedade **se sustenta**, não há vazamento; os renderizadores operam por allow-list. Era cobertura ausente, não bug — nenhum handoff de core necessário. 6 vetores adversariais; 2 mutações do document engine confirmadas detectadas.
- **Lease:** nenhum `ACTIVE`. Owner liberado.

- **PR #41: integrada prematuramente e parcialmente revertida.** A revisão de composição (`7a947f4`) estava **certa**: os vetores calculavam `plan`/`visible`/`context` e depois renderizavam `emptyForm()`, sem atravessar a fronteira real. A afirmação de cobertura integral publicada por este setor era **superestimada** — erro de escopo, não de execução: enumerar exaustivamente o espaço declarativo não é provar a propriedade sobre a composição. Patrimônio de testes preservado; `INV-CLIN-003` voltou a `PARTIAL`.

- **Lease `audit/founder-homologation-verification` — ABERTO**, base `da03213`. Owner: `tests/` + esta lane. Nenhum arquivo de `assets/`, `src/`, `protocols/` ou `app.html` modificado. Duas frentes:
  1. **Ponte de composição** — `tests/context-composition-bridge.test.mjs`, 7 vetores. O par `(form, clinicalState)` entregue ao document engine é produzido pelos escritores reais, com âncora anti-trivialidade que reprova se o formulário voltar a chegar vazio. 6 mutações comportamentais + 2 de enforcement, todas detectadas. Reclassificação `INV-CLIN-003 → FULL` **proposta**, válida só após `INTEGRATION READY — <HEAD SHA>`.
  2. **Verificação dos 10 achados de homologação** da Founder contra o código, conforme a instrução de não marcar item como resolvido por constar na lista.
- Suíte **267/267**; cobertura declarada 10 integral / 0 parcial. Evidência completa em `docs/audits/entries/2026-08-13T054500Z-quality-composition-bridge-and-founder-verification.md`.

### Achados de homologação — resultado da verificação

Implementados e verificados: **3** (hidratação em cruzes), **4** (diferencial leucocitário, referências exatas), **5** (UPPERCASE + prefixo `- `), **6** (`Formatar Imagem`), **7** (justificativa por campo livre), **9** (aviso legal compacto). **1** implementado por ocultação do grid de roteiros — os placeholders seguem nos dados, sem alcance pela UI.

- **Achado 8 — NÃO resolvido, defeito de alcance confirmado.** `createEncounter()` só é chamado por `handleScenarioChange`, ligado a `#workflow-scenario`, que é filho de `.workflow-card`, que a camada de convergência oculta; e `handleStartReassessment()` retorna cedo sem encounter. Logo `zera-ps:encounter:v3` nunca é escrito e o Resumo do Plantão mostra `ATENDIDOS: 0` com atendimento em curso. O motor puro está correto — o defeito é de alcance, não de cálculo. **Consequência maior:** a mesma ocultação tira do alcance toda a camada temporal/protocolo, o que limita o alcance prático do próprio `INV-CLIN-003`. Fixado em `tests/converged-surface-reachability.test.mjs` com pin que reprova quando a correção chegar (2 correções simuladas, ambas detectadas). **Handoff → Platform/Core.**
- **Achado 2 — não implementado.** Nenhum `accesskey`/`keydown`/atalho na superfície clínica. Fixado por teste.

### Auditoria da superfície de uso — `docs/audits/UX_SURFACE_AUDIT_2026-08-13.md`

Quinze achados. Origem: instrução da Founder de verificar os 10 achados de homologação contra o código, ampliada após ela relatar perda de dado e desorientação em uso real — classe de defeito que a primeira rodada não alcançava.

- **S1:** #45 (justificativa afirma urgência não confirmada), #47 (Atualizar evolução destrói edição manual), #49 (abrir rascunho + digitar destrói QP/HDA restauradas).
- **S2:** #44 (camada temporal inalcançável), #48 (superfície sem estado inicial), UX-12 (reavaliação silenciosamente parcial), UX-15 (dois listeners no mesmo botão; contrato documental do README inalcançável).
- **S3/S4:** #46, UX-05, UX-06, UX-07, UX-13, UX-14, UX-04.

**Padrão sistêmico (seção 6.1):** motor correto e coberto por teste; ponto de chamada que liga o motor ao usuário, não. Vale para os quinze e para o próprio `INV-CLIN-003`. **Doze dos quinze não têm protetor algum.** A fronteira de verificação deste projeto está nos motores; os defeitos que a Founder encontra estão nas bordas.

**Falha de método registrada (seção 13):** leitura de código + execução de motores puros verifica o que o sistema produz e é cega para o que ele permite perder e deixa de comunicar. Auditoria sem harness de interação não deve ser apresentada como cobertura de superfície de uso.

**Correção de recomendação após ler o roadmap (seção 12.1):** a disposição que eu havia publicado em #47 e #49 — acrescentar guarda no padrão dos `confirm()` existentes — contraria `ROADMAP.md:50` e `README.md:37`, que classificam diálogo nativo como fricção a remover. Disposição revista: **desfazer, não confirmar**, no padrão de "Restaurar texto colado".

**Reconciliação com roadmap (seção 12.2):** nenhum achado exige gate novo; todos caem em gates já declarados. Alimentam o item 2 do Gate da PR #30.

**Divergências do README (seção 12.3):** sete afirmações de capacidade atual não alcançáveis na superfície convergida. Registradas para o owner de documentação canônica; não corrigidas por este setor.

### Aberto e rastreado como issue

- **#39** — respondida por Platform/Core. Executada, mas a primeira entrega foi insuficiente pelo motivo acima; a ponte de composição é a correção. Fechar só depois do handshake.
- **#40 — FECHADA.** Platform/Core entregou o step de CI em `0ff8396`; verifiquei por execução e restava um elo: remover o próprio step não era detectado por nada, o que reabria o caso "apagar gate e âncora na mesma mudança". Fechado com `workflow-security.test.mjs :: 'the CI guard for critical safety sentinels cannot be removed silently'`, mapeado como protetor de `INV-GOV-001`. 3 mutações verificadas. `checks.yml` lido, não modificado.
- **github-advanced-security:** do setor; falha por infraestrutura do GitHub (`SessionModelError: 400`), não por código do repositório. Não silenciar. Próximo bloco candidato.

## Restrições

- não refatorar core arquitetural por iniciativa própria;
- não alterar UX/semântica clínica;
- correção localizada é permitida quando provada e sem cruzar owner de Platform/Core;
- toda garantia crítica exige evidência adversarial e segunda leitura.
