# Platform / Core Engineering — Active Work

## Setor
ChatGPT / Platform & Core Engineering.

## Responsabilidades
Arquitetura canônica, modelagem de estado, document engine, workflow/temporalidade, storage/persistência, PWA/offline, integração entre módulos, CI/CD, segurança técnica, ownership, housekeeping, roadmap/documentação canônica, merge/reconciliação e dívida técnica estrutural.

## Estado atual

- **Linha canônica:** `chore/housekeeping-product-convergence` / PR #30.
- **Owner ativo:** Platform/Core — CI/CD estrutural, documentação canônica, integração e reconciliação.
- **Objetivo:** manter a PR #30 estável e auditável sem alterar silenciosamente UX/semântica clínica em homologação.
- **Status:** ACTIVE.
- **PR #30:** DRAFT / NÃO MERGEAR EM `main` antes da homologação clínica explícita da Founder.

## Handoff obrigatório para qualquer agente novo

Antes de escrever código ou documentação:

1. sincronizar `chore/housekeeping-product-convergence`;
2. ler `docs/architecture/AGENT_COORDINATION.md`;
3. ler os três arquivos em `docs/coordination/active/`;
4. ler `ROADMAP.md` e `docs/clinical/INVARIANT_REGISTRY.md`;
5. identificar setor e owner antes de adquirir lease;
6. não usar `docs/architecture/ACTIVE_WORK.md` nem `docs/audits/SHARED_AUDIT_LOG.md` como estado corrente;
7. não interpretar CI verde como homologação ou prova absoluta de invariant;
8. PR filha que exige segunda leitura só pode ser integrada após handshake `INTEGRATION READY — <HEAD SHA>`.

## Estado técnico verdadeiro — checkpoint atual

- Joyce = Founder/Produto/Domínio Clínico; ChatGPT = Platform/Core; Claude = Quality/Verification;
- PR #37 integrada à PR #30 em `a5a5ade`: gate invariant → teste;
- PR #38 integrada à PR #30 em `3a23402`: proteção adversarial de `INV-DOC-001`;
- PR #41 trouxe patrimônio útil, mas a segunda leitura encontrou falha de composição na alegação de `INV-CLIN-003 = FULL`; integração prematura foi reconciliada;
- **PR #43 está DRAFT e BLOQUEADA no HEAD `eac1b05f`.** A ponte de composição de Quality ficou materialmente melhor, porém precisa rebasear sobre a canônica, atualizar achados que já foram corrigidos e separar lifecycle corrigido do gap ainda real de protocolo dinâmico. Sem novo HEAD + segunda leitura + handshake, não integrar;
- P0 justificativa de exame: RED `915c1c58` / run 669; GREEN `db1d5347` / run 670. Predicados automáticos de urgência/gravidade foram removidos. Issue #45 encerrada com evidência;
- overwrite de documento final: proteção de texto gerado/manual implantada; edição manual não pode mais ser substituída silenciosamente por `Atualizar evolução`. Issue #47 encerrada com protetores;
- restore de rascunho: bridge de sincronização pós-restauração impede `#qp-free` obsoleto de destruir QP/HDA restauradas. Issue #49 encerrada com protetor;
- reachability/lifecycle: atividade clínica real no `#evolution-form` cria Encounter protocol-agnostic via `ensureEncounterStarted`, atualiza admission snapshot, persiste `zera-ps:encounter:v3` e permite anexar workflow posteriormente sem trocar identidade. O falso `ATENDIDOS: 0` por inexistência de Encounter foi tratado na origem;
- **reachability foi refinada em dois ramos:** scores estáticos continuam alcançáveis em `Atendimento → Ferramentas`; a convergência move o conteúdo real de `view-scores` e preserva CRB-65/qSOFA/CURB-65. Protetor dedicado em `tests/static-score-reachability.test.mjs`, commit `2d7ef018`, CI run 688 verde. O gap restante da issue #44 é especificamente o motor declarativo de protocolo (`workflow-protocol-fields`, progressive disclosure, stage/pending e ferramentas protocol-bound como HEART), não “todas as ferramentas”;
- PWA: novos bridges entraram no APP_SHELL e cache avançou para v16; o primeiro RED expôs teste de geração de cache desatualizado e o checkpoint posterior voltou verde (run 687);
- troponina: interpretação depende de ensaio/kit + unidade + referência do laboratório. `0,0019` é referência local informada para troponina ultrassensível no Meridional, nunca cutoff universal. Existe protetor explícito contra universalização;
- `INV-CLIN-003` permanece oficialmente **9 FULL / 1 PARTIAL** até PR #43 rebaseada + segunda leitura + handshake válido;
- `INV-GOV-001`: camada interna de CI foi concluída e issue #40 encerrada no escopo interno. Guard pré-suíte + âncora mútua + `workflow-security` protegem erosão isolada. O risco externo foi separado para **issue #50**;
- **governança externa comprovadamente ausente:** API GitHub retornou `protected:false` e enforcement de required checks `off` tanto em `main` quanto em `chore/housekeeping-product-convergence`. Portanto handshake ainda é processual, não enforcement de repositório. #50 rastreia branch protection/ruleset antes de produção e idealmente antes do merge final da PR #30;
- branch audit refeito em `docs/audits/entries/2026-08-13T040000Z-platform-branch-prune-recheck.md`: existem 7 branches. `fix/pr30-priority-blockers` tem `files: []` contra a canônica; `fix/p0-fabricated-negatives` foi semanticamente classificada como implementação obsoleta que reintroduz placeholders `[CONFIRMAR AUSÊNCIA...]` rejeitados pela direção atual. Ambas estão **SAFE TO PRUNE**, mas o conector atual não expõe delete-ref; não simular exclusão com force update;
- preservar: `main`, PR #30, PR #43, PR #36 pausada e `develop` como mina arqueológica;
- QP×HDA redundantes (#46) são problema documental demonstrado, mas a solução pertence ao domínio da Founder; não corrigir silenciosamente;
- orientação inicial/fricção (#48) é achado caracterizado a partir do uso da Founder + DOM, ainda sem harness real de interação. Não redesenhar unilateralmente;
- keyboard-first continua ausente e é P1 após estabilização de reachability/UX canônica.

## Modelo epistemológico do time

A Founder fornece evidência de uso real na linguagem natural do plantão. Quality transforma em reprodução, RED, testes e delimitação do que a evidência prova. Platform/Core verifica causalidade/composição, implementa/reconcilia mudanças estruturais e impede que cobertura local seja promovida a garantia sistêmica sem evidência.

Regra: **quem implementa uma garantia crítica não é seu único validador**.

## Trabalho aberto — ordem atual

1. **P1 Core + Produto:** definir e implementar reachability do protocolo dinâmico sem reintroduzir `Workflow`/`Roteiro` como escolhas concorrentes; preservar simultaneamente as microfunções estáticas já alcançáveis em Ferramentas;
2. aguardar/revisar novo HEAD da PR #43; exigir rebase, evidência atual e novo contraditório antes de qualquer `INTEGRATION READY`;
3. **P1 Governança:** fechar #50 com branch protection/ruleset externo quando a infraestrutura permitir; não declarar enforcement inexistente;
4. **P1 UX/domain:** #46 (QP×HDA) e #48 (orientação/estado inicial) dependem de decisão explícita da Founder antes da implementação semântica;
5. reduzir fricção operacional/keyboard-first após estabilizar o caminho canônico;
6. testes reais de interação desktop/mobile;
7. evidência real de PWA instalado/offline;
8. remover refs `fix/pr30-priority-blockers` e `fix/p0-fabricated-negatives` apenas quando existir operação de delete-ref segura;
9. concluir homologação clínica contínua da PR #30;
10. somente então avaliar merge final da PR #30.

## Restrições

- não escrever em owner ACTIVE de Quality/Verification;
- não alterar UX/semântica clínica sem decisão da Founder;
- não mergear PR #30 antes da homologação;
- mudanças técnicas devem ser reversíveis, testáveis e auditadas;
- nenhuma suíte verde será tratada como prova absoluta de maturidade;
- não apagar microfunções/patrimônio sem prova de equivalência ou decisão explícita;
- não corrigir reachability simplesmente desocultando `.workflow-card`;
- não confundir scores estáticos já preservados com ferramentas protocol-bound ainda sem alcance;
- não usar `force update` para simular deleção de branch;
- não fechar gap externo de governança enquanto branch protection/ruleset real continuar ausente.
