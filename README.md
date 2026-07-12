# Zera PS

**Documentação clínica no ritmo do plantão.**

O Zera PS é um MVP offline-first de uma estação clínica para pronto-socorro. A proposta é reduzir a fricção documental, organizar o fluxo do atendimento e apresentar ferramentas úteis no momento certo, sem substituir julgamento clínico, protocolos institucionais ou revisão médica.

## Status do projeto

O projeto está em fase de MVP funcional e evolução de arquitetura. A versão atual já permite testar o núcleo de documentação, mas ainda não deve ser tratada como produto assistencial homologado.

## O que existe hoje

- Evolução no padrão atualmente configurado para o Hospital Meridional Serra
- QP, HDA, HPP, exame físico, exames complementares, hipóteses e conduta
- Saída final em caixa alta, editável e pronta para copiar
- Modelos rápidos para cenários clínicos frequentes
- Reavaliação, solicitação de internação e alta
- Scores CRB-65, CURB-65, qSOFA e Glasgow
- Seleções rápidas em HPP e exame físico
- Autosave e rascunhos em `localStorage`
- Funcionamento offline após o primeiro carregamento
- Sem backend e sem chamadas a APIs externas nesta fase

## Visão do produto

A evolução futura do Zera PS será centrada em um objeto único chamado **Atendimento**.

```text
ATENDIMENTO
├── QP
├── HDA
├── HPP
├── EXAME FÍSICO
├── EXAMES COMPLEMENTARES
├── HIPÓTESES + CID
├── CONDUTA
├── REAVALIAÇÕES
├── LAUDOS
├── DESFECHO
└── HORÁRIOS E MÉTRICAS
```

A interface deverá manter um bloco de evolução imponente e editável no topo, com sete seções progressivas abaixo:

```text
1. QP
2. HDA
3. HPP
4. EXAME FÍSICO
5. EXAMES COMPLEMENTARES
6. HIPÓTESES + CID
7. CONDUTA
```

As ferramentas existirão no menu para acesso independente, mas também deverão surgir automaticamente dentro do atendimento quando o contexto exigir. Exemplos:

- suspeita de pneumonia → oferecer CURB-65;
- laboratório colado → abrir organizador de exames;
- hipótese registrada → sugerir CID para confirmação;
- tomografia ou ressonância solicitada → oferecer laudo para o plano;
- internação selecionada → gerar justificativa editável;
- reavaliação escolhida → inserir o caso na fila de pendências.

## Roadmap

### v0.1 — MVP atual

- gerador de evolução;
- reavaliação, internação e alta;
- scores;
- autosave e rascunhos locais;
- PWA offline-first.

### v0.2 — Estrutura de atendimento

- criar o modelo central de Atendimento;
- reorganizar o formulário nos sete cards;
- manter navegação livre entre as seções;
- preservar o bloco final de evolução.

### v0.3 — Fluxo do plantão

- múltiplos atendimentos;
- reavaliações pendentes;
- histórico por cards;
- desfechos e horários.

### v0.4 — Métricas

- atendimentos totais;
- altas, internações e reavaliações;
- média de atendimentos por hora;
- gráficos por horário, QP, CID e desfecho.

### v0.5 — Ferramentas contextuais

- organizador de exames laboratoriais;
- sugestões de scores;
- sugestão de CID com confirmação médica;
- laudos editáveis e impressão em A4.

### v0.6 — Validação de uso

- testes com médicos de pronto-socorro;
- análise de cliques, hesitação e tempo de preenchimento;
- revisão clínica dos scores, modelos e textos gerados.

### v0.7 — Conta e sincronização

- login;
- perfil profissional;
- preferências e métricas sincronizadas;
- arquitetura segura para dados clínicos e adequação à LGPD.

### v0.8 — Inteligência clínica assistiva

- HDA narrativa;
- exame físico contextual;
- diferenciais e pontos a revisar;
- apoio a CID, laudos e condutas sempre sujeito à validação médica.

## Estrutura atual

```text
Zera-PS/
├── index.html
├── app.html
├── manifest.json
├── service-worker.js
├── assets/
│   ├── app.js
│   ├── data.js
│   ├── templates.js
│   ├── scores.js
│   ├── styles.css
│   └── logo.svg
└── README.md
```

## Desenvolvimento local

Abra o projeto por um servidor local para testar corretamente o service worker.

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Dados, segurança e uso responsável

- A versão atual armazena rascunhos somente no dispositivo, por meio de `localStorage`.
- Não existe sincronização em nuvem nesta fase.
- Não utilize dados identificáveis de pacientes em testes ou demonstrações.
- Todo texto deve ser revisado e validado pelo médico antes do registro em prontuário.
- A ferramenta não substitui avaliação clínica, protocolos institucionais ou decisão profissional.

## Versionamento

- `main`: versão estável e demonstrável;
- `develop`: desenvolvimento da próxima versão;
- releases numeradas, como `v0.1.0`, preservam os marcos estáveis do projeto.

As mudanças futuras devem ser feitas em `develop` e levadas para `main` apenas após teste. Quando uma versão estiver estável, ela recebe uma nova release.

## Licença

Nenhuma licença de uso foi concedida neste momento. Todos os direitos permanecem reservados ao titular do repositório.
