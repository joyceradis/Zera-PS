# Workflows clínico-documentais

O Zera PS representa o atendimento como processo temporal. O workflow não depende apenas de campos condicionais; ele também depende da etapa do atendimento e do que ocorreu desde a avaliação anterior.

## Etapas

```text
initial_assessment
→ initial_conduct
→ pending_results
→ reassessment
→ final_documentation
```

## Exemplo de referência — dor torácica / suspeita de SCA

```text
avaliação inicial
→ conduta inicial
→ ECG/troponina/parecer pendentes
→ resultados disponíveis
→ reavaliação
→ HEART quando aplicável e calculável
→ nova conduta/destino
```

## Reavaliação

`Reavaliar atendimento` cria novo evento temporal no mesmo Atendimento. A admissão não é sobrescrita.

Contrato documental atual:

```text
## REAVALIAÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##

# QP: "DOR TORÁCICA"

# SCORES:
- HEART: ...

# HDA (ADMISSÃO): [HDA ORIGINAL OU CONTEXTO RESUMIDO]

... EM TEMPO (REAVALIAÇÃO): ...

[CONTINUIDADE DAS SEÇÕES CLÍNICAS]

# CONDUTA:
- ...
```

Regras protegidas: QP permanece inline e entre aspas; `# SCORES:` só aparece quando houver ferramenta aplicada e calculada; HDA da admissão é preservada; `EM TEMPO (REAVALIAÇÃO)` representa o delta temporal; conduta antiga não é reapresentada como conduta atual.
