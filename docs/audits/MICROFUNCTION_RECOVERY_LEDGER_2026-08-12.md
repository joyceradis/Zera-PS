# Ledger de microfunções — arqueologia e recuperação

Data: 2026-08-12

## Objetivo

Impedir que pequenas capacidades úteis desapareçam durante refactors. Cada item histórico é separado em:

- `PRESENT` — existe no Zera atual;
- `RECOVERED` — havia desaparecido/fragmentado e foi recuperado;
- `CANDIDATE` — patrimônio real, mas ainda precisa de validação de produto/domínio;
- `DO NOT RECOVER` — comportamento histórico incompatível com segurança/arquitetura atual;
- `UNRESOLVED` — lembrado ou citado, mas implementação ainda não localizada.

## Microfunções atuais protegidas

| Microfunção | Estado | Observação |
|---|---|---|
| HDA integral ao selecionar roteiro | PRESENT | edição manual protegida |
| refinamento da HDA diarreica | PRESENT | auxiliar, não obrigatório |
| troca de roteiro sem QP travada | PRESENT | boilerplate ≠ conteúdo médico |
| HPP `NEGA` por ação explícita | PRESENT | vazio nunca vira negativa |
| exame físico normal por confirmação explícita | PRESENT | template ≠ exame realizado |
| texto final editável | PRESENT | antes da cópia |
| copiar evolução | PRESENT | preview principal |
| salvar/reabrir rascunhos | PRESENT | storage local v2 |
| `# EM TEMPO:` opcional | PRESENT | bloco documental |
| reavaliação do mesmo Atendimento | PRESENT | Encounter v3 |
| resultados temporais seriados | PRESENT | append-only |
| HEART contextual | PRESENT | available/applicable/calculable/applied |
| CRB-65 / CURB-65 / qSOFA / Glasgow | PRESENT | incompletos até todas as variáveis |
| justificativa derivada da Evolução | PRESENT | piloto TC/USG/internação |
| PWA/offline | PRESENT | gate manual ainda necessário |

## Recuperadas neste ciclo

### Organizador de laboratório bruto

Estado: `RECOVERED`.

Fonte histórica: predecessor HMS + especificação v0.2.

Contrato atual:

```text
COLAR TEXTO BRUTO
→ ORGANIZAR LABORATÓRIO
→ - LAB: ...
→ RESTAURAR TEXTO COLADO, se ainda seguro
```

A regra do diferencial leucocitário foi definida pela Founder e possui regressão própria.

### Exames Complementares em linhas clínicas concisas

Estado: `RECOVERED/REFINED`.

A alteração intermediária que criava wrappers `LABORATORIAIS:` / `IMAGEM:` não é o contrato final. A superfície converge para linhas documentais clínicas (`- LAB:`, `- ECG:`, `- TC...`).

## Patrimônio encontrado no predecessor HMS

O `app.js` histórico contém microfunções que não devem ser confundidas com requisitos atuais.

### Chips de sintomas

Histórico:

- tosse;
- dor torácica ventilatório-dependente;
- dor torácica;
- otalgia;
- odinofagia;
- dor abdominal;
- disúria;
- cefaleia;
- lombalgia;
- náuseas/vômitos;
- febre;
- tontura.

Classificação: `CANDIDATE / UX HERITAGE`.

Princípio útil: seleção rápida quando clicar for mais barato que digitar. Não recuperar catálogo automaticamente.

### Red flags rápidas

Histórico:

- choque;
- síncope;
- déficit focal;
- rebaixamento do sensório;
- instabilidade hemodinâmica;
- sangramento ativo;
- vômitos incoercíveis;
- irritação peritoneal.

Classificação: `CANDIDATE / DOMAIN-SPECIFIC REBUILD`.

Não criar checklist genérico de red flags. No modelo atual, discriminadores pertencem ao contexto clínico e sua semântica depende do cenário.

### Quick choices de comorbidades/alergias/medicações de uso contínuo

Histórico real:

- listas rápidas de comorbidades;
- alergias frequentes;
- medicamentos contínuos comuns.

Classificação: `CANDIDATE`.

Podem reduzir teclas, mas precisam obedecer ao estado/proveniência atual e à regra de exclusividade do NEGA.

### Medicações rápidas de PS

O predecessor continha atalhos como dipirona, paracetamol, ondansetrona, bromoprida, hioscina, omeprazol e SF 0,9%.

Classificação: `DOMAIN REVIEW BEFORE RECOVER`.

Não transplantar por catálogo histórico. Medicamento disponível na UI ≠ indicação ≠ prescrição realizada. Qualquer recuperação deve ser explicitamente validada pela Founder e modelada como registro rápido da conduta escolhida, não recomendação automática.

### Condutas rápidas

O predecessor continha frases como solicitar laboratório, imagem, ECG, troponina, EAS, parecer, observação, reavaliar, alta e internação.

Classificação: `DOMAIN REVIEW BEFORE RECOVER`.

O valor potencial é redução de digitação. O risco é parecer recomendação do sistema. Só recuperar como affordance contextual depois de o contrato `ação disponível ≠ conduta escolhida` estar refletido na UI.

### Status do paciente

Histórico:

- alta;
- aguarda exames;
- aguarda parecer;
- observação clínica;
- sala vermelha;
- internação solicitada.

Classificação: `CANDIDATE / TEMPORAL MODEL RECONCILIATION`.

Encounter v3 já possui etapa, pendências, resultados e documentos. Não criar segundo status paralelo; minerar somente estados que preencherem lacuna real.

### Toggle móvel Formulário ↔ Texto

O predecessor tinha `showForm` / `showOutput` e modo mobile específico.

Classificação: `CANDIDATE / MANUAL UX GATE`.

Pode ser valioso em smartphone, mas não deve ser recuperado sem testar a superfície atual responsiva.

### Sinais vitais em bloco

O predecessor tinha campos FC, FR, SatO2, Tax, PA, HGT e dor.

Classificação: `DOMAIN/PRODUCT REVIEW`.

O Zera atual não deve ganhar campos apenas porque existiam. Reutilização de sinais vitais pode ser de alto valor para scores e reavaliação, mas a forma de entrada precisa refletir o fluxo real do PS e evitar redigitação de dados já disponíveis no PEP.

### Documento adicional de reavaliação/alta (`adc`)

O predecessor montava texto automático a partir de `status`, inclusive frases de estabilidade e condições de alta.

Classificação: `DO NOT RECOVER AS-IS`.

Motivo: o renderer adicionava afirmações como estabilidade hemodinâmica/ausência de instabilidade independentemente de fonte clínica suficientemente estruturada. O modelo atual exige confirmação e temporalidade explícitas.

### Handoff

O predecessor gerava resumo em formato Situação / Background / Avaliação / Recomendação.

Classificação: `CANDIDATE / LOW PRIORITY`.

É patrimônio real, mas não faz parte do núcleo atual. Só avaliar se houver caso operacional concreto de passagem de plantão que justifique a superfície e os dados necessários.

## Comportamentos históricos explicitamente inseguros

### `NA` automático

O predecessor possuía helper que convertia vazio em `NA` e podia preencher seções inteiras com `NA`.

Classificação: `DO NOT RECOVER`.

No modelo atual:

```text
vazio
≠ não aplicável
≠ não investigado
≠ negado
```

### Exame físico com `NA`/normalidade sem proveniência adequada

Classificação: `DO NOT RECOVER`.

### HDA/roteiro contendo negativas genéricas sem confirmação individual

Classificação: `DO NOT RECOVER AS FACT`.

Texto pode existir como rascunho visual para edição, mas não ganha estado confirmado apenas por carregar o template.

### Hipótese e conduta pré-preenchidas por roteiro

Classificação: `DO NOT RECOVER`.

## Microfunções lembradas mas ainda não localizadas

### Gráfico longitudinal/mensal

Estado: `UNRESOLVED`.

A busca encontrou apenas métricas hardcoded no protótipo e não o motor/gráfico lembrado pela Founder.

### Ditado/transcrição por voz

Estado: `UNRESOLVED`.

Busca em Zera e predecessores acessíveis não encontrou implementação com Web Speech API ou identificadores equivalentes. Não recriar por memória neste housekeeping.

## Macrofunção perdida identificada em `develop`

### Vários atendimentos locais / retomar atendimento

Estado: `RECOVER BY ADAPTATION — FUTURE`.

`develop/assets/attendance.js` possuía lista, atendimento atual, status, reavaliações e desfecho. O código não será transplantado porque o Encounter v3 atual é estruturalmente superior.

A recuperação futura deve ser:

```text
Encounter v3
→ repository/lista local de encounters
→ atendimento atual
→ retomar
→ finalizar
```

Somente depois da homologação da superfície canônica do Atendimento.

## Regra para todo patrimônio futuro

Uma microfunção antiga só volta se passar por quatro perguntas:

1. economiza cliques/teclas/tempo real no PS?
2. cabe no owner semântico atual sem criar segundo motor?
3. preserva os invariantes clínico-documentais atuais?
4. a Founder confirma que resolve uma fricção real do plantão?

Se qualquer resposta for não/indeterminada, permanece patrimônio documentado — não feature ativa.
