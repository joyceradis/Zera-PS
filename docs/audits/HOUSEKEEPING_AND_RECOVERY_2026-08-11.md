# Zera PS — Housekeeping & Recovery Audit

Data: 2026-08-11
Status: EM ANDAMENTO
Branch: `audit/full-repository-recovery-2026-08-11`

## Objetivo
Reduzir entropia do repositório sem perder patrimônio funcional. Esta auditoria precede exclusões, merges conceituais, reorganização de navegação e reconstrução de microfunções.

## Regras
1. Nenhuma capacidade é removida apenas porque a UI atual parece redundante.
2. Antes de reescrever, procurar implementação anterior no histórico.
3. Mudança funcional exige caracterização/teste antes e regressão depois.
4. Código interno pode manter conceitos técnicos que não devem aparecer como modelo mental para a médica.
5. Ausência de dado nunca pode virar afirmação clínica.
6. Priorizar redução de cliques, teclas, troca de contexto e tempo até texto copiável.

## Classificação
KEEP; REFINE; MOVE; MERGE; RECOVER; DELETE; REWRITE.

## Inventário inicial
| Capacidade | Estado | Classificação provisória | Observação |
|---|---|---|---|
| Clinical state/proveniência | existe | KEEP | fundamento de segurança |
| Document engine | existe | KEEP/REFINE | preservar contrato documental |
| Workflow temporal | existe | KEEP/REFINE | não competir visualmente com cenário |
| Roteiros + workflow contextual na UI | coexistem | MERGE | abstração interna vazando para a médica |
| Reavaliação como item primário | existe | MOVE | etapa/evento do mesmo atendimento |
| HDA integral editável | existe | KEEP/REFINE | texto livre permanece first-class |
| Scores | existem | KEEP/REFINE | contextualizar |
| Exames complementares um item por linha | existe | KEEP | commit 9a8697d |
| Organizador/normalizador de laboratório bruto | não localizado ainda | RECOVER — P0 | rastrear histórico antes de reconstruir |
| Justificativas de alto custo/internação | piloto | KEEP/ISOLATE | fora do núcleo da HDA |
| PWA/offline | existe | AUDIT | verificar cache/registro/atualização |
| Gráficos/dashboard | a auditar | UNCLASSIFIED | descobrir origem/utilidade antes de excluir |
| Documentação histórica | volumosa | AUDIT | separar canonical/audit/legacy/obsolete/duplicate |

## Achado confirmado — exames complementares
O commit `9a8697d70ba39d1aa2ae6d30f296257aa3f0060d` implementou apenas a transcrição estruturada de múltiplos exames já digitados: cada linha vira item próprio sob LABORATORIAIS/IMAGEM. Isso NÃO é o Organizador de Exames Laboratoriais descrito pela Founder, cuja função é receber saída bruta copiada do laboratório, reconhecer/normalizar analitos e produzir o padrão documental do Zera.

Decisão: preservar `renderExamComplementSection()` e procurar separadamente o normalizador bruto.

## Norte
`ATENDIMENTO → DOCUMENTAÇÃO → CONTEXTO CLÍNICO → MICROFERRAMENTAS PERTINENTES → TEXTO REVISÁVEL`

## Próximas verificações
- [ ] mapear ownership de `assets/`, `src/`, `protocols/` e raiz;
- [ ] localizar normalizador bruto por comportamento/histórico;
- [ ] inventariar gráficos/dashboard;
- [ ] mapear sidebar para domínio real;
- [ ] classificar documentação;
- [ ] caracterizar microfunções de HDA, HPP/NEGA, exame, scores, rascunhos, alta, internação e reavaliação;
- [ ] auditar PWA/service worker;
- [ ] produzir matriz final;
- [ ] limpar em commits pequenos;
- [ ] CI/regressão após cada bloco funcional.
