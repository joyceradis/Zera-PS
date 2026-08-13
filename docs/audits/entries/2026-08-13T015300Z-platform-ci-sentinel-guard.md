# CI externo ao gate — sentinelas críticos de invariantes

```text
AGENTE/SETOR:      Platform / Core Engineering (ChatGPT)
BRANCH/PR/BASE/SHA: chore/housekeeping-product-convergence / PR #30 / commit b3cfc5c
ESCOPO:            reduzir o limite residual do INV-GOV-001 fora da própria suíte
SEVERIDADE:        garantia / CI
STATUS:            IMPLEMENTED — segunda leitura adversarial de Quality pendente
FOUNDER:           não necessária
```

## Problema

A ancoragem mútua entre `tests/invariant-coverage.test.mjs` e `tests/integration-static.test.mjs` detecta a remoção isolada de qualquer um dos dois arquivos. Porém uma suíte não consegue, sozinha, garantir sua própria existência: apagar ou esvaziar simultaneamente os sentinelas internos pode retirar também o mecanismo que denunciaria a remoção.

Esse limite é especialmente relevante porque o incidente clínico P0 demonstrou um modo de falha real em que uma regressão e o teste que a impediria foram alterados no mesmo ciclo, mantendo a suíte verde.

## Ação em Platform/Core

O workflow `.github/workflows/checks.yml` passou a executar um guard **antes do Setup Node e antes de `npm run verify`**.

O guard não verifica somente existência. Ele exige:

- `docs/clinical/INVARIANT_REGISTRY.md`, `tests/invariant-coverage.test.mjs` e `tests/integration-static.test.mjs` presentes e não vazios;
- `INV-GOV-001` e `INV-CLIN-001` ainda declarados no registry;
- o gate ainda referenciando `INVARIANT_REGISTRY.md`;
- `INV-GOV-001` ainda mapeado no gate;
- a âncora externa `the invariant coverage gate exists and is wired to the clinical registry` ainda presente em `integration-static.test.mjs`.

Assim, substituir um arquivo crítico por um placeholder vazio ou retirar a fiação mínima deixa de satisfazer o guard simplesmente porque o caminho do arquivo continua existindo.

## Evidência

Commit: `b3cfc5ce52ddc9bc1edc7ceca072de6fbaa97554`.

GitHub Actions `checks`, run `31659068974`:

```text
Guard critical safety sentinels  success
Verify                           success
job verify                       success
```

## Limites declarados

Isto **não é prova criptográfica nem branch protection**. Um ator deliberado ainda pode modificar simultaneamente o workflow e os sentinelas. A propriedade que esta camada adiciona é outra: uma remoção/enfraquecimento acidental ou uma alteração de testes que não perceba a dependência externa passa a precisar atravessar também uma segunda superfície (`checks.yml`) para ficar silenciosa.

A API disponível a Platform/Core não permitiu confirmar/configurar branch protection (`403 Resource not accessible by integration`). Portanto não será alegado que review obrigatório/CODEOWNERS está ativo sem evidência.

## Próximo gate

Quality / Verification deve fazer segunda leitura adversarial do guard, tentando demonstrar pelo menos:

1. remoção de um sentinela;
2. arquivo vazio preservando o nome;
3. remoção da âncora externa;
4. remoção do mapeamento de `INV-GOV-001`;
5. alteração que mantenha todos os `grep` verdadeiros mas neutralize semanticamente o gate.

O item 5 é intencional: se houver bypass simples que preserve os marcadores textuais, o guard deve ser reclassificado como heurístico e não como garantia forte.
