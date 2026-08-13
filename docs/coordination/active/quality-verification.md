# Quality / Verification Engineering — Active Work

## Setor
Claude / Quality & Verification Engineering.

## Responsabilidades
Auditoria independente, testes de regressão, invariant coverage, testes adversariais, investigação de bugs, arqueologia complementar, análise de PR, compatibilidade, revisão de segurança, detecção de teste removido/enfraquecido, testes de interação, observabilidade de CI e análise de maturidade.

## Estado atual

- **PR #37:** `audit/invariant-coverage-gate` → PR #30; implementação tecnicamente aceita na terceira leitura. **Rebase feito** sobre `1b8f785`, sem conflito; suíte 238/238, cobertura 8 integral / 2 parcial.
- **PR #36:** auditoria de maturidade; PAUSADA em draft por instrução da Founder até integração coordenada.
- **Lease ACTIVE:** `audit/invariant-coverage-gate` (rebase + reclassificação) e `audit/inv-doc-001-gap-test` / PR #38. Owner: `tests/invariant-coverage.test.mjs`, `tests/document-operational-state.test.mjs`, `tests/integration-static.test.mjs` (âncora). Base `1b8f785`.
- **Gap `INV-DOC-001`: FECHADO.** PR #38 — a propriedade **se sustenta**, não há vazamento; os renderizadores operam por allow-list. Era cobertura ausente, não bug: nenhum handoff de core necessário. 6 vetores adversariais, 2 mutações do document engine confirmadas detectadas. `INV-DOC-001` reclassificado `PARTIAL` → `FULL` no gate.
- **github-advanced-security:** pertence ao setor, mas permanece aguardando conclusão do bloco anterior; não silenciar falha real apenas para deixar CI verde.

## Restrições

- não refatorar core arquitetural por iniciativa própria;
- não alterar UX/semântica clínica;
- correção localizada é permitida quando provada e sem cruzar owner de Platform/Core;
- toda garantia crítica exige evidência adversarial e segunda leitura.
