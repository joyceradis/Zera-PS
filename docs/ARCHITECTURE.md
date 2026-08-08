# Arquitetura do Zera PS

## Princípio central

O Zera PS transforma dados clínicos em documentação, mas não pode aumentar o grau de certeza, alterar a polaridade ou fabricar um fato ausente.

```text
ação médica
→ dado clínico
→ estado + proveniência
→ regra de transformação
→ saída documental
→ revisão médica
```

## Invariantes

1. Campo vazio não equivale a negativa.
2. Não informado não equivale a não investigado.
3. Template não equivale a exame realizado até confirmação explícita.
4. Sugestão ou roteiro não equivale a achado, diagnóstico ou conduta realizada.
5. Score incompleto não equivale a zero.
6. Texto gerado não equivale a texto validado.
7. Dados migrados de versões antigas não ganham confirmação clínica durante a migração.

## Módulos

### `assets/data.js`
Somente dados e configurações declarativas: modelo de exame normal, escolhas rápidas e mapeamentos de campo.

### `assets/clinical-state.js`
Modelo semântico para estado, proveniência e confirmação dos dados clínicos.

### `assets/document-engine.js`
Transformação determinística de dados confirmados em texto. Não acessa DOM nem armazenamento.

### `assets/scores.js`
Definições, estado e cálculo de scores. O resultado só existe após todas as variáveis obrigatórias serem respondidas.

### `assets/storage.js`
Persistência local versionada e migração. Migração preserva dados legados sem presumir confirmação clínica.

### `assets/ui.js`
Renderização de componentes e utilidades de interação com o DOM.

### `assets/app.js`
Coordenação do fluxo: conecta UI, estado clínico, documentos, scores e armazenamento.

## Modelo de campo clínico

```js
{
  value: null,
  state: 'not_informed',
  source: null,
  confirmed: false,
  confirmedAt: null
}
```

Estados atualmente suportados:

- `not_informed`
- `not_investigated`
- `denied`
- `present`
- `absent`
- `not_applicable`
- `template_confirmed`

Fontes atualmente suportadas:

- `patient`
- `physician_observation`
- `physician_action`
- `medical_record`
- `exam_result`
- `other`

## Exame físico normal

O modelo normal permanece como recurso operacional. O clique em **Usar modelo de exame normal** registra uma ação médica explícita, preenche os achados e mantém todos os campos editáveis. O template possui identidade e timestamp de confirmação.

## HPP

O comando **Confirmar NEGA em HPP** registra uma ação explícita. Um campo vazio nunca é convertido automaticamente em `NEGA`.

## Templates sindrômicos

Templates fornecem estrutura e prompts. Não devem conter negativas clínicas pré-confirmadas. Ferramentas clínicas relacionadas podem ser vinculadas como metadado, mas não geram conclusão automática.

## Scores

Todo score começa assim:

```js
{
  status: 'incomplete',
  score: null,
  interpretation: null,
  answers: { ...null }
}
```

A interpretação só é produzida quando todas as variáveis obrigatórias possuem resposta explícita.

## Persistência

A versão atual usa `localStorage` com schema v2. Chaves anteriores v1 são lidas para migração, mas seus campos clínicos não são automaticamente marcados como confirmados.
