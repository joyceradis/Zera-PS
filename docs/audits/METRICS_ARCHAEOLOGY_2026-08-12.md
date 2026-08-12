# Zera PS — Arqueologia de métricas e dashboards

Data: 2026-08-12
Status: investigação aberta

## Pergunta

Separar patrimônio funcional real de elementos visuais históricos para evitar dois erros opostos:

1. apagar uma métrica útil por parecer decoração;
2. recuperar um número cenográfico como se fosse indicador confiável.

## Linhagem A — `develop/prototype-novo-atendimento.html`

O protótipo contém indicadores de produtividade e volume na superfície:

- `2,4 atendimentos/h`;
- `1 ATENDIMENTO`;
- `0 altas · 0 reavaliações`.

No artefato localizado esses valores são hardcoded. Não há, naquele arquivo, cadeia confiável `evento → persistência → agregação → indicador` que justifique tratá-los como métricas reais.

Classificação: `LEGACY-REFERENCE / UI PLACEHOLDER`.

Decisão: não transplantar valores; preservar o conceito de feedback operacional apenas como hipótese de produto.

## Linhagem B — predecessor HMS, PR #1

Foi localizada uma segunda família de métricas no predecessor `drajoyceradis/HMS-Dra-Joyce-Radis`, PR #1, merge commit `45b0f9ad62d4b25f418156033990cd333f4009b1`.

A PR adicionou um painel executivo com três indicadores calculados sobre o atendimento corrente:

- `mCrit` — contagem de critérios críticos marcados;
- `mAudit` — completude documental;
- `mDestino` — destino sugerido.

A própria descrição da PR registra `updateQuality` para calcular completude e pendências, além de checklist de gravidade e racional auditável.

Essa família **não é um dashboard longitudinal**. É feedback transacional do atendimento aberto.

Classificação:

| Item | Classe | Motivo |
| --- | --- | --- |
| contagem de critérios críticos | `MINE / ASSESS` | pode reduzir omissão, mas depende do contrato clínico de cada contexto |
| completude documental | `MINE / ASSESS` | conceito potencialmente útil; não confundir completude de campos com qualidade clínica |
| destino sugerido | `DO NOT TRANSPLANT` | sugestão automática de destino cruza decisão clínica e não deve ser recuperada sem metodologia explícita e validação própria |

Nenhum desses três componentes será inserido no Zera PS durante o housekeeping atual.

## Linhagem C — gráfico mensal referido pela Founder

Até esta rodada não foi localizado um artefato que satisfaça simultaneamente:

```text
visualização mensal
+ dados persistidos
+ agregação temporal verificável
+ origem dos eventos definida
```

Buscas foram realizadas na árvore atual, `develop`, predecessor HMS, Acelerador e histórico de PRs/commits por termos associados a dashboard, gráfico, métricas, produtividade e atendimentos.

Status: `UNRESOLVED HERITAGE`.

Regra: ausência de localização **não autoriza exclusão conceitual** nem reconstrução por memória.

## Critério para eventual recuperação

Uma métrica só poderá voltar ao produto se responder às quatro perguntas:

1. Qual evento clínico/operacional a alimenta?
2. Onde o evento é persistido e com qual semântica?
3. Qual fórmula/agregação transforma eventos em indicador?
4. Que decisão do usuário melhora ao ver esse indicador?

Sem essas respostas, o componente é visualização sem proveniência.

## Resultado desta etapa

A arqueologia já distingue três coisas que anteriormente podiam parecer o mesmo “dashboard”:

```text
protótipo hardcoded de produtividade
≠ feedback calculado do atendimento corrente
≠ dashboard longitudinal/mensal
```

Isso reduz o risco de apagar patrimônio e, simultaneamente, evita promover protótipos antigos a requisitos canônicos sem evidência.
