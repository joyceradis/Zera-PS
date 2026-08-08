# Auditoria pós-refatoração — checklist

Este documento registra o checklist histórico da fundação de segurança clínica. Não substitui testes nem regressão manual.

## Segurança clínico-documental

- [ ] Campo HPP vazio não gera `NEGA`.
- [ ] `Confirmar NEGA em HPP` registra ação explícita.
- [ ] Campo HPP manual gera apenas o valor informado.
- [ ] `Usar modelo de exame normal` registra template confirmado e mantém edição livre.
- [ ] Exame físico não confirmado é omitido.
- [ ] Templates sindrômicos não contêm negativas pré-confirmadas.
- [ ] Campo de exames vazio é omitido, não transformado em `NA`.
- [ ] Texto gerado permanece editável.

## Scores

- [ ] CRB-65, CURB-65, qSOFA e Glasgow iniciam incompletos.
- [ ] Resultado só aparece com todas as variáveis obrigatórias respondidas.
- [ ] Alterar resposta recalcula o resultado.

## Persistência e PWA

- [ ] Autosave v2 preserva formulário e estado clínico.
- [ ] Migração v1 não fabrica confirmação.
- [ ] App shell contém os módulos necessários.
- [ ] Navegação offline cai em `app.html` sem mascarar falha de recurso estático.

## Gate histórico

Merge proibido diante de teste falhando, regressão P0 conhecida, fabricação de fato clínico ou divergência material entre documentação e implementação.