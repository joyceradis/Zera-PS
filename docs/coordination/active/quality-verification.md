# Quality / Verification Engineering — Active Work

## Setor
Claude / Quality & Verification Engineering.

## Responsabilidades
Auditoria independente, testes de regressão, invariant coverage, testes adversariais, investigação de bugs, arqueologia complementar, análise de PR, compatibilidade, revisão de segurança, detecção de teste removido/enfraquecido, testes de interação, observabilidade de CI e análise de maturidade.

## Estado atual

- **PR #37: INTEGRADA** por Platform/Core em `a5a5ade`. Gate de invariantes na linha canônica; branch removida. Lease encerrado.
- **PR #38: INTEGRADA** por Platform/Core em `3a23402`; branch removida. `INV-DOC-001` fechado na linha canônica.
- **PR #36:** auditoria de maturidade; PAUSADA em draft por instrução da Founder. Base `3577383`, desatualizada — rebase pendente quando a Founder liberar.
- **PR #33:** fechada por este setor. Apontava para `main` e ficou obsoleta: o mesmo P0 foi resolvido por outro caminho (hotfix `b098235` + PR #34). Verificado na `main` antes de fechar — 0 negativas fabricadas nos roteiros e `defaultDiarrheaHdaState` já corrigido. PR aberta sem trabalho pendente é ruído na memória compartilhada.
- **Gap `INV-DOC-001`: FECHADO.** A propriedade **se sustenta**, não há vazamento; os renderizadores operam por allow-list. Era cobertura ausente, não bug — nenhum handoff de core necessário. 6 vetores adversariais; 2 mutações do document engine confirmadas detectadas.
- **Lease:** nenhum `ACTIVE`. Owner liberado.

- **PR nova:** `audit/inv-clin-003-stage-context-gate` → canônica, rebaseada sobre `087a520`. Fecha a lacuna do `INV-CLIN-003`. Cobertura **10 integral / 0 parcial**; suíte 255/255. Aguarda leitura de Platform/Core.
- **Gap `INV-CLIN-003`: FECHADO.** A propriedade **se sustenta** — disclosure e contexto alteram só visibilidade/disponibilidade. Era cobertura ausente, não bug; nenhum handoff necessário. 160 combinações etapa×contexto exercidas, 8 mutações verificadas. Executado após Platform/Core responder na #39 que o espaço é enumerável e o bloco é deste setor.

### Aberto e rastreado como issue

- **#39** — respondida por Platform/Core: espaço enumerável, bloco de Quality/Verification, sem mudança de workflow/estado. **Executado.** Pronta para fechar quando a PR empilhada for integrada.
- **#40** — limite residual do `INV-GOV-001`. **Endereçada por Platform/Core** em `0ff8396` (step `Guard critical safety sentinels` no CI, que reprova se o registry, o gate ou a âncora sumirem). Falta confirmar se cobre esvaziamento de `integration-static.test.mjs` — hoje nada ancora esse arquivo externamente.
- **github-advanced-security:** do setor; falha por infraestrutura do GitHub (`SessionModelError: 400`), não por código do repositório. Não silenciar. Próximo bloco candidato.

## Restrições

- não refatorar core arquitetural por iniciativa própria;
- não alterar UX/semântica clínica;
- correção localizada é permitida quando provada e sem cruzar owner de Platform/Core;
- toda garantia crítica exige evidência adversarial e segunda leitura.
