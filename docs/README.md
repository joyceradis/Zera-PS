# Documentação técnica — Zera PS

Esta pasta concentra a documentação de produto, arquitetura, segurança, testes e auditorias históricas. O `README.md` da raiz permanece a página principal do projeto; os detalhes técnicos ficam aqui.

## Navegação

### Produto

- [`product/PRODUCT_SCOPE.md`](product/PRODUCT_SCOPE.md) — escopo, limites e proposta do produto.
- [`product/WORKFLOWS.md`](product/WORKFLOWS.md) — modelo de Atendimento, etapas temporais e reavaliação.

### Arquitetura

- [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) — visão técnica consolidada e responsabilidades dos módulos.
- [`architecture/PROTOCOL_CONTRACT.md`](architecture/PROTOCOL_CONTRACT.md) — contrato declarativo de protocolos clínicos e como adicionar um novo cenário.
- [`architecture/TEMPORAL_WORKFLOW.md`](architecture/TEMPORAL_WORKFLOW.md) — contrato do workflow temporal e estados do Atendimento.

### Segurança clínica

- [`safety/CLINICAL_SAFETY.md`](safety/CLINICAL_SAFETY.md) — política de segurança clínico-documental.
- [`safety/INVARIANTS.md`](safety/INVARIANTS.md) — invariantes que nenhuma implementação pode violar.

### Verificação

- [`testing/TESTING.md`](testing/TESTING.md) — testes automatizados, regressão manual e gates.

### Auditorias

- [`audits/baseline/AUDIT_BASELINE.md`](audits/baseline/AUDIT_BASELINE.md) — baseline anterior à fundação de segurança.
- [`audits/clinical-safety/AUDIT_POST_REFACTOR.md`](audits/clinical-safety/AUDIT_POST_REFACTOR.md) — checklist pós-refatoração clínica.
- [`audits/clinical-safety/AUDIT_RESULT.md`](audits/clinical-safety/AUDIT_RESULT.md) — evidência da fundação automatizada.
- [`audits/temporal-workflow/AUDIT_TEMPORAL_WORKFLOW_POST.md`](audits/temporal-workflow/AUDIT_TEMPORAL_WORKFLOW_POST.md) — auditoria do workflow temporal.
- [`audits/repository/`](audits/repository/) — auditorias de organização e governança do repositório.

## Regra de manutenção

Documentação normativa deve permanecer separada de evidência histórica. Arquivos de auditoria registram o estado de um marco específico e não devem ser usados como especificação vigente quando houver documento técnico mais recente.

Qualquer mudança clínica ou documental segue:

```text
AUDITORIA PRÉVIA
→ TESTE/CONTRATO
→ ALTERAÇÃO
→ VERIFICAÇÃO
→ AUDITORIA PÓS
```