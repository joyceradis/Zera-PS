# Contrato de protocolos clínicos

Um protocolo declara **o que é específico do domínio clínico**. Os motores permanecem genéricos: eles interpretam a declaração, não conhecem o cenário.

```text
protocols/<cenario>.js      → configuração declarativa
src/protocol-schema.js      → contrato + validador determinístico
src/protocol-registry.js    → ponto único de registro/resolução
src/protocol-engine.js      → derivações puras (plano de render, variáveis, pendências)
src/protocol-renderer.js    → renderização declarativa no DOM
```

Um protocolo **não** executa diagnóstico, conduta, DOM ou decisão clínica. Configuração inválida falha explicitamente no registro — não produz interface parcialmente quebrada.

## Estrutura

```js
{
  id: 'sca',                       // minúsculas, iniciado por letra, único no registry
  version: '2.0.0',                // MAJOR.MINOR.PATCH
  label: 'DOR TORÁCICA / SUSPEITA DE SCA',   // texto exibido ao usuário
  stages: [...],                   // subconjunto das etapas do workflow temporal
  fields: [...],
  sections: [...],
  tools: [...],                    // opcional
  temporalResults: [...]           // opcional
}
```

### Campos (`fields[]`)

| Chave | Obrigatória | Descrição |
| --- | --- | --- |
| `id` | sim | identificador do campo; também é a chave no `context` persistido |
| `type` | sim | `text`, `textarea`, `number`, `select`, `boolean` |
| `label` | sim | rótulo acessível |
| `source` | não | `protocol` (padrão) ou `evolution_form` |
| `domId` | externo | id do elemento; obrigatório para `evolution_form` |
| `options` | select | lista `{ value, label }` |
| `default` | não | valor inicial; ausência não vira valor |
| `coerce` | não | `number` para selects numéricos |
| `width` | não | `half` (padrão) ou `full` |
| `rows`, `placeholder`, `help`, `min`, `max`, `step` | não | apresentação |
| `visibleWhen` | não | regra `{ field, equals }` |

Campos `evolution_form` são **referências** a campos já pertencentes ao formulário de evolução (QP, HDA, conduta). O protocolo os declara para documentar a relação, mas não os renderiza nem os lê para o contexto operacional — conteúdo documental não é copiado para o estado de workflow.

### Seções (`sections[]`)

| Chave | Obrigatória | Descrição |
| --- | --- | --- |
| `id` | sim | único no protocolo |
| `fields` | sim | lista de ids de campos (pode ser vazia) |
| `stage` / `stages` | não | etapas em que a seção é pertinente; ausência = todas |
| `visibleWhen` | não | regra `{ field, equals }` sobre o contexto |
| `layout` | não | `stack` (padrão) ou `two-columns` |
| `kicker`, `title` | não | cabeçalho da subseção |
| `tool` | não | id da ferramenta apresentada na seção |

Uma seção cujos campos sejam todos `evolution_form` e que não apresente ferramenta não gera DOM.

**Regra de disclosure:** progressive disclosure revela, não esconde. Uma seção deve declarar todas as etapas em que permanece pertinente; caso contrário ela desaparece quando o Atendimento avança, ainda que já contenha dado preenchido pela médica.

### Ferramentas (`tools[]`)

```js
{
  id, label, type,
  availability: 'available',
  applicableWhen: { field, equals },
  variables: { <nomeDaVariável>: { field, availableWhen? } },
  requiredVariables: [...],
  missingMessages: { <variável>: '...' },
  messages: { notApplicable, incomplete },
  calculate(variables), interpret(score)
}
```

`variables` liga o nome usado pelo cálculo ao campo do protocolo. `availableWhen` expressa dependência de estado — por exemplo, a relação da troponina só é considerada quando o resultado está `available`; caso contrário a variável é `null` e a ferramenta permanece **não calculável**.

O contrato `available ≠ applicable ≠ calculable ≠ applied` é do motor. Nenhuma ferramenta entra no documento sem aplicação explícita da médica.

### Resultados temporais (`temporalResults[]`)

```js
{
  id, kind, label,
  pendingWhen: { field, equals },
  availableWhen: { field, equals },
  payload: { <chaveDoResultado>: <idDoCampo> }
}
```

O motor converte a declaração em `pendingItems[]` e `results[]` do Atendimento. Resultado novo não reescreve resultado anterior: cada pendência mantém o pedido e atualiza apenas o evento ligado a ela.

## Validação

`validateProtocol(protocol)` retorna `{ valid, errors[] }` com `{ code, path, message }`. `assertValidProtocol` lança `ProtocolValidationError`. O registry valida no registro, então erro de configuração quebra o carregamento em desenvolvimento e testes.

Detecções atuais: id/versão/label inválidos, ids duplicados, etapa inexistente ou não declarada, seção referenciando etapa inválida, campo referenciado inexistente, campo órfão ou declarado em duas seções, `visibleWhen`/`applicableWhen`/`availableWhen` apontando para campo inexistente ou externo, variável obrigatória sem origem declarada, variável apontando para campo inexistente, ferramenta inexistente ou sem seção, resultado temporal sem regra ou com payload quebrado, e estrutura incompatível com o contrato.

## Como adicionar um novo cenário

1. Criar `protocols/<cenario>.js` exportando a definição declarativa.
2. Registrar em `src/protocol-registry.js` (`createProtocolRegistry([...])`).
3. Adicionar o arquivo ao `APP_SHELL` do `service-worker.js` e ao script `check` do `package.json`.
4. Adicionar teste do protocolo: `validateProtocol` sem erros e comportamento clínico esperado das ferramentas.
5. Rodar `npm run verify` e revalidar manualmente desktop/mobile e PWA.

Não é necessário editar `app.html`, `src/temporal-ui.js` ou qualquer motor. Se algum cenário exigir alteração de motor, isso indica que falta uma primitiva declarativa — a primitiva deve ser adicionada ao contrato, não um ramo `if (scenario === ...)`.

Tipos de campo, operadores de regra e classes de ferramenta são deliberadamente mínimos. Extensões devem ser adicionadas quando um cenário real precisar delas, com validador e teste correspondentes.
