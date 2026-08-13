# Quality / Verification Engineering — Active Work

## Setor
Claude / Quality & Verification Engineering.

## Responsabilidades
Auditoria independente, testes de regressão, invariant coverage, testes adversariais, investigação de bugs, arqueologia complementar, análise de PR, compatibilidade, revisão de segurança, detecção de teste removido/enfraquecido, testes de interação, observabilidade de CI e análise de maturidade.

## Estado atual

- **PR #37: INTEGRADA** por Platform/Core em `a5a5ade`. Gate de invariantes na linha canônica; branch removida. Lease encerrado.
- **PR #38:** `audit/inv-doc-001-gap-test`, draft. **Rebaseada sobre `a5a5ade`**, sem conflito. Suíte 244/244; cobertura **9 integral / 1 parcial**. Diff sobre a canônica: 3 arquivos (teste novo, reclassificação, registro append-only). Aguarda leitura de Platform/Core.
- **PR #36:** auditoria de maturidade; PAUSADA em draft por instrução da Founder. Base `3577383`, desatualizada — rebase pendente quando a Founder liberar.
- **PR #33:** fechada por este setor. Apontava para `main` e ficou obsoleta: o mesmo P0 foi resolvido por outro caminho (hotfix `b098235` + PR #34). Verificado na `main` antes de fechar — 0 negativas fabricadas nos roteiros e `defaultDiarrheaHdaState` já corrigido. PR aberta sem trabalho pendente é ruído na memória compartilhada.
- **Gap `INV-DOC-001`: FECHADO.** A propriedade **se sustenta**, não há vazamento; os renderizadores operam por allow-list. Era cobertura ausente, não bug — nenhum handoff de core necessário. 6 vetores adversariais; 2 mutações do document engine confirmadas detectadas.
- **Lease:** nenhum `ACTIVE`. Owner liberado.

### Aberto e rastreado como issue

- **#39** — `INV-CLIN-003`, único `PARTIAL` restante. **Bloqueado por decisão anterior ao teste:** o espaço etapa×contexto é enumerável por teste, ou fechar exige mudança de workflow/estado? A resposta define o setor dono do bloco. Pergunta feita a Platform/Core na própria issue.
- **#40** — limite residual do `INV-GOV-001`: a suíte não protege contra a própria remoção. 4 opções de CI/CD listadas; decisão de Platform/Core.
- **github-advanced-security:** do setor; falha por infraestrutura do GitHub (`SessionModelError: 400`), não por código do repositório. Não silenciar. Próximo bloco candidato após #38.

## Restrições

- não refatorar core arquitetural por iniciativa própria;
- não alterar UX/semântica clínica;
- correção localizada é permitida quando provada e sem cruzar owner de Platform/Core;
- toda garantia crítica exige evidência adversarial e segunda leitura.
