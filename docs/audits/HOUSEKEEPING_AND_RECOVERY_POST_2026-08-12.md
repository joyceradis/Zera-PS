# Zera PS — Housekeeping & Product Convergence — Auditoria pós

Data: 2026-08-12
Implementação auditada: PR #30 — `chore/housekeeping-product-convergence`
Status: **AUTOMATED GATES GREEN NO HEAD FUNCIONAL MAIS RECENTE / REGRESSÃO MANUAL DE UI E PWA PENDENTE**

## 1. Escopo verificado

A PR modifica produto, documentação, PWA e testes. Não há deleção de engine clínico, schema temporal, storage ou template nesta convergência.

## 2. Evidência automatizada atual

Workflow canônico: `.github/workflows/checks.yml`
Run PR mais recente após correção de superfície: `31556209385`
Job: `verify`
Resultado: `success`

O job executou:

```text
npm run verify
→ npm run check
→ node --check em *.js, assets/*.js, src/*.js e protocols/*.js
→ npm test
→ node --test tests/*.test.mjs
```

Resultado atual:

```text
tests 177
pass 177
fail 0
cancelled 0
skipped 0
todo 0
```

O ciclo TDD da correção de superfície foi observado no CI: o commit de teste `4f74a8b...` falhou como esperado porque o launcher legado de reavaliação ainda permanecia visível; a implementação `08c79eaf...` ocultou esse launcher na camada convergida e restaurou o gate para verde com 177/177 testes.

Code scanning default do GitHub havia concluído com sucesso no marco funcional anterior desta mesma PR. A regressão canônica `checks` permanece o gate obrigatório a cada alteração.

### Nota sobre “Code scanning AI findings”

Em head anterior, o workflow experimental de revisão agentic falhou antes de produzir análise porque o próprio runtime solicitou um modelo não suportado (`CAPIError 400: The requested model is not supported`). Isso é falha de infraestrutura/configuração do agente GitHub, não finding de segurança do código. O CodeQL default permaneceu verde no marco auditado.

## 3. Arqueologia e patrimônio recuperado

### 3.1 `develop`

`develop` foi classificada como `LEGACY-REFERENCE`, não base de merge. Foram minerados os conceitos úteis de uma única entidade de Atendimento, reavaliação/desfecho ligados ao mesmo atendimento, dados informados uma vez e microferramentas contextuais.

Nenhum merge bruto de `develop` foi realizado.

### 3.2 Predecessor HMS — parser de exames

Foi localizada a implementação ancestral em `drajoyceradis/HMS-Dra-Joyce-Radis`, commit `c3828267fd393d722af6cc99f137b8d442eac690`.

A recuperação atual não copia o gerador antigo. Ela separa parsing e apresentação:

```text
texto bruto
→ normalização
→ analitos explicitamente encontrados
→ estrutura interna
→ renderer compacto autorizado
```

O parser preserva explicitamente bastonetes, eosinófilos, basófilos, linfócitos, monócitos, BUN/NU, RFG, TGO, TGP, amilase e lipase.

### 3.3 Regra clínica autorizada do diferencial leucocitário

Decisão de domínio da Founder em 2026-08-11: na linha compacta do hemograma, as frações do diferencial leucocitário só entram quando o percentual explicitamente informado está **acima do limite superior de referência adotado para esta regra de produto**.

Limites e abreviações:

```text
S   segmentados   > 70%
B   bastões       > 5%
L   linfócitos    > 45%
M   monócitos     > 10%
E   eosinófilos   > 5%
Bas basófilos     > 1%
```

Exemplo autorizado:

```text
LEUCO: 23.400 (S 74% B 8%)
```

Regras de segurança:

- valor ausente não é inferido;
- valor igual ao limite superior não entra;
- valor abaixo do limite superior não entra;
- não inferir “desvio à esquerda”, “infecção aguda” ou qualquer interpretação clínica a partir do diferencial;
- o renderer apenas seleciona e abrevia valores explicitamente presentes segundo a regra acima;
- componentes adicionais continuam preservados na estrutura interna mesmo quando não aparecem na linha compacta.

## 4. Segurança clínico-documental verificada

A suíte contém regressões específicas para:

- campo HPP vazio não virar `NEGA`;
- template de exame físico não confirmado ser omitido;
- score calculável mas não aplicado permanecer fora do documento;
- unknown/missing permanecer ausente ou placeholder explícito, sem fabricação;
- HDA integral permanecer editável e não ser sobrescrita após edição manual;
- resultados temporais seriados permanecerem append-only;
- reavaliação preservar snapshot de admissão;
- parser laboratorial não fabricar diferencial ou analitos ausentes;
- input laboratorial não reconhecido não criar linha `LAB`;
- aliases compactos de prontuário serem reconhecidos;
- diferencial leucocitário ser apresentado apenas quando explicitamente elevado segundo a regra de domínio;
- documento de Exames Complementares manter linha clínica compacta sem wrapper técnico redundante.

## 5. Segurança da interação recuperada

O organizador laboratorial mantém o texto bruto apenas como snapshot transitório em `WeakMap`.

```text
texto colado
→ organizar
→ texto compacto
→ opção de restaurar bruto
```

Se a médica editar manualmente o resultado organizado, o snapshot é invalidado. O texto bruto não é guardado em `data-*` do DOM.

## 6. Convergência do produto

A camada `src/product-convergence.js` não elimina engines existentes. Ela muda a apresentação da organização interna.

```text
ATENDIMENTO
→ CONTEXTO CLÍNICO
→ DOCUMENTAÇÃO
→ EXAMES COMPLEMENTARES
→ AÇÕES DO ATENDIMENTO
```

Reavaliação, internação, alta e scores deixam de competir como destinos primários da sidebar. As views existentes permanecem acessíveis internamente como camada transitória para preservar comportamento enquanto a equivalência de UX não for validada manualmente.

A auditoria de superfície identificou ainda uma duplicidade residual: o botão legado `Reavaliar atendimento` dentro do antigo card de workflow continuaria visível depois de o produto já expor Reavaliação em `AÇÕES DO ATENDIMENTO`. A correção foi feita sem apagar o handler/DOM legado: o launcher antigo passa a ser ocultado pela camada de convergência. Assim, existe uma única ação visível de reavaliação na superfície convergida, enquanto o comportamento interno permanece preservado para a migração estrutural posterior.

## 7. PWA / offline

O service worker foi versionado para `zera-ps-v10` e o APP_SHELL inclui `src/product-convergence.js` e `src/lab-parser.js`.

A validação automatizada não substitui teste manual de instalação, atualização de cache e uso offline em navegador real.

## 8. Housekeeping documental e CI

A documentação foi classificada em `CANONICAL`, `AUDIT`, `LEGACY-REFERENCE`, `OBSOLETE` e `DUPLICATE`.

Nenhum documento foi apagado apenas por parecer antigo. A limpeza de CI foi executada separadamente na PR #31 e já integrada à `main`.

O ROADMAP canônico foi reconciliado com a decisão já implementada do diferencial leucocitário; a antiga pendência de “definir quando outros componentes entram” foi encerrada para a regra atual.

## 9. Métricas — arqueologia pós

Foram separadas três linhagens:

1. `develop/prototype-novo-atendimento.html`: números hardcoded de produtividade/volume;
2. predecessor HMS PR #1: feedback do atendimento corrente (`mCrit`, `mAudit`, `mDestino`);
3. gráfico longitudinal/mensal referido pela Founder: implementação ainda não localizada.

O `mDestino` antigo não será transplantado sem metodologia e validação clínica próprias. `mCrit` e `mAudit` são patrimônio a avaliar, não requisito deste ciclo.

## 10. Pendências reais antes de homologação clínica da UX

### 10.1 Regressão manual de navegador/PWA

Ainda necessária:

- desktop;
- viewport móvel;
- reload/autosave;
- troca de contexto;
- HDA editada manualmente;
- organizar/restaurar laboratório;
- confirmar uma única ação visível de reavaliação;
- reavaliação;
- alta/internação;
- PWA instalada/offline;
- atualização do cache v9 → v10.

### 10.2 Gráfico mensal

A origem da implementação longitudinal/mensal continua não resolvida. Ausência de localização não autoriza recriação por memória nem exclusão conceitual.

## 11. Gate desta auditoria

```text
AUTOMATED CODE/TEST GATE     = PASS — 177/177 no run 31556209385
DEFAULT CODEQL               = PASS no marco funcional anterior; revalidar no head final se houver nova execução
CLINICAL FABRICATION GATE    = regressões automatizadas preservadas
WBC DISPLAY RULE             = DOMAIN DECISION RESOLVED / IMPLEMENTED
REASSESSMENT SURFACE DEDUPE  = PASS automatizado / manual visual pendente
PWA STATIC APP-SHELL GATE    = PASS automatizado
MANUAL CLINICAL UX GATE      = PENDING
MONTHLY METRICS ARCHAEOLOGY  = UNRESOLVED
```

Conclusão técnica: o núcleo automatizado permanece verde após a convergência adicional da superfície. A homologação clínica da UX e a arqueologia do gráfico longitudinal continuam abertas.
