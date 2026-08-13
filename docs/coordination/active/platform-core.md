# Platform / Core Engineering — Active Work

## Setor
ChatGPT / Platform & Core Engineering.

## Responsabilidades
Arquitetura canônica, modelagem de estado, document engine, workflow/temporalidade, storage/persistência, PWA/offline, integração entre módulos, CI/CD, segurança técnica, ownership, housekeeping, roadmap/documentação canônica, merge/reconciliação e dívida técnica estrutural.

## Estado atual

- **Linha:** `chore/housekeeping-product-convergence` / PR #30.
- **Owner ativo:** CI/CD estrutural + documentação canônica + integração de PRs filhas.
- **Objetivo atual:** manter a linha canônica estável sem alterar UX/semântica clínica em homologação; reduzir superfície de colisão multiagente; fechar garantias técnicas de CI e reconciliar PRs filhas de Quality.
- **Status:** ACTIVE.

### Checkpoints

- divisão operacional formalizada por setor;
- novos leases migrados para `docs/coordination/active/<setor>.md`;
- novas auditorias migradas para entradas append-only em `docs/audits/entries/`;
- PR #37 revisada em três ciclos e integrada à PR #30 em `a5a5ade` — PR #30 não foi mergeada em `main`;
- PR #38 sob revisão; Quality rebaseou uma vez após #37 e deve manter diff restrito a testes + lane + entrada append-only;
- PRs obsoletas #33 e #35 fechadas; #36 permanece pausada/draft;
- divergência `main` ↔ PR #30 registrada sem merge cego;
- issue #39 classificada como próximo bloco de Quality: espaço declarativo stage×context é enumerável por teste; qualquer RED que exija Core vira handoff;
- issue #40 classificada como Platform/Core: `checks` agora verifica sentinelas críticos antes de `npm run verify`; segunda leitura adversarial por Quality ainda pendente;
- descrição da PR #30 atualizada para remover baseline/test-count obsoleto e refletir cache `zera-ps-v15` + governança atual.

## Restrições

- não escrever em owner declarado ACTIVE pelo setor Quality / Verification;
- não alterar UX/semântica clínica sem decisão da Founder;
- não mergear PR #30 antes da homologação;
- mudanças puramente técnicas devem ser reversíveis, testáveis e auditadas;
- nenhuma suíte verde será tratada como prova absoluta de maturidade.
