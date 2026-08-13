# Zera PS — Coordenação multiagente

Contrato canônico de governança enquanto mais de um agente atua no repositório.

## Princípios

1. GitHub é a fonte única de verdade operacional.
2. A Founder não transporta contexto entre agentes.
3. Setor vem antes do lease.
4. CI verde prova que os testes presentes passaram; não prova que invariantes críticos continuam suficientemente protegidos.
5. PR #30 (`chore/housekeeping-product-convergence`) é a linha canônica de convergência e não pode ser mergeada antes da homologação clínica manual da Founder.
6. Nenhum agente altera silenciosamente UX clínica, semântica clínica ou comportamento em homologação.

## Divisão operacional

### Joyce — Founder / Produto / Domínio Clínico

Owner de:

- fluxo real do pronto-socorro;
- prioridade de produto;
- UX clínica;
- linguagem documental;
- relevância clínica;
- microfunções úteis;
- homologação;
- decisão final em trade-off de domínio.

A Founder não decide branch hygiene, CI/CD, storage, PWA, ownership ou refatoração puramente técnica e não atua como mensageira entre agentes.

### ChatGPT — Platform / Core Engineering

Owner de:

- arquitetura canônica;
- modelagem de estado e proveniência;
- document engine;
- workflow/temporalidade;
- storage/persistência;
- PWA/offline;
- integração entre módulos;
- CI/CD estrutural e supply chain;
- segurança técnica de plataforma;
- ownership;
- housekeeping;
- roadmap e documentação canônica;
- merge/reconciliação;
- dívida técnica estrutural.

Pode executar autonomamente mudanças não clínicas, reversíveis e testáveis dentro desse setor. Garantias críticas devem receber segunda leitura independente quando viável.

### Claude — Quality / Verification Engineering

Owner de:

- auditoria independente;
- testes de regressão;
- invariant coverage;
- testes adversariais;
- investigação/reprodução de bugs;
- arqueologia complementar;
- análise de PR;
- compatibilidade;
- revisão de segurança;
- detecção de teste removido/enfraquecido;
- testes de interação;
- observabilidade de CI;
- análise de maturidade;
- correções técnicas localizadas demonstradas por auditoria, desde que não alterem silenciosamente Core ou domínio.

Se uma lacuna exigir mudança de arquitetura canônica, estado, document engine, workflow, storage, PWA ou UX/semântica clínica, Quality registra o RED/evidência e faz handoff ao owner correto em vez de refatorar o Core por iniciativa própria.

## Interface entre setores

```text
QUALITY encontra bug/gap
→ reproduz e caracteriza
→ fortalece teste/garantia dentro de Quality
→ pode corrigir bug técnico localizado do próprio setor
→ se exigir Core: handoff para Platform/Core
→ se exigir domínio/UX: handoff para Founder

PLATFORM/CORE implementa mudança estrutural
→ Quality faz segunda leitura/adversarial quando crítico

FOUNDER
→ entra somente em decisão real de produto/domínio/homologação
```

Autorrevisão não substitui segunda leitura quando a mudança toca segurança clínica, estado, documento, microfunções ou garantias críticas.

## Estado operacional sem colisão

Novos leases usam **um arquivo por setor**, evitando múltiplos agentes editarem a mesma tabela:

- `docs/coordination/active/founder.md`
- `docs/coordination/active/platform-core.md`
- `docs/coordination/active/quality-verification.md`

`docs/architecture/ACTIVE_WORK.md` está **FROZEN / HISTÓRICO**. Não registrar novos leases, checkpoints ou estado corrente nele. PR antiga que ainda o carregue no diff deve descartar esse write no rebase e usar a lane do próprio setor.

Antes de escrever:

1. sincronizar o HEAD da linha-alvo;
2. ler os três arquivos de estado em `docs/coordination/active/`;
3. confirmar setor e owner;
4. registrar lease somente no arquivo do próprio setor;
5. executar;
6. publicar PR/checkpoint;
7. fechar o lease no mesmo arquivo.

Dois agentes não escrevem simultaneamente no mesmo owner. Enquanto um escreve, o outro pode auditar/revisar ou trabalhar em owner ortogonal.

## Auditorias sem colisão

`docs/audits/SHARED_AUDIT_LOG.md` é **histórico/transicional**, não arquivo de write concorrente.

Novas auditorias/checkpoints relevantes usam um arquivo por entrada em:

`docs/audits/entries/`

Convenção:

```text
YYYY-MM-DDTHHMMSSZ-<sector>-<slug>.md
```

Isso elimina disputa por contador `AUD-*` e conflito por ponto único de inserção. Platform/Core pode atualizar/recompor o índice em lote depois, sem bloquear Quality.

## Invariantes

Registry canônico: `docs/clinical/INVARIANT_REGISTRY.md`.

Regras mínimas:

- ausência de confirmação nunca vira afirmação clínica;
- template não equivale a achado confirmado;
- contexto/sugestão não equivale a diagnóstico;
- score incompleto não equivale a zero;
- disponível ≠ aplicável ≠ calculável ≠ aplicado/documentado;
- estado operacional não vaza para prontuário;
- reavaliação não sobrescreve admissão;
- falha de persistência não equivale a ausência de dado;
- métrica/informação clínica não pode ser fabricada.

Teste protetor de invariant é patrimônio. Remoção/enfraquecimento exige segunda leitura explícita. Coverage declarada deve distinguir cobertura integral no escopo mapeado de cobertura parcial com gap nomeado; não usar suíte verde como prova absoluta.

### Regra adicional para cobertura de composição

Um invariant que atravessa múltiplas camadas só pode ser classificado como cobertura integral quando ao menos um protetor atravessa a **composição real** entre essas camadas. Testes isolados de duas pontas não provam automaticamente a ponte entre elas.

Exemplo:

```text
contexto/progressive disclosure
→ coordenador real
→ estado/formulário entregue ao document engine
→ documento final
```

Calcular um `renderPlan` e depois renderizar um formulário vazio independente não prova que o contexto não possa contaminar a projeção documental em um glue intermediário.

## Branches

### Convergência

```text
main
  ↑
PR #30 — chore/housekeeping-product-convergence
  ↑
PRs filhas por setor
```

- mudanças do produto convergente entram diretamente na PR #30 ou por PR filha apontando para ela;
- não criar terceira linha de produto;
- PR #30 permanece bloqueada até homologação da Founder.

### Hotfix P0

Hotfix em `main` só quando risco real não puder aguardar:

```text
RED reproduzível
→ correção mínima
→ GREEN
→ segunda leitura quando crítico
→ merge explícito PR #N → main
→ reconciliação comprovada com PR #30
```

Merge em `main` nunca implica que PR #30 herdou a correção.

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

## Estado ancorado — 2026-08-13

- PR #30 aberta/draft, linha canônica e bloqueada para merge até homologação clínica.
- P0 de negativas clínicas automáticas corrigido/reconciliado; o incidente demonstrou que teste verde não basta.
- divisão vigente: Joyce = Founder/Produto/Domínio; ChatGPT = Platform/Core; Claude = Quality/Verification.
- PR #37: gate de invariantes revisado em três ciclos e integrado à PR #30 em `a5a5ade`.
- PR #38: proteção adversarial de `INV-DOC-001` integrada à PR #30 em `3a23402`; estado operacional → documento segue allow-list no escopo testado.
- PR #41: Quality propôs fechar `INV-CLIN-003`; segunda leitura de Platform/Core bloqueou integração porque os vetores calculavam stage/context/plan, mas a chamada documental usava `renderEvolution(emptyForm(), {})` sem atravessar a ponte real contexto → documento. Deve permanecer `PARTIAL` até existir protetor da composição real ou handoff arquitetural.
- issue #40 / `INV-GOV-001`: guard externo de CI implementado em `checks.yml` antes da suíte; presença + fiação mínima dos sentinelas são verificadas. Branch protection externa não foi confirmada pela integração e não deve ser presumida.
- `ACTIVE_WORK.md` congelado; coordenação vigente usa lanes por setor.
- PR #36: auditoria de maturidade, draft/pausada por instrução da Founder.
- `develop`: somente mina arqueológica, não linha de implementação.
- gates ainda abertos: `INV-CLIN-003`, keyboard-first, remoção de fricções concorrentes, testes de interação real, PWA/offline real e homologação clínica.
