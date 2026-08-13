# Zera PS — Active Work

> **FROZEN / HISTÓRICO — NÃO REGISTRAR NOVOS LEASES AQUI.**
>
> A coordenação vigente foi migrada para lanes por setor em `docs/coordination/active/` para eliminar colisões de escrita entre agentes. Este arquivo preserva o histórico dos ciclos anteriores e permanece apenas para rastreabilidade de PRs/commits antigos.
>
> Estado atual:
> - Founder → `docs/coordination/active/founder.md`
> - Platform/Core → `docs/coordination/active/platform-core.md`
> - Quality/Verification → `docs/coordination/active/quality-verification.md`
> - auditorias/checkpoints novos → `docs/audits/entries/`

## Histórico do ledger anterior

| Agente | Branch / PR | Owner / arquivos | Objetivo | SHA inicial | Status | Founder necessária? |
| --- | --- | --- | --- | --- | --- | --- |
| Founder | PR #30 | superfície clínica | Homologação clínica manual e relatório de domínio | — | ACTIVE no momento da migração | — |
| Lead Engineering | `chore/housekeeping-product-convergence` / #30 | governança multiagente, documentação canônica e reconciliação | Consolidar shared audit log, invariant registry e coordenação; sem alterar comportamento clínico em homologação | `f588a05` | migrado para lane Platform/Core | não |
| Auditor independente (Claude) | `audit/invariant-coverage-gate` / PR #37 | `tests/invariant-coverage.test.mjs` + `tests/integration-static.test.mjs` | Endereçar fragilidades do gate de invariantes | `7936afc` | CLOSED / integrada | não |
| Auditor independente (Claude) | `audit/maturity-report-publication` / PR #36 | documentação de auditoria | Publicar auditoria independente de maturidade | `3577383` | PAUSADA (draft) | não |

### Incidente que motivou a migração

PRs concorrentes passaram a editar esta mesma tabela e `docs/audits/SHARED_AUDIT_LOG.md`, produzindo conflito textual em arquivos cuja finalidade era justamente coordenar trabalho concorrente. A resolução adotada foi estrutural:

```text
um arquivo compartilhado de leases
→ substituído por
um arquivo de estado por setor

um ledger compartilhado de auditorias
→ substituído por
uma entrada append-only por checkpoint
```

Assim, agentes distintos podem atualizar seu próprio estado sem disputar o mesmo ponto de inserção.

## Regras vigentes

- **não escrever novos leases neste arquivo**;
- setor vem antes do lease;
- cada setor escreve somente em `docs/coordination/active/<setor>.md`;
- auditorias/checkpoints novos usam arquivo próprio em `docs/audits/entries/`;
- owner ativo de outro setor bloqueia write concorrente; revisão/auditoria continua permitida;
- P0 urgente na `main` segue protocolo de hotfix + reconciliação da PR #30;
- PR #30 não pode ser mergeada antes da homologação clínica manual da Founder.

Para o protocolo atual, consultar `docs/architecture/AGENT_COORDINATION.md` e `docs/coordination/README.md`.
