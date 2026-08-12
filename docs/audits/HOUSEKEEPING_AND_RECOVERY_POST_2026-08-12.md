# Zera PS — Housekeeping & Product Convergence — Auditoria pós

Data: 2026-08-12
Implementação auditada: `216b1fe4966a272630bf478422a7f807bcad7a6a`
PR: #30 — `chore: housekeeping and product convergence`
Status: **AUTOMATED GATES GREEN NO HEAD AUDITADO / REGRESSÃO MANUAL DE UI E PWA PENDENTE**

## 1. Escopo verificado

A PR modifica 16 arquivos de produto, documentação, PWA e testes. Não há deleção de engine clínico, schema temporal, storage ou template nesta convergência.

Arquivos alterados no marco auditado:

```text
ROADMAP.md
assets/document-engine.js
docs/README.md
docs/audits/DOCUMENT_CLASSIFICATION_2026-08-12.md
docs/audits/HOUSEKEEPING_AND_RECOVERY_2026-08-11.md
docs/audits/METRICS_ARCHAEOLOGY_2026-08-12.md
docs/product/PRODUCT_MAP.md
service-worker.js
src/app.js
src/lab-parser.js
src/product-convergence.js
tests/document-engine.test.mjs
tests/exam-output-convergence.test.mjs
tests/justification-engine.test.mjs
tests/lab-parser.test.mjs
tests/product-convergence.test.mjs
```

## 2. Evidência automatizada fresca

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

Em head anterior, o workflow experimental de revisão agentic falhou antes de produzir análise porque o próprio runtime solicitou um modelo não suportado (`CAPIError 400: The requested model is not supported`). Isso é falha de infraestrutura/configuração do agente GitHub, não finding de segurança do código. O CodeQL default, que é o scanner de segurança configurado para o repositório, permaneceu verde.

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

O parser preserva explicitamente patrimônio adicional do predecessor — bastonetes, eosinófilos, basófilos, linfócitos, monócitos, BUN/NU, RFG, TGO, TGP, amilase e lipase — sem obrigar esses dados a aparecerem no documento atual.

Renderer compacto autorizado neste ciclo:

```text
- LAB: HB: ... / HT: ... / LEUCO: ... (NEUT: ...%) / PLAQ: ... / PCR: ... / UR: ... / CR: ... / NA: ... / K: ...
```

O neutrófilo só aparece quando existe valor explícito. Nenhum predomínio é inferido.

## 4. Segurança clínico-documental verificada

A suíte fresca contém regressões específicas para:

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
- patrimônio laboratorial adicional ser parseado sem ser forçado no renderer;
- documento de Exames Complementares manter linha clínica compacta sem wrapper técnico redundante.

## 5. Segurança da interação recuperada

O organizador laboratorial mantém o texto bruto apenas como snapshot transitório em `WeakMap`.

Fluxo protegido:

```text
texto colado
→ organizar
→ texto compacto
→ opção de restaurar bruto
```

Se a médica editar manualmente o resultado organizado, o snapshot é invalidado. Assim, uma restauração posterior não pode sobrescrever silenciosamente a edição clínica mais recente.

O texto bruto não é guardado em `data-*` do DOM.

## 6. Convergência do produto

A camada `src/product-convergence.js` não elimina engines existentes. Ela muda a apresentação da organização interna.

Superfície anterior:

```text
Roteiros
+
Workflow contextual
+
Reavaliação
+
Internação
+
Alta
+
Scores
```

Superfície convergida:

```text
ATENDIMENTO
→ CONTEXTO CLÍNICO
→ DOCUMENTAÇÃO
→ EXAMES COMPLEMENTARES
→ AÇÕES DO ATENDIMENTO
```

Reavaliação, internação, alta e scores deixam de competir como destinos primários da sidebar. As views existentes permanecem acessíveis internamente como camada transitória para preservar comportamento enquanto a equivalência de UX não for validada manualmente.

### Limitação arquitetural consciente

A convergência atual é incremental: algumas ações da superfície nova ainda acionam views antigas escondidas. Isso é dívida transitória deliberada, não arquitetura final.

Remover as views antigas antes da validação manual aumentaria o risco de perder microfunções. A integração estrutural definitiva deve ocorrer em ciclo posterior, depois de equivalência demonstrada.

## 7. PWA / offline

O service worker foi versionado para `zera-ps-v10` e o APP_SHELL inclui os novos módulos:

```text
./src/product-convergence.js
./src/lab-parser.js
```

A suíte automatizada confirmou que os arquivos do app shell existem e que o fallback offline permanece limitado a navegação.

A validação automatizada não substitui teste manual de instalação, atualização de cache e uso offline em navegador real.

## 8. Housekeeping documental e CI

A documentação foi classificada em:

```text
CANONICAL
AUDIT
LEGACY-REFERENCE
OBSOLETE
DUPLICATE
```

Nenhum documento foi apagado apenas por parecer antigo. A árvore atual já separa norma vigente, evidência de auditoria e histórico de intenção.

A limpeza de CI foi executada separadamente na PR #31 e já integrada à `main`: workflows irrelevantes/conflitantes foram removidos e o gate `checks.yml` foi preservado.

Refs/branches históricas ainda podem permanecer como clutter remoto porque a ferramenta de manutenção usada neste ciclo não expõe exclusão segura de branch. `develop` deve permanecer até a mineração de patrimônio ser encerrada.

## 9. Métricas — arqueologia pós

Foram separadas três linhagens que não devem ser confundidas:

1. `develop/prototype-novo-atendimento.html`: números hardcoded de produtividade/volume;
2. predecessor HMS PR #1: feedback do atendimento corrente (`mCrit`, `mAudit`, `mDestino`);
3. gráfico longitudinal/mensal referido pela Founder: implementação ainda não localizada.

O `mDestino` antigo não será transplantado, pois sugestão automática de destino exige metodologia e validação clínica próprias.

`mCrit` e `mAudit` são patrimônio a avaliar, não requisito deste ciclo.

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

### 10.2 Regra de apresentação do diferencial leucocitário

A estrutura interna já preserva componentes explícitos adicionais. Falta decisão clínica de domínio para definir **quando**, além de neutrófilos, bastonetes/eosinófilos/basófilos/linfócitos/monócitos merecem entrar na linha compacta do prontuário.

Até essa decisão, a política segura é não exibi-los automaticamente.

### 10.3 Gráfico mensal

A origem da implementação longitudinal/mensal continua não resolvida. Ausência de localização não autoriza recriação por memória nem exclusão conceitual.

## 11. Gate desta auditoria

```text
AUTOMATED CODE/TEST GATE     = PASS no head 216b1fe...
DEFAULT CODEQL               = PASS no head 216b1fe...
CLINICAL FABRICATION GATE    = regressões automatizadas preservadas
PWA STATIC APP-SHELL GATE    = PASS automatizado
MANUAL CLINICAL UX GATE      = PENDING
MONTHLY METRICS ARCHAEOLOGY  = UNRESOLVED
EXTRA WBC DISPLAY RULE       = DOMAIN DECISION PENDING
```

Conclusão técnica: o ciclo alcançou um ponto seguro para **congelar novas mudanças funcionais e passar à validação manual da experiência**, mas ainda não é correto declarar a UX homologada ou apagar as implementações transitórias preservadas.
