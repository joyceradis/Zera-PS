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
  id: 'sca',
  version: '2.0.0',
  label: 'DOR TORÁCICA / SUSPEITA DE SCA',
  stages: [...],
  fields: [...],
  sections: [...],
  tools: [...],
  temporalResults: [...]
}
```

### Campos (`fields[]`)

| Chave | Obrigatória | Descrição |
| --- | --- | --- |
| `id` | sim | identificador do campo; também é a chave no `context` persistido |
| `type` | sim | `text`, `textarea`, `number`, `select`, `boolean` |
| `label` | sim | rótulo acessível |
| `source` | não | `protocol` (padrão) ou `evolution_form` |
| `domId` | externo | id do elemento; obrigatório para `evolution_form`; padrão `<protocolo>-<campo>`; único no protocolo |
| `options` | select | lista `{ value, label }` |
| `default` | não | valor inicial compatível com o tipo e, em select, presente nas opções; ausência não vira valor |
| `coerce` | não | `number`, apenas em select cujas opções sejam numéricas ou vazias |
| `width` | não | `half` (padrão) ou `full` |
| `rows`, `placeholder`, `help`, `min`, `max`, `step` | não | apresentação |
| `visibleWhen` | não | regra `{ field, equals }` |

Campos `evolution_form` são **referências** a campos já pertencentes ao formulário de evolução (QP, HDA, conduta). O protocolo os declara para documentar a relação, mas não os renderiza nem os lê para o contexto operacional — conteúdo documental não é copiado para o estado de workflow.

### Valores laboratoriais e referências dependentes do ensaio

Protocolos não podem embutir um cutoff laboratorial como se fosse universal quando o valor de referência depende de **ensaio/kit, unidade, população ou laboratório**.

Regra canônica:

```text
valor medido + unidade + referência válida do ensaio/laboratório
→ relação/interpretação permitida

referência ausente ou ensaio desconhecido
→ relação/interpretação permanece NÃO INFORMADA
```

Exemplo crítico: **troponina**. O HEART utiliza relação com o limite superior de referência, não um valor absoluto universal. Um número local (por exemplo, referência informada pela Founder para troponina ultrassensível no Meridional) pertence a um eventual perfil institucional/configuração do ensaio e **não pode virar default global do protocolo SCA**.

Portanto:

- resultado bruto pode ser armazenado como texto/valor + unidade;
- relação com o limite superior só é aceita quando explicitamente informada ou calculada a partir de referência explicitamente conhecida;
- ausência de referência nunca vira `normal`, `positivo`, `1×LSN` ou qualquer classificação presumida;
- troca de hospital/kit/unidade não pode reutilizar silenciosamente a referência anterior;
- configuração institucional futura deve ser versionada e identificável, separada da lógica clínica genérica.

### Seções (`sections[]`)

| Chave | Obrigatória | Descrição |
| --- | --- | --- |
| `id` | sim | único no protocolo |
| `fields` | sim | lista de ids de campos (pode ser vazia) |
| `stage` / `stages` | não | `stage` recebe uma etapa textual; `stages` exige array de etapas; declare uma das duas chaves, nunca ambas; ausência = todas |
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
  messages: { unavailable, notApplicable, incomplete },
  calculate(variables), interpret(score)
}
```

`variables` liga o nome usado pelo cálculo ao campo do protocolo. `availableWhen` expressa dependência de estado — por exemplo, a relação da troponina só é considerada quando o resultado está `available`; caso contrário a variável é `null` e a ferramenta permanece **não calculável**.

O contrato `available ≠ applicable ≠ calculable ≠ applied` é do motor. Nenhuma ferramenta entra no documento sem aplicação explícita da médica.

Disponibilidade é avaliada antes de aplicabilidade. Uma ferramenta `unavailable` nunca é descrita como disponível e nunca expõe ação de aplicação, ainda que possua regras de aplicabilidade declaradas.

## Roteiro documental não é protocolo

Os cards da evolução são roteiros de documentação: podem sugerir QP e orientar a coleta da HDA, mas não ativam protocolo clínico por inferência. A associação entre roteiro e protocolo, quando existir, deve ser declarada por `protocolId`. Ausência dessa chave significa “sem protocolo correspondente”.

O coordenador de contexto impede que um roteiro sem protocolo permaneça simultaneamente ativo com workflow específico. Em uma troca confirmada, a documentação anterior é preservada em Rascunhos e a superfície do novo contexto começa limpa; estado temporal significativo só é desvinculado após confirmação explícita. QP, HDA, hipóteses ou conduta nunca são usados para inferir diagnóstico ou compatibilidade.

O mesmo coordenador também trata a troca entre dois roteiros documentais. A QP sugerida por um roteiro é reconhecida como texto de sugestão, não como dado da médica: trocar de roteiro sem que nenhum campo tenha recebido conteúdo além dessa sugestão substitui a QP silenciosamente, sem diálogo — é o caso comum de navegar entre roteiros até encontrar o correto. Qualquer conteúdo além da sugestão (QP editada, HDA, HPP, exame ou evolução já gerada) exige confirmação explícita antes de a troca substituir os campos; a documentação anterior é preservada em Rascunhos, exatamente como na troca de workflow.

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

Detecções atuais: id/versão/label inválidos, ids duplicados, identificadores de DOM colidentes (inclusive entre campo e ferramenta), etapa inexistente ou não declarada, `stage` e `stages` declarados ao mesmo tempo, `stages` que não seja array, seção referenciando etapa inválida, campo referenciado inexistente, campo órfão ou declarado em duas seções, valor inicial incompatível com tipo ou opções, coerção numérica sobre opções não numéricas, `visibleWhen`/`applicableWhen`/`availableWhen` apontando para campo inexistente ou externo, variável obrigatória sem origem declarada, variável apontando para campo inexistente, ferramenta inexistente ou sem seção, resultado temporal sem regra ou com payload quebrado, e estrutura incompatível com o contrato.

Em tempo de execução a proteção é complementar: um controle numérico com conteúdo não numérico é lido como **ausente**, e uma ferramenta cujo cálculo não produza número finito permanece **não calculável**. Valor inválido nunca vira score.

## Como adicionar um novo cenário

1. Criar `protocols/<cenario>.js` exportando a definição declarativa.
2. Registrar em `src/protocol-registry.js` (`createProtocolRegistry([...])`).
3. Adicionar o arquivo ao `APP_SHELL` do `service-worker.js`. O script `check` do `package.json` varre `*.js`, `assets/*.js`, `src/*.js` e `protocols/*.js`, então não exige manutenção manual.
4. Adicionar teste do protocolo: `validateProtocol` sem erros e comportamento clínico esperado das ferramentas.
5. Rodar `npm run verify` e revalidar manualmente desktop/mobile e PWA.

Não é necessário editar `app.html`, `src/temporal-ui.js` ou qualquer motor. Se algum cenário exigir alteração de motor, isso indica que falta uma primitiva declarativa — a primitiva deve ser adicionada ao contrato, não um ramo `if (scenario === ...)`.

Tipos de campo, operadores de regra e classes de ferramenta são deliberadamente mínimos. Extensões devem ser adicionadas quando um cenário real precisar delas, com validador e teste correspondentes.
