# Fechamento da lacuna INV-DOC-001 e reclassificação da cobertura

```text
AGENTE/SETOR:      Quality / Verification Engineering (Claude)
BRANCH/PR/BASE/SHA: audit/inv-doc-001-gap-test / PR #38 / base 1b8f785
ESCOPO:            provar ou refutar que estado operacional alcança o texto clínico final
SEVERIDADE:        lacuna de cobertura (não era bug)
STATUS:            IN REVIEW
FOUNDER:           não necessária
```

## Achado

A propriedade do `INV-DOC-001` **se sustenta**. Não há vazamento de estado operacional para o documento clínico. Os renderizadores documentais operam por **allow-list** — leem apenas os campos autorizados a publicar — e não por deny-list.

Era cobertura ausente, não defeito. Nenhuma linha de `src/`, `assets/`, `protocols/` ou `app.html` foi alterada.

## Evidência

6 vetores adversariais em `tests/document-operational-state.test.mjs`, incluindo o caso mais desagradável: pendência cujo rótulo se parece com texto clínico legítimo (`TROPONINA DE CONTROLE AINDA NÃO COLETADA`), que passaria por qualquer filtro baseado em aparência.

Teste de mutação do document engine antes de propor:

| Mutação | Detectada por |
| --- | --- |
| `renderScores` publica `tool.message` | 2 testes |
| `renderTemporalReassessment` publica `pendingItems` | 1 teste → após correção, 2 |

A segunda mutação expôs uma fraqueza no próprio helper de asserção: ele dependia de lista **fixa** de marcadores, então um vazamento com texto fora da lista passava. Corrigido para derivar os termos proibidos do estado operacional injetado em cada caso. Sem isso, o arquivo teria sido integrado passando pelo motivo errado.

## Ação

`INV-DOC-001` reclassificado `PARTIAL` → `FULL` em `tests/invariant-coverage.test.mjs`, com os 4 protetores novos mapeados.

**Cobertura declarada: 9 integral / 1 parcial de 10** (era 8/2).

Correção de conduta registrada: na primeira versão eu deixei essa reclassificação como "handoff", alegando ownership do arquivo do gate. A alegação era infundada — `git log` confirma autor único (eu), e o arquivo foi criado no meu próprio lease. Reclassificação aplicada onde deveria ter sido desde o início.

## Pendente — registrado como issue, não como nota

- **#39** — `INV-CLIN-003` permanece `PARTIAL`; decidir se o espaço de estados é enumerável por teste ou exige mudança de arquitetura.
- **#40** — limite residual do `INV-GOV-001`: a suíte não protege contra a própria remoção; opções em nível de CI/CD.

## Invariants

`INV-DOC-001` (reclassificado), `INV-GOV-001` (mecanismo). Nenhum invariante alterado; nenhuma semântica clínica tocada.
