# Documentação técnica — Zera PS

Esta pasta concentra documentação vigente, evidência de auditoria e histórico de decisões. O `README.md` da raiz permanece a página principal do projeto.

## O que é normativo hoje

Antes de usar planos antigos ou auditorias como referência de implementação, consultar nesta ordem:

1. [`product/PRODUCT_MAP.md`](product/PRODUCT_MAP.md) — **modelo mental canônico do produto e da interface clínica**;
2. [`product/PRODUCT_SCOPE.md`](product/PRODUCT_SCOPE.md) — escopo, limites e proposta;
3. [`product/WORKFLOWS.md`](product/WORKFLOWS.md) — modelo temporal do Atendimento;
4. [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) — responsabilidades técnicas;
5. [`architecture/OWNERSHIP.md`](architecture/OWNERSHIP.md) — owner semântico de cada responsabilidade e limites da migração `assets/` → `src/`;
6. [`architecture/AGENT_COORDINATION.md`](architecture/AGENT_COORDINATION.md) — divisão operacional Founder / Platform-Core / Quality-Verification e protocolo de integração;
7. [`safety/INVARIANTS.md`](safety/INVARIANTS.md) — doutrina ampla de invariantes que nenhuma implementação pode quebrar;
8. [`clinical/INVARIANT_REGISTRY.md`](clinical/INVARIANT_REGISTRY.md) — subset crítico rastreado mecanicamente pelo gate de testes.

## Navegação

### Produto

- [`product/PRODUCT_MAP.md`](product/PRODUCT_MAP.md) — Atendimento como entidade central; contexto, microferramentas, reavaliação e destino.
- [`product/PRODUCT_SCOPE.md`](product/PRODUCT_SCOPE.md) — escopo, limites e proposta do produto.
- [`product/WORKFLOWS.md`](product/WORKFLOWS.md) — modelo de Atendimento, etapas temporais e reavaliação.

### Arquitetura

- [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) — visão técnica consolidada e responsabilidades dos módulos.
- [`architecture/OWNERSHIP.md`](architecture/OWNERSHIP.md) — ownership canônico, wrappers transitórios e ordem de consolidação arquitetural.
- [`architecture/AGENT_COORDINATION.md`](architecture/AGENT_COORDINATION.md) — coordenação multiagente e fronteiras de setor.
- [`coordination/README.md`](coordination/README.md) — protocolo operacional de estado/leases por setor.
- [`coordination/active/`](coordination/active/) — estado atual separado de Founder, Platform/Core e Quality/Verification.
- [`architecture/PROTOCOL_CONTRACT.md`](architecture/PROTOCOL_CONTRACT.md) — contrato declarativo interno de protocolos/contextos.
- [`architecture/TEMPORAL_WORKFLOW.md`](architecture/TEMPORAL_WORKFLOW.md) — contrato do workflow temporal e estados do Atendimento.

> `protocol`, `workflow`, `template`, `engine` e `registry` são termos técnicos internos. O fato de existirem na arquitetura não exige que apareçam como escolhas concorrentes para a médica.

### Segurança clínica

- [`safety/CLINICAL_SAFETY.md`](safety/CLINICAL_SAFETY.md) — política de segurança clínico-documental.
- [`safety/INVARIANTS.md`](safety/INVARIANTS.md) — doutrina ampla de invariantes.
- [`clinical/INVARIANT_REGISTRY.md`](clinical/INVARIANT_REGISTRY.md) — registry crítico usado pelo gate `tests/invariant-coverage.test.mjs`.

A existência do registry não revoga invariantes doutrinários que ainda não foram promovidos ao gate executável. Coverage `FULL` significa integral **no escopo mapeado**, não prova absoluta sobre qualquer estado imaginável.

### Verificação

- [`testing/TESTING.md`](testing/TESTING.md) — testes automatizados, regressão manual e gates.

### Auditorias

Auditorias são fotografias de um marco, não especificação vigente.

Novas auditorias/checkpoints multiagente usam **um arquivo por entrada** em [`audits/entries/`](audits/entries/), evitando colisão em ledger único. `audits/SHARED_AUDIT_LOG.md` permanece histórico/transicional para ciclos iniciados antes dessa migração.

- [`audits/HOUSEKEEPING_AND_RECOVERY_2026-08-11.md`](audits/HOUSEKEEPING_AND_RECOVERY_2026-08-11.md) — auditoria ativa de housekeeping, arqueologia e convergência do produto.
- [`audits/HOUSEKEEPING_AND_RECOVERY_POST_2026-08-12.md`](audits/HOUSEKEEPING_AND_RECOVERY_POST_2026-08-12.md) — auditoria pós do marco automatizado, limites transitórios e gates ainda pendentes de validação manual.
- [`audits/ENGINEERING_HARDENING_2026-08-12.md`](audits/ENGINEERING_HARDENING_2026-08-12.md) — hardening não clínico: namespace de cache PWA, fechamento do APP_SHELL sobre imports, dívida técnica e gates restantes.
- [`audits/TECHNICAL_DEBT_REGISTER_2026-08-12.md`](audits/TECHNICAL_DEBT_REGISTER_2026-08-12.md) — registro ativo de dívida técnica por risco, owner, estado e gate de redução.
- [`audits/CAPABILITY_INVENTORY_2026-08-12.md`](audits/CAPABILITY_INVENTORY_2026-08-12.md) — inventário real de superfícies, macrofunções, scores, persistência, PWA e patrimônio, com matriz de classificação.
- [`audits/UI_SURFACE_INVENTORY_2026-08-12.md`](audits/UI_SURFACE_INVENTORY_2026-08-12.md) — telas, campos, botões, ações e views transitórias da superfície clínica atual.
- [`audits/MICROFUNCTION_RECOVERY_LEDGER_2026-08-12.md`](audits/MICROFUNCTION_RECOVERY_LEDGER_2026-08-12.md) — microfunções atuais, recuperadas, candidatas, inseguras e ainda não localizadas.
- [`audits/BRANCH_ARCHAEOLOGY_2026-08-12.md`](audits/BRANCH_ARCHAEOLOGY_2026-08-12.md) — arqueologia e classificação original das branches.
- [`audits/BRANCH_PRUNE_2026-08-12.md`](audits/BRANCH_PRUNE_2026-08-12.md) — fechamento histórico da grande poda inicial; novas branches transitórias posteriores são tratadas separadamente.
- [`audits/LEGACY_MINING_2026-08-12.md`](audits/LEGACY_MINING_2026-08-12.md) — mineração consolidada de `develop`/v0.2: multi-Encounter, retomada, autosave, destino, microfunções recuperadas e comportamentos bloqueados.
- [`audits/DOCUMENT_CLASSIFICATION_2026-08-12.md`](audits/DOCUMENT_CLASSIFICATION_2026-08-12.md) — classificação canonical/audit/legacy/obsolete/duplicate e regras de preservação.
- [`audits/METRICS_ARCHAEOLOGY_2026-08-12.md`](audits/METRICS_ARCHAEOLOGY_2026-08-12.md) — separa placeholders históricos, feedback do atendimento corrente e o gráfico longitudinal ainda não localizado.
- [`audits/baseline/AUDIT_BASELINE.md`](audits/baseline/AUDIT_BASELINE.md) — baseline anterior à fundação de segurança.
- [`audits/clinical-safety/AUDIT_POST_REFACTOR.md`](audits/clinical-safety/AUDIT_POST_REFACTOR.md) — checklist pós-refatoração clínica.
- [`audits/clinical-safety/AUDIT_RESULT.md`](audits/clinical-safety/AUDIT_RESULT.md) — evidência da fundação automatizada.
- [`audits/clinical-safety/AUDIT_INTEGRAL_HDA_OUTPUT_2026-08-09.md`](audits/clinical-safety/AUDIT_INTEGRAL_HDA_OUTPUT_2026-08-09.md) — recuperação da HDA integral.
- [`audits/temporal-workflow/AUDIT_TEMPORAL_WORKFLOW_BASELINE.md`](audits/temporal-workflow/AUDIT_TEMPORAL_WORKFLOW_BASELINE.md) — baseline anterior ao workflow temporal.
- [`audits/temporal-workflow/AUDIT_TEMPORAL_WORKFLOW_POST.md`](audits/temporal-workflow/AUDIT_TEMPORAL_WORKFLOW_POST.md) — auditoria do workflow temporal.
- [`audits/repository/`](audits/repository/) — auditorias de organização e governança do repositório.

### Histórico de planejamento

- [`history/`](history/README.md) — planos/specs anteriores. **Não são normativos.**

### Marcos

- [`../CHANGELOG.md`](../CHANGELOG.md) — marcos relevantes do projeto.

## Regra de manutenção documental

```text
CANONICAL
→ product/, architecture/, coordination/, safety/, clinical/, testing/

AUDIT
→ audits/entries/ + auditorias históricas em audits/

LEGACY REFERENCE
→ history/ ou repositório predecessor explicitamente citado

OBSOLETE / DUPLICATE
→ remover somente após confirmar substituto canônico e ausência de referência necessária
```

Planos e auditorias não ganham autoridade apenas por serem mais longos ou mais recentes. Quando houver conflito, o documento canônico vigente e o comportamento verificado do código prevalecem; conflitos clínicos retornam à Founder para decisão de domínio.

Toda mudança clinicamente relevante segue:

```text
AUDITORIA PRÉVIA
→ TESTE/CONTRATO
→ ALTERAÇÃO
→ VERIFICAÇÃO
→ AUDITORIA PÓS
```
