# Arquitetura do workflow temporal

## Unidade de trabalho

A unidade central é o **Atendimento**, não um formulário isolado.

```text
ATENDIMENTO
├── context
├── currentStage
├── stageHistory[]
├── admissionSnapshot
├── pendingItems[]
├── results[]
├── reassessments[]
└── documents[]
```

## Etapas

`initial_assessment`, `initial_conduct`, `pending_results`, `reassessment` e `final_documentation` representam momentos diferentes do mesmo atendimento.

## Progressive disclosure

A visibilidade de uma seção resulta de três dimensões:

```text
cenário + etapa + estado/contexto
```

O sistema deve mostrar o mínimo necessário e revelar novos campos quando se tornarem pertinentes.

## Ferramentas clínicas

A semântica é obrigatoriamente independente:

```text
disponível ≠ aplicável ≠ calculável ≠ aplicada/documentada
```

Uma ferramenta pode pertencer ao cenário sem ser pertinente ao caso; pode ser pertinente sem possuir dados suficientes para cálculo; e pode estar calculável sem autorização para integrar o documento clínico. O cálculo determinístico não equivale à decisão médica de aplicar/documentar a ferramenta.

## Estado operacional ≠ conteúdo documental

Pendências, motivos de incompletude, dados faltantes e avisos pertencem ao workspace operacional. Eles não entram automaticamente na evolução ou reavaliação. O document engine recebe apenas conteúdo autorizado para renderização.

## Pendências e resultados

A solicitação é preservada como evento operacional. Quando o resultado chega, o atendimento mantém o pedido e registra o resultado temporalmente em `results[]`.

Resultados seriados são append-only por identidade clínica: troponina inicial e troponina de controle são eventos distintos, com seus próprios horários e valores. Atualizações de interface do mesmo resultado já registrado atualizam o evento ligado àquela pendência em vez de fabricar uma nova coleta.

```text
pedido
→ pending
→ resultado disponível
→ results[]
→ reavaliação
```

A mesma regra é extensível a ECG seriado, sinais vitais, sintomas e outros dados temporais.

## Reavaliação

Cada reavaliação é um evento filho temporal. O snapshot de admissão permanece estável após o início dessa linha temporal. Múltiplas reavaliações podem coexistir sem sobrescrever eventos anteriores.

O documento de reavaliação preserva o contrato institucional definido para o Zera PS, incluindo QP na mesma linha e entre aspas, `# SCORES:` apenas quando houver ferramenta efetivamente aplicada e calculada, `# HDA (ADMISSÃO):` e `... EM TEMPO (REAVALIAÇÃO):`.
