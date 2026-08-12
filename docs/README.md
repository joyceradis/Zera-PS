# Documentação técnica — Zera PS

Esta pasta concentra a documentação vigente, evidência de auditoria e histórico de decisões. O `README.md` da raiz permanece a página principal do projeto.

## O que é normativo hoje

Antes de usar planos antigos ou auditorias como referência de implementação, consultar nesta ordem:

1. [`product/PRODUCT_MAP.md`](product/PRODUCT_MAP.md) — **modelo mental canônico do produto e da interface clínica**;
2. [`product/PRODUCT_SCOPE.md`](product/PRODUCT_SCOPE.md) — escopo, limites e proposta;
3. [`product/WORKFLOWS.md`](product/WORKFLOWS.md) — modelo temporal do Atendimento;
4. [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) — responsabilidades técnicas;
5. [`safety/INVARIANTS.md`](safety/INVARIANTS.md) — invariantes que nenhuma implementação pode quebrar.

## Navegação

### Produto

- [`product/PRODUCT_MAP.md`](product/PRODUCT_MAP.md) — Atendimento como entidade central; contexto, microferramentas, reavaliação e destino.
- [`product/PRODUCT_SCOPE.md`](product/PRODUCT_SCOPE.md) — escopo, limites e proposta do produto.
- [`product/WORKFLOWS.md`](product/WORKFLOWS.md) — modelo de Atendimento, etapas temporais e reavaliação.

### Arquitetura

- [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) — visão técnica consolidada e responsabilidades dos módulos.
- [`architecture/PROTOCOL_CONTRACT.md`](architecture/PROTOCOL_CONTRACT.md) — contrato declarativo interno de protocolos/contextos.
- [`architecture/TEMPORAL_WORKFLOW.md`](architecture/TEMPORAL_WORKFLOW.md) — contrato do workflow temporal e estados do Atendimento.

> `protocol`, `workflow`, `template`, `engine` e `registry` são termos técnicos internos. O fato de existirem na arquitetura não exige que apareçam como escolhas concorrentes para a médica.

### Segurança clínica

- [`safety/CLINICAL_SAFETY.md`](safety/CLINICAL_SAFETY.md) — política de segurança clínico-documental.
- [`safety/INVARIANTS.md`](safety/INVARIANTS.md) — invariantes que nenhuma implementação pode violar.

### Verificação

- [`testing/TESTING.md`](testing/TESTING.md) — testes automatizados, regressão manual e gates.

### Auditorias

Auditorias são fotografias de um marco, não especificação vigente.

- [`audits/HOUSEKEEPING_AND_RECOVERY_2026-08-11.md`](audits/HOUSEKEEPING_AND_RECOVERY_2026-08-11.md) — auditoria ativa de housekeeping, arqueologia e convergência do produto.
- [`audits/HOUSEKEEPING_AND_RECOVERY_POST_2026-08-12.md`](audits/HOUSEKEEPING_AND_RECOVERY_POST_2026-08-12.md) — auditoria pós do marco automatizado, limites transitórios e gates ainda pendentes de validação manual.
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
→ product/, architecture/, safety/, testing/

AUDIT
→ audits/

LEGACY REFERENCE
→ history/ ou repositório predecessor explicitamente citado

OBSOLETE / DUPLICATE
→ remover somente após confirmar substituto canônico e ausência de referência necessária
```

Planos e auditorias não ganham autoridade apenas por serem mais longos ou mais recentes. Quando houver conflito, o documento canônico vigente e o comportamento verificado do código prevalecem; conflitos clínicos retornam à Founder para decisão de domínio.

Toda mudança clínico-documental segue:

```text
AUDITORIA PRÉVIA
→ TESTE/CONTRATO
→ ALTERAÇÃO
→ VERIFICAÇÃO
→ AUDITORIA PÓS
```
