# Inventário real de capacidades — Zera PS

Data: 2026-08-12
Status: baseline de housekeeping e product convergence

Este inventário descreve o produto que existe de fato no repositório, não o produto desejado. Ele serve de base para `KEEP / REFINE / MOVE / MERGE / RECOVER / DELETE / REWRITE`.

## 1. Superfícies de produto

### Landing pública — `index.html`

Responsabilidade: apresentação pública e entrada no aplicativo.

Classificação atual: `KEEP/REFINE`.

### Aplicação clínica — `app.html`

A estrutura HTML original expõe seis views primárias:

- Evolução;
- Reavaliação;
- Internação;
- Alta;
- Scores;
- Rascunhos.

A camada `src/product-convergence.js` já altera a superfície apresentada:

- `Evolução` é relabelada para **Atendimento**;
- Reavaliação, Internação, Alta e Scores são ocultadas da navegação principal;
- essas mesmas capacidades são reapresentadas como **ações do Atendimento**;
- `Roteiros de documentação` e o launcher de contexto temporal são convergidos visualmente numa única porta de contexto.

Classificação: `REFINE/MOVE/MERGE`.

A implementação antiga continua existindo por baixo para não perder microfunções antes da equivalência de UX.

## 2. Atendimento / Evolução

### QP

- campo livre;
- roteiros podem sugerir QP;
- troca de roteiro protege conteúdo real;
- QP herdada como boilerplate não é tratada como edição médica.

Classificação: `KEEP`.

### HDA

Capacidades atuais:

- texto integral editável;
- roteiro abre HDA pronta;
- edição manual impede sobrescrita silenciosa;
- compositor estruturado para síndrome diarreica;
- entrada livre continua first-class;
- aliases históricos GEA/GECA convergem para síndrome diarreica.

Classificação: `KEEP/REFINE`.

Roteiros atuais em `assets/templates.js`:

- Rinossinusite;
- Cefaleia;
- Síndrome diarreica;
- Síndrome gripal;
- PAC.

### HPP

Campos:

- comorbidades;
- MUC;
- alergias;
- hábitos;
- cirurgias prévias.

Microfunção:

- `Confirmar NEGA em HPP` registra intenção explícita; vazio não vira negativa.

Classificação: `KEEP`.

### Exame físico

Campos:

- estado geral;
- ACV;
- AR;
- ABD;
- EXT;
- neurológico.

Microfunção:

- `Usar modelo de exame normal` exige ação médica explícita e permanece editável.

Classificação: `KEEP/REFINE`.

### Exames complementares

Entradas atuais:

- Laboratoriais;
- Imagem.

Capacidades recuperadas/convergidas:

- parser de texto laboratorial bruto;
- normalização para linha compacta no padrão da Founder;
- restauração transitória do texto colado enquanto não houver edição manual;
- saída clínica concisa em `# EXAMES COMPLEMENTARES:`;
- nenhuma categoria vazia é fabricada.

Contrato LAB atual:

```text
- LAB: HB: ... / HT: ... / LEUCO: ... (frações elevadas) / PLAQ: ... / PCR: ... / UR: ... / CR: ... / NA: ... / K: ...
```

Regra do diferencial leucocitário:

- apenas fração explicitamente informada;
- apenas acima do limite superior configurado;
- abreviações: `S`, `B`, `L`, `M`, `E`, `Bas`;
- sem inferir diagnóstico, infecção ou desvio.

Classificação: `RECOVERED/KEEP/REFINE`.

### Hipóteses diagnósticas

- texto livre;
- uma hipótese por linha na UI;
- sem diagnóstico automático.

Classificação: `KEEP`.

### Conduta

- texto livre;
- uma ação por linha;
- não há prescrição automática por cenário.

Classificação: `KEEP/REFINE`.

### `# EM TEMPO:`

- bloco opcional na Evolução;
- não substitui o workflow temporal de reavaliação.

Classificação: `KEEP`, com semântica a preservar durante convergência.

## 3. Contexto clínico e workflow temporal

Infraestrutura concreta:

- `protocols/sca.js` é o único contexto temporal registrado atualmente;
- registry expõe somente SCA;
- campos/contexto são declarativos;
- engines genéricos não conhecem vocabulário SCA;
- etapas explícitas de Atendimento;
- pendências/resultados;
- resultados seriados append-only;
- snapshot de admissão protegido após reavaliação;
- progressive disclosure por etapa + contexto.

Etapas internas atuais:

```text
initial_assessment
initial_conduct
pending_results
reassessment
final_documentation
```

Classificação: `KEEP INTERNAL / REFINE SURFACE`.

## 4. Reavaliação

Capacidades existentes:

- pertence ao mesmo Encounter v3;
- preserva snapshot da admissão;
- QP permanece inline e entre aspas;
- `# HDA (ADMISSÃO):` preservada;
- `... EM TEMPO (REAVALIAÇÃO):` acrescenta atualização;
- scores aplicados podem aparecer logo abaixo da QP;
- carry-forward mantém seções clínicas relevantes sem repetir a conduta antiga.

Classificação de produto: `MOVE` — não deve competir como produto separado da sidebar.

Classificação de código: `KEEP/REFINE`.

## 5. Internação e Alta

Existem views e geradores próprios.

A convergência atual as reapresenta como ações/desfechos do Atendimento, preservando as views antigas internamente.

Classificação: `MOVE/REFINE`, não `DELETE`.

## 6. Justificativas

Motor: `src/justification-engine.js`.

Perfis piloto existentes:

- TC de abdome/pelve;
- USG abdominal/rins e vias urinárias;
- internação.

Regras:

- reutiliza dados já confirmados;
- campo essencial ausente vira `[COMPLETAR: ...]`;
- não garante autorização;
- não fabrica urgência, risco ou critério de convênio;
- saída é revisável e copiável.

Classificação: `KEEP/ISOLATE/REFINE LOCATION`.

## 7. Scores e ferramentas clínicas

### Catálogo documental legado — `assets/scores.js`

Implementados:

- CRB-65;
- qSOFA;
- CURB-65;
- Glasgow.

Todos começam incompletos e só calculam após todas as variáveis obrigatórias.

### Ferramenta contextual temporal

- HEART no contexto SCA.

Contrato:

```text
available ≠ applicable ≠ calculable ≠ applied
```

Um score calculável não entra no documento até aplicação explícita.

Classificação: `KEEP/REFINE CONTEXTUALIZATION`.

Não há SNNOOP10 implementado; referência falsa anterior foi removida por regressão.

## 8. Persistência

### Documento/autosave — schema v2

Responsabilidades:

- estado da evolução;
- autosave;
- rascunhos;
- migração de chaves legadas sem fabricar confirmação clínica.

### Atendimento temporal — schema v3

Responsabilidades:

- workflow/contexto;
- etapa;
- admission snapshot;
- pendingItems;
- results;
- reassessments;
- documents;
- intenção de aplicação de ferramentas.

Classificação: `KEEP`, com separação deliberada enquanto a convergência não estiver homologada.

## 9. PWA / offline

Artefatos:

- `manifest.json`;
- `service-worker.js`;
- APP_SHELL explícito;
- limpeza de caches antigos;
- fallback offline apenas para navegação;
- cache same-origin.

Classificação: `KEEP/AUDIT`.

Gate manual ainda necessário: instalação, atualização, reload e uso offline real.

## 10. Camadas de código

### `assets/`

Contém fundação documental estabilizada e UI legada:

- `app.js`;
- `clinical-state.js`;
- `data.js`;
- `document-engine.js`;
- `scores.js`;
- `storage.js`;
- `templates.js`;
- `ui.js`;
- `styles.css`.

### `src/`

Contém coordenação/motores novos e wrappers de migração, incluindo:

- app coordinator;
- clinical-state wrapper;
- context coordination;
- data wrapper;
- document temporal engine;
- HDA composer;
- justification engine;
- lab parser;
- product convergence adapter;
- protocol schema/registry/engine/renderer;
- score engine;
- storage temporal;
- temporal UI;
- tool presentation;
- workflow engine.

Ownership detalhado: `docs/architecture/OWNERSHIP.md`.

## 11. Histórico / patrimônio

### `develop`

Não é base de merge. É fonte de patrimônio:

- Novo Atendimento v0.2;
- `assets/attendance.js`;
- protótipo de interface;
- modelo de reavaliação/desfecho dentro do mesmo atendimento;
- ideia de `COLAR LABORATÓRIO` contextual.

Classificação: `MINE / LEGACY-REFERENCE`.

### Predecessores

Fontes arqueológicas oficiais:

- `drajoyceradis/HMS-Dra-Joyce-Radis`;
- `joyceradis/Dra-Joyce-Radis-HMS`;
- Acelerador PS, quando acessível/pertinente.

Código antigo nunca é transplantado em bloco.

## 12. Métricas e gráficos

Foram identificadas linhagens distintas:

1. números hardcoded do protótipo `develop` — não são métrica real;
2. feedback do atendimento corrente em predecessor — patrimônio a avaliar;
3. gráfico longitudinal/mensal lembrado pela Founder — implementação ainda não localizada.

Classificação: `AUDIT / UNRESOLVED`.

Não recriar por memória e não apagar conceitualmente enquanto a arqueologia estiver aberta.

## 13. Matriz resumida

| Capacidade | Classificação |
|---|---|
| QP | KEEP |
| HDA integral | KEEP/REFINE |
| compositor síndrome diarreica | KEEP/REFINE |
| HPP + NEGA explícito | KEEP |
| exame normal confirmado | KEEP |
| exames complementares | KEEP/REFINE |
| LAB compacto | RECOVERED/KEEP |
| hipóteses | KEEP |
| conduta | KEEP |
| EM TEMPO | KEEP |
| Encounter v3 | KEEP |
| workflow temporal | KEEP INTERNAL |
| Roteiro × Workflow na UI | MERGE |
| Reavaliação sidebar | MOVE |
| Internação sidebar | MOVE |
| Alta sidebar | MOVE |
| Scores sidebar | MOVE/REFINE |
| CRB-65 | KEEP |
| CURB-65 | KEEP |
| qSOFA | KEEP |
| Glasgow | KEEP |
| HEART | KEEP |
| justificativas piloto | KEEP/ISOLATE |
| storage v2/v3 | KEEP |
| PWA | KEEP/AUDIT |
| `develop` | MINE |
| gráfico mensal | UNRESOLVED |
| branches integradas antigas | PRUNE CANDIDATE |

## 14. O que este inventário NÃO autoriza

- não autoriza apagar views transitórias antes do gate manual;
- não autoriza consolidar `assets/` e `src/` por estética;
- não transforma protótipo/histórico em requisito;
- não adiciona protocolo, score ou conduta clínica nova;
- não substitui decisão da Founder quando a questão for prática real de PS ou semântica clínica.
