# Platform / Core Engineering — Active Work

## Setor
ChatGPT / Platform & Core Engineering.

## Responsabilidades
Arquitetura canônica, modelagem de estado, document engine, workflow/temporalidade, storage/persistência, PWA/offline, integração entre módulos, CI/CD, segurança técnica, ownership, housekeeping, roadmap/documentação canônica, merge/reconciliação e dívida técnica estrutural.

## Estado atual

- **Linha canônica:** `chore/housekeeping-product-convergence` / PR #30.
- **PR #30:** OPEN + DRAFT + NÃO MERGEAR em `main` antes da homologação clínica explícita da Founder.
- **Fonte de verdade do HEAD:** consultar sempre o `head_sha` atual da PR #30. Não congelar SHA de uma linha que recebe integrações contínuas nesta lane.
- **Última integração Platform/Core desta retomada ao escrever este estado:** #58, storage temporal observável; o SHA específico é evidência histórica do merge, não ponteiro canônico permanente.
- **Checkpoint histórico anterior:** `docs/audits/entries/2026-08-13T053000Z-platform-session-handoff.md`.
- O estado corrente desta lane prevalece sobre o checkpoint histórico quando houver divergência temporal.

## Handoff obrigatório para agente novo

1. sincronizar `chore/housekeeping-product-convergence` e conferir o `head_sha` da PR #30;
2. ler `docs/architecture/AGENT_COORDINATION.md`;
3. ler as três lanes em `docs/coordination/active/`;
4. ler `ROADMAP.md` e `docs/clinical/INVARIANT_REGISTRY.md`;
5. ler `docs/audits/entries/2026-08-13T053000Z-platform-session-handoff.md` apenas como checkpoint histórico;
6. abrir PR/issues citadas no próprio setor;
7. só então adquirir lease.

Não usar `ACTIVE_WORK.md`/`SHARED_AUDIT_LOG.md` históricos como estado corrente. Não pedir à Founder que reconte a história técnica.

## Estado técnico verdadeiro

- Joyce = Founder/Produto/Domínio Clínico; ChatGPT = Platform/Core; Claude = Quality/Verification.
- #45 FECHADA: justificativa de alto custo não fabrica mais urgência/gravidade não confirmadas.
- #47 FECHADA: edição manual do documento final não pode ser destruída silenciosamente por `Atualizar evolução`.
- #49 FECHADA: restauração de rascunho ressincroniza o intake visível antes de novo input.
- #51 FECHADA: `#generate-reassessment` tem owner único no coordenador temporal.
- #52 FECHADA nesta retomada:
  - UX-12 já estava corrigido na canônica: atividade clínica cria Encounter antes de iniciar reavaliação;
  - UX-13 corrigido em #54: removido descarte silencioso de rascunhos a partir do 31º;
  - UX-14 completado em #55: falha de leitura/escrita de rascunhos chega à UI, e troca de contexto é abortada se o arquivo de segurança não puder ser persistido.
- #53 FECHADA em #56: README agora separa capacidade implementada internamente de capacidade realmente alcançável; não mascara #44.
- #20 FECHADA após rechecagem: housekeeping histórico concluído; o resíduo de branches SAFE TO PRUNE permanece registrado no estado corrente porque delete-ref não está disponível.
- #58 integrado: `src/temporal-ui.js` não lê mais Encounter durante avaliação do módulo; falhas de leitura/escrita/remoção temporal são observáveis e reset destrutivo é bloqueado quando o storage persistido não pode ser limpo.
- lifecycle/produtividade: atividade clínica real inicia Encounter protocol-agnostic e persiste `zera-ps:encounter:v3`; o falso `ATENDIDOS: 0` por inexistência de Encounter foi tratado na origem.
- #44 permanece ABERTA apenas no ramo de protocolo dinâmico/progressive disclosure/ferramentas protocol-bound. Scores estáticos CRB-65/qSOFA/CURB-65 já estão alcançáveis em `Atendimento → Ferramentas`.
- não desocultar `.workflow-card` para resolver #44; isso reintroduz Workflow/Roteiro como produto concorrente.
- troponina: assay-dependent. Valor + unidade + referência do ensaio/laboratório. `0,0019` no Meridional é perfil local, não cutoff universal.
- PWA app shell/hardening em v16; ainda falta prova instalada/offline real.
- storage: ausente ≠ corrompido ≠ indisponível; I/O compartilhado preservado; rascunhos não têm mais truncamento silencioso por quantidade; falha de draft não vira histórico vazio; storage temporal não derruba bootstrap da UI.
- `INV-CLIN-003` permanece oficialmente **9 FULL / 1 PARTIAL** até PR #43 rebaseada, evidência atualizada, segunda leitura e handshake válido.
- PR #43 recebeu segunda leitura nesta retomada: o HEAD `b964dcb` está stale porque `tests/converged-surface-reachability.test.mjs` ainda fixa a antiga dependência do seletor oculto para criação de Encounter. Quality deve rebasear e atualizar os pins antes de novo handshake.
- #50 ABERTA: `main` continua `protected:false`, required status enforcement `off`; consulta ao endpoint de proteção retorna `403 Resource not accessible by integration`. Não há mutation de branch protection/ruleset disponível neste conector.
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

A segunda leitura de Platform/Core encontrou evidência stale no HEAD atual: o pin de reachability ainda espera que `createEncounter()` dependa do `#workflow-scenario` oculto, embora a linha canônica já inicie Encounter protocol-agnostic por atividade clínica real.

Quality deve:

1. rebasear sobre a canônica atual;
2. atualizar evidências para reconhecer #45/#47/#49/#51/#52 e as correções de storage posteriores;
3. inverter/remover pins que tratam o lifecycle quebrado como estado esperado;
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

1. Platform/Core continua auditando/corrigindo falhas estruturais que não dependem de decisão clínica/UX da Founder.
2. Quality rebaseia/atualiza #43.
3. Platform/Core faz nova segunda leitura e decide honestamente `INV-CLIN-003`.
4. Platform/Core + Produto resolvem ou deferem #44 sem criar segundo produto.
5. Founder decide #46/#48 quando retomar.
6. Core/Quality tratam fricção/keyboard-first com proteção.
7. interação real desktop/mobile.
8. PWA instalado/offline real.
9. #50 branch protection/ruleset externo ou risco explicitamente aceito para piloto.
10. novo preview da PR #30 identificado pelo HEAD final.
11. Founder homologa esse preview.
12. só então avaliar PR #30 → `main` e V1 candidata a piloto.

## Restrições

- não escrever na lane ACTIVE de Quality;
- não alterar UX/semântica clínica sem decisão da Founder;
- não mergear PR #30 antes da homologação;
- não tratar CI verde como homologação;
- não apagar patrimônio/microfunção sem prova de equivalência;
- não confundir código implementado com capacidade reachable;
- não fechar governança externa enquanto proteção real estiver ausente.
