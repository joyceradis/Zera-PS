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
disponível ≠ aplicável ≠ calculável
```

Uma ferramenta pode pertencer ao cenário sem ser pertinente ao caso; pode ser pertinente sem possuir dados suficientes para cálculo.

## Pendências e resultados

Resultados solicitados podem permanecer `pending` e posteriormente mudar para `available` sem reescrever o estado histórico da admissão.

## Reavaliação

Cada reavaliação é um evento filho temporal. O snapshot de admissão permanece estável após o início dessa linha temporal. Múltiplas reavaliações podem coexistir sem sobrescrever eventos anteriores.