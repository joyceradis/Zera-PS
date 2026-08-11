# Auditoria integral e recuperação do Zera PS — 2026-08-11

Status: EM ANDAMENTO — baseline congelado antes de qualquer alteração funcional.

## Escopo

Auditar o repositório do zero antes de modificar UX, arquitetura ou conteúdo clínico. O objetivo é localizar regressões e microfunções perdidas, separar legado útil de documentação obsoleta e definir uma arquitetura de informação compatível com o fluxo real do pronto-socorro e com evolução futura para PWA/assinatura.

## Baseline confirmado

- `main`: `ab17a9687e588c9f48b82b94f1c8398a721e1605`.
- A branch histórica `claude/clinical-protocols-infrastructure-njmdmi` não contém trabalho perdido posterior: ela é ancestral da `main` e está 24 commits atrás.
- Existe uma branch `develop` antiga, de julho/2026, com `prototype-novo-atendimento.html`, `assets/attendance.js`, `ROADMAP_V0.2.md` e `SPEC_NOVO_ATENDIMENTO_V0.2.md`. Esses artefatos não devem ser mesclados automaticamente; serão tratados como fonte arqueológica de UX/microfunções.
- A `main` contém código executável duplicado entre `assets/` e wrappers/engines em `src/`, além de documentação histórica/auditorias. Essa duplicação exige mapeamento de ownership antes de limpeza.

## Achados P0/P1 iniciais

### P0 — Arquitetura de informação da UI está semanticamente duplicada

A interface atual apresenta simultaneamente `Roteiros de documentação` (rinossinusite, cefaleia, síndrome diarreica, síndrome gripal, PAC) e `Workflow contextual`/cenário. Para a usuária, ambos respondem à mesma pergunta clínica: “qual é o cenário deste atendimento?”. Isso cria duas taxonomias concorrentes e aumenta carga cognitiva.

Direção: unificar a entrada clínica em **Cenário do atendimento**. O cenário pode ter configuração simples ou workflow temporal avançado, mas isso é detalhe do motor, não uma segunda escolha da interface.

### P0 — Reavaliação está modelada duas vezes

A navegação lateral possui `Reavaliação` como destino separado enquanto o atendimento temporal já suporta reavaliação do mesmo encounter. Isso contradiz o contrato temporal: reavaliar é uma nova etapa do mesmo atendimento, não um produto/documento independente na navegação primária.

Direção: retirar `Reavaliação` da navegação primária e expor `Reavaliar atendimento` dentro do atendimento ativo. O documento gerado continua sendo `REAVALIAÇÃO PRONTO SOCORRO`.

### P0 — Microfunções perdidas devem ser recuperadas por arqueologia, não reescritas por memória

A usuária relata perda de: (1) calculadora/ferramentas rápidas; (2) normalizador/transcritor de exames laboratoriais, no qual texto copiado do laboratório era convertido para o formato clínico em caixa alta. Busca inicial na `main` não encontrou implementação nominal dessas funções. A branch `develop` e commits históricos serão inspecionados antes de qualquer reconstrução.

### P1 — `develop` é legado divergente, não branch de desenvolvimento atual

Ela contém uma arquitetura antiga e protótipo funcional de “Novo Atendimento”. Não deve continuar parecendo branch operacional corrente. Após extração do que for útil, deverá ser arquivada/renomeada ou documentada como legado; exclusão só depois de garantir rastreabilidade.

### P1 — Limpeza documental deve ocorrer depois da classificação

Não apagar documentos apenas por parecerem antigos. Cada arquivo será classificado como:

- CANONICAL — especificação vigente;
- AUDIT — evidência histórica preservada;
- LEGACY-REFERENCE — contém decisões/microfunções úteis, mas não é vigente;
- OBSOLETE — contradiz o sistema atual e não contém valor histórico exclusivo;
- DUPLICATE — conteúdo integralmente coberto por documento canônico.

Somente `OBSOLETE` e `DUPLICATE` serão candidatos à remoção.

## Norte de produto proposto para validação no código

```text
PLANTÃO
  ├── Novo atendimento
  │     └── Cenário
  │           └── Atendimento ativo
  │                 ├── Avaliação inicial
  │                 ├── Conduta
  │                 ├── Pendências/resultados
  │                 ├── Reavaliação
  │                 └── Destino/documentação
  ├── Atendimentos em andamento
  ├── Ferramentas
  │     ├── Scores/calculadoras
  │     └── Normalizar exames laboratoriais
  └── Rascunhos/histórico local
```

`Internação` e `Alta` são destinos/documentos do atendimento e devem ser avaliados para remoção da navegação primária pelo mesmo motivo da reavaliação. `Scores` deixa de ser simultaneamente “página principal” e “ferramenta contextual”: scores aplicáveis aparecem no atendimento; a área Ferramentas pode oferecer cálculo avulso quando isso tiver utilidade real.

## Invariantes que a reorganização não pode quebrar

1. campo vazio ≠ negativa;
2. modelo de exame ≠ exame realizado;
3. sugestão ≠ fato confirmado;
4. texto gerado ≠ texto validado;
5. disponível ≠ aplicável ≠ calculável ≠ aplicado;
6. estado operacional ≠ conteúdo documental;
7. reavaliação preserva admissão e resultados anteriores;
8. HDA integral/editável não pode ser truncada por refinadores;
9. `# QP: "..."` e contrato documental institucional permanecem estáveis;
10. nenhuma limpeza documental pode remover código ou evidência antes de confirmar substituto.

## Próximas etapas da auditoria

1. inventário integral da árvore da `main` e classificação documental;
2. comparação das branches relevantes contra `main`;
3. arqueologia de `develop`, protótipos e commits para localizar microfunções;
4. mapa DOM → evento → função → estado → storage → documento;
5. mapa de navegação atual versus domínio real;
6. suíte de regressão antes da primeira refatoração;
7. refatoração incremental em branch própria;
8. auditoria pós, CI e revisão de diff antes de qualquer merge.

Nenhuma alteração funcional foi realizada neste commit.