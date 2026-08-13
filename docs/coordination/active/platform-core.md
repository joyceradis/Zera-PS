# Platform / Core Engineering — Active Work

## Setor
ChatGPT / Platform & Core Engineering.

## Responsabilidades
Arquitetura canônica, modelagem de estado, document engine, workflow/temporalidade, storage/persistência, PWA/offline, integração entre módulos, CI/CD, segurança técnica, ownership, housekeeping, roadmap/documentação canônica, merge/reconciliação e dívida técnica estrutural.

## Estado atual

- **Linha canônica:** `chore/housekeeping-product-convergence` / PR #30.
- **PR #30:** OPEN + DRAFT + NÃO MERGEAR em `main` antes da homologação clínica explícita da Founder.
- **Checkpoint detalhado da sessão:** `docs/audits/entries/2026-08-13T053000Z-platform-session-handoff.md`.
- **Último HEAD Core com correção funcional verificada antes do checkpoint documental:** `45e7341d13444accfbe74d49d5b323e46935c2db`.
- **Status do setor ao encerrar a sessão:** checkpoint publicado; retomada deve começar pela leitura do estado atual e não por nova arqueologia.

## Handoff obrigatório para agente novo

1. sincronizar `chore/housekeeping-product-convergence`;
2. ler `docs/architecture/AGENT_COORDINATION.md`;
3. ler as três lanes em `docs/coordination/active/`;
4. ler `ROADMAP.md` e `docs/clinical/INVARIANT_REGISTRY.md`;
5. ler `docs/audits/entries/2026-08-13T053000Z-platform-session-handoff.md`;
6. abrir PR/issues citadas no próprio setor;
7. só então adquirir lease.

Não usar `ACTIVE_WORK.md`/`SHARED_AUDIT_LOG.md` históricos como estado corrente. Não pedir à Founder que reconte a história técnica.

## Estado técnico verdadeiro

- Joyce = Founder/Produto/Domínio Clínico; ChatGPT = Platform/Core; Claude = Quality/Verification.
- #45 FECHADA: justificativa de alto custo não fabrica mais urgência/gravidade não confirmadas.
- #47 FECHADA: edição manual do documento final não pode ser destruída silenciosamente por `Atualizar evolução`.
- #49 FECHADA: restauração de rascunho ressincroniza o intake visível antes de novo input.
- #51 FECHADA: `#generate-reassessment` tem owner único no coordenador temporal. RED `ef085ead...`; GREEN `45e7341d...`; `checks` run 696 = success.
- lifecycle/produtividade: atividade clínica real inicia Encounter protocol-agnostic e persiste `zera-ps:encounter:v3`; o falso `ATENDIDOS: 0` por inexistência de Encounter foi tratado na origem.
- #44 permanece ABERTA apenas no ramo de protocolo dinâmico/progressive disclosure/ferramentas protocol-bound. Scores estáticos CRB-65/qSOFA/CURB-65 já estão alcançáveis em `Atendimento → Ferramentas`.
- não desocultar `.workflow-card` para resolver #44; isso reintroduz Workflow/Roteiro como produto concorrente.
- troponina: assay-dependent. Valor + unidade + referência do ensaio/laboratório. `0,0019` no Meridional é perfil local, não cutoff universal.
- PWA app shell/hardening em v16; ainda falta prova instalada/offline real.
- storage: ausente ≠ corrompido ≠ indisponível; I/O compartilhado preservado.
- `INV-CLIN-003` permanece oficialmente **9 FULL / 1 PARTIAL** até PR #43 rebaseada, evidência atualizada, segunda leitura e handshake válido.
- #50 ABERTA: branch protection/required checks externos não estão enforced; handshake ainda é disciplina processual.
- PR #30 chegou a aparecer fechada sem merge durante a sessão e foi restaurada para OPEN + DRAFT. Não presumir autoria/causa; lifecycle da PR canônica não é housekeeping.
- branches `fix/pr30-priority-blockers` e `fix/p0-fabricated-negatives` seguem SAFE TO PRUNE, mas sem delete-ref seguro disponível; não usar force update para simular deleção.

## Correção metodológica importante da homologação

O screenshot final da Founder mostra `joyceradis.github.io/Zera-PS/...`, ou seja, a publicação GitHub Pages da linha publicada/main, **não** o preview efêmero da PR #30.

Portanto:

- observações de UX/fricção continuam válidas como evidência de produto;
- achados já reproduzidos e corrigidos não são invalidados;
- porém isso não constitui homologação do HEAD atual da PR #30;
- o gate final exige novo preview da PR #30 identificado por HEAD e homologação explícita desse preview.

## PR #43 / Quality — estado de integração

PR #43 continua DRAFT e **não possui handshake válido para integração**.

Quality deve:

1. rebasear sobre a canônica atual;
2. atualizar evidências para reconhecer #45/#47/#49/#51 resolvidas;
3. atualizar pins de reachability que esperavam lifecycle quebrado;
4. preservar âncora anti-trivialidade, contraprova positiva e mutation testing;
5. separar composição de código × reachability de produto × homologação manual;
6. publicar novo HEAD + suíte/evidência fresca;
7. aguardar nova segunda leitura de Platform/Core.

Sem `INTEGRATION READY — <HEAD SHA>` para o HEAD revisado, não integrar.

## Decisões ainda reservadas à Founder

- #46 — semântica QP × HDA;
- #48 — orientação inicial, hierarquia/estado da superfície e fricção cognitiva;
- qualquer escolha cognitiva necessária para a porta canônica do protocolo dinâmico;
- aceite final para piloto.

## Próxima ordem de trabalho

1. Quality rebaseia/atualiza #43.
2. Platform/Core faz nova segunda leitura e decide honestamente `INV-CLIN-003`.
3. Platform/Core + Produto resolvem ou deferem #44 sem criar segundo produto.
4. Founder decide #46/#48 quando retomar.
5. Core/Quality tratam fricção/keyboard-first com proteção.
6. interação real desktop/mobile.
7. PWA instalado/offline real.
8. #50 branch protection/ruleset externo ou risco explicitamente aceito para piloto.
9. novo preview da PR #30 identificado pelo HEAD final.
10. Founder homologa esse preview.
11. só então avaliar PR #30 → `main` e V1 candidata a piloto.

## Restrições

- não escrever na lane ACTIVE de Quality;
- não alterar UX/semântica clínica sem decisão da Founder;
- não mergear PR #30 antes da homologação;
- não tratar CI verde como homologação;
- não apagar patrimônio/microfunção sem prova de equivalência;
- não confundir código implementado com capacidade reachable;
- não fechar governança externa enquanto proteção real estiver ausente.
