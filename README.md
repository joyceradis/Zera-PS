# Zera PS

**Documentação clínica no ritmo do pronto-socorro, com confirmação explícita e saída revisável.**

O Zera PS é um MVP offline-first de apoio à documentação clínica no pronto-socorro. O produto organiza dados, acelera registros repetitivos e oferece ferramentas clínicas estruturadas sem substituir julgamento médico, protocolos institucionais ou revisão profissional.

> **Princípio de segurança:** nenhuma transformação documental pode aumentar o grau de certeza, alterar a polaridade ou fabricar um fato clínico ausente.

## Status

O projeto está em evolução arquitetural. O núcleo funcional inclui evolução, reavaliação, solicitação de internação, alta, scores, rascunhos locais e PWA. A arquitetura atual está sendo consolidada para separar estado clínico, transformação documental, interface, scores e persistência.

O Zera PS ainda não deve ser tratado como produto assistencial homologado.

## O que existe hoje

- evolução estruturada para o fluxo atualmente configurado do Hospital Meridional Serra;
- QP, HDA, HPP, exame físico, exames complementares, hipóteses e conduta;
- reavaliação, internação e alta;
- CRB-65, CURB-65, qSOFA e Glasgow;
- atalhos de HPP e exame físico com intenção explícita;
- templates sindrômicos sem pré-confirmar negativas clínicas;
- saída em caixa alta e editável;
- rascunhos e autosave locais;
- migração de armazenamento v1 → v2 sem inferir confirmação clínica;
- funcionamento offline por Service Worker;
- sem backend ou chamadas externas nesta fase;
- testes automatizados para invariantes clínico-documentais.

## O que o Zera PS não faz

- não diagnostica de forma autônoma;
- não prescreve automaticamente;
- não decide alta ou internação;
- não transforma campo vazio em negativa;
- não considera template como exame realizado sem ação médica explícita;
- não calcula score incompleto como zero;
- não garante autorização de exames ou procedimentos;
- não substitui o prontuário institucional.

## Arquitetura

```text
Ação médica
    ↓
Dado clínico
    ↓
Estado + proveniência
    ↓
Transformação documental
    ↓
Saída editável
    ↓
Revisão médica
```

Estrutura principal:

```text
Zera-PS/
├── index.html
├── app.html
├── manifest.json
├── service-worker.js
├── package.json
├── README.md
├── ROADMAP.md
├── docs/
│   └── ARCHITECTURE.md
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
└── tests/
    ├── clinical-state.test.mjs
    ├── document-engine.test.mjs
    ├── scores.test.mjs
    └── storage.test.mjs
```

### Responsabilidades

`clinical-state.js` — estado, proveniência e confirmação clínica.

`document-engine.js` — transformação determinística de dados confirmados em texto.

`scores.js` — definições, respostas, completude e cálculo dos scores.

`storage.js` — persistência local versionada e migração.

`ui.js` — renderização e interação com DOM.

`data.js` — somente dados e configurações declarativas.

`app.js` — coordenação entre os módulos.

Veja `docs/ARCHITECTURE.md` para os invariantes e contratos internos.

## Segurança clínica

### Campo vazio

Campo vazio representa ausência de informação no sistema. Ele não autoriza geração de `NEGA`, `NORMAL`, `AUSENTE` ou qualquer outra afirmação clínica.

### Negativas em HPP

O comando **Confirmar NEGA em HPP** representa intenção explícita da médica. Só então os respectivos campos recebem estado `denied` e podem gerar `NEGA` na saída.

### Exame físico normal

O comando **Usar modelo de exame normal** registra ação médica explícita, associa o `templateId`, grava timestamp de confirmação e mantém os achados editáveis.

### Templates sindrômicos

Templates fornecem estrutura, perguntas e pontos de revisão. Não devem carregar negativas clínicas como fatos já confirmados.

### Scores

Um score começa como `incomplete`, com `score: null`. Resultado e interpretação só surgem quando todas as variáveis obrigatórias foram respondidas.

## Testes

Requer Node.js 20 ou superior.

```bash
npm test
```

Os testes atuais cobrem:

- estado clínico inicial;
- negativa explícita;
- proveniência de relato e observação;
- confirmação de template;
- proibição de `vazio → NEGA`;
- renderização condicional do exame físico;
- score incompleto;
- cálculo após completude;
- Glasgow incompleto e completo;
- schema de armazenamento;
- migração v1 → v2 sem fabricação de estado clínico.

## Desenvolvimento local

Use um servidor HTTP local para testar corretamente módulos ES e Service Worker:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Dados e privacidade

Nesta fase, os dados ficam no dispositivo por `localStorage`. Não existe sincronização em nuvem. Não utilize dados identificáveis de pacientes em testes ou demonstrações fora de ambiente institucional autorizado.

## Versionamento

- `main`: versão estável/demonstrável;
- branches de trabalho: mudanças isoladas;
- integração somente após regressão e revisão;
- versões estáveis devem receber tag/release.

## Roadmap

O roadmap executável e os gates de conclusão estão em `ROADMAP.md`.

## Licença

Nenhuma licença de uso foi concedida neste momento. Todos os direitos permanecem reservados ao titular do repositório.
