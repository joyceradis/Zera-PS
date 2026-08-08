# Zera PS — Roadmap

Este roadmap é orientado por risco e por gates verificáveis. Quantidade de telas não define maturidade.

## Fase 0 — Baseline e segurança estrutural

**Status:** fundação automatizada concluída; regressão manual permanece contínua.

- [x] inventário do MVP inicial;
- [x] eliminar `vazio → NEGA`;
- [x] tornar NEGA em HPP ação explícita;
- [x] tornar exame normal template confirmado;
- [x] remover fatos clínicos pré-confirmados dos roteiros;
- [x] impedir falso zero nos scores e falso Glasgow 15;
- [x] separar estado clínico, documento, UI, storage e scores;
- [x] persistência v2 conservadora;
- [x] testes automatizados e CI;
- [x] integração estática DOM/PWA;
- [ ] regressão manual desktop/mobile a cada marco de interface.

**Gate permanente:** nenhum campo vazio ou template não confirmado pode produzir afirmação clínica.

## Fase 1 — Workflow temporal de Atendimento

**Status:** implementação v1 em consolidação.

**Objetivo:** representar o atendimento como processo temporal, e não como formulários independentes.

```text
initial_assessment
→ initial_conduct
→ pending_results
→ reassessment
→ final_documentation
```

- [x] schema v3 de Atendimento temporal;
- [x] `currentStage` e histórico de etapas;
- [x] snapshot de admissão;
- [x] pendências e resultados disponibilizados;
- [x] múltiplas reavaliações como eventos filhos;
- [x] `Reavaliar atendimento` no fluxo;
- [x] persistência v3 separada do autosave/rascunhos v2;
- [x] preservar admissão durante reavaliação;
- [x] permitir atualização do snapshot enquanto a admissão ainda está em construção;
- [x] congelar o snapshot depois da primeira reavaliação;
- [x] persistir contexto do workflow para recuperação após reload;
- [ ] múltiplos atendimentos simultâneos;
- [ ] fila de atendimentos/reavaliações;
- [ ] destino como estado formal do Atendimento.

**Gate:** reavaliar nunca sobrescreve a admissão e reload não perde o contexto temporal ativo.

## Fase 2 — Progressive disclosure e configurações clínicas

**Status:** cenário de referência SCA implementado; generalização pendente.

**Objetivo:** mostrar apenas o que é necessário conforme cenário + etapa + estado.

- [x] `protocols/sca.js` como configuração declarativa;
- [x] `workflow-engine.js` genérico, sem conhecimento de SCA;
- [x] regras de visibilidade por etapa e contexto;
- [x] campos condicionais de ECG e troponina no cenário de referência;
- [x] pendências visuais com semântica de estado;
- [x] cores funcionais para disponível / incompleto / disponível como resultado / reavaliação;
- [ ] extrair toda configuração de UI específica do cenário para renderer declarativo;
- [ ] schema formal e validador de arquivos em `protocols/`;
- [ ] garantir que todo campo/regra/ferramenta referenciado em uma configuração exista;
- [ ] impedir seções obrigatórias inalcançáveis por configuração incorreta;
- [ ] novos cenários apenas após validação do padrão com SCA.

**Gate:** adicionar um segundo cenário não deve exigir `if (scenario === ...)` no motor genérico.

## Fase 3 — Ferramentas clínicas estruturadas

**Princípio:**

```text
available ≠ applicable ≠ calculable
```

- [x] estado genérico de ferramenta;
- [x] lista de variáveis faltantes;
- [x] mensagem de não calculabilidade;
- [x] HEART disponível no cenário SCA;
- [x] suspeita clínica determina pertinência do HEART;
- [x] ausência de troponina impede cálculo;
- [x] `# SCORES:` somente para ferramenta aplicada e calculada;
- [x] CRB-65, CURB-65, qSOFA e Glasgow permanecem sem falso resultado inicial;
- [ ] validar UX clínica do preenchimento do HEART — os campos de pontos atuais são infraestrutura de referência, não desenho final de coleta;
- [ ] registrar versão/metadados do instrumento em resultado persistido;
- [ ] classificar ferramentas em `score`, `checklist`, `rule`, `calculator`, `reference`;
- [ ] SNNOOP10 como checklist estruturada, não score numérico;
- [ ] vincular demais ferramentas a contextos após revisão de indicação e limitações.

**Gate:** ferramenta não produz resultado enquanto não for simultaneamente aplicável e calculável.

## Fase 4 — Documento temporal

**Status:** contrato de reavaliação v1 implementado.

Formato protegido:

```text
## REAVALIAÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##

# QP: "DOR TORÁCICA"

# SCORES:
- HEART: ...

# HDA (ADMISSÃO): ...

... EM TEMPO (REAVALIAÇÃO): ...

[CONTINUIDADE DAS SEÇÕES CLÍNICAS]

# CONDUTA:
- ...
```

- [x] QP inline e entre aspas na reavaliação;
- [x] `# SCORES:` imediatamente abaixo da QP quando aplicável;
- [x] omitir seção de scores quando não houver resultado válido;
- [x] HDA de admissão preservada;
- [x] `EM TEMPO (REAVALIAÇÃO)` como delta narrativo;
- [x] carry-forward exclui cabeçalho, QP, HDA e conduta antiga;
- [x] conduta final deriva da reavaliação atual;
- [ ] versionar templates institucionais (`templateId`, `templateVersion`);
- [ ] definir política fina de carry-forward para cada domínio temporal;
- [ ] representar exame físico atualizado como snapshot explícito da reavaliação quando utilizado;
- [ ] testes de regressão textual por template institucional.

**Gate:** o documento não pode apresentar um dado antigo como se tivesse sido novamente observado.

## Fase 5 — Persistência e histórico robustos

- [x] v2 para núcleo documental/rascunhos;
- [x] v3 independente para Atendimento temporal ativo;
- [ ] múltiplos Atendimentos;
- [ ] histórico de documentos por Atendimento;
- [ ] versionamento de reavaliações;
- [ ] avaliar IndexedDB;
- [ ] política de retenção local;
- [ ] exportação/importação segura;
- [ ] testes de corrupção e recuperação;
- [ ] backend apenas após requisitos institucionais e LGPD.

**Gate:** atualização de versão não perde Atendimento nem fabrica estado clínico.

## Fase 6 — Fluxo operacional do plantão

- [ ] painel de atendimentos ativos;
- [ ] reavaliações pendentes;
- [ ] hora de entrada, última ação e tempo de espera;
- [ ] destino/desfecho;
- [ ] métricas locais de tempo de documentação;
- [ ] filtros por status;
- [ ] indicadores sem dados identificáveis em demonstração.

**Gate:** a ferramenta reduz atrito sem aumentar omissões ou carga de interação.

## Fase 7 — Novos cenários

Somente após regressão cognitiva do cenário SCA.

Candidatos, sujeitos a especificação clínica própria:

- cefaleia;
- pneumonia;
- dispneia;
- sepse/infecção;
- trauma;
- dor abdominal.

Cada cenário deve declarar campos, etapas, regras e ferramentas. Nenhum arquivo de cenário pode executar diagnóstico ou conduta automaticamente.

**Gate:** fonte/finalidade/limitação das ferramentas do cenário estão definidas antes do código de produção.

## Fase 8 — Módulos documentais adicionais

Antes de implementar documento para exame/procedimento de maior complexidade, definir sua entidade exata:

- justificativa clínica de solicitação;
- relatório médico;
- resposta a exigência de auditoria;
- documento de autorização;
- relatório de acompanhamento;
- parecer técnico.

Não usar “laudo para o plano” como entidade técnica genérica.

## Fase 9 — Piloto controlado

- [ ] casos sintéticos padronizados;
- [ ] teste com médicos de PS em ambiente autorizado;
- [ ] tempo para documentação;
- [ ] taxa de edição do texto gerado;
- [ ] campos esquecidos;
- [ ] incidentes de afirmação não confirmada;
- [ ] perda de contexto entre admissão e reavaliação;
- [ ] satisfação e carga de interação.

**Meta de segurança:** zero saídas com informação clínica fabricada pelo sistema.

## Fase 10 — Produção institucional

Somente após piloto e requisitos institucionais:

- autenticação;
- controle de acesso;
- criptografia;
- logs/auditoria;
- backup;
- retenção;
- gestão de incidentes;
- política de privacidade;
- termos e responsabilidades;
- integração autorizada com sistemas institucionais.

## Critérios permanentes de mudança

Qualquer alteração clínico-documental deve responder:

1. Qual dado entra?
2. Quem ou qual fonte o originou?
3. Qual estado possui?
4. Em qual etapa temporal ele existe?
5. É dado histórico, atual, pendente ou resultado novo?
6. O que autoriza sua transformação em texto?
7. A ferramenta está disponível, aplicável e calculável?
8. A mudança pode aumentar certeza ou alterar polaridade?
9. Existe teste de regressão?
10. O fluxo antigo e suas microfunções foram preservados?
11. A saída continua editável e revisável?
