# Zera PS — Roadmap

Este roadmap é orientado por risco. Nenhuma fase avança por quantidade de telas; cada fase possui um gate verificável.

## Fase 0 — Baseline e segurança estrutural

**Objetivo:** transformar o MVP em uma base testável sem alterar silenciosamente o significado clínico.

- [x] branch isolada para refatoração;
- [x] inventário do fluxo atual;
- [x] identificar `vazio → NEGA`;
- [x] identificar exame normal em massa;
- [x] identificar templates com negativas pré-escritas;
- [x] identificar scores iniciando como zero/Glasgow 15;
- [x] criar modelo explícito de estado e proveniência;
- [x] criar `document-engine.js`;
- [x] separar dados declarativos de comportamento;
- [x] criar persistência v2 com migração conservadora;
- [x] adicionar testes automatizados e comando reproduzível;
- [x] adicionar CI;
- [ ] validar CI em pull request;
- [ ] executar regressão manual em navegador desktop e mobile.

**Gate:** testes automatizados verdes + revisão do diff + nenhum campo vazio gerando afirmação clínica.

## Fase 1 — Segurança documental do núcleo

**Objetivo:** consolidar evolução segura e rápida.

- [x] HPP com confirmação explícita;
- [x] `NEGA` em massa somente por ação médica;
- [x] exame normal como template explicitamente confirmado;
- [x] campos de exame editáveis após template;
- [x] templates sem negativas clínicas pré-confirmadas;
- [x] saída condicionada ao estado clínico;
- [x] campos sem confirmação omitidos do texto final;
- [ ] indicador visual de campos HPP pendentes;
- [ ] histórico de alteração de estado em atendimento ativo;
- [ ] confirmação diferenciada para `not_investigated` e `not_applicable` quando necessário.

**Gate:** nenhum fato clínico aparece na evolução sem entrada explícita, confirmação ou ação médica rastreável.

## Fase 2 — Scores e ferramentas clínicas estruturadas

**Objetivo:** impedir falso zero e diferenciar score de checklist clínica.

- [x] CRB-65 com estado incompleto;
- [x] CURB-65 com estado incompleto;
- [x] qSOFA com estado incompleto;
- [x] Glasgow sem valor inicial implícito;
- [x] resultado apenas após todas as respostas obrigatórias;
- [ ] persistir scores vinculados ao atendimento;
- [ ] registrar horário e versão do instrumento;
- [ ] classificar ferramentas em `score`, `checklist`, `rule` e `reference`;
- [ ] implementar SNNOOP10 como checklist estruturada, não como score numérico;
- [ ] vincular ferramentas aos contextos clínicos sem execução automática.

**Gate:** ausência de resposta nunca produz pontuação ou interpretação clínica.

## Fase 3 — Entidade Atendimento

**Objetivo:** deixar de tratar evolução, reavaliação e desfecho como ilhas independentes.

```text
ATENDIMENTO
├── identificação local não nominal
├── timestamps
├── evolução inicial
├── reavaliações[]
├── scores[]
├── documentos[]
└── desfecho
```

- [ ] schema v3 de Atendimento;
- [ ] múltiplos atendimentos simultâneos;
- [ ] reavaliações vinculadas ao atendimento;
- [ ] internação/alta vinculadas ao atendimento;
- [ ] histórico por versão;
- [ ] fila de pendências;
- [ ] recuperação após reload sem perda de contexto.

**Gate:** cada documento pode ser rastreado ao atendimento que o originou sem misturar dados entre pacientes.

## Fase 4 — Document Engine versionado

**Objetivo:** tornar templates institucionais auditáveis.

- [ ] `templateId` e `templateVersion` em cada documento;
- [ ] configuração institucional separada do código clínico;
- [ ] teste de regressão textual por template;
- [ ] preservar documentos antigos quando template mudar;
- [ ] suporte a formato institucional sem alterar o dado de origem.

**Gate:** mudança de template não altera retroativamente documentos previamente gerados.

## Fase 5 — Persistência robusta

**Objetivo:** evoluir além do `localStorage` quando o modelo de Atendimento estiver estável.

- [ ] avaliar IndexedDB;
- [ ] política explícita de retenção local;
- [ ] exportação/importação segura;
- [ ] estratégia de migração de schema;
- [ ] testes de corrupção e recuperação;
- [ ] avaliar backend somente após requisitos de LGPD e fluxo institucional.

**Gate:** atualização de versão não perde atendimento salvo nem fabrica novo estado clínico.

## Fase 6 — Fluxo operacional do plantão

- [ ] painel de atendimentos ativos;
- [ ] reavaliações pendentes;
- [ ] horário de entrada e última ação;
- [ ] desfecho;
- [ ] métricas locais de tempo de documentação;
- [ ] filtros por status sem dados identificáveis em demonstração.

**Gate:** o produto reduz atrito documental sem aumentar omissões ou cliques desnecessários.

## Fase 7 — Módulos documentais adicionais

Somente depois do núcleo estabilizado.

Antes de implementar qualquer documento para exame/procedimento de maior complexidade, definir a entidade exata:

- justificativa clínica de solicitação;
- relatório médico;
- resposta a exigência de auditoria;
- documento de autorização;
- relatório de acompanhamento;
- parecer técnico.

Não usar o rótulo genérico “laudo para o plano” como entidade técnica.

**Gate:** finalidade, autoria, campos mínimos e responsabilidade de cada documento estão definidos antes do código.

## Fase 8 — Piloto controlado

- [ ] casos sintéticos padronizados;
- [ ] teste com médicos de PS em ambiente autorizado;
- [ ] tempo para documentação;
- [ ] taxa de edição do texto gerado;
- [ ] campos esquecidos;
- [ ] incidentes de afirmação não confirmada;
- [ ] perda de dados;
- [ ] satisfação e carga de interação.

**Meta de segurança:** zero saídas com informação clínica fabricada pelo sistema.

## Fase 9 — Produção institucional

Somente após piloto e definição de requisitos institucionais:

- autenticação;
- controle de acesso;
- criptografia;
- logs e auditoria;
- backup;
- retenção;
- gestão de incidentes;
- política de privacidade;
- termos e responsabilidades;
- integração autorizada com sistemas institucionais.

## Critérios permanentes

Qualquer alteração clínica deve responder:

1. Qual dado entra?
2. Quem/qual fonte o informou ou observou?
3. Qual estado ele possui?
4. O que autoriza sua transformação em texto?
5. A mudança pode aumentar certeza ou alterar polaridade?
6. Existe teste cobrindo a regressão?
7. A saída continua editável e revisável?
