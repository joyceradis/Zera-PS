# Checkpoint — encerramento da sessão de convergência / 2026-08-13

## Objetivo
Registrar o estado verificável ao encerrar a sessão, para que ChatGPT, Claude ou qualquer agente novo retomem sem depender da Founder como mensageira.

```text
LINHA CANÔNICA: chore/housekeeping-product-convergence / PR #30
HEAD VERDE DE CORE: 45e7341d13444accfbe74d49d5b323e46935c2db
PR #30: OPEN + DRAFT + NÃO MERGEAR
INV-CLIN-003: 9 FULL / 1 PARTIAL (estado canônico)
PR #43: DRAFT / requer rebase + nova segunda leitura + handshake
FOUNDER: pausa de homologação nesta sessão; nenhum aceite final para piloto
```

## Correção de escopo da homologação visual

O screenshot final fornecido pela Founder mostra URL `joyceradis.github.io/Zera-PS/...`, isto é, a publicação GitHub Pages associada à linha publicada/main, **não o preview efêmero da PR #30**.

Consequências metodológicas:

1. as observações de UX/fricção da Founder continuam válidas como evidência de produto e da linhagem publicada;
2. elas **não provam** que o HEAD atual da PR #30 mantém ou corrige o mesmo comportamento;
3. não invalidar retrospectivamente os achados já reproduzidos por Quality/Core no código — vários já viraram issues/testes e foram corrigidos na canônica;
4. o gate final de homologação da PR #30 exige um **novo preview identificado pelo HEAD** e testado explicitamente pela Founder;
5. nunca dizer à Founder que ela “já homologou a PR #30” apenas porque usou o GitHub Pages atual.

## O que avançou hoje — Platform/Core

### Segurança / perda documental

- #45 FECHADA: justificativa de alto custo deixou de fabricar `URGÊNCIA`, `CONDUTA IMEDIATA` e `COMPLICAÇÕES GRAVES` sem entrada confirmatória. RED→GREEN registrado.
- #47 FECHADA: `Atualizar evolução` não pode destruir silenciosamente edição manual do documento final; proteção de generated-vs-manual incorporada.
- #49 FECHADA: restore de rascunho ganhou bridge de ressincronização; `#qp-free` obsoleto não pode destruir QP/HDA restauradas ao primeiro input.
- troponina: regra canônica assay-dependent. Valor + unidade + referência do ensaio/laboratório. `0,0019` informado para hs-troponina no Meridional é perfil local, nunca cutoff universal.

### Lifecycle / produtividade / reachability

- Encounter passou a nascer da atividade clínica real do Atendimento, protocol-agnostic, em vez de depender do seletor de workflow oculto.
- produtividade passou a ter fonte real; falso `ATENDIDOS: 0` por inexistência de Encounter foi tratado na origem.
- #44 foi refinada: CRB-65/qSOFA/CURB-65 estão alcançáveis em `Atendimento → Ferramentas`; o gap restante é **motor declarativo protocol-bound** (progressive disclosure, stage/pending, HEART/contexto SCA etc.).
- NÃO resolver #44 simplesmente desocultando `.workflow-card`; isso ressuscita Workflow/Roteiro como produto concorrente.

### Reavaliação

- #51 FECHADA nesta sessão.
- RED: `ef085ead3691dfbe329dc547cd9748ca0aa0a354` exigiu owner único para `#generate-reassessment` e fez `checks` falhar.
- GREEN: `45e7341d13444accfbe74d49d5b323e46935c2db` removeu o listener legado de `assets/app.js`; `src/temporal-ui.js` ficou como único coordenador temporal do clique.
- CI `checks` run 696 = SUCCESS.
- Escopo: ownership concorrente fechado. #44 continua aberto quanto ao protocolo dinâmico.

### PWA / storage / governança

- APP_SHELL/hardening em v16; bridges necessários incorporados.
- storage distingue ausente × corrompido × indisponível; I/O compartilhado preservado.
- governança interna de CI endurecida; porém #50 permanece ABERTA: `main` e branch da PR #30 continuam sem branch protection/required checks externos.
- PR #30 chegou a aparecer fechada sem merge durante a sessão; Platform/Core restaurou `OPEN + DRAFT`. Não presumir causa/autoria. Regra: lifecycle da PR canônica não é housekeeping.

## Quality / PR #43 — instrução de retomada

Claude / Quality deve, antes de nova alegação:

1. sincronizar a canônica atual;
2. rebasear `audit/founder-homologation-verification` sobre o HEAD atual da PR #30;
3. atualizar a auditoria para reconhecer #45, #47, #49 e #51 como corrigidas na canônica;
4. preservar e retestar a âncora anti-trivialidade, contraprova positiva e mutation testing da ponte de composição;
5. separar explicitamente:
   - propriedade de composição do código (`INV-CLIN-003`),
   - reachability real do produto (#44),
   - homologação da Founder (preview real da PR #30);
6. atualizar `tests/converged-surface-reachability.test.mjs`, pois pins que esperavam lifecycle quebrado ficaram obsoletos após criação protocol-agnostic de Encounter;
7. publicar novo HEAD SHA e evidência fresca;
8. aguardar nova segunda leitura de Platform/Core;
9. não integrar sem comentário literal `INTEGRATION READY — <HEAD SHA>` para o HEAD revisado.

## Decisões de domínio ainda abertas — Founder

Não implementar unilateralmente:

- #46 — relação documental QP × HDA no intake livre;
- #48 — orientação inicial, hierarquia da superfície, estado inicial e fricção cognitiva;
- reachability final de ferramentas protocol-bound quando envolver escolha de fluxo cognitivo;
- aceite final da V1 para piloto.

A Founder não precisa produzir relatório final nem repetir os achados anteriores. Quando retomar, deve receber um preview da PR #30 identificado por HEAD e apenas usar o produto como médica.

## Próxima ordem de trabalho

```text
1. Quality: rebase/atualização da #43 + nova evidência
2. Platform/Core: segunda leitura da #43 e decisão honesta do INV-CLIN-003
3. Platform/Core + Produto: fechar/deferir #44 sem segundo produto concorrente
4. Founder: decisões #46/#48 quando desejar retomar
5. Core/Quality: fricção + keyboard-first com protetores
6. interação real desktop/mobile
7. PWA instalado/offline real
8. #50 branch protection/ruleset externo ou risco explicitamente aceito para piloto
9. novo preview da PR #30 no HEAD final
10. Founder homologa esse preview
11. só então avaliar PR #30 → main e V1 candidata a piloto
```

## Divisão operacional vigente

**JOYCE — Founder / Produto / Domínio Clínico**
Fluxo real do PS, prioridade, linguagem documental, UX clínica, microfunções úteis, homologação e decisão final de trade-offs clínicos.

**CHATGPT — Platform / Core Engineering**
Arquitetura, estado, document engine, workflow/temporalidade, storage, PWA/offline, integração, CI/CD, segurança técnica, ownership, housekeeping, roadmap/documentação canônica, merge/reconciliação e dívida estrutural.

**CLAUDE — Quality / Verification Engineering**
Auditoria independente, regressão, invariant coverage, testes adversariais/mutation, investigação de bugs, análise de PR, compatibilidade, segurança, interação e observabilidade de CI. Quando o RED exigir arquitetura/Core ou decisão clínica, faz handoff; não redesenha silenciosamente.

## Regra final de retomada

GitHub é a fonte operacional. Agente novo lê `AGENT_COORDINATION.md` → lanes → `ROADMAP.md` → invariant registry → este checkpoint → PRs/issues. A Founder não transporta contexto.