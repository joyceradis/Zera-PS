# Arqueologia de branches — 2026-08-12

## Objetivo

Separar patrimônio histórico de clutter remoto sem apagar trabalho não integrado e sem alterar silenciosamente a superfície clínica em homologação na PR #30.

## Âncora operacional

Durante esta fase, a Founder homologa clinicamente a PR #30 e a engenharia trabalha em paralelo somente em trilhas ortogonais: arqueologia, branch audit, dívida técnica, testes, PWA, documentação e segurança.

Nenhuma conclusão desta auditoria autoriza merge da PR #30 nem alteração silenciosa de comportamento clínico.

## Fontes verificadas

- inventário remoto atual de branches;
- histórico de PRs #2–#31;
- auditoria de organização da PR #21;
- comparações diretas contra `main` das branches funcionais/documentais relevantes;
- inventários de patrimônio, UI, microfunções e métricas produzidos na própria PR #30.

## Inventário remoto atual

Foram encontradas **26 branches**:

```text
main
chore/housekeeping-product-convergence
chore/housekeeping-product-convergence-v2
claude/clinical-protocols-infrastructure-njmdmi
develop
docs/clinical-safety-closeout
docs/product-doctrine
docs/readme-verification-status
docs/repository-housekeeping
docs/repository-housekeeping-clean
docs/repository-housekeeping-clean-2
docs/repository-housekeeping-clean-3
docs/repository-housekeeping-clean-4
docs/repository-housekeeping-clean-5
docs/repository-housekeeping-clean-6
docs/repository-housekeeping-clean-7
docs/repository-housekeeping-final
docs/repository-housekeeping-plan
docs/repository-housekeeping-v2
docs/repository-housekeeping-work
feat/temporal-results-and-applied-tools
feat/temporal-workflow-engine
fix/issue-15-clinical-context-coherence
fix/temporal-state-persistence
fix/temporal-workflow-completion
refactor/clinical-safety-foundation
```

## Regra de classificação

```text
ACTIVE
→ trabalho corrente; preservar

LEGACY-REFERENCE / MINE
→ contém patrimônio exclusivo; não mergear em bloco e não remover antes de terminar mineração

MERGED / ABSORBED
→ conteúdo já alcançado pela main ou comprovadamente reincorporado; candidato a remoção do ref remoto

IDENTICAL TO MAIN
→ nenhum conteúdo exclusivo; candidato direto a remoção do ref remoto

UNKNOWN
→ não remover até obter evidência suficiente
```

Exclusão de branch não apaga commits já alcançáveis pela `main`, mas este ciclo continua não removendo refs sem evidência individual.

## Branches ativas

### `main`

Classificação: **KEEP / CANONICAL**.

É a linha estável de integração. A PR #30 continua sem merge enquanto aguarda homologação clínica.

### `chore/housekeeping-product-convergence`

Classificação: **ACTIVE / KEEP**.

É a branch da PR #30. Comparação atual contra `main`:

- status: `diverged`;
- ahead: **93 commits**;
- behind: **6 commits**;
- concentra a convergência de Atendimento, parser LAB recuperado, produtividade, intake zero-friction, PWA preview e documentação de auditoria.

Não remover nem retargetar enquanto a homologação estiver aberta.

## Branch sem conteúdo exclusivo

### `chore/housekeeping-product-convergence-v2`

Classificação: **IDENTICAL TO MAIN / PRUNE CANDIDATE**.

Comparação direta:

```text
ahead_by: 0
behind_by: 0
status: identical
```

Não contém patrimônio próprio.

## Branch de patrimônio ainda relevante

### `develop`

Classificação: **LEGACY-REFERENCE / MINE**.

Comparação atual contra `main`:

```text
status: diverged
ahead_by: 10
behind_by: 118
```

Arquivos exclusivos detectados:

- `ROADMAP_V0.2.md`;
- `SPEC_NOVO_ATENDIMENTO_V0.2.md`;
- `assets/attendance.js`;
- `prototype-novo-atendimento.html`.

Esse ramo contém patrimônio real do modelo de múltiplos atendimentos locais, retomada/status/desfecho e ideias de UI operacional. Não deve ser mergeado em bloco. O conteúdo útil é minerado por comportamento e adaptado à arquitetura atual.

## Branches funcionais antigas — evidência de absorção

### `claude/clinical-protocols-infrastructure-njmdmi`

Classificação: **MERGED / ABSORBED / PRUNE CANDIDATE**.

Comparação atual:

```text
ahead_by: 0
behind_by: 34
status: behind
```

A PR #14 foi merged. Não há commits exclusivos no tip remoto atual.

### `fix/issue-15-clinical-context-coherence`

Classificação: **MERGED / ABSORBED / PRUNE CANDIDATE**.

Comparação atual:

```text
ahead_by: 0
behind_by: 30
status: behind
```

PRs #16 e #17 merged. Nenhum patrimônio exclusivo no tip.

### `feat/temporal-results-and-applied-tools`

Classificação: **MERGED / RESIDUAL VERIFIED / PRUNE CANDIDATE**.

Comparação atual:

```text
status: diverged
ahead_by: 6
behind_by: 38
```

Os arquivos residuais detectados são `ROADMAP.md`, documentação temporal, `src/temporal-ui.js` e testes. A PR #21 já verificou que o conteúdo funcional residual estava reincorporado à `main`; as PRs #12 e #13 foram merged. Não tratar como linha alternativa de produto.

### `feat/temporal-workflow-engine`

Classificação: **MERGED / RESIDUAL VERIFIED / PRUNE CANDIDATE**.

Comparação atual:

```text
status: diverged
ahead_by: 4
behind_by: 54
```

Residual concentrado em `src/temporal-ui.js`, service worker e testes. A PR #21 verificou que a implementação relevante do temporal UI já estava contida na `main`; PR #8 merged.

### `fix/temporal-state-persistence`

Classificação: **MERGED / RESIDUAL VERIFIED / PRUNE CANDIDATE**.

Comparação atual:

```text
status: diverged
ahead_by: 10
behind_by: 47
```

A PR #10 foi merged. O residual é composto principalmente por documentação histórica e versões anteriores de `temporal-ui` / `workflow-engine` / testes. Os contratos vigentes estão cobertos pela arquitetura e suíte atuais.

### `fix/temporal-workflow-completion`

Classificação: **MERGED / RESIDUAL VERIFIED / PRUNE CANDIDATE**.

Comparação atual:

```text
status: diverged
ahead_by: 1
behind_by: 48
```

O único residual direto é alteração de teste em `tests/workflow-engine.test.mjs`; PR #9 foi merged e a PR #21 já verificou os testes correspondentes na `main`.

### `refactor/clinical-safety-foundation`

Classificação: **MERGED / RESIDUAL HISTORICAL / PRUNE CANDIDATE**.

Comparação atual:

```text
status: diverged
ahead_by: 3
behind_by: 85
```

Residual observado: `docs/AUDIT_RESULT.md` e uma versão histórica de `tests/integration-static.test.mjs`. O núcleo de clinical safety foi integrado pelas PRs #2–#4; a PR #5 foi fechada justamente por duplicar histórico já absorvido.

## Família documental de housekeeping

Classificação coletiva: **PROCESS ARTIFACT / PRUNE CANDIDATE**, condicionada apenas à remoção futura do ref remoto.

Inclui:

- `docs/repository-housekeeping`;
- `docs/repository-housekeeping-clean`;
- `docs/repository-housekeeping-clean-2`;
- `docs/repository-housekeeping-clean-3`;
- `docs/repository-housekeeping-clean-4`;
- `docs/repository-housekeeping-clean-5`;
- `docs/repository-housekeeping-clean-6`;
- `docs/repository-housekeeping-clean-7`;
- `docs/repository-housekeeping-final`;
- `docs/repository-housekeeping-plan`;
- `docs/repository-housekeeping-v2`;
- `docs/repository-housekeeping-work`.

A PR #11 é o marco consolidado dessa linhagem. As variantes intermediárias são artefatos de processo, não linhas de produto.

Também são candidatos a prune por integração comprovada:

- `docs/clinical-safety-closeout` — PR #6 merged;
- `docs/readme-verification-status` — PR #7 merged;
- `docs/product-doctrine` — PRs #18 e #19 merged.

## Histórico de PRs como evidência

O levantamento das PRs recentes confirma:

- #2–#4: fundação de segurança clínica integrada;
- #6–#7: closeout/documentação integrada;
- #8–#10: workflow temporal e hardening integrados;
- #11: consolidação documental do repositório;
- #12–#14: resultados temporais, applied tools e infraestrutura declarativa integrados;
- #16–#19: coerência de contexto e doutrina de produto integradas;
- #21–#27: housekeeping, correções de roteiro/HDA, exames complementares e justificativas integrados;
- #28–#29: início formal da auditoria de recuperação integrado;
- #31: housekeeping de CI integrado;
- #30: única PR funcional aberta relevante neste momento.

## Resultado da arqueologia restante

A investigação não encontrou uma segunda linha moderna do produto concorrendo com a PR #30.

O estado é:

```text
CANONICAL
main

ACTIVE
chore/housekeeping-product-convergence  → PR #30

LEGACY-REFERENCE / MINE
develop

IDENTICAL / PRUNE
chore/housekeeping-product-convergence-v2

MERGED / ABSORBED / PRUNE
claude/clinical-protocols-infrastructure-njmdmi
fix/issue-15-clinical-context-coherence
feat/temporal-results-and-applied-tools
feat/temporal-workflow-engine
fix/temporal-state-persistence
fix/temporal-workflow-completion
refactor/clinical-safety-foundation
docs/* antigos e família repository-housekeeping-*
```

## Patrimônio ainda não encerrado

A arqueologia de branches está fechada para fins de classificação, mas duas frentes históricas permanecem como mineração funcional, não como incerteza de branch:

1. `develop` — extrair/adaptar apenas comportamentos úteis de múltiplos atendimentos e retomada/status/desfecho após a homologação do núcleo atual;
2. gráfico longitudinal/mensal lembrado pela Founder — ainda não localizado como implementação comprovada; não reconstruir no chute. O painel `Resumo do Plantão` atual é uma implementação nova e separada.

## Limitação operacional

O conector GitHub disponível expõe criação/movimentação de refs, mas não expõe exclusão segura de branch/ref remoto. Portanto:

- a auditoria destrutiva está deliberadamente adiada;
- não será usado `force update` para simular exclusão;
- após a homologação/merge da PR #30, os candidatos acima podem ser removidos manualmente no GitHub ou por ferramenta apropriada.

## Conclusão

**A arqueologia restante de branches está concluída em modo não destrutivo.**

Não há necessidade de envolver a Founder para decidir limpeza de refs. A única branch antiga que merece preservação temporária por patrimônio é `develop`; as demais linhas antigas analisadas são integradas, absorvidas, idênticas à `main` ou artefatos documentais do processo.

A âncora continua:

```text
Founder
→ homologação clínica da PR #30
→ feedback / decisões de domínio

Engineering
→ branch audit concluída em modo não destrutivo
→ dívida técnica / testes / PWA / documentação / segurança
→ sem alterar silenciosamente a superfície clínica em homologação
```
