# Zera PS — Coordenação multiagente

Contrato canônico de governança enquanto mais de um agente atua no repositório.

## Princípios

1. GitHub é a fonte única de verdade operacional.
2. A Founder não transporta contexto entre agentes.
3. Agente novo reconstrói o estado a partir da documentação canônica; não pede à Founder que reconte a história técnica.
4. Setor vem antes do lease.
5. CI verde prova que os testes presentes passaram; não prova que invariantes críticos continuam suficientemente protegidos.
6. PR #30 (`chore/housekeeping-product-convergence`) é a linha canônica de convergência. Enquanto a homologação estiver ativa, deve permanecer **OPEN + DRAFT**, apontando para `main`; não pode ser fechada, retargetada, marcada ready-for-review ou mergeada sem decisão explícita de Platform/Core compatível com o gate da Founder. **Merge em `main` exige homologação clínica manual explícita da Founder.**
7. Nenhum agente altera silenciosamente UX clínica, semântica clínica ou comportamento em homologação.
8. PR filha submetida a segunda leitura não pode ser integrada enquanto existir revisão bloqueante pendente. Integração só após comentário do setor revisor contendo `INTEGRATION READY — <HEAD SHA>` para o HEAD revisado.
9. Fechar uma PR canônica não é housekeeping. Estado `closed`/`open`, base branch e draft/ready fazem parte da governança e exigem owner explícito.

## Bootstrap obrigatório de agente novo

Antes de qualquer write:

1. sincronizar `chore/housekeeping-product-convergence`;
2. ler este documento;
3. ler `docs/coordination/active/founder.md`;
4. ler `docs/coordination/active/platform-core.md`;
5. ler `docs/coordination/active/quality-verification.md`;
6. ler `ROADMAP.md`;
7. ler `docs/clinical/INVARIANT_REGISTRY.md`;
8. abrir PR/issue citada na lane do próprio setor;
9. somente então registrar lease no arquivo do próprio setor.

`docs/architecture/ACTIVE_WORK.md` e `docs/audits/SHARED_AUDIT_LOG.md` são históricos/transicionais e não representam estado corrente.

## Divisão operacional

### Joyce — Founder / Produto / Domínio Clínico

Owner de fluxo real do PS, prioridade de produto, UX clínica, linguagem documental, relevância clínica, microfunções úteis, homologação e decisão final em trade-off de domínio.

A Founder não decide branch hygiene, CI/CD, storage, PWA, ownership ou refatoração puramente técnica e não atua como mensageira entre agentes.

**Contrato de evidência da Founder:** observação em linguagem natural é suficiente. `Fiz X → ocorreu Y → eu esperava Z` é dado bruto de produto. A Founder não precisa nomear invariant, teste, módulo ou causa arquitetural.

### ChatGPT — Platform / Core Engineering

Owner de arquitetura canônica, modelagem de estado/proveniência, document engine, workflow/temporalidade, storage/persistência, PWA/offline, integração, CI/CD estrutural/supply chain, segurança técnica, ownership, housekeeping, roadmap/documentação canônica, merge/reconciliação e dívida estrutural.

Pode executar autonomamente mudanças não clínicas, reversíveis e testáveis dentro desse setor. Garantias críticas devem receber segunda leitura independente quando viável.

### Claude — Quality / Verification Engineering

Owner de auditoria independente, testes de regressão, invariant coverage, testes adversariais, investigação/reprodução de bugs, arqueologia complementar, análise de PR, compatibilidade, revisão de segurança, detecção de teste removido/enfraquecido, testes de interação, observabilidade de CI, análise de maturidade e correções técnicas localizadas demonstradas por auditoria que não alterem silenciosamente Core ou domínio.

Se uma lacuna exigir arquitetura, estado, document engine, workflow, storage, PWA ou UX/semântica clínica, Quality registra RED/evidência e faz handoff ao owner correto.

## Interface entre setores

```text
FOUNDER observa uso real
→ relata comportamento/fricção em linguagem natural

QUALITY
→ reproduz e caracteriza
→ converte observação/achado em RED e teste
→ faz regressão/adversarial/mutation testing
→ delimita exatamente o que a evidência prova
→ se exigir Core: handoff
→ se exigir domínio: Founder

PLATFORM/CORE
→ verifica causalidade e composição real entre camadas
→ implementa/reconcilia mudança estrutural
→ impede promoção de cobertura local a garantia sistêmica sem evidência

QUALITY
→ tenta quebrar novamente quando crítico

FOUNDER
→ homologa o comportamento clínico/produto
```

**Regra epistemológica:** quem implementa uma garantia crítica não é seu único validador. Autorrevisão não substitui contraditório técnico. Um teste pode estar correto e ainda sustentar uma conclusão maior do que aquilo que realmente exercitou.

### Handshake de integração

Para PR filha que exige segunda leitura:

```text
AUTOR publica checkpoint + HEAD SHA
→ REVISOR lê diff/evidência
→ se houver gap: comentário BLOCKED + motivo
→ autor corrige/rebaseia e publica novo HEAD
→ revisor confirma o HEAD atual
→ comentário literal: INTEGRATION READY — <HEAD SHA>
→ somente então merge na branch-alvo
```

- `INTEGRATION READY` vale somente para o SHA citado; push/rebase posterior invalida o handshake;
- `CI verde`, `mergeable=true`, lease fechado ou autorrevisão não substituem o handshake;
- `BLOCKED`, `não integrar` ou equivalente mantém a PR sem merge;
- quem integra confere HEAD atual = SHA liberado;
- gate é **processual hoje**: a API do GitHub confirmou `protected:false` e required status enforcement `off` em `main` e na branch da PR #30. O enforcement externo é gap explícito da issue #50 e nunca deve ser presumido.

## Estado operacional sem colisão

Novos leases usam um arquivo por setor:

- `docs/coordination/active/founder.md`
- `docs/coordination/active/platform-core.md`
- `docs/coordination/active/quality-verification.md`

Antes de escrever: sincronizar HEAD; executar bootstrap; confirmar setor/owner; registrar lease apenas na própria lane; executar; publicar checkpoint/PR; fechar lease.

Dois agentes não escrevem simultaneamente no mesmo owner. Enquanto um escreve, outro pode revisar/auditar ou trabalhar em owner ortogonal.

## Auditorias sem colisão

Novas auditorias/checkpoints relevantes usam um arquivo por entrada em `docs/audits/entries/`, convenção `YYYY-MM-DDTHHMMSSZ-<sector>-<slug>.md`. `SHARED_AUDIT_LOG.md` é histórico/transicional.

## Invariantes

Registry canônico: `docs/clinical/INVARIANT_REGISTRY.md`.

Regras mínimas: ausência de confirmação nunca vira afirmação clínica; template não equivale a achado confirmado; contexto/sugestão não equivale a diagnóstico; score incompleto não equivale a zero; disponível ≠ aplicável ≠ calculável ≠ aplicado/documentado; estado operacional não vaza para prontuário; reavaliação não sobrescreve admissão; falha de persistência não equivale a ausência de dado; métrica/informação clínica não pode ser fabricada.

Teste protetor é patrimônio. Remoção/enfraquecimento exige segunda leitura. Coverage declarada distingue integral no escopo mapeado de parcial com gap nomeado.

### Cobertura de composição

Invariant que atravessa múltiplas camadas só pode ser integral quando ao menos um protetor atravessa a composição real:

```text
contexto/progressive disclosure
→ coordenador real
→ estado/formulário entregue ao document engine
→ documento final
```

Calcular `renderPlan` e depois renderizar formulário vazio independente não prova a ponte.

## Branches

```text
main
  ↑
PR #30 — chore/housekeeping-product-convergence [OPEN + DRAFT]
  ↑
PRs filhas por setor
```

Mudanças convergentes entram na PR #30 ou por PR filha apontando para ela. Não criar terceira linha de produto. PR #30 permanece aberta/draft e bloqueada para merge até homologação da Founder.

Hotfix P0 em `main` somente com RED reproduzível → correção mínima → GREEN → segunda leitura quando crítico → merge explícito → reconciliação comprovada com PR #30. Merge em `main` nunca implica herança automática pela PR #30.

## Checkpoint obrigatório

```text
OBJETIVO:
AGENTE/SETOR:
BRANCH:
PR:
BASE:
HEAD SHA:
ARQUIVOS/OWNERS:
TESTES/EVIDÊNCIA:
INVARIANTS:
MERGE: não realizado | PR #N → <base>, SHA ...
PENDÊNCIA DE RECONCILIAÇÃO:
IMPACTO CLÍNICO:
```

A frase `mesclando` sem PR e base explícitos é comunicação inválida.

## Estado ancorado — checkpoint corrente

- PR #30 foi encontrada `closed` sem merge durante auditoria de estado em 13/08; Platform/Core restaurou imediatamente para **OPEN + DRAFT**. Nenhuma causa foi presumida. A nova regra acima impede tratar fechamento/retarget como housekeeping;
- PR #30 segue linha canônica e bloqueada para merge até homologação clínica;
- P0 de negativas clínicas automáticas corrigido/reconciliado;
- justificativa sem fabricação, proteção contra overwrite manual e restore de rascunho já reconciliados;
- lifecycle protocol-agnostic do Atendimento está alcançável; scores estáticos permanecem em Ferramentas; reachability do protocolo dinâmico continua aberta em #44;
- Joyce = Founder/Produto/Domínio; ChatGPT = Platform/Core; Claude = Quality/Verification;
- PR #37 integrada após três leituras: gate invariant→teste;
- PR #38 integrada: proteção adversarial de `INV-DOC-001`;
- PR #41 foi integrada prematuramente durante revisão bloqueante; patrimônio de testes preservado, `INV-CLIN-003` revertido para `PARTIAL`. Estado verdadeiro: **9 integral / 1 parcial**;
- PR #43 está bloqueada até rebase + nova segunda leitura;
- `INV-GOV-001` interno está protegido em camadas; issue #40 fechada no escopo interno. Branch protection externa ausente e rastreada em #50;
- `ACTIVE_WORK.md` congelado; lanes por setor são estado corrente;
- PR #36 draft/pausada; `develop` é somente mina arqueológica;
- branches `fix/pr30-priority-blockers` e `fix/p0-fabricated-negatives` estão classificadas `SAFE TO PRUNE`, aguardando delete-ref seguro;
- gates abertos: reachability do protocolo dinâmico, `INV-CLIN-003`, #46/#48, keyboard-first/fricção, branch protection #50, interação real, PWA/offline real e homologação clínica final.
