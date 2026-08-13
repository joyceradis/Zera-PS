# Zera PS — Coordination State

Estado operacional multiagente com baixa superfície de conflito.

## Bootstrap obrigatório de agente novo

Nenhum agente deve começar perguntando à Founder “onde paramos?”. O GitHub é a fonte única de verdade operacional.

Ordem mínima de leitura:

1. `docs/architecture/AGENT_COORDINATION.md` — contrato de governança e fronteiras;
2. `docs/coordination/active/founder.md`;
3. `docs/coordination/active/platform-core.md`;
4. `docs/coordination/active/quality-verification.md`;
5. `ROADMAP.md` — estado executivo, prioridades e gate da PR #30;
6. `docs/clinical/INVARIANT_REGISTRY.md` — propriedades críticas;
7. PR/issue citada pela própria lane do setor, quando houver.

Só depois dessa leitura o agente escolhe trabalho e registra lease no arquivo do próprio setor.

## Regra

Cada setor escreve somente no seu próprio arquivo de estado. Leases não são mais registrados por múltiplos agentes na mesma tabela Markdown.

- `active/founder.md` — Founder / Produto / Domínio Clínico
- `active/platform-core.md` — ChatGPT / Platform & Core Engineering
- `active/quality-verification.md` — Claude / Quality & Verification Engineering

`docs/architecture/ACTIVE_WORK.md` está **FROZEN** como snapshot histórico/transicional. Não recebe novos leases, checkpoints ou atualizações de estado. PR antiga que ainda o carregue no diff deve descartá-lo no rebase e preservar somente a informação histórica já existente na linha canônica.

`docs/audits/SHARED_AUDIT_LOG.md` também é histórico/transicional para ciclos antigos. Auditorias e checkpoints novos usam **um arquivo por entrada** em `docs/audits/entries/`.

## Protocolo

Antes de escrever:

1. sincronizar a linha canônica `chore/housekeeping-product-convergence` / PR #30;
2. executar o bootstrap acima;
3. confirmar setor e que o owner não está reservado por outro setor;
4. registrar o lease somente no arquivo do próprio setor;
5. executar o bloco;
6. publicar checkpoint/PR;
7. fechar o lease no mesmo arquivo.

Regras adicionais:

- setor vem antes do lease;
- revisão/auditoria pode ocorrer enquanto outro setor escreve, mas não há write concorrente no mesmo owner;
- se Quality encontra RED que exige arquitetura/core, faz handoff em vez de refatorar o owner alheio;
- se a decisão altera fluxo, linguagem ou semântica clínica, retorna à Founder;
- a observação clínica da Founder pode ser fornecida em linguagem natural; Quality e Platform/Core fazem a tradução para reprodução, invariant, teste e arquitetura;
- quem implementa garantia crítica não deve ser seu único validador;
- CI verde prova somente que os testes presentes passaram;
- PR filha sujeita a segunda leitura só fica pronta para integração após handshake explícito `INTEGRATION READY — <HEAD SHA>` do setor revisor;
- PR #30 permanece sem merge até homologação clínica manual.

## Estado resumido atual

- PR #30 = linha canônica, draft, bloqueada para merge em `main`;
- cobertura declarada = **9 invariants integrais / 1 parcial (`INV-CLIN-003`)**;
- PR #41 gerou patrimônio útil, mas sua alegação de cobertura integral foi rebaixada porque não atravessava a composição real contexto → estado/formulário → document engine;
- `INV-GOV-001` possui guard externo de sentinelas antes da suíte, com segunda leitura/adversarial ainda como disciplina permanente;
- Founder segue em homologação clínica;
- Platform/Core segue em integração, CI/PWA/arquitetura/housekeeping;
- Quality/Verification segue em garantias, adversarial testing, interação e observabilidade;
- trabalho aberto relevante: `INV-CLIN-003`, keyboard-first/fricção, interação real, PWA/offline real e homologação da PR #30.

A Founder não transporta estado entre agentes.
