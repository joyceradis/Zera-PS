# Branch prune recheck — Platform/Core — 2026-08-13

## Escopo

Rechecagem destrutiva **não executada** dos refs remotos restantes após a arqueologia principal. Objetivo: distinguir branch ativa, patrimônio, auditoria pausada e refs comprovadamente obsoletos sem simular exclusão por `force update`.

## Inventário remoto atual

```text
audit/founder-homologation-verification
audit/maturity-report-publication
chore/housekeeping-product-convergence
develop
fix/p0-fabricated-negatives
fix/pr30-priority-blockers
main
```

Total: **7 branches**.

## KEEP

### `main`
Linha estável. Não tocar.

### `chore/housekeeping-product-convergence`
PR #30, linha canônica de convergência. ACTIVE. Não mergear em `main` antes da homologação clínica explícita da Founder.

### `audit/founder-homologation-verification`
PR #43, Quality/Verification. DRAFT e bloqueada até rebase/segunda leitura/handshake. Não remover.

### `audit/maturity-report-publication`
PR #36, auditoria de maturidade pausada por instrução da Founder. Preservar enquanto pausada.

### `develop`
Mina arqueológica com patrimônio histórico exclusivo. Não usar como linha de implementação e não remover antes de encerrar a mineração declarada.

## PRUNE CANDIDATE — prova forte

### `fix/pr30-priority-blockers`

Comparação contra a linha canônica atual:

```text
status: diverged
ahead_by: 6
behind_by: 245
files: []
```

Apesar da ancestralidade divergente, **não existe diff de arquivos** contra `chore/housekeeping-product-convergence`. Não há PR aberta ou histórica localizada para este head. Classificação: **OBSOLETE / SAFE TO PRUNE**.

### `fix/p0-fabricated-negatives`

A comparação ainda mostra diff de arquivos, então a conclusão não pode se basear apenas em `files != []`. A leitura semântica demonstra que o residual é uma abordagem antiga/rejeitada do mesmo P0:

- a branch adiciona `[CONFIRMAR AUSÊNCIA DE: ...]` diretamente nos cinco `hdaDraft` estáticos;
- a linha canônica remove esses blocos dos templates e preserva segurança por estado desconhecido + confirmação explícita/progressive disclosure;
- a Founder já registrou que o excesso de `[CHAVES]`/placeholders é cansativo e não deve ser reintroduzido como solução padrão;
- `defaultDiarrheaHdaState()` já inicia todos os achados como `UNKNOWN` na canônica;
- os protetores correntes impedem negativas pré-escritas e preservam a edição clínica.

Logo, o conteúdo exclusivo desta branch **não é patrimônio ausente**: é uma variante de implementação superada pela decisão de produto e pela solução canônica posterior. Classificação: **OBSOLETE / SAFE TO PRUNE**, preservando o histórico nos commits.

## Limitação operacional

O conector atual não expõe exclusão de ref remoto. Não será usado `update_ref(force=true)` para fingir deleção ou apagar a ponta da branch. Os dois refs acima estão tecnicamente classificados para exclusão quando houver uma ação explícita de delete-ref/branch disponível.

## Estado mínimo desejado após prune

```text
main
chore/housekeeping-product-convergence
audit/founder-homologation-verification
audit/maturity-report-publication
develop
```

Depois que PR #43 for integrada/fechada, sua branch também vira candidata a remoção. Depois que a Founder liberar/encerrar a PR #36, o mesmo vale para a branch de maturidade.
