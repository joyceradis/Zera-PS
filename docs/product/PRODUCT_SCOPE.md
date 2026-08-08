# Escopo do produto

## Definição

O Zera PS é uma ferramenta offline-first de apoio à documentação clínica no pronto-socorro. Seu objetivo é reduzir atrito entre avaliação, reavaliação e registro por meio de estrutura contextual, campos condicionais, ferramentas clínicas e geração de texto revisável.

## Proposta operacional

> **Escolha o cenário. Preencha o essencial. O Zera organiza o fluxo clínico-documental e gera o registro.**

O sistema trabalha com contexto e tempo:

```text
cenário
→ etapa do atendimento
→ dados confirmados
→ pendências/resultados
→ ferramentas clínicas pertinentes
→ documento revisável
```

## Escopo atual

- evolução estruturada;
- reavaliação temporal vinculada ao mesmo Atendimento;
- solicitação de internação e alta já existentes;
- HPP com negativa apenas por ação explícita;
- modelo de exame físico normal confirmado por ação médica;
- roteiros sindrômicos sem fatos clínicos pré-confirmados;
- CRB-65, CURB-65, qSOFA e Glasgow sem resultado inicial implícito;
- cenário de referência para dor torácica / suspeita de SCA;
- HEART com disponibilidade, aplicabilidade e calculabilidade independentes;
- pendências de ECG e troponina no Atendimento temporal;
- autosave, rascunhos locais e PWA offline-first.

## Limites

O Zera PS não diagnostica, prescreve, determina alta/internação, fabrica negativa, transforma template em exame realizado sem confirmação, calcula score incompleto, garante autorização de exame ou substitui o prontuário institucional.

## Estado de maturidade

O projeto permanece um MVP em validação. CI e regressão automatizada não equivalem a homologação assistencial. A regressão manual em navegador e a validação cognitiva do fluxo real são gates independentes.