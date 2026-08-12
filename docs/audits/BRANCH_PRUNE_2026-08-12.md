# Branch prune — 2026-08-12

Status: **concluído com política conservadora; PR #30 permanece sem merge.**

## Objetivo

Reduzir a superfície remota de branches sem perder microfunções, contratos clínico-documentais, testes ou patrimônio histórico útil.

A prioridade foi segurança de patrimônio: falso negativo (manter uma branch por mais tempo) foi preferido a falso positivo (apagar uma referência com comportamento ainda não recuperado).

## Política aplicada

A limpeza ocorreu em camadas.

### Camada 1 — prova estrutural forte

Uma branch pôde ser removida imediatamente quando:

1. o tip era idêntico à `main`; ou
2. `git merge-base --is-ancestor <branch> main` era verdadeiro.

### Camada 2 — equivalência de conteúdo

Branches divergentes por squash/merge só foram removidas após revisão do conteúdo exclusivo. Para cada uma foi verificado se o residual representava:

- documentação histórica já preservada em localização canônica;
- teste antigo já coberto por teste atual mais geral/forte;
- implementação antiga já superada por implementação atual que preserva ou amplia o mesmo contrato;
- ou patrimônio clínico/operacional ainda único.

Branches com patrimônio único não são removidas.

### Guard de execução

Todos os prunes divergentes foram executados com **SHA exato do tip auditado**. Se uma branch tivesse se movido após a auditoria, a automação recusaria a exclusão.

O workflow destrutivo foi devolvido para estado desabilitado e `contents: read` após cada uso.

## Resultado final

Inventário remoto inicial: **26 branches**.

Inventário remoto final: **3 branches**.

Total removido: **23 branches**.

```text
main
chore/housekeeping-product-convergence
develop
```

## Branches preservadas

### `main`

Classificação: **KEEP / CANONICAL**.

Linha estável de integração.

### `chore/housekeeping-product-convergence`

Classificação: **ACTIVE / KEEP**.

Branch da PR #30. Permanece aberta e sem merge enquanto a Founder executa homologação clínica manual.

### `develop`

Classificação: **LEGACY-REFERENCE / MINE**.

Foi deliberadamente preservada porque ainda contém patrimônio operacional exclusivo a minerar/adaptar, especialmente:

- múltiplos atendimentos locais;
- retomada de atendimento;
- status/desfecho;
- ideias de UI operacional do protótipo anterior.

Não deve ser mergeada em bloco. O patrimônio útil será recuperado por comportamento, sem reintroduzir arquitetura obsoleta.

## Branches removidas

### Conjunto A — idênticas, ancestrais ou processo documental consolidado

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
- `claude/clinical-protocols-infrastructure-njmdmi`
- `fix/issue-15-clinical-context-coherence`
- `docs/product-doctrine`

### Conjunto B — divergentes auditadas por equivalência

- `docs/readme-verification-status`
- `fix/temporal-workflow-completion`
- `docs/clinical-safety-closeout`
- `docs/repository-housekeeping-clean-7`
- `feat/temporal-results-and-applied-tools`
- `feat/temporal-workflow-engine`
- `fix/temporal-state-persistence`
- `refactor/clinical-safety-foundation`

## Evidência de equivalência relevante

### `docs/readme-verification-status`

O único residual era um README antigo. A documentação canônica atual contém arquitetura, temporalidade, segurança e estado do produto mais recentes.

### `fix/temporal-workflow-completion`

O residual era um teste acoplado diretamente ao `SCA_PROTOCOL`. A `main` cobre o mesmo contrato de progressive disclosure com fixture declarativa genérica, o que prova melhor que o workflow engine não carrega conhecimento clínico específico.

### `docs/clinical-safety-closeout`

O `docs/AUDIT_RESULT.md` histórico foi confirmado como preservado no caminho canônico `docs/audits/clinical-safety/AUDIT_RESULT.md`; o roadmap residual era versão anterior do roadmap atual.

### `docs/repository-housekeeping-clean-7`

Residual exclusivamente documental/organizacional. Não havia parser, score, storage, workflow, UI clínica ou microfunção operacional exclusiva.

### `feat/temporal-results-and-applied-tools`

A branch continha a primeira implementação explícita de aplicação de HEART, pendências e resultados temporais. A `main` preserva esses contratos e os generaliza:

- `setToolApplied` continua existindo;
- `syncTemporalResults` continua existindo;
- resultados temporais são derivados declarativamente pelo protocolo;
- ferramentas são resolvidas por engine/renderer genéricos, em vez de SCA hardcoded;
- resultado clínico passou a possuir `results[]` temporal próprio, além de `pendingItems`.

Portanto a branch antiga não contém microfunção exclusiva ainda necessária.

### `feat/temporal-workflow-engine`

A implementação inicial de workflow temporal/SCA foi superada pela arquitetura atual com registry de protocolos, renderer declarativo, protocol engine, tool presentation, contexto coordenado e testes adicionais. A temporalidade de admissão → conduta → pendência → reavaliação permanece no núcleo atual.

### `fix/temporal-state-persistence`

O schema v3 e a proteção do snapshot de admissão foram preservados. A `main` é um superset: além de `pendingItems`, `reassessments` e `documents`, adiciona `results[]`, `addClinicalResult`, `getClinicalResults` e ligação de resultados resolvidos ao item pendente sem sobrescrever história.

### `refactor/clinical-safety-foundation`

A branch continha auditoria inicial e integração estática. A auditoria relevante está arquivada de forma canônica e o teste atual de integração amplia o anterior: cobre coordinator raiz, camadas temporais, IDs dinâmicos, PWA, HDA guiada e contrato de saída.

## Microfunções: regra de preservação

Nenhuma branch foi removida porque “parecia antiga”. Antes do prune, qualquer comportamento que economizasse digitação/clique, reduzisse carga cognitiva, preservasse contexto temporal ou tivesse valor clínico-documental foi tratado como patrimônio.

A regra permanece:

```text
microfunção útil e exclusiva
→ MINE / RECOVER
→ somente depois considerar DELETE da branch

resíduo superseded / duplicado / histórico já preservado
→ DELETE
```

## Estado após a limpeza

O repositório remoto agora possui uma topologia intencionalmente simples:

```text
main
└── integração estável

chore/housekeeping-product-convergence
└── PR #30 / homologação clínica em andamento

develop
└── mina arqueológica temporária; não é linha moderna concorrente
```

## Âncora preservada

```text
Founder
→ homologação clínica da PR #30
→ feedback / decisões de domínio

Engineering
→ mineração final de `develop`
→ dívida técnica / testes / PWA / documentação / segurança
→ sem alterar silenciosamente a superfície clínica em homologação
→ sem merge antes da homologação manual
```

## Conclusão

**Branch hygiene remoto concluído.**

A redução de 26 para 3 branches foi realizada sem transformar limpeza estética em perda de patrimônio. O único ramo legado deliberadamente preservado é `develop`, e sua finalidade é exclusivamente arqueológica até que as microfunções úteis restantes sejam mineradas/adaptadas.
