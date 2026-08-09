# Zera PS — Roadmap

Roadmap orientado por **risco + gate verificável**. Quantidade de telas não define maturidade.

## Doutrina permanente do produto

> **O paciente deve ser ouvido; o médico deve ser poupado de redigitar a mesma informação.**

O Zera PS não é prioritariamente uma biblioteca de protocolos nem um gerador de texto. É uma plataforma de documentação sem fricção: começa por síndrome ou apresentação clínica, oferece HDA semipronta, registra o dado uma vez e o reutiliza com contexto em todo o Atendimento. Protocolos, scores, pendências, temporalidade e apoio à decisão servem a essa finalidade.

Ordem obrigatória de prioridade:

1. tempo de escuta e exame;
2. HDA semipronta metodologicamente segura;
3. mínima digitação repetida e mínima carga de interação;
4. entrada sindrômica e *cores* contextuais;
5. reutilização responsável ao longo do Atendimento;
6. ferramentas clínicas e protocolos;
7. expansão de funcionalidades.

Nenhuma nova funcionalidade deve ser considerada avanço se economizar texto, mas aumentar cliques, navegação, dúvida operacional ou risco de informação presumida.

## Estado executivo

| Fase | Estado | Gate principal |
| --- | --- | --- |
| 0. Fundação de segurança | Concluída | Sem fabricação clínica |
| 1. Workflow temporal | v1.1 implementada | Reavaliação preserva admissão e resultados seriados |
| 2. Progressive disclosure | Infraestrutura declarativa concluída | Motor continua genérico |
| 3. Ferramentas clínicas | v1.1 implementada | `available ≠ applicable ≠ calculable ≠ applied` |
| 4. Documento temporal | v1.1 implementada | Estado operacional não vaza para o prontuário |
| 5. Persistência/histórico | Parcial | Sem perda ou reinterpretação de estado |
| 6. Experiência sem fricção | Prioridade atual | Menos redigitação e interação sem perda de conteúdo |
| 7. Cores sindrômicos | Bloqueada por validação cognitiva | Síndrome antes de diagnóstico; configuração antes de código |
| 8. Módulos adicionais | Futuro | Entidade documental definida |
| 9. Piloto | Futuro | Zero informação fabricada |
| 10. Produção institucional | Futuro | Requisitos institucionais/LGPD |

## 0 — Fundação de segurança

**Concluído:** eliminação de `vazio → NEGA`, NEGA em HPP como ação explícita, template normal confirmado, scores sem falso zero/Glasgow 15, separação de estado/documento/UI/storage, persistência v2, testes, CI e PWA endurecido.

**Gate permanente:** nenhum campo vazio ou template não confirmado pode produzir afirmação clínica.

## 1 — Workflow temporal de Atendimento

```text
initial_assessment
→ initial_conduct
→ pending_results
→ reassessment
→ final_documentation
```

Concluído: schema v3, etapa atual, histórico, snapshot de admissão, pendências, `results[]` temporal append-only, reavaliações filhas, `Reavaliar atendimento`, persistência temporal independente e proteção do snapshot após início das reavaliações.

Resultados seriados passam a ser eventos distintos. Troponina inicial não é sobrescrita por troponina de controle. O mesmo modelo deverá ser reutilizado para ECG, sinais vitais e demais variáveis temporais.

Próximos itens: UI explícita para múltiplas coletas/resultados seriados, múltiplos Atendimentos, fila de reavaliações e destino como estado formal.

## 2 — Progressive disclosure e configurações clínicas

Concluído como referência: `protocols/sca.js`, regras por cenário + etapa + contexto, ECG/troponina condicionais e estados visuais.

Concluído nesta fase: contrato formal de protocolo, validador determinístico com falha explícita, registry único, renderer declarativo e migração do SCA como prova da arquitetura. A interface deixou de conter blocos específicos do cenário e nenhuma camada genérica importa ferramenta clínica concreta.

Próximos itens: ampliar tipos de campo e operadores de regra apenas quando um cenário real exigir, e versionar migração de protocolo quando um `version` mudar de forma incompatível.

## 3 — Ferramentas clínicas estruturadas

Princípio obrigatório:

```text
available ≠ applicable ≠ calculable ≠ applied
```

Concluído: estado genérico, variáveis faltantes, HEART contextual, bloqueio de cálculo sem troponina, cálculo determinístico quando completo e aplicação documental explícita. Uma ferramenta calculável não entra automaticamente em `# SCORES:`.

Próximos itens: validar UX do HEART no plantão, persistir versão/metadados do instrumento, classificar ferramentas (`score`, `checklist`, `rule`, `calculator`, `reference`) e implementar SNNOOP10 como checklist estruturada.

## 4 — Documento temporal

Contrato protegido de reavaliação:

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

Regra nova formalizada: **estado operacional ≠ conteúdo documental**. Pendência de troponina, HEART incompleto e avisos de workflow permanecem na interface e não entram automaticamente no documento.

Próximos itens: versionamento de template institucional, política fina de carry-forward, snapshot explícito de exame físico reavaliado e regressão textual por template.

## 5 — Persistência e histórico

Atual: v2 para núcleo documental e v3 para Atendimento temporal ativo.

Próximos itens: múltiplos Atendimentos, histórico de documentos, versionamento de reavaliações, avaliação de IndexedDB, retenção, exportação/importação e testes de corrupção/recuperação.

## 6 — Experiência operacional sem fricção

Esta fase precede a expansão clínica. O objetivo é comprovar que o Zera realmente devolve tempo à escuta, em vez de apenas transferir a carga da digitação para cliques e navegação.

Implementado como primeiro núcleo validável: compositor da **síndrome diarreica**, com temporalidade, frequência, consistência, sintomas, características das fezes e sinais de alarme em estados explícitos (`não informado`, `presente`, `negado`). A HDA é produzida integralmente em caixa alta, permanece editável e não é sobrescrita após edição manual sem ação explícita.

Próximos itens:

- validar cognitivamente a HDA semipronta da síndrome diarreica e então ampliar o mesmo contrato para as demais síndromes;
- permitir fluxo keyboard-first, ordem previsível de foco e atalhos coerentes;
- reduzir modais, confirmações banais, mudanças de tela e cliques sem valor clínico;
- registrar o dado uma vez e reutilizá-lo com contexto em evolução, reavaliação, internação e alta;
- impedir que reutilização carregue conduta antiga, certeza maior ou informação fora da etapa correta;
- validar a interface durante plantão real, inclusive com cronômetro e contagem de interações;
- somente depois consolidar painel de atendimentos ativos, reavaliações pendentes, tempos e desfechos.

Gate: a médica deve conseguir ouvir, registrar e documentar sem reconstruir a narrativa e sem procurar controles na interface.

## 7 — Cores sindrômicos

Somente após a validação cognitiva da experiência sem fricção. As portas de entrada devem ser síndromes ou apresentações, não diagnósticos presumidos.

Candidatos iniciais:

- síndrome diarreica;
- síndrome gripal;
- síndrome febril;
- cefaleia;
- dor torácica;
- dispneia;
- dor abdominal;
- trauma.

Pneumonia, rinossinusite, síndrome coronariana aguda e outros diagnósticos podem surgir como hipóteses ou contextos explicitamente selecionados depois da avaliação. Não devem definir automaticamente a história inicial.

Cada *core* deve declarar HDA semipronta, campos, etapas, sinais de alarme, regras e ferramentas conforme [`docs/architecture/PROTOCOL_CONTRACT.md`](docs/architecture/PROTOCOL_CONTRACT.md). O arquivo não executa diagnóstico ou conduta automaticamente. A infraestrutura já aceita configuração; o gate remanescente é clínico, cognitivo e operacional — não apenas técnico.

## 8 — Módulos documentais adicionais

Antes de implementar qualquer documento de maior complexidade, definir a entidade exata: justificativa clínica, relatório médico, resposta a exigência, documento de autorização, relatório de acompanhamento ou parecer técnico.

## 9 — Piloto controlado

Medir tempo de documentação, tempo útil de escuta, repetição do mesmo dado, quantidade de cliques, uso do teclado, mudanças de tela, taxa de edição, completude da HDA, campos esquecidos, perda de contexto, incidentes clínico-documentais e carga mental percebida.

**Meta de segurança:** zero saídas com informação clínica fabricada pelo sistema.

## 10 — Produção institucional

Somente após piloto e requisitos institucionais: autenticação, acesso, criptografia, logs, backup, retenção, incidentes, privacidade, termos e integração autorizada.

## Critérios permanentes de mudança

Toda mudança clínico-documental deve responder: qual tempo devolve à escuta; qual digitação ou interação elimina; qual dado entra; se a entrada é síndrome ou diagnóstico; origem; estado; etapa temporal; natureza histórica/atual/pendente; regra de reutilização; autorização para renderização; estado da ferramenta; risco de aumento de certeza; teste de regressão; preservação de microfunções; e revisão final da saída.

Detalhes técnicos e auditorias: [`docs/README.md`](docs/README.md).
