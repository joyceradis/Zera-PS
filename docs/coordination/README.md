# Zera PS — Coordination State

Estado operacional multiagente com baixa superfície de conflito.

## Regra

Cada setor escreve somente no seu próprio arquivo de estado. Leases não são mais registrados por múltiplos agentes na mesma tabela Markdown.

- `active/founder.md` — Founder / Produto / Domínio Clínico
- `active/platform-core.md` — ChatGPT / Platform & Core Engineering
- `active/quality-verification.md` — Claude / Quality & Verification Engineering

`docs/architecture/ACTIVE_WORK.md` está **FROZEN** como snapshot histórico/transicional. Não recebe novos leases, checkpoints ou atualizações de estado. PR antiga que ainda o carregue no diff deve descartá-lo no rebase e preservar somente a informação histórica já existente na linha canônica.

`docs/audits/SHARED_AUDIT_LOG.md` também é histórico/transicional para ciclos antigos. Auditorias e checkpoints novos usam **um arquivo por entrada** em `docs/audits/entries/`.

## Protocolo

Antes de escrever:

1. sincronizar a linha canônica;
2. ler os três arquivos de `active/`;
3. confirmar que o owner não está reservado por outro setor;
4. registrar o lease somente no arquivo do próprio setor;
5. executar o bloco;
6. publicar checkpoint/PR;
7. fechar o lease no mesmo arquivo.

Regras adicionais:

- setor vem antes do lease;
- revisão/auditoria pode ocorrer enquanto outro setor escreve, mas não há write concorrente no mesmo owner;
- se Quality encontra RED que exige arquitetura/core, faz handoff em vez de refatorar o owner alheio;
- se a decisão altera fluxo, linguagem ou semântica clínica, retorna à Founder;
- PR #30 permanece sem merge até homologação clínica manual.

A Founder não transporta estado entre agentes.
