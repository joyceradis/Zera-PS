# Zera PS — Active Work

Fonte canônica para evitar colisão de escrita entre agentes.

Antes de alterar owner compartilhado, sincronize a branch-alvo e registre um lease aqui. Ao concluir, publique checkpoint e marque CLOSED.

## Leases ativos

| Agente | Branch / PR | Owner / arquivos | Objetivo | SHA inicial | Status | Founder necessária? |
| --- | --- | --- | --- | --- | --- | --- |
| Founder | PR #30 | superfície clínica | Homologação clínica manual e relatório de domínio | — | ACTIVE | — |
| Lead Engineering | `chore/housekeeping-product-convergence` / #30 | governança multiagente, documentação canônica e reconciliação | Consolidar shared audit log, invariant registry e coordenação; sem alterar comportamento clínico em homologação | `f588a05` | ACTIVE | não |
| Auditor independente (Claude) | `audit/maturity-report-publication` → PR filha da #30 | `docs/audits/MATURITY_AUDIT_2026-08-12.md` (novo) + entrada aditiva em `docs/audits/SHARED_AUDIT_LOG.md` + `docs/README.md` (índice) | Publicar relatório de maturidade independente e registrá-lo no log compartilhado | `3577383` | CLOSED — `AUD-2026-08-13-004`, suíte 231/231 | não |
| Auditor independente (Claude) | declarar antes do próximo write | próximo bloco técnico — ver checkpoint | A definir sem conflito com lease ativo | sincronizar antes do write | AVAILABLE | não |

### Sobreposição declarada — 2026-08-12

O lease do auditor independente toca `docs/audits/SHARED_AUDIT_LOG.md`, que está dentro do owner declarado por Lead Engineering (`documentação canônica`). A escrita foi mantida **estritamente aditiva** (uma entrada nova, nenhuma linha existente alterada ou removida), porque o próprio log declara essa entrada como esperada em "Próximas entradas esperadas". Registrado aqui em vez de assumido: se Lead Engineering considerar que o log deve ser append-only exclusivo do owner, basta reverter a entrada e reindexar a partir do arquivo de auditoria, que é autocontido.

## Regras rápidas

- `ACTIVE` no mesmo owner bloqueia write concorrente; o outro agente pode revisar/auditar.
- `AVAILABLE` não reserva owner.
- Mudança de owner exige atualizar esta tabela.
- P0 urgente na `main` segue protocolo de hotfix e reconciliação da PR #30.
- PR #30 não pode ser mergeada antes da homologação clínica manual da Founder.
- Ao terminar um bloco, registrar SHA/testes no `SHARED_AUDIT_LOG.md` e fechar o lease.
