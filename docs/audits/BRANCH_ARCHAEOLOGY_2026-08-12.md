# Arqueologia de branches — 2026-08-12

## Objetivo

Separar patrimônio histórico de clutter remoto sem apagar trabalho não integrado.

## Fontes verificadas

- inventário remoto atual de branches;
- histórico de PRs #2–#31;
- auditoria de organização da PR #21;
- comparações recentes contra `main` para branches funcionais/documentais representativas.

## Regra

```text
MERGED / conteúdo comprovadamente absorvido
→ candidato a remoção do ref remoto

LEGACY-REFERENCE com trabalho exclusivo
→ preservar

ACTIVE
→ preservar

UNKNOWN
→ não remover até comparar
```

Exclusão de branch não altera o histórico de commits já alcançáveis pela `main`, mas este ciclo não removerá ref remoto sem evidência individual de integração.

## Branches ativas

- `main` — produção/canônica.
- `chore/housekeeping-product-convergence` — PR #30 ativa; preservar até homologação e merge/close.

## Branch de patrimônio que deve permanecer

### `develop`

Classificação: **LEGACY-REFERENCE / MINE**.

Motivo: contém trabalho exclusivo não presente na `main`, incluindo a especificação/protótipo do Novo Atendimento v0.2 e `assets/attendance.js`. Já foi determinado que não deve ser mergeada em bloco; continua fonte arqueológica até a mineração encerrar.

## Branches com integração comprovada por PR ou auditoria anterior

O histórico de PRs confirma integração dos principais ramos funcionais/documentais:

- `refactor/clinical-safety-foundation` — PRs #2, #3 e #4; PR #5 foi fechado justamente porque o histórico correspondente já havia sido integrado por squash.
- `docs/clinical-safety-closeout` — PR #6 merged.
- `docs/readme-verification-status` — PR #7 merged.
- `feat/temporal-workflow-engine` — PR #8 merged; PR #21 verificou que o conteúdo residual posterior também já estava presente na `main`.
- `fix/temporal-workflow-completion` — PR #9 merged; PR #21 verificou os testes residuais na `main`.
- `fix/temporal-state-persistence` — PR #10 merged.
- família `docs/repository-housekeeping-*` — culminou na PR #11 merged; ramos intermediários são artefatos do processo de organização.
- `feat/temporal-results-and-applied-tools` — PRs #12 e #13 merged.
- `claude/clinical-protocols-infrastructure-njmdmi` — PR #14 merged.
- `fix/issue-15-clinical-context-coherence` — PRs #16 e #17 merged.
- `docs/product-doctrine` — PRs #18 e #19 merged.
- branch de cleanup do Claude usada nas PRs #21–#25 — mudanças merged sequencialmente.
- branches de HDA integral usadas nas PRs #26–#27 — mudanças merged.
- `audit/full-repository-recovery-2026-08-11` — PRs #28 e #29 merged.
- `chore/ci-housekeeping` — PR #31 merged.

A auditoria da PR #21 já havia contado 22 refs antigas como comprovadamente integradas e preservado `develop` como única branch com trabalho próprio relevante naquele marco.

## Branches remotas ainda visíveis como clutter

O inventário remoto continua exibindo refs antigas como:

- `docs/repository-housekeeping`;
- `docs/repository-housekeeping-clean` e variantes `-2` … `-7`;
- `docs/repository-housekeeping-final`;
- `docs/repository-housekeeping-plan`;
- `docs/repository-housekeeping-v2`;
- `docs/repository-housekeeping-work`;
- `docs/product-doctrine`;
- `docs/readme-verification-status`;
- `docs/clinical-safety-closeout`;
- `feat/temporal-workflow-engine`;
- `feat/temporal-results-and-applied-tools`;
- `fix/temporal-state-persistence`;
- `fix/temporal-workflow-completion`;
- `fix/issue-15-clinical-context-coherence`;
- `refactor/clinical-safety-foundation`;
- `claude/clinical-protocols-infrastructure-njmdmi`.

Essas refs não devem voltar a ser tratadas como linhas alternativas do produto.

## Limitação operacional

O conector GitHub disponível neste ciclo expõe criação/movimentação de ref, mas **não expõe exclusão segura de branch/ref**. Portanto, a limpeza remota não será simulada nem feita por force-update.

Decisão: documentar candidatos agora; remover refs somente quando houver ferramenta de delete apropriada ou operação manual explícita no GitHub.

## Estado após arqueologia

```text
main                                  KEEP
chore/housekeeping-product-convergence ACTIVE

develop                               KEEP / LEGACY-REFERENCE

branches merged/integradas             PRUNE CANDIDATE
branch sem evidência suficiente         KEEP UNTIL VERIFIED
```

Nenhuma branch será usada como base de código nova por simples antiguidade ou por conter uma ideia desejável. Patrimônio é extraído por comportamento/testes e reconciliado com a arquitetura vigente.
