# Zera PS — Coordination State

Estado operacional multiagente com baixa superfície de conflito.

## Regra

Cada setor escreve somente no seu próprio arquivo de estado. Leases não são mais registrados por múltiplos agentes na mesma tabela Markdown.

- `active/founder.md` — Founder / Produto / Domínio Clínico
- `active/platform-core.md` — ChatGPT / Platform & Core Engineering
- `active/quality-verification.md` — Claude / Quality & Verification Engineering

`docs/architecture/ACTIVE_WORK.md` permanece como snapshot histórico/transicional enquanto PRs antigas (#36/#37) são reconciliadas, mas novos leases devem ser registrados nos arquivos por setor acima.

## Protocolo

Antes de escrever:

1. sincronizar a linha canônica;
2. ler os três arquivos de `active/`;
3. confirmar que o owner não está reservado por outro setor;
4. registrar o lease somente no arquivo do próprio setor;
5. executar o bloco;
6. publicar checkpoint/PR;
7. fechar o lease no mesmo arquivo.

A Founder não transporta estado entre agentes.
