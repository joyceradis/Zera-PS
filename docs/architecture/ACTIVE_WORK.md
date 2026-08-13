# Zera PS — Active Work

Fonte canônica para evitar colisão de escrita entre agentes.

Antes de alterar owner compartilhado, sincronize a branch-alvo e registre um lease aqui. Ao concluir, publique checkpoint e marque CLOSED.

## Leases ativos

| Agente | Branch / PR | Owner / arquivos | Objetivo | SHA inicial | Status | Founder necessária? |
| --- | --- | --- | --- | --- | --- | --- |
| Founder | PR #30 | superfície clínica | Homologação clínica manual e relatório de domínio | — | ACTIVE | — |
| Lead Engineering | `chore/housekeeping-product-convergence` / #30 | governança multiagente, documentação canônica e reconciliação | Consolidar shared audit log, invariant registry e coordenação; sem alterar comportamento clínico em homologação | `f588a05` | ACTIVE | não |
| Auditor independente (Claude) | `audit/invariant-coverage-gate` → PR filha da #30 | `tests/invariant-coverage.test.mjs` (novo) — **somente** este arquivo de código | Tornar a rastreabilidade invariante→teste um gate executável, implementando `INV-GOV-001` mecanicamente | `3577383` | ACTIVE | não |
| Auditor independente (Claude) | `audit/maturity-report-publication` / PR #36 | `docs/audits/MATURITY_AUDIT_2026-08-12.md` + entrada aditiva no log + índice | Publicar auditoria independente de maturidade | `3577383` | PAUSADA (draft, por instrução da Founder) | não |

### Escopo declarado do lease `audit/invariant-coverage-gate`

Este lease **não** toca `docs/clinical/INVARIANT_REGISTRY.md`, que pertence ao owner `documentação canônica` de Lead Engineering e está `ACTIVE`. O gate lê o registry como fonte de verdade e mantém o mapeamento invariante→teste dentro do próprio arquivo de teste, para não escrever em owner alheio.

Não altera semântica clínica nem UX em homologação: nenhum arquivo de `assets/`, `src/`, `protocols/` ou `app.html` é modificado.

## Regras rápidas

- `ACTIVE` no mesmo owner bloqueia write concorrente; o outro agente pode revisar/auditar.
- `AVAILABLE` não reserva owner.
- Mudança de owner exige atualizar esta tabela.
- P0 urgente na `main` segue protocolo de hotfix e reconciliação da PR #30.
- PR #30 não pode ser mergeada antes da homologação clínica manual da Founder.
- Ao terminar um bloco, registrar SHA/testes no `SHARED_AUDIT_LOG.md` e fechar o lease.
