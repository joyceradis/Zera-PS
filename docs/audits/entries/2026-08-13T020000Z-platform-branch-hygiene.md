# Branch hygiene checkpoint

```text
AGENTE/SETOR: Platform / Core Engineering (ChatGPT)
ESCOPO: branches remanescentes após integração das PRs #37 e #38
STATUS: CONTROLLED
FOUNDER: não necessária
```

## Refs observadas

1. `main` — produção/base; KEEP.
2. `chore/housekeeping-product-convergence` — PR #30, linha canônica; KEEP.
3. `develop` — mina arqueológica explicitamente preservada; HOLD até patrimônio exclusivo estar canonizado.
4. `audit/maturity-report-publication` — PR #36 pausada; KEEP enquanto a auditoria não for reconciliada.
5. `fix/p0-fabricated-negatives` — PR #33 fechada/superseded; **DELETE CANDIDATE** quando a interface/API de branch deletion estiver disponível.
6. `fix/pr30-priority-blockers` — branch antiga divergida, 6 commits à frente do merge-base porém sem diff de arquivos contra a convergência no compare atual; **DELETE CANDIDATE**, condicionada a uma última verificação de patrimônio antes da exclusão.

Branches transitórias de #37 e #38 já não aparecem na listagem após merge, reduzindo automaticamente a superfície ativa.

## Regra

Não criar branch nova sem PR/bloco/owner explícito. Branch transitória integrada deve desaparecer ou ser marcada para poda. `develop` não volta a ser linha de implementação.
