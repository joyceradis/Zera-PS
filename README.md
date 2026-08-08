# Zera PS

**Documentação clínica no ritmo do pronto-socorro, orientada por contexto, tempo e confirmação explícita.**

O Zera PS é um MVP offline-first de apoio à documentação clínica no pronto-socorro. O produto reduz atrito entre atendimento, reavaliação e registro sem substituir julgamento médico, protocolos institucionais, revisão profissional ou o prontuário oficial.

> **Princípio central:** nenhuma transformação documental pode aumentar o grau de certeza, alterar a polaridade ou fabricar um fato clínico ausente.

## Estado do projeto

A fundação de segurança documental está implementada e o Zera já possui um primeiro **workflow temporal de referência** para dor torácica / suspeita de SCA.

O sistema agora distingue:

```text
CENÁRIO
→ ETAPA DO ATENDIMENTO
→ DADOS + ESTADO + PROVENIÊNCIA
→ PENDÊNCIAS / RESULTADOS
→ FERRAMENTAS CLÍNICAS
→ DOCUMENTO
```

A regressão manual em navegador real continua obrigatória antes de qualquer declaração de homologação para uso assistencial. O Zera PS permanece um MVP em validação.

## Escopo funcional atual

- evolução estruturada no formato atualmente configurado para o Hospital Meridional Serra;
- QP, HDA, HPP, exame físico, exames complementares, hipóteses e conduta;
- reavaliação vinculada ao mesmo atendimento no workflow temporal;
- solicitação de internação e alta preservadas;
- CRB-65, CURB-65, qSOFA e Glasgow;
- workflow temporal com `initial_assessment`, `initial_conduct`, `pending_results`, `reassessment` e `final_documentation`;
- primeiro cenário declarativo em `protocols/sca.js`;
- campos condicionais por cenário, etapa e estado clínico;
- HEART com distinção entre disponibilidade, aplicabilidade e calculabilidade;
- pendências de ECG e troponina no atendimento temporal;
- `# SCORES:` abaixo da QP somente quando houver ferramenta aplicada e calculada;
- atalhos de HPP com confirmação explícita;
- modelo de exame físico normal confirmado por ação médica;
- roteiros sindrômicos sem pré-confirmar negativas, diagnósticos ou condutas;
- autosave e rascunhos locais da evolução;
- armazenamento v3 independente para o atendimento temporal;
- PWA offline-first;
- CI e regressão automatizada.

## Limites do produto

O Zera PS não:

- diagnostica de forma autônoma;
- prescreve automaticamente;
- decide alta, internação ou transferência;
- interpreta campo vazio como negativa;
- considera template como exame realizado sem ação médica explícita;
- transforma ferramenta disponível em automaticamente aplicável;
- transforma ferramenta aplicável em automaticamente calculável;
- calcula score incompleto como zero;
- converte roteiro sindrômico em fato clínico;
- garante autorização de exames ou procedimentos;
- substitui o prontuário institucional;
- substitui protocolos ou responsabilidade profissional.

## Modelo clínico-documental

```text
AÇÃO MÉDICA
    ↓
DADO CLÍNICO
    ↓
ESTADO + PROVENIÊNCIA
    ↓
CONTEXTO + ETAPA TEMPORAL
    ↓
TRANSFORMAÇÃO DOCUMENTAL
    ↓
SAÍDA EDITÁVEL
    ↓
REVISÃO MÉDICA
```

### Invariantes

1. **Ausência de informação não gera conteúdo clínico.**
2. **Não informado não equivale a negado.**
3. **Template não equivale a exame realizado sem confirmação explícita.**
4. **Sugestão ou roteiro não equivale a achado, diagnóstico ou conduta realizada.**
5. **Score incompleto não equivale a zero.**
6. **Ferramenta disponível não equivale a ferramenta aplicável.**
7. **Ferramenta aplicável não equivale a ferramenta calculável.**
8. **Reavaliação não sobrescreve a admissão.**
9. **Resultado novo não reescreve retrospectivamente um dado anterior.**
10. **Migração técnica não fabrica confirmação clínica.**
11. **Texto gerado permanece sujeito à revisão médica.**

## Workflow temporal

O workflow não é apenas condicional por campo. O atendimento muda no tempo.

```text
workflow
├── initial_assessment
├── initial_conduct
├── pending_results
├── reassessment
└── final_documentation
```

A mesma entidade de atendimento preserva:

- snapshot da admissão;
- contexto do cenário;
- etapa atual;
- histórico de etapas;
- itens pendentes;
- resultados disponibilizados;
- reavaliações;
- documentos gerados.

O snapshot de admissão pode ser atualizado enquanto a admissão ainda está em construção. Depois da primeira reavaliação, ele é protegido contra sobrescrita pelo workflow.

## Ferramentas clínicas

A semântica obrigatória é:

```text
DISPONÍVEL
≠
APLICÁVEL
≠
CALCULÁVEL
```

Exemplo do cenário SCA:

```text
HEART pertence ao cenário
→ available

suspeita clínica de SCA / equivalente anginoso
→ applicable

dados obrigatórios completos
→ calculable
```

Se a ferramenta for pertinente, mas faltarem dados, não há pontuação. A interface explica a pendência, por exemplo:

```text
HEART Score não calculado: troponina ainda não informada.
```

## Reavaliação

A reavaliação pertence ao **mesmo atendimento**. O botão `Reavaliar atendimento` cria um novo evento temporal sem apagar a admissão.

Contrato documental atual:

```text
## REAVALIAÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##

# QP: "DOR TORÁCICA"

# SCORES:
- HEART: ...

# HDA (ADMISSÃO): [HDA ORIGINAL OU CONTEXTO RESUMIDO]

... EM TEMPO (REAVALIAÇÃO): REAVALIO PACIENTE... ...

[CONTINUIDADE DAS SEÇÕES CLÍNICAS DA EVOLUÇÃO]

# CONDUTA:
- ...
```

Regras:

- `# QP:` permanece na mesma linha e entre aspas na reavaliação;
- `# SCORES:` fica imediatamente abaixo da QP quando houver score aplicável e calculado;
- `# SCORES:` desaparece se nenhum score preencher essas condições;
- `# HDA (ADMISSÃO):` preserva a história da admissão;
- `EM TEMPO (REAVALIAÇÃO)` registra o delta temporal;
- a conduta anterior não é carregada como conduta atual;
- HPP, exame físico, exames complementares e hipóteses podem ser reaproveitados conforme o contrato do document engine, permanecendo sujeitos à revisão médica.

## Arquitetura

```text
Zera-PS/
├── index.html
├── app.html
├── app.js
├── manifest.json
├── service-worker.js
├── package.json
├── README.md
├── ROADMAP.md
├── src/
│   ├── app.js
│   ├── temporal-ui.js
│   ├── workflow-engine.js
│   ├── score-engine.js
│   ├── document-engine.js
│   ├── clinical-state.js
│   ├── storage.js
│   ├── data.js
│   ├── templates.js
│   └── ui.js
├── protocols/
│   └── sca.js
├── assets/
│   ├── app.js
│   ├── clinical-state.js
│   ├── data.js
│   ├── document-engine.js
│   ├── scores.js
│   ├── storage.js
│   ├── templates.js
│   ├── ui.js
│   ├── styles.css
│   └── logo.svg
├── tests/
└── docs/
```

A pasta `assets/` ainda contém a fundação estável anterior e é mantida durante a migração incremental para evitar regressões. O novo entrypoint raiz carrega `src/app.js`, que coordena a camada existente e o workflow temporal.

### Responsabilidades

| Módulo | Responsabilidade |
| --- | --- |
| `protocols/sca.js` | Configuração clínica declarativa do cenário; não manipula DOM nem executa conduta |
| `src/workflow-engine.js` | Etapas, transições, pendências, contexto e progressive disclosure; não conhece regras específicas de SCA |
| `src/score-engine.js` | Disponibilidade, aplicabilidade, calculabilidade, dados faltantes e cálculo de ferramentas |
| `src/document-engine.js` | Reavaliação temporal, bloco de scores e carry-forward documental |
| `src/storage.js` | Persistência independente do atendimento temporal v3 |
| `src/temporal-ui.js` | Integração da camada temporal com a interface atual |
| `assets/clinical-state.js` | Estado, proveniência e confirmação clínica |
| `assets/app.js` | Microfunções e coordenação do núcleo documental já estabilizado |

Detalhes em `docs/ARCHITECTURE.md`.

## Segurança das microfunções

As seguintes funções existentes são deliberadamente preservadas durante a evolução arquitetural:

- `Confirmar NEGA em HPP` como ação explícita;
- edição individual após o atalho;
- `Usar modelo de exame normal` com confirmação explícita;
- edição individual após o template;
- quick choices;
- roteiros sindrômicos sem fatos pré-confirmados;
- autosave;
- rascunhos locais;
- copiar para clipboard com fallback;
- navegação lateral;
- internação e alta;
- edição livre;
- omissão de HPP não confirmado;
- scores sem falso zero;
- Glasgow sem falso 15;
- PWA/offline.

## Persistência

Existem dois domínios locais deliberadamente separados nesta etapa:

```text
schema v2
→ evolução / autosave / rascunhos existentes

schema v3
→ atendimento temporal ativo
```

A separação evita que a introdução do workflow temporal migre ou reinterpretе silenciosamente dados clínicos já salvos.

## Verificação

Requer Node.js 24 ou superior.

```bash
npm run verify
```

O comando executa verificação de sintaxe de todos os módulos e a suíte de regressão automatizada. O workflow `checks` deve rodar em branches e pull requests.

A suíte cobre, entre outros:

- invariantes de estado clínico;
- HPP e exame físico;
- scores incompletos;
- Glasgow;
- persistência v2 e migração legada;
- Atendimento v3;
- workflow temporal e histórico de etapas;
- progressive disclosure por etapa + contexto;
- disponibilidade ≠ aplicabilidade ≠ calculabilidade;
- HEART não calculável com troponina ausente;
- contrato textual da reavaliação;
- QP inline entre aspas;
- posição de `# SCORES:`;
- carry-forward sem conduta antiga;
- integração estática DOM/JS;
- app shell do PWA.

A regressão manual de navegador permanece um gate distinto do CI.

## Governança de mudança

Mudanças que alterem significado clínico seguem:

```text
AUDITORIA PRÉVIA
→ TESTE QUE CAPTURA O CONTRATO
→ ALTERAÇÃO MÍNIMA
→ VERIFICAÇÃO AUTOMATIZADA
→ AUDITORIA PÓS-ALTERAÇÃO
→ REGRESSÃO DE INTERFACE
```

Nenhuma alteração visual pode modificar silenciosamente o significado clínico do registro.

## Desenvolvimento local

```bash
python3 -m http.server 8000
```

Acesse `http://localhost:8000`.

## Dados e privacidade

Nesta fase, os dados são armazenados localmente no dispositivo. Não existe backend nem sincronização em nuvem.

Não utilizar dados identificáveis de pacientes em testes, demonstrações ou ambientes não autorizados.

Autenticação, controle de acesso, criptografia, retenção, backup e integração institucional pertencem a fases posteriores.

## Roadmap

O plano executável e os gates estão em `ROADMAP.md`.

O próximo gate de produto é a **regressão manual cognitiva e operacional em navegador real**, especialmente no fluxo:

```text
admissão
→ conduta inicial
→ pendências
→ retorno do resultado
→ reavaliação
→ novo cálculo quando aplicável
→ nova conduta / destino
```

## Licença

Nenhuma licença de uso foi concedida neste momento. Todos os direitos permanecem reservados ao titular do repositório.
