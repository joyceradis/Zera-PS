# Zera PS — Roadmap

Roadmap orientado por **risco + gate verificável**. Quantidade de telas não define maturidade.

## Estado executivo

| Fase | Estado | Gate principal |
| --- | --- | --- |
| 0. Fundação de segurança | Concluída | Sem fabricação clínica |
| 1. Workflow temporal | v1.1 implementada | Reavaliação preserva admissão e resultados seriados |
| 2. Progressive disclosure | Infraestrutura declarativa concluída | Motor continua genérico |
| 3. Ferramentas clínicas | v1.1 implementada | `available ≠ applicable ≠ calculable ≠ applied` |
| 4. Documento temporal | v1.1 implementada | Estado operacional não vaza para o prontuário |
| 5. Persistência/histórico | Parcial | Sem perda ou reinterpretação de estado |
| 6. Fluxo operacional | Planejada | Menor atrito sem omissões |
| 7. Novos cenários | Bloqueada por validação SCA | Configuração antes de código |
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

## 6 — Fluxo operacional do plantão

Painel de atendimentos ativos, reavaliações pendentes, tempos, destino/desfecho, filtros e métricas locais sem dados identificáveis em demonstração.

## 7 — Novos cenários

Somente após regressão cognitiva do cenário SCA. Candidatos: cefaleia, pneumonia, dispneia, sepse/infecção, trauma e dor abdominal.

Cada cenário deve declarar campos, etapas, regras e ferramentas conforme [`docs/architecture/PROTOCOL_CONTRACT.md`](docs/architecture/PROTOCOL_CONTRACT.md). Arquivo de cenário não executa diagnóstico ou conduta automaticamente. A infraestrutura já aceita configuração; o gate remanescente é clínico, não técnico.

## 8 — Módulos documentais adicionais

Antes de implementar qualquer documento de maior complexidade, definir a entidade exata: justificativa clínica, relatório médico, resposta a exigência, documento de autorização, relatório de acompanhamento ou parecer técnico.

## 9 — Piloto controlado

Medir tempo de documentação, taxa de edição, campos esquecidos, perda de contexto, incidentes clínico-documentais e carga de interação.

**Meta de segurança:** zero saídas com informação clínica fabricada pelo sistema.

## 10 — Produção institucional

Somente após piloto e requisitos institucionais: autenticação, acesso, criptografia, logs, backup, retenção, incidentes, privacidade, termos e integração autorizada.

## Critérios permanentes de mudança

Toda mudança clínico-documental deve responder: qual dado entra; origem; estado; etapa temporal; natureza histórica/atual/pendente; autorização para renderização; estado da ferramenta; risco de aumento de certeza; teste de regressão; preservação de microfunções; e revisão final da saída.

Detalhes técnicos e auditorias: [`docs/README.md`](docs/README.md).
