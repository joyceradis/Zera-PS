# Segurança clínica do Zera PS

## Escopo

O Zera PS é ferramenta de apoio à documentação. A avaliação clínica, a decisão terapêutica e a validação do registro permanecem sob responsabilidade do médico.

## Invariante de fidelidade

Nenhuma transformação documental pode:

- aumentar o grau de certeza do dado de origem;
- inverter ou presumir polaridade;
- converter ausência de dado em achado;
- converter sugestão em decisão realizada.

## Invariante de não fabricação

Ausência de informação não gera conteúdo clínico.

Exemplos proibidos:

```text
campo vazio → NEGA
sem resposta no score → 0
select não tocado → Glasgow 15
template selecionado → achado examinado sem confirmação
roteiro sindrômico → negativa clínica automática
```

## Ações explícitas

Ações de atalho são permitidas quando representam intenção médica clara.

### Confirmar NEGA em HPP

O clique confirma negativas para os campos abrangidos. A ação deve atualizar estado, fonte e timestamp.

### Usar modelo de exame normal

O clique confirma o uso do template como representação do exame realizado. Os achados permanecem editáveis e alterações subsequentes passam a representar observação médica explícita.

## Scores

Scores não são decisões clínicas. Devem permanecer `incomplete` até que todas as variáveis obrigatórias sejam respondidas. Uma pontuação completa pode ser exibida com interpretação, mas não deve determinar automaticamente alta, internação ou tratamento.

## Templates e ferramentas clínicas

Template é estrutura de documentação. Checklist é instrumento de revisão. Score é cálculo. Regra clínica é outra categoria. Essas entidades não devem ser tratadas como sinônimos.

## Migração

Dados legados podem ser preservados, mas a migração técnica não autoriza inferir que um dado foi perguntado, observado ou confirmado. Por isso, estado clínico legado inicia sem confirmação até nova ação médica.
