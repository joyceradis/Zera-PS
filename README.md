# Zera PS

> **O paciente deve ser ouvido. O médico não deve redigitar a mesma história.**

O **Zera PS** é uma plataforma de documentação clínica sem fricção, orientada por síndromes e sustentada por rigor metodológico. Nasceu para devolver tempo clínico ao encontro entre médico e paciente em um pronto-socorro que frequentemente exige quatro a cinco atendimentos por hora.

No modelo-alvo, a médica começa por uma síndrome ou apresentação clínica, recebe uma HDA semipronta e editável, registra o dado uma vez e o reutiliza com segurança ao longo da evolução, reavaliação, internação ou alta. *Cores* clínicos, pendências, protocolos e scores aparecem conforme contexto e etapa — sem presumir diagnóstico, fabricar informação ou substituir julgamento médico.

## Finalidade

O problema principal não é a falta de mais um formulário ou protocolo. É o tempo de escuta consumido por digitação repetitiva, navegação e reconstrução da mesma história em documentos sucessivos.

> **Reduzir documentação é o meio. Devolver tempo ao paciente é o fim.**

Apoio à decisão, workflow temporal e ferramentas clínicas são camadas subordinadas a essa finalidade.

## Como o produto pensa

```text
SÍNDROME OU APRESENTAÇÃO
   ↓
HDA SEMIPRONTA E EDITÁVEL
   ↓
DADO CONFIRMADO REGISTRADO UMA VEZ
   ↓
CONTEXTO + ETAPA DO ATENDIMENTO
   ↓
CORES / PENDÊNCIAS / RESULTADOS / FERRAMENTAS
   ↓
DOCUMENTOS REVISÁVEIS SEM REDIGITAÇÃO INTEGRAL
```

**Princípio central:** nenhuma transformação documental pode aumentar o grau de certeza, alterar a polaridade ou fabricar um fato clínico ausente.

**Princípio de interação:** a interface deve ser previsível, keyboard-first e parcimoniosa em cliques, confirmações e mudanças de tela. Reduzir digitação criando nova fricção mental não é sucesso.

## Estado atual

O projeto já possui fundação de segurança clínico-documental, testes automatizados, CI e um primeiro workflow temporal de referência para **dor torácica / suspeita de SCA**.

Principais capacidades atuais:

- evolução estruturada;
- roteiros documentais e HDAs semiprontas editáveis, ainda pendentes de reorganização sindrômica;
- reavaliação vinculada ao mesmo Atendimento;
- HPP com negativas apenas por ação explícita;
- modelo de exame físico normal confirmado pela médica;
- campos condicionais por cenário + etapa + contexto, renderizados a partir da configuração do protocolo;
- pendências e resultados de ECG/troponina no workflow de referência;
- HEART com `disponível ≠ aplicável ≠ calculável`;
- CRB-65, CURB-65, qSOFA e Glasgow sem falso resultado inicial;
- autosave, rascunhos locais e funcionamento PWA offline-first;
- regressão automatizada e auditorias por marco.

> O Zera PS permanece **MVP em validação**. CI verde não equivale a homologação assistencial.

## Workflow temporal

```text
initial_assessment
→ initial_conduct
→ pending_results
→ reassessment
→ final_documentation
```

A reavaliação pertence ao mesmo Atendimento e preserva a admissão. O contrato documental atual mantém, entre outras regras, `# QP: "..."` inline, `# SCORES:` abaixo da QP quando houver resultado válido e `# HDA (ADMISSÃO):` preservando o contexto inicial.

## Arquitetura

```text
Zera-PS/
├── index.html
├── app.html
├── app.js               # entrypoint do módulo ES
├── manifest.json        # PWA
├── service-worker.js    # app shell offline-first
├── src/                 # workflow temporal, contrato de protocolos e coordenação atual
├── protocols/           # configurações clínicas declarativas
├── assets/              # fundação documental estabilizada
├── tests/               # regressão automatizada
├── docs/                # documentação técnica organizada por domínio
├── README.md
├── ROADMAP.md
└── CHANGELOG.md
```

A migração arquitetural é incremental: a fundação estável em `assets/` permanece enquanto a camada temporal em `src/` amadurece, evitando perda de microfunções já estabilizadas.

## Contratos de segurança

- vazio ≠ `NEGA`;
- não informado ≠ não investigado;
- template ≠ exame realizado sem confirmação;
- sugestão ≠ fato clínico;
- score incompleto ≠ zero;
- ferramenta disponível ≠ aplicável ≠ calculável;
- reavaliação não sobrescreve admissão;
- resultado novo não reescreve retrospectivamente dado anterior;
- migração técnica não fabrica confirmação clínica;
- saída permanece editável e revisável;
- síndrome/apresentação ≠ diagnóstico presumido;
- reutilizar dado ≠ retirar contexto, proveniência ou temporalidade;

## Verificação

Requer Node.js 24+.

```bash
npm run verify
```

O comando executa verificação de sintaxe e toda a suíte automatizada. Testes manuais em navegador desktop/mobile e PWA continuam sendo gates independentes.

## Documentação

| Área | Documento |
| --- | --- |
| Índice técnico | [`docs/README.md`](docs/README.md) |
| Escopo do produto | [`docs/product/PRODUCT_SCOPE.md`](docs/product/PRODUCT_SCOPE.md) |
| Workflows | [`docs/product/WORKFLOWS.md`](docs/product/WORKFLOWS.md) |
| Arquitetura | [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) |
| Contrato de protocolos | [`docs/architecture/PROTOCOL_CONTRACT.md`](docs/architecture/PROTOCOL_CONTRACT.md) |
| Workflow temporal | [`docs/architecture/TEMPORAL_WORKFLOW.md`](docs/architecture/TEMPORAL_WORKFLOW.md) |
| Segurança clínica | [`docs/safety/CLINICAL_SAFETY.md`](docs/safety/CLINICAL_SAFETY.md) |
| Invariantes | [`docs/safety/INVARIANTS.md`](docs/safety/INVARIANTS.md) |
| Testes e gates | [`docs/testing/TESTING.md`](docs/testing/TESTING.md) |
| Roadmap | [`ROADMAP.md`](ROADMAP.md) |

Auditorias históricas ficam deliberadamente separadas em [`docs/audits/`](docs/audits/).

## Desenvolvimento local

```bash
python3 -m http.server 8000
```

Acesse `http://localhost:8000`.

## Dados e privacidade

Nesta fase os dados permanecem no dispositivo. Não existe backend nem sincronização em nuvem. Não utilizar dados identificáveis de pacientes em testes, demonstrações ou ambientes não autorizados.

## Licença

Nenhuma licença de uso foi concedida neste momento. Todos os direitos permanecem reservados ao titular do repositório.
