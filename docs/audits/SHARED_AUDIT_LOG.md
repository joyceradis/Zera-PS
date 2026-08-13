# Zera PS — Shared Audit Log

Índice canônico de auditorias e reconciliações multiagente. O objetivo é permitir que Founder, Lead Engineering e auditor independente trabalhem sobre o mesmo estado sem retransmissão manual.

## Como registrar

Cada entrada relevante deve conter:

- data;
- agente;
- branch / PR / base / SHA;
- escopo;
- achado e severidade;
- evidência reproduzível;
- ação tomada ou proposta;
- invariants afetados;
- status: `OPEN`, `IN REVIEW`, `RECONCILED`, `CLOSED`;
- necessidade de decisão da Founder.

Auditorias extensas podem ter arquivo próprio em `docs/audits/`; este log aponta para elas.

## Estado compartilhado — 2026-08-13

### AUD-2026-08-13-001 — Negativas clínicas pré-escritas

- **Origem:** auditoria independente.
- **Severidade:** P0.
- **Achado:** cinco roteiros legados continham negativas clínicas não confirmadas; a proteção automatizada correspondente havia sido removida junto da regressão.
- **Evidência:** execução real do compositor/template reproduziu `NEGA ...` sem confirmação.
- **Invariant:** `INV-CLIN-001`, `INV-GOV-001`.
- **Ação:** hotfixes na `main`; reconciliação exigida e mantida na PR #30; registry permanente criado.
- **Status:** `RECONCILED` para comportamento conhecido; garantia efetiva permanece gate contínuo.
- **Founder:** não necessária para remover fabricação clínica; necessária para qualquer mudança de semântica/UX além do invariant.

### AUD-2026-08-13-002 — Colisão multiagente no mesmo P0

- **Origem:** auditoria independente + revisão de Engineering.
- **Severidade:** processo / lacuna real.
- **Achado:** duas sessões corrigiram partes do mesmo bug em paralelo sem estado compartilhado, produzindo retrabalho e janela de correção parcial.
- **Ação:** `ACTIVE_WORK.md`, write leases, checkpoints explícitos, shared audit log e proibição de merge ambíguo.
- **Invariant:** `INV-GOV-001`.
- **Status:** `IN REVIEW` até o fluxo ser usado por ambos os agentes em trabalho real.
- **Founder:** não.

### AUD-2026-08-13-003 — Maturidade não pode ser inferida da suíte verde

- **Origem:** relatório de maturidade do auditor independente.
- **Achado:** desenho de segurança é mais maduro que sua garantia efetiva; keyboard-first ainda é doutrina, há `confirm()` nativos, caminhos/seletores concorrentes, ausência de testes automatizados de interação real e revisão automática externa indisponível.
- **Ação:** corrigir status do roadmap; priorizar garantia demonstrável e fricção operacional antes de expansão clínica.
- **Status:** `OPEN` para reconciliação completa com PR #30 e homologação da Founder.
- **Founder:** sim somente para classificar fricção clínica/UX; não para lacunas técnicas objetivas.

### AUD-2026-08-13-004 — Relatório de maturidade publicado no repositório

- **Origem:** auditor independente (Claude).
- **Branch / PR / base / SHA:** `audit/maturity-report-publication` → PR filha da #30; base `3577383`. Baseline efetivamente auditado: `main` @ `276daf7`.
- **Escopo:** maturidade da plataforma como PWA de plantão, sob o critério declarado pela Founder (máquinas que não aceitam sites com IA pesada).
- **Documento:** [`MATURITY_AUDIT_2026-08-12.md`](MATURITY_AUDIT_2026-08-12.md) — 19 FATOs, 8 INTERPRETAÇÕES e 2 PROPOSTAS, rotulados e separados.
- **Achados principais:** independência de IA/rede é estrutural e verificada (~53 KB gzip, zero dependências de runtime); garantia efetiva de segurança clínica é mais fraca que o desenho; keyboard-first é doutrina sem implementação; regressão manual é gate declarado sem evidência de execução; compatibilidade real das máquinas-alvo é suposição, não dado.
- **Evidência:** execução direta em Node, medição de bundle e comparação de branches — comandos reproduzíveis no próprio documento.
- **Reconciliação verificada:** este auditor **confirmou por execução** que `AUD-2026-08-13-001` está de fato `RECONCILED` na PR #30, e que a proteção lá (`tests/clinical-safety-invariants.test.mjs`) é superior à da `main`. Registrado como FATO 17.
- **Divergência registrada:** contrato de saída de `# EXAMES COMPLEMENTARES:` difere entre `main` e PR #30 (FATO 18) — divergência de comportamento documental, não regressão de invariante.
- **Invariants:** `INV-CLIN-001`, `INV-GOV-001` (referenciados); `INV-STOR-001` e `INV-METRIC-001` **não verificados** neste ciclo.
- **Status:** `CLOSED` para a publicação; achados abertos permanecem rastreados em `AUD-2026-08-13-003`.
- **Founder:** necessária apenas para FATO 12 e FATO 13 (unificar seletores concorrentes e caminhos de reavaliação — alteram fluxo cognitivo do PS). Demais achados são técnicos objetivos.

## Próximas entradas esperadas

1. ~~auditor independente publica/referencia seu relatório de maturidade completo~~ — feito em `AUD-2026-08-13-004`;
2. Lead Engineering reconcilia achados contra a PR #30, não apenas contra `main`;
3. Founder conclui relatório de homologação clínica;
4. backlog da PR #30 é reclassificado por P0/P1/P2/P3 e por `clínico / UX / técnico / bug / dívida`;
5. novo preview somente após reconciliação e testes.
