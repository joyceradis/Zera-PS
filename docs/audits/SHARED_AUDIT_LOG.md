# Zera PS — Shared Audit Log

Índice canônico de auditorias e reconciliações multiagente. O objetivo é permitir que Founder, Lead Engineering e auditor independente trabalhem sobre o mesmo estado sem retransmissão manual.

## Como registrar

Cada entrada relevante deve conter:

- data;
- agente;
- branch / PR / base / SHA;
- escopo;
- achado e severidade;
- evidência reproduzível;
- ação tomada ou proposta;
- invariants afetados;
- status: `OPEN`, `IN REVIEW`, `RECONCILED`, `CLOSED`;
- necessidade de decisão da Founder.

Auditorias extensas podem ter arquivo próprio em `docs/audits/`; este log aponta para elas.

## Estado compartilhado — 2026-08-13

### AUD-2026-08-13-001 — Negativas clínicas pré-escritas

- **Origem:** auditoria independente.
- **Severidade:** P0.
- **Achado:** cinco roteiros legados continham negativas clínicas não confirmadas; a proteção automatizada correspondente havia sido removida junto da regressão.
- **Evidência:** execução real do compositor/template reproduziu `NEGA ...` sem confirmação.
- **Invariant:** `INV-CLIN-001`, `INV-GOV-001`.
- **Ação:** hotfixes na `main`; reconciliação exigida e mantida na PR #30; registry permanente criado.
- **Status:** `RECONCILED` para comportamento conhecido; garantia efetiva permanece gate contínuo.
- **Founder:** não necessária para remover fabricação clínica; necessária para qualquer mudança de semântica/UX além do invariant.

### AUD-2026-08-13-002 — Colisão multiagente no mesmo P0

- **Origem:** auditoria independente + revisão de Engineering.
- **Severidade:** processo / lacuna real.
- **Achado:** duas sessões corrigiram partes do mesmo bug em paralelo sem estado compartilhado, produzindo retrabalho e janela de correção parcial.
- **Ação:** `ACTIVE_WORK.md`, write leases, checkpoints explícitos, shared audit log e proibição de merge ambíguo.
- **Invariant:** `INV-GOV-001`.
- **Status:** `IN REVIEW` até o fluxo ser usado por ambos os agentes em trabalho real.
- **Founder:** não.

### AUD-2026-08-13-003 — Maturidade não pode ser inferida da suíte verde

- **Origem:** relatório de maturidade do auditor independente.
- **Achado:** desenho de segurança é mais maduro que sua garantia efetiva; keyboard-first ainda é doutrina, há `confirm()` nativos, caminhos/seletores concorrentes, ausência de testes automatizados de interação real e revisão automática externa indisponível.
- **Ação:** corrigir status do roadmap; priorizar garantia demonstrável e fricção operacional antes de expansão clínica.
- **Status:** `OPEN` para reconciliação completa com PR #30 e homologação da Founder.
- **Founder:** sim somente para classificar fricção clínica/UX; não para lacunas técnicas objetivas.

### AUD-2026-08-13-005 — `INV-GOV-001` convertido de regra escrita em gate executável

- **Origem:** auditor independente (Claude).
- **Severidade:** lacuna real de garantia (não é bug de comportamento).
- **Branch / PR / base / SHA:** `audit/invariant-coverage-gate` → PR filha da #30; base `3577383`.
- **Achado:** o registry declarava 10 invariantes críticos, mas **nenhum teste da suíte referenciava qualquer invariante por id**. A ligação "invariante → teste que o protege" existia apenas em prosa. Foi exatamente por isso que a proteção de `INV-CLIN-001` pôde ser apagada junto com a regressão que ela impedia (`AUD-2026-08-13-001`) sem que 158 testes verdes acusassem nada.
- **Evidência:** `grep -rl "INV-" tests/` retornava zero ocorrências no SHA `3577383`.
- **Ação:** `tests/invariant-coverage.test.mjs` — lê o registry como fonte de verdade e falha quando (a) um invariante declarado não tem protetor mapeado, (b) um arquivo de teste protetor desaparece, (c) um teste protetor é removido ou renomeado, (d) o mapeamento aponta para invariante que o registry não declara mais.
- **Verificação adversarial:** os quatro modos de falha foram reproduzidos em cópia isolada do repositório e **todos reprovaram corretamente**, incluindo a reprodução literal do P0 real (renomear `legacy syndrome templates never prewrite clinical negatives`). Um gate que só passa não é gate; este foi verificado falhando.
- **Cobertura resultante:** 10/10 invariantes do registry com protetor rastreável. 26 testes protetores mapeados.
- **Invariants:** implementa `INV-GOV-001`. Nenhum invariante alterado; nenhuma semântica clínica tocada.
- **Owner:** `tests/invariant-coverage.test.mjs` apenas. `INVARIANT_REGISTRY.md` foi **lido, não modificado** — pertence ao owner `documentação canônica`, `ACTIVE` com Lead Engineering. O mapeamento vive dentro do teste por essa razão.
- **Testes:** `npm run verify` — 234/234, 0 falhas (231 anteriores + 3 do gate).
- **Status:** `IN REVIEW` por Lead Engineering (PR #37, draft). Implementação concluída e lease `CLOSED`; nenhum merge antes da segunda leitura.
- **Founder:** não necessária. Zero alteração de semântica clínica ou UX em homologação. A Founder já delegou esta revisão diretamente a Lead Engineering.

### AUD-2026-08-13-006 — Colisão entre as duas PRs do auditor no próprio ledger de coordenação

- **Origem:** auditor independente (Claude), autodetectado antes de qualquer merge.
- **Severidade:** processo. Sem impacto clínico, sem impacto em runtime.
- **Achado:** as PRs #36 e #37 do auditor foram criadas independentemente a partir de `3577383` e ambas escrevem em `SHARED_AUDIT_LOG.md` e `ACTIVE_WORK.md` no mesmo ponto de inserção. Isso produziu (a) **ID duplicado** — ambas emitiram `AUD-2026-08-13-004` para auditorias diferentes — e (b) **conflito textual de merge** nos dois arquivos de coordenação.
- **Evidência:** merge simulado em clone isolado, na ordem #36 → #37:

  ```text
  CONFLICT (content): Merge conflict in docs/architecture/ACTIVE_WORK.md
  CONFLICT (content): Merge conflict in docs/audits/SHARED_AUDIT_LOG.md
  ```

- **Causa:** o ledger compartilhado é um arquivo Markdown único com ponto de inserção fixo. Dois blocos concorrentes do **mesmo** agente colidem nele exatamente como dois agentes distintos colidiriam. Isto é a materialização da `INTERPRETAÇÃO 6.2` do relatório de maturidade (`AUD-2026-08-13-004`), que previu esse modo de falha antes de ele ocorrer.
- **Ação tomada:** ID renumerado para `AUD-2026-08-13-005` nesta branch, eliminando a duplicação. O conflito textual **permanece** e é esperado.
- **Resolução para quem integrar (receita determinística):** o conflito é puramente aditivo — nenhuma linha escrita por outro agente é alterada por nenhuma das duas PRs. Ao mesclar a segunda, aceitar **ambos os lados** (`git checkout --theirs`/`--ours` não serve; manter os dois blocos). Ordem recomendada: #36 antes de #37, preservando a numeração cronológica 004 → 005. Nenhuma informação se perde em qualquer ordem.
- **Invariants:** `INV-GOV-001` (governança). Nenhum invariante clínico afetado.
- **Status:** `OPEN` — resolução mecânica pendente no ato do merge; não bloqueia a segunda leitura da PR #37.
- **Founder:** não.
- **Proposta para Lead Engineering (não implementada):** enquanto o ledger for um Markdown único, esse conflito reaparecerá a cada dois blocos concorrentes. Um formato append-only por arquivo (`docs/audits/entries/AUD-*.md` indexados) eliminaria a classe inteira. Decisão é do owner de `documentação canônica`; não a executei por não ser meu owner.

### Ponto para segunda leitura de Lead Engineering

O critério de inclusão que adotei foi: *um teste só é listado como protetor se falhar quando a propriedade do invariante for violada*. Testes que apenas exercitam o módulo relacionado, sem asserção sobre a propriedade, foram deixados de fora deliberadamente. Esse julgamento é meu e é o ponto mais contestável desta entrega — se algum mapeamento estiver frouxo, o gate passa a dar falsa segurança, que é precisamente o problema que ele existe para eliminar.

Se Lead Engineering preferir que o mapeamento viva no próprio `INVARIANT_REGISTRY.md` (owner dele) em vez de dentro do teste, a migração é mecânica e não altera o comportamento do gate.

## Próximas entradas esperadas

1. auditor independente publica/referencia seu relatório de maturidade completo;
2. Lead Engineering reconcilia achados contra a PR #30, não apenas contra `main`;
3. Founder conclui relatório de homologação clínica;
4. backlog da PR #30 é reclassificado por P0/P1/P2/P3 e por `clínico / UX / técnico / bug / dívida`;
5. novo preview somente após reconciliação e testes.
