# Zera PS — Active Work

Fonte canônica para evitar colisão de escrita entre agentes.

Antes de alterar owner compartilhado, sincronize a branch-alvo e registre um lease aqui. Ao concluir, publique checkpoint e marque CLOSED.

## Leases ativos

| Agente | Branch / PR | Owner / arquivos | Objetivo | SHA inicial | Status | Founder necessária? |
| --- | --- | --- | --- | --- | --- | --- |
| Founder | PR #30 | superfície clínica | Homologação clínica manual e relatório de domínio | — | ACTIVE | — |
| Lead Engineering | `chore/housekeeping-product-convergence` / #30 | governança multiagente, documentação canônica e reconciliação | Consolidar shared audit log, invariant registry e coordenação; sem alterar comportamento clínico em homologação | `f588a05` | ACTIVE | não |
| Auditor independente | declarar antes do próximo write | declarar owner | Auditoria/correção técnica conforme escopo | sincronizar antes do write | AVAILABLE | somente se cruzar domínio |

## Regras rápidas

- `ACTIVE` no mesmo owner bloqueia write concorrente; o outro agente pode revisar/auditar.
- `AVAILABLE` não reserva owner.
- Mudança de owner exige atualizar esta tabela.
- P0 urgente na `main` segue protocolo de hotfix e reconciliação da PR #30.
- PR #30 não pode ser mergeada antes da homologação clínica manual da Founder.
- Ao terminar um bloco, registrar SHA/testes no `SHARED_AUDIT_LOG.md` e fechar o lease.
