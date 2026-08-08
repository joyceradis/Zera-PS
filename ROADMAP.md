# Zera PS — Roadmap

Roadmap orientado por **risco + gate verificável**. Quantidade de telas não define maturidade.

## Estado executivo

| Fase | Estado | Gate principal |
| --- | --- | --- |
| 0. Fundação de segurança | Concluída | Sem fabricação clínica |
| 1. Workflow temporal | v1 implementada | Reavaliação preserva admissão |
| 2. Progressive disclosure | Referência SCA implementada | Motor continua genérico |
| 3. Ferramentas clínicas | Em evolução | `available ≠ applicable ≠ calculable` |
| 4. Documento temporal | v1 implementada | Dado antigo não aparece como novo |
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

Concluído em v1: schema v3, etapa atual, histórico, snapshot de admissão, pendências/resultados, reavaliações filhas, `Reavaliar atendimento`, persistência temporal independente e proteção do snapshot após início das reavaliações.

Próximos itens: múltiplos Atendimentos, fila de reavaliações e destino como estado formal.

## 2 — Progressive disclosure e configurações clínicas

Concluído como referência: `protocols/sca.js`, regras por cenário + etapa + contexto, ECG/troponina condicionais e estados visuais.

Próximos itens: renderer declarativo, schema/validador de protocolos e garantia de referências válidas antes de adicionar novos cenários.

## 3 — Ferramentas clínicas estruturadas

Princípio obrigatório:

```text
available ≠ applicable ≠ calculable
```

Concluído: estado genérico, variáveis faltantes, HEART contextual, bloqueio de cálculo sem troponina e `# SCORES:` apenas para ferramenta aplicada e calculada.

Próximos itens: validar UX do HEART, persistir versão/metadados do instrumento, classificar ferramentas (`score`, `checklist`, `rule`, `calculator`, `reference`) e implementar SNNOOP10 como checklist estruturada.

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

Próximos itens: versionamento de template institucional, política fina de carry-forward, snapshot explícito de exame físico reavaliado e regressão textual por template.

## 5 — Persistência e histórico

Atual: v2 para núcleo documental e v3 para Atendimento temporal ativo.

Próximos itens: múltiplos Atendimentos, histórico de documentos, versionamento de reavaliações, avaliação de IndexedDB, retenção, exportação/importação e testes de corrupção/recuperação.

## 6 — Fluxo operacional do plantão

Painel de atendimentos ativos, reavaliações pendentes, tempos, destino/desfecho, filtros e métricas locais sem dados identificáveis em demonstração.

## 7 — Novos cenários

Somente após regressão cognitiva do cenário SCA. Candidatos: cefaleia, pneumonia, dispneia, sepse/infecção, trauma e dor abdominal.

Cada cenário deve declarar campos, etapas, regras e ferramentas. Arquivo de cenário não executa diagnóstico ou conduta automaticamente.

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