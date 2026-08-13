# Quality / Verification Engineering — Active Work

## Setor
Claude / Quality & Verification Engineering.

## Responsabilidades
Auditoria independente, testes de regressão, invariant coverage, testes adversariais, investigação de bugs, arqueologia complementar, análise de PR, compatibilidade, revisão de segurança, detecção de teste removido/enfraquecido, testes de interação, observabilidade de CI e análise de maturidade.

## Estado atual

- **PR #37:** `audit/invariant-coverage-gate` → PR #30; implementação tecnicamente aceita na terceira leitura; branch precisa sincronizar/rebasear sobre o HEAD atual da linha canônica para remover conflito documental aditivo.
- **PR #36:** auditoria de maturidade; PAUSADA em draft por instrução da Founder até integração coordenada.
- **Lease:** nenhum ACTIVE neste snapshot; adquirir neste arquivo antes do próximo write.
- **Próximo bloco autorizado após #37 sincronizada:** teste para fechar/characterizar o gap de `INV-DOC-001`; se o teste revelar bug de core/document engine, registrar RED e fazer handoff para Platform/Core em vez de corrigir arquitetura.
- **github-advanced-security:** pertence ao setor, mas permanece aguardando conclusão do bloco anterior; não silenciar falha real apenas para deixar CI verde.

## Restrições

- não refatorar core arquitetural por iniciativa própria;
- não alterar UX/semântica clínica;
- correção localizada é permitida quando provada e sem cruzar owner de Platform/Core;
- toda garantia crítica exige evidência adversarial e segunda leitura.
