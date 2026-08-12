# Zera PS — Housekeeping & Product Convergence — Auditoria pós

Data: 2026-08-12
Implementação auditada: `216b1fe4966a272630bf478422a7f807bcad7a6a`, com regra clínica incremental do diferencial leucocitário adicionada posteriormente na mesma PR
PR: #30 — `chore: housekeeping and product convergence`
Status: **AUTOMATED GATES GREEN NO MARCO AUDITADO / REGRESSÃO MANUAL DE UI E PWA PENDENTE**

## 1. Escopo verificado

A PR modifica produto, documentação, PWA e testes. Não há deleção de engine clínico, schema temporal, storage ou template nesta convergência.

## 2. Evidência automatizada do marco anterior

Workflow canônico: `.github/workflows/checks.yml`
Run PR: `31553910631`
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

Resultado dos testes no head auditado:

```text
tests 174
pass 174
fail 0
cancelled 0
skipped 0
todo 0
```

Code scanning default do GitHub:

```text
workflow: dynamic/github-code-scanning/codeql
run: 31553908472
head: 216b1fe4966a272630bf478422a7f807bcad7a6a
conclusion: success
```

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

## 7. PWA / offline

O service worker foi versionado para `zera-ps-v10` e o APP_SHELL inclui `src/product-convergence.js` e `src/lab-parser.js`.

A validação automatizada não substitui teste manual de instalação, atualização de cache e uso offline em navegador real.

## 8. Housekeeping documental e CI

A documentação foi classificada em `CANONICAL`, `AUDIT`, `LEGACY-REFERENCE`, `OBSOLETE` e `DUPLICATE`.

Nenhum documento foi apagado apenas por parecer antigo. A limpeza de CI foi executada separadamente na PR #31 e já integrada à `main`.

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
- reavaliação;
- alta/internação;
- PWA instalada/offline;
- atualização do cache v9 → v10.

### 10.2 Gráfico mensal

A origem da implementação longitudinal/mensal continua não resolvida. Ausência de localização não autoriza recriação por memória nem exclusão conceitual.

## 11. Gate desta auditoria

```text
AUTOMATED CODE/TEST GATE     = PASS no marco auditado; revalidar no head final
DEFAULT CODEQL               = PASS no marco auditado; revalidar no head final
CLINICAL FABRICATION GATE    = regressões automatizadas preservadas
WBC DISPLAY RULE             = DOMAIN DECISION RESOLVED / IMPLEMENTED
PWA STATIC APP-SHELL GATE    = PASS automatizado no marco auditado
MANUAL CLINICAL UX GATE      = PENDING
MONTHLY METRICS ARCHAEOLOGY  = UNRESOLVED
```

Conclusão técnica: a decisão do diferencial leucocitário deixou de ser pendência de domínio e passou a contrato explícito de renderer. A homologação clínica da UX e a arqueologia do gráfico longitudinal continuam abertas.
