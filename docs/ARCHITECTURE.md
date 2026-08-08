# Arquitetura do Zera PS

## 1. Princípio central

O Zera PS transforma dados clínicos confirmados em documentação revisável. A transformação não pode aumentar certeza, alterar polaridade ou fabricar fato clínico.

```text
ação médica
→ dado clínico
→ estado + proveniência
→ cenário + etapa temporal
→ regra de transformação
→ saída documental
→ revisão médica
```

## 2. Invariantes

1. Campo vazio não equivale a negativa.
2. Não informado não equivale a não investigado.
3. Template não equivale a exame realizado até confirmação explícita.
4. Sugestão/roteiro não equivale a achado, diagnóstico ou conduta.
5. Score incompleto não equivale a zero.
6. Ferramenta disponível não equivale a aplicável.
7. Ferramenta aplicável não equivale a calculável.
8. Reavaliação não sobrescreve a admissão.
9. Resultado novo não modifica retrospectivamente o estado anterior.
10. Migração não fabrica confirmação clínica.
11. Texto gerado não equivale a texto validado.

## 3. Camadas

```text
protocols/*.js
      ↓
workflow-engine.js
      ↓
encounter + clinical state
      ↓
score-engine.js / tools
      ↓
document-engine.js
      ↓
ui.js / temporal-ui.js
```

### Configuração clínica — `protocols/`

Declara campos, seções, etapas, regras de visibilidade e ferramentas relacionadas. Não acessa DOM, não persiste dados e não executa conduta.

`protocols/sca.js` é o cenário de referência.

### Workflow — `src/workflow-engine.js`

Motor genérico responsável por:

- criação do Atendimento;
- etapa temporal;
- histórico de etapas;
- contexto do workflow;
- pendências;
- disponibilização de resultados;
- criação de reavaliações;
- progressive disclosure por etapa + contexto;
- proteção do snapshot de admissão após início das reavaliações.

O motor não contém regra clínica específica de SCA.

### Ferramentas — `src/score-engine.js`

Mantém estados independentes:

```text
availability
applicability
calculability
```

Além de:

- `missingVariables`;
- `message`;
- `score`;
- `interpretation`;
- `status`.

Cálculo só ocorre quando a ferramenta é aplicável e todos os dados obrigatórios estão disponíveis.

### Estado clínico — `assets/clinical-state.js`

Continua sendo a fonte para valor, estado, proveniência e confirmação de campos clínicos estruturados.

```js
{
  value: null,
  state: 'not_informed',
  source: null,
  confirmed: false,
  confirmedAt: null
}
```

### Documento — `src/document-engine.js`

Complementa o motor documental estável e é responsável por:

- bloco `# SCORES:`;
- reavaliação temporal;
- QP inline entre aspas na reavaliação;
- HDA da admissão;
- `EM TEMPO (REAVALIAÇÃO)`;
- carry-forward controlado;
- exclusão da conduta antiga do carry-forward.

Não acessa DOM ou armazenamento.

### Persistência — `src/storage.js`

Mantém Atendimento temporal em chave independente v3:

```text
zera-ps:encounter:v3
```

O núcleo anterior permanece em v2. A separação é intencional para evitar migração prematura e reinterpretação de dados já salvos.

### UI temporal — `src/temporal-ui.js`

Faz a ponte entre o DOM atual e os motores genéricos. Responsável por:

- selecionar cenário;
- revelar campos condicionais;
- persistir/restaurar contexto temporal;
- apresentar pendências;
- apresentar estado do HEART;
- criar reavaliação;
- injetar score calculado na evolução;
- gerar reavaliação temporal.

Conhecimento específico de UI do cenário de referência ainda existe nesta camada e deve migrar gradualmente para renderer declarativo antes da multiplicação de cenários.

## 4. Atendimento temporal

Schema conceitual v3:

```js
{
  schemaVersion: 3,
  encounterId,
  workflowId,
  currentStage,
  startedAt,
  context: {},
  admissionSnapshot: {},
  stageHistory: [],
  pendingItems: [],
  reassessments: [],
  documents: []
}
```

### Etapas

```text
initial_assessment
→ initial_conduct
→ pending_results
→ reassessment
→ final_documentation
```

A transição é explícita e registrada no histórico.

### Snapshot da admissão

Enquanto nenhuma reavaliação existe, a evolução de admissão pode ser regenerada e o snapshot pode ser atualizado. Isso é necessário porque o documento da admissão permanece em construção durante o atendimento inicial.

Depois da primeira reavaliação:

```text
admissionSnapshot = protegido
```

A reavaliação passa a referenciar esse snapshot histórico.

### Contexto

O contexto do workflow é persistido separadamente de `pendingItems`. Exemplo:

```js
{
  suspectedAcs: true,
  ecgStatus: 'pending',
  ecgResult: '',
  troponinStatus: 'pending',
  troponinValue: '',
  troponinRatio: null,
  heartHistory: 1,
  heartEcg: 0,
  heartAge: 52,
  heartRisk: 1
}
```

Reload deve recuperar o contexto sem converter ausência de dado em resposta clínica.

## 5. Pendências e resultados

Um item pode existir como:

```text
pending
→ available
```

O resultado disponibilizado é associado ao mesmo item e não sobrescreve o snapshot de admissão.

Exemplo:

```js
{
  id: 'troponin_1',
  kind: 'lab',
  label: 'Troponina',
  status: 'available',
  result: {
    value: '...',
    ratio: 0.8,
    availableAt: '...'
  }
}
```

## 6. Progressive disclosure

Visibilidade é função de:

```text
protocol + stage + context
```

Não apenas de um campo isolado.

Exemplo SCA:

```text
sem suspeita de SCA
→ apresentação + contexto

suspeita presente na avaliação inicial
→ ECG + troponina + risco cardiovascular

pending_results
→ campos ligados aos resultados pendentes
```

## 7. HEART como referência do modelo de ferramentas

```text
cenário SCA
→ available

suspeita clínica
→ applicable

History + ECG + idade + fatores de risco + troponina
→ calculable
```

Se faltar troponina:

```text
score = null
calculability = not_calculable
missingVariables = ['troponinRatio']
```

A UI explica a pendência; o documento não recebe score incompleto.

## 8. Documento de reavaliação

Contrato protegido:

```text
## REAVALIAÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##

# QP: "DOR TORÁCICA"

# SCORES:
- HEART: ...

# HDA (ADMISSÃO): ...

... EM TEMPO (REAVALIAÇÃO): ...

[SEÇÕES CLÍNICAS CARREGADAS CONFORME REGRA]

# CONDUTA:
- ...
```

`# SCORES:` é condicional. A conduta antiga não é reaproveitada como conduta atual.

## 9. Compatibilidade e migração da casa

A arquitetura está migrando incrementalmente de `assets/` para `src/`.

```text
app.js (raiz)
→ src/app.js
   ├── assets/app.js        # núcleo estável/microfunções
   └── src/temporal-ui.js   # camada temporal
```

Wrappers em `src/` reexportam módulos estáveis enquanto a migração ocorre. Essa estratégia reduz risco de regressão e evita reescrever funções clínicas já validadas apenas por estética arquitetural.

## 10. Microfunções protegidas

Qualquer refatoração deve preservar:

- NEGA em HPP apenas por intenção explícita;
- edição posterior de HPP;
- template de exame normal confirmado;
- edição posterior do exame;
- quick choices;
- roteiros sem fatos clínicos pré-confirmados;
- autosave e rascunhos;
- clipboard com fallback;
- internação e alta;
- navegação;
- feedback de ações;
- edição livre;
- scores incompletos sem resultado;
- PWA/offline.

## 11. Verificação arquitetural

O gate automatizado deve verificar:

- sintaxe dos módulos;
- invariantes clínico-documentais;
- estados de ferramentas;
- temporalidade do Atendimento;
- imutabilidade da admissão após reavaliação;
- persistência de contexto;
- contrato textual da reavaliação;
- referências DOM;
- app shell PWA.

O gate automatizado não substitui regressão manual no navegador nem validação cognitiva da UX clínica.
