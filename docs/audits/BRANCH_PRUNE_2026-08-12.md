# Branch prune — 2026-08-12

Status: executado com prova de ancestralidade; PR #30 permanece sem merge.

## Política aplicada

Uma branch só foi removida quando uma das condições abaixo foi provada contra `main`:

1. tip idêntico à `main`; ou
2. `git merge-base --is-ancestor <branch> main` verdadeiro.

Branches divergentes não foram removidas neste ciclo, mesmo quando o histórico de PR sugere absorção funcional. O objetivo é preferir falso negativo (deixar clutter temporário) a falso positivo (apagar uma referência ainda útil).

## Resultado

Inventário remoto antes: **26 branches**.

Inventário remoto após prune: **11 branches**.

Total removido com prova forte: **15 branches**.

### Removidas — conjunto 1

- `chore/housekeeping-product-convergence-v2`
- `docs/repository-housekeeping`
- `docs/repository-housekeeping-clean`
- `docs/repository-housekeeping-clean-2`
- `docs/repository-housekeeping-clean-3`
- `docs/repository-housekeeping-clean-4`
- `docs/repository-housekeeping-clean-5`
- `docs/repository-housekeeping-clean-6`
- `docs/repository-housekeeping-final`
- `docs/repository-housekeeping-plan`
- `docs/repository-housekeeping-v2`
- `docs/repository-housekeeping-work`

### Removidas — conjunto 2

- `claude/clinical-protocols-infrastructure-njmdmi`
- `fix/issue-15-clinical-context-coherence`
- `docs/product-doctrine`

Cada execução utilizou um workflow temporário com guard de ancestralidade antes de `git push --delete`. O workflow destrutivo foi desabilitado após uso e não permanece com permissão de escrita ativa.

## Branches remotas restantes

```text
main
chore/housekeeping-product-convergence
develop
docs/clinical-safety-closeout
docs/readme-verification-status
docs/repository-housekeeping-clean-7
feat/temporal-results-and-applied-tools
feat/temporal-workflow-engine
fix/temporal-state-persistence
fix/temporal-workflow-completion
refactor/clinical-safety-foundation
```

### KEEP

- `main` — linha canônica estável.
- `chore/housekeeping-product-convergence` — PR #30, trabalho ativo em homologação.
- `develop` — patrimônio ainda a minerar (multi-Encounter, retomada/status/desfecho); não remover ainda.

### HOLD / REQUIRE CONTENT-EQUIVALENCE REVIEW

As demais branches estão divergentes de `main`. Algumas têm PRs já integradas e provavelmente poderão ser removidas, porém o critério estrito de ancestralidade não é suficiente porque houve merges/squashes e commits residuais próprios. Elas ficam preservadas até auditoria de equivalência por conteúdo:

- `docs/clinical-safety-closeout`
- `docs/readme-verification-status`
- `docs/repository-housekeeping-clean-7`
- `feat/temporal-results-and-applied-tools`
- `feat/temporal-workflow-engine`
- `fix/temporal-state-persistence`
- `fix/temporal-workflow-completion`
- `refactor/clinical-safety-foundation`

## Regra daqui para frente

Nenhuma branch residual será apagada apenas porque o nome parece antigo ou porque a PR correspondente foi fechada. Para cada uma será exigida evidência de que todo comportamento/artefato útil está alcançável na linha canônica ou deliberadamente arquivado antes do prune.

## Âncora preservada

```text
Founder
→ homologação clínica da PR #30
→ feedback / decisões de domínio

Engineering
→ housekeeping técnico em paralelo
→ sem alterar silenciosamente a superfície clínica
→ sem merge antes da homologação manual
```
