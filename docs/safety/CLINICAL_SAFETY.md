# Segurança clínica do Zera PS

## Escopo

O Zera PS é ferramenta de apoio à documentação. Avaliação clínica, decisão terapêutica e validação do registro permanecem sob responsabilidade médica.

## Invariante de fidelidade

Nenhuma transformação documental pode aumentar o grau de certeza do dado de origem, inverter ou presumir polaridade, converter ausência de dado em achado ou converter sugestão em decisão realizada.

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

Atalhos são permitidos quando representam intenção médica clara. `Confirmar NEGA em HPP` e `Usar modelo de exame normal` são ações explícitas e devem manter os campos posteriormente editáveis.

## Scores e ferramentas

Score não é decisão clínica. Ferramenta disponível não é automaticamente aplicável; ferramenta aplicável não é automaticamente calculável. Pontuação e interpretação só existem quando o instrumento possui os dados necessários.

## Migração

Migração técnica pode preservar dado legado, mas nunca atribuir retrospectivamente confirmação, observação ou investigação que não estejam demonstradas.

Veja também [`INVARIANTS.md`](INVARIANTS.md).