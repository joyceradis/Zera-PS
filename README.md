# Zera PS

> **O paciente deve ser ouvido. O médico não deve redigitar a mesma história.**

O **Zera PS** é uma plataforma de documentação clínica sem fricção, orientada pelo contexto do atendimento e sustentada por rigor metodológico. Nasceu para devolver tempo clínico ao encontro entre médico e paciente em um pronto-socorro que frequentemente exige quatro a cinco atendimentos por hora.

No modelo-alvo, a médica inicia um **Atendimento**, parte de uma apresentação/contexto clínico quando isso economiza trabalho, recebe uma HDA pronta para editar ou escreve livremente, registra o dado uma vez e o reutiliza com segurança ao longo da evolução e dos eventos posteriores. Pendências, resultados, microferramentas e scores aparecem conforme contexto e etapa — sem presumir diagnóstico, fabricar informação ou substituir julgamento médico.

## Finalidade

O problema principal não é a falta de mais um formulário, protocolo ou catálogo de calculadoras. É o tempo de escuta consumido por digitação repetitiva, navegação e reconstrução da mesma história em documentos sucessivos.

> **Reduzir documentação é o meio. Devolver tempo ao paciente é o fim.**

Apoio à documentação, workflow temporal e ferramentas clínicas são camadas subordinadas a essa finalidade.

## Como o produto pensa

```text
ATENDIMENTO
   ↓
CONTEXTO / APRESENTAÇÃO CLÍNICA, QUANDO ÚTIL
   ↓
HDA EDITÁVEL + DADOS CONFIRMADOS
   ↓
DADO REGISTRADO UMA VEZ
   ↓
CONTEXTO + ETAPA TEMPORAL
   ↓
PENDÊNCIAS / RESULTADOS / MICROFERRAMENTAS
   ↓
DOCUMENTO REVISÁVEL E COPIÁVEL
```

**Princípio central:** nenhuma transformação documental pode aumentar o grau de certeza, alterar a polaridade ou fabricar um fato clínico ausente.

**Princípio de interação:** a interface deve ser previsível, keyboard-first e parcimoniosa em cliques, confirmações e mudanças de tela. Se uma interação estruturada for mais lenta do que escrever, o texto livre permanece caminho de primeira classe.

## Estado atual

O projeto possui fundação de segurança clínico-documental, testes automatizados, CI, persistência local, PWA e um primeiro motor temporal de referência para **dor torácica / suspeita de SCA**. A convergência atual reorganiza a superfície em torno de uma única entidade de **Atendimento** sem apagar implementações anteriores antes de comprovar equivalência de UX.

Capacidades hoje alcançáveis na superfície convergida:

- evolução estruturada e texto final sempre editável;
- roteiros existentes abrem HDA integral editável; a síndrome diarreica também possui compositor estruturado opcional;
- texto livre continua disponível independentemente do roteiro/contexto;
- atividade clínica real inicia um Encounter protocol-agnostic e alimenta o ciclo temporal do mesmo Atendimento;
- reavaliação vinculada ao mesmo Atendimento e sem sobrescrever a admissão;
- HPP com negativas apenas por ação explícita;
- modelo de exame físico normal somente após confirmação médica;
- CRB-65, CURB-65, qSOFA e Glasgow sem falso resultado inicial;
- organizador laboratorial recuperado do patrimônio histórico, com saída compacta no padrão do produto e sem fabricar analitos;
- justificativas piloto derivadas de dados já confirmados;
- autosave, rascunhos locais sem corte silencioso por quantidade e funcionamento PWA offline-first;
- regressão automatizada e auditorias por marco.

Capacidades implementadas internamente, mas **ainda sem alcance completo pela superfície convergida**:

- progressive disclosure dependente de protocolo;
- pendências, resultados seriados e contexto de etapa vinculados ao protocolo declarativo;
- ferramentas protocol-bound, incluindo o percurso contextual do HEART;
- seleção/apresentação canônica de contexto clínico sem reintroduzir `Workflow` como uma segunda porta de produto.

Esse gap de reachability é acompanhado na issue **#44**. A existência do engine, de testes ou de código preservado não é apresentada como capacidade disponível ao usuário enquanto não houver porta canônica verificável.

> O Zera PS permanece **MVP em validação**. CI verde não equivale a homologação assistencial.

## Atendimento temporal

Internamente, o Encounter v3 possui etapas explícitas:

```text
initial_assessment
→ initial_conduct
→ pending_results
→ reassessment
→ final_documentation
```

Esses nomes são arquitetura interna, não etapas que a médica precisa gerenciar como produtos independentes. A reavaliação pertence ao mesmo Atendimento e preserva a admissão. O contrato documental atual mantém, entre outras regras, `# QP: "..."` inline, `# SCORES:` abaixo da QP somente quando houver ferramenta aplicada/documentada e `# HDA (ADMISSÃO):` preservando o contexto inicial.

## Contexto clínico, não duas portas concorrentes

A médica não deve escolher entre “roteiro” e “workflow”. **Esse é o contrato de produto; a superfície convergida ainda não implementa integralmente essa porta canônica de contexto.** O seletor legado de workflow permanece oculto de propósito para não ressuscitar dois produtos concorrentes, enquanto a reachability do motor protocolar é reconciliada na #44.

A direção canônica permanece:

```text
CONTEXTO CLÍNICO
→ ajuda documental pertinente
→ ferramentas somente quando úteis
→ mesma Evolução / mesmo Atendimento
```

Protocolos, engines, registry e templates permanecem conceitos internos de engenharia. Até a porta canônica existir e ser validada, o README distingue explicitamente **capacidade implementada** de **capacidade alcançável**.

## Laboratório compacto

O organizador de laboratório vive no próprio bloco de **Exames Complementares**:

```text
texto bruto colado
→ parser determinístico
→ analitos explicitamente encontrados
→ saída compacta revisável
```

Exemplo de contrato de saída:

```text
- LAB: HB: 13,2 / HT: 39,8 / LEUCO: 23.400 (S 74%) / PLAQ: 245.000 / PCR: 72 / UR: 38 / CR: 0,9 / NA: 138 / K: 4,1
```

Frações leucocitárias somente são exibidas quando explicitamente presentes na fonte e acima do limite superior adotado para apresentação. O parser não conclui infecção, desvio à esquerda ou qualquer diagnóstico.

## Arquitetura

```text
Zera-PS/
├── index.html
├── app.html
├── app.js               # entrypoint do módulo ES
├── manifest.json        # PWA
├── service-worker.js    # app shell offline-first
├── src/                 # engines, coordenação e adapters de convergência
├── protocols/           # configurações clínicas declarativas internas
├── assets/              # fundação documental/UI estabilizada durante migração
├── tests/               # regressão automatizada
├── docs/                # documentação técnica por domínio
├── README.md
├── ROADMAP.md
└── CHANGELOG.md
```

A migração arquitetural é incremental. `assets/` não será esvaziado por estética: cada responsabilidade tem owner semântico definido e wrappers/adapters só serão consolidados depois de equivalência comportamental demonstrada.

## Contratos de segurança

- vazio ≠ `NEGA`;
- não informado ≠ não investigado;
- template ≠ exame realizado sem confirmação;
- sugestão ≠ fato clínico;
- contexto disponível ≠ diagnóstico confirmado;
- score incompleto ≠ zero;
- ferramenta disponível ≠ aplicável ≠ calculável ≠ aplicada/documentada;
- estado operacional ≠ conteúdo do prontuário;
- reavaliação não sobrescreve admissão;
- resultado novo não reescreve retrospectivamente dado anterior;
- migração técnica não fabrica confirmação clínica;
- saída permanece editável e revisável;
- reutilizar dado ≠ retirar contexto, proveniência ou temporalidade;
- documentação assistida ≠ decisão clínica automática.

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
| Mapa canônico do produto | [`docs/product/PRODUCT_MAP.md`](docs/product/PRODUCT_MAP.md) |
| Escopo do produto | [`docs/product/PRODUCT_SCOPE.md`](docs/product/PRODUCT_SCOPE.md) |
| Workflows | [`docs/product/WORKFLOWS.md`](docs/product/WORKFLOWS.md) |
| Arquitetura | [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) |
| Ownership | [`docs/architecture/OWNERSHIP.md`](docs/architecture/OWNERSHIP.md) |
| Contrato interno de protocolos | [`docs/architecture/PROTOCOL_CONTRACT.md`](docs/architecture/PROTOCOL_CONTRACT.md) |
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
