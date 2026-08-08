# Zera PS

**Documentação clínica no ritmo do pronto-socorro, com confirmação explícita e saída revisável.**

O Zera PS é um MVP offline-first de apoio à documentação clínica no pronto-socorro. O produto reduz atrito documental, organiza o fluxo de registro e oferece ferramentas clínicas estruturadas sem substituir julgamento médico, protocolos institucionais ou revisão profissional.

> **Princípio de segurança:** nenhuma transformação documental pode aumentar o grau de certeza, alterar a polaridade ou fabricar um fato clínico ausente.

## Estado atual

A fundação de segurança clínica e a separação arquitetural foram implementadas e submetidas a verificação automatizada.

**Último gate automatizado registrado em 2026-08-08:**

```text
syntax checks: success
tests: 27
pass: 27
fail: 0
skipped: 0
```

A regressão manual em navegador real ainda é obrigatória antes de qualquer declaração de homologação para uso assistencial. O Zera PS permanece um MVP em validação.

## Escopo funcional atual

- evolução estruturada no formato atualmente configurado para o Hospital Meridional Serra;
- QP, HDA, HPP, exame físico, exames complementares, hipóteses e conduta;
- reavaliação;
- solicitação de internação;
- alta;
- CRB-65, CURB-65, qSOFA e Glasgow;
- atalhos de HPP com confirmação explícita;
- modelo de exame físico normal confirmado por ação médica;
- roteiros sindrômicos sem pré-confirmar negativas, diagnósticos ou condutas;
- saída final editável;
- autosave e rascunhos locais;
- migração conservadora do armazenamento v1 para v2;
- PWA offline-first com Service Worker;
- testes automatizados e CI.

## Limites do produto

O Zera PS não:

- diagnostica de forma autônoma;
- prescreve automaticamente;
- decide alta, internação ou transferência;
- transforma campo vazio em negativa;
- considera template como exame realizado sem ação médica explícita;
- calcula score incompleto como zero;
- converte roteiro sindrômico em fato clínico;
- garante autorização de exames ou procedimentos;
- substitui o prontuário institucional;
- substitui protocolos ou responsabilidade profissional.

## Modelo de segurança clínica

```text
AÇÃO MÉDICA
    ↓
DADO CLÍNICO
    ↓
ESTADO + PROVENIÊNCIA
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
6. **Migração técnica não fabrica confirmação clínica.**
7. **Texto gerado permanece sujeito à revisão médica.**

## Arquitetura

```text
Zera-PS/
├── index.html
├── app.html
├── manifest.json
├── service-worker.js
├── package.json
├── README.md
├── ROADMAP.md
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
│   ├── clinical-state.test.mjs
│   ├── document-engine.test.mjs
│   ├── integration-static.test.mjs
│   ├── scores.test.mjs
│   ├── storage.test.mjs
│   └── templates.test.mjs
└── docs/
    ├── ARCHITECTURE.md
    ├── CLINICAL_SAFETY.md
    ├── AUDIT_BASELINE.md
    ├── AUDIT_POST_REFACTOR.md
    ├── AUDIT_RESULT.md
    └── TESTING.md
```

### Responsabilidades dos módulos

| Módulo | Responsabilidade |
| --- | --- |
| `clinical-state.js` | Estado, proveniência, confirmação e timestamps clínicos |
| `document-engine.js` | Transformação determinística de dados admissíveis em texto |
| `scores.js` | Definições, completude, cálculo e interpretação dos scores |
| `storage.js` | Persistência local versionada e migrações |
| `data.js` | Dados e configurações declarativas |
| `ui.js` | Renderização e interação com DOM |
| `app.js` | Coordenação entre estado, UI, documentos, scores e persistência |

A especificação arquitetural detalhada está em `docs/ARCHITECTURE.md`. As regras de segurança estão em `docs/CLINICAL_SAFETY.md`.

## Semântica clínica

### HPP

Um campo novo inicia sem confirmação. Campo vazio não gera linha afirmativa na evolução.

O comando **Confirmar NEGA em HPP** representa ação médica explícita e autoriza a transformação dos campos abrangidos em negativas documentais.

### Exame físico

O comando **Usar modelo de exame normal** registra:

- identificação do template;
- confirmação por ação médica;
- timestamp;
- valores utilizados.

Os achados permanecem editáveis. Modificações posteriores podem ser distinguidas do template originalmente confirmado.

### Roteiros sindrômicos

Roteiros fornecem estrutura e pontos de investigação. Eles não preenchem automaticamente negativas, hipótese diagnóstica ou conduta.

Ferramentas clínicas podem ser vinculadas ao contexto como metadado. Exemplo: cefaleia pode referenciar SNNOOP10 como checklist estruturada; isso não o transforma em score numérico nem em conclusão automática.

### Scores

Todo score inicia conceitualmente como:

```js
{
  status: 'incomplete',
  score: null,
  interpretation: null,
  answers: { /* variáveis obrigatórias inicialmente null */ }
}
```

Resultado e interpretação só existem após resposta explícita de todas as variáveis obrigatórias.

## Persistência

A fase atual usa `localStorage` com schema v2.

A migração de dados v1 preserva conteúdo legado, mas não converte valores antigos em dados clinicamente confirmados. Isso evita que uma migração de software altere o significado epistemológico de um registro.

## PWA / offline

O Service Worker mantém um app shell versionado e inclui os módulos atuais. O fallback para `app.html` é restrito a requisições de navegação; falha de recurso estático não deve ser mascarada pela entrega de HTML.

## Verificação

Requer Node.js 20 ou superior.

```bash
npm run verify
```

Esse comando executa:

```bash
npm run check
npm test
```

A suíte atual verifica, entre outros:

- estado clínico inicial não confirmado;
- negativa explícita e proveniência;
- distinção entre relato do paciente e observação médica;
- confirmação do template de exame físico;
- proibição de `vazio → NEGA`;
- omissão de exame não confirmado;
- score incompleto e completo;
- Glasgow incompleto e completo;
- migração conservadora de autosave e rascunhos;
- ausência de negativas, hipóteses e condutas pré-injetadas nos roteiros;
- correspondência estática entre IDs usados pelo coordenador e `app.html`;
- existência dos arquivos do PWA app shell;
- fallback offline restrito à navegação.

Procedimento completo em `docs/TESTING.md`. Evidência da auditoria atual em `docs/AUDIT_RESULT.md`.

## Desenvolvimento local

Módulos ES e Service Worker exigem contexto HTTP:

```bash
python3 -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## Dados e privacidade

Nesta fase, os dados são armazenados localmente no dispositivo. Não existe backend nem sincronização em nuvem.

Não utilizar dados identificáveis de pacientes em testes, demonstrações ou ambientes não autorizados.

Autenticação, controle de acesso, criptografia, retenção, backup e integração institucional pertencem a fases posteriores e não devem ser antecipados antes da estabilização do modelo de Atendimento e dos requisitos institucionais/LGPD.

## Governança de mudança

Mudanças que alterem significado clínico devem seguir:

```text
AUDITORIA PRÉVIA
→ TESTE DE REGRESSÃO
→ ALTERAÇÃO MÍNIMA
→ VERIFICAÇÃO AUTOMATIZADA
→ AUDITORIA PÓS-ALTERAÇÃO
→ REGRESSÃO DE INTERFACE QUANDO APLICÁVEL
```

Nenhuma alteração visual pode modificar silenciosamente o significado clínico do registro.

## Roadmap

O plano executável, com fases e gates de conclusão, está em `ROADMAP.md`.

A próxima barreira de qualidade é a regressão manual em navegador desktop/mobile; depois dela, o roadmap avança para entidade **Atendimento**, persistência vinculada e ferramentas clínicas estruturadas.

## Versionamento

- `main`: versão integrada e demonstrável;
- branches: desenvolvimento isolado;
- pull requests: revisão e CI antes da integração;
- mudanças clínicas: teste de regressão obrigatório;
- releases: marcos estáveis após gates definidos no roadmap.

## Licença

Nenhuma licença de uso foi concedida neste momento. Todos os direitos permanecem reservados ao titular do repositório.
