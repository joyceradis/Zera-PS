# Zera PS

> **Documentação clínica no ritmo do pronto-socorro, orientada por contexto, tempo e confirmação explícita.**

O **Zera PS** é um MVP offline-first de apoio à documentação clínica no pronto-socorro. Ele organiza o atendimento, revela campos conforme contexto e etapa, acompanha pendências e reavaliações e transforma dados confirmados em registro revisável — sem substituir julgamento médico ou o prontuário institucional.

## Como o produto pensa

```text
CENÁRIO
   ↓
ETAPA DO ATENDIMENTO
   ↓
DADOS + ESTADO + PROVENIÊNCIA
   ↓
PENDÊNCIAS / RESULTADOS
   ↓
FERRAMENTAS CLÍNICAS
   ↓
DOCUMENTO REVISÁVEL
```

**Princípio central:** nenhuma transformação documental pode aumentar o grau de certeza, alterar a polaridade ou fabricar um fato clínico ausente.

## Estado atual

O projeto já possui fundação de segurança clínico-documental, testes automatizados, CI e um primeiro workflow temporal de referência para **dor torácica / suspeita de SCA**.

Principais capacidades atuais:

- evolução estruturada;
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
├── app.js
├── src/                 # workflow temporal, contrato de protocolos e coordenação atual
├── protocols/           # configurações clínicas declarativas
├── assets/              # fundação documental estabilizada
├── tests/               # regressão automatizada
├── docs/                # documentação técnica organizada por domínio
├── README.md
└── ROADMAP.md
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
- saída permanece editável e revisável.

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