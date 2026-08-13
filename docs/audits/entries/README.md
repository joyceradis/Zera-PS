# Audit entries — append-only

Novas auditorias/checkpoints relevantes devem ser publicadas como **um arquivo por entrada**, evitando dois agentes escreverem simultaneamente no mesmo `SHARED_AUDIT_LOG.md`.

## Convenção de nome

Prefira identificador sem contador global sujeito a corrida:

```text
YYYY-MM-DDTHHMMSSZ-<sector>-<slug>.md
```

Exemplos:

```text
2026-08-13T011500Z-quality-invariant-doc-gap.md
2026-08-13T012000Z-platform-pr37-integration.md
```

O identificador do arquivo é único por timestamp UTC + setor + slug. Não reservar números `AUD-...` concorrentes.

## Conteúdo mínimo

```text
AGENTE/SETOR:
BRANCH/PR/BASE/SHA:
ESCOPO:
ACHADO:
SEVERIDADE:
EVIDÊNCIA:
AÇÃO:
INVARIANTS:
STATUS:
FOUNDER NECESSÁRIA: sim/não
```

## Índice

`docs/audits/SHARED_AUDIT_LOG.md` permanece como índice histórico, mas **não é mais o canal de write concorrente**. Novas entradas são criadas aqui; o índice pode ser recomposto/atualizado por Platform/Core em lote, sem bloquear trabalho de Quality.

PRs #36/#37 são anteriores a esta regra e serão reconciliadas preservando seus registros.
