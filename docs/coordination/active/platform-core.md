# Platform / Core Engineering — Active Work

## Setor
ChatGPT / Platform & Core Engineering.

## Responsabilidades
Arquitetura canônica, modelagem de estado, document engine, workflow/temporalidade, storage/persistência, PWA/offline, integração entre módulos, CI/CD, segurança técnica, ownership, housekeeping, roadmap/documentação canônica, merge/reconciliação e dívida técnica estrutural.

## Estado atual

- **Linha canônica:** `chore/housekeeping-product-convergence` / PR #30.
- **PR #30:** OPEN + DRAFT + NÃO MERGEAR em `main` antes da homologação clínica explícita da Founder.
- **Fonte de verdade do HEAD:** consultar sempre o `head_sha` atual da PR #30. Não congelar SHA de uma linha que recebe integrações contínuas.
- **Checkpoint histórico anterior:** `docs/audits/entries/2026-08-13T053000Z-platform-session-handoff.md`.
- O estado corrente desta lane prevalece sobre checkpoints históricos quando houver divergência temporal.

## Handoff obrigatório para agente novo

1. sincronizar `chore/housekeeping-product-convergence` e conferir o `head_sha` da PR #30;
2. ler `docs/architecture/AGENT_COORDINATION.md`;
3. ler as três lanes em `docs/coordination/active/`;
4. ler `ROADMAP.md` e `docs/clinical/INVARIANT_REGISTRY.md`;
5. usar `docs/audits/entries/2026-08-13T053000Z-platform-session-handoff.md` apenas como checkpoint histórico;
6. abrir issues/PRs citadas no setor;
7. só então adquirir lease.

Não usar `ACTIVE_WORK.md`/`SHARED_AUDIT_LOG.md` históricos como estado corrente. Não pedir à Founder que reconte a história técnica.

## Estado técnico verdadeiro

- Joyce = Founder/Produto/Domínio Clínico; ChatGPT = Platform/Core; Claude = Quality/Verification.
- **Produto canônico:** `Atendimento`. Não existe produto separado `Workflow` na V1.
- #44 foi encerrada como deferimento consciente: o motor declarativo/progressive disclosure e o protocolo SCA permanecem preservados internamente, mas não são superfície clínica até existir porta contextual coerente ou mais de um protocolo real. Não reintroduzir seletor de workflow.
- #62 removeu o card legado `WORKFLOW CONTEXTUAL` do DOM vivo e retirou `SEM CENÁRIO` da superfície, preservando o owner temporal atrás de bridge interna neutra.
- #63 corrigiu falsa abertura do painel de reavaliação: a superfície só abre após `zera:reassessment-started` efetivo.
- #64 resolveu orientação inicial sem criar fluxo linear: `Atendimento atual`, ponto de partida explícito e ações do mesmo atendimento.
- #65 corrigiu estado falso `EM REGISTRO` causado por defaults de controles auxiliares.
- #66 adicionou execução comportamental para estado do Atendimento e delegação da reavaliação.
- #69 corrigiu orientação em blocos e atualização do estado depois de `reset` programático.
- #46 foi resolvida em #67 sem síntese clínica automática: QP e HDA literalmente idênticas são emitidas uma única vez; conteúdos distintos continuam separados.
- #68 corrigiu os efeitos temporais dessa deduplicação: reavaliação não repete admissão idêntica e scores continuam sendo injetados usando HDA como fallback quando não há QP separada.
- #45 FECHADA: justificativa de alto custo não fabrica urgência/gravidade não confirmadas.
- #47 FECHADA: edição manual do documento final não pode ser destruída silenciosamente por `Atualizar evolução`.
- #49 FECHADA: restauração de rascunho ressincroniza o intake visível antes de novo input.
- #51 FECHADA: `#generate-reassessment` tem owner único no coordenador temporal.
- #52 FECHADA: lifecycle real, rascunhos sem truncamento silencioso e falhas de persistência de draft observáveis.
- #53 FECHADA: documentação distingue capacidade interna de capability realmente reachable.
- #58 integrado: storage temporal não derruba bootstrap; falhas são observáveis e reset destrutivo é bloqueado se persistência não puder ser limpa.
- #60 integrado: `Limpar campos` não destrói a superfície antes de confirmar remoção durável do autosave.
- #61 integrado: acesso ao adapter padrão de localStorage é lazy e não derruba avaliação do módulo.
- lifecycle/produtividade: atividade clínica real inicia Encounter protocol-agnostic em `zera-ps:encounter:v3`.
- troponina permanece assay-dependent; nenhum cutoff universal deve ser codificado.
- PWA app shell/hardening está em **v17**; prova instalada/offline real continua pendente.
- storage: ausente ≠ corrompido ≠ indisponível; I/O compartilhado preservado.
- `INV-CLIN-003` permanece oficialmente **9 FULL / 1 PARTIAL** até evidência de composição real, segunda leitura e handshake válido.
- #39 permanece aberta para a lacuna real de composição do `INV-CLIN-003`.
- #50 permanece aberta: branch protection/required checks externos não estão enforced; a integração atual não expõe mutation segura para resolver isso.
- branches classificadas SAFE TO PRUNE não devem ser simuladas por force-update; delete-ref seguro continua indisponível.

## Homologação e preview

O GitHub Pages publicado em `main` não representa o HEAD atual da PR #30. Portanto:

- screenshots da publicação antiga continuam válidos como evidência dos defeitos observados naquele marco;
- correções reproduzidas/testadas não viram homologação visual por terem CI verde;
- o gate final exige preview identificável do HEAD final da #30 e homologação explícita da Founder;
- PWA instalado/offline e interação desktop/mobile continuam gates manuais.

## PR #43 / Quality — estado de integração

PR #43 continua DRAFT e **não possui handshake válido para integração**.

A evidência anterior ficou ainda mais stale após #62–#69: além de o lifecycle já ser protocol-agnostic, a superfície `Workflow` foi deliberadamente retirada do produto e a reachability do motor declarativo foi deferida em #44. Quality não deve usar o seletor oculto nem a existência interna do protocolo SCA como prova de reachability do produto.

Quality deve:

1. rebasear sobre o HEAD canônico atual;
2. atualizar evidências para reconhecer #45/#47/#49/#51/#52/#58/#60/#61/#62–#69;
3. remover/inverter pins que esperam lifecycle dependente de workflow oculto;
4. separar claramente composição de código × reachability de produto × homologação manual;
5. preservar âncora anti-trivialidade, contraprova positiva e mutation testing;
6. publicar novo HEAD + suíte/evidência fresca;
7. solicitar nova segunda leitura de Platform/Core.

Sem `INTEGRATION READY — <HEAD SHA>` para o HEAD revisado, não integrar.

## Decisões de produto já encerradas nesta rodada

- #44 — reachability protocolar deferida sem criar segundo produto.
- #46 — duplicação QP × HDA resolvida sem síntese automática.
- #48 — orientação/estado inicial resolvidos sem stepper fictício.

Aceite final para piloto permanece reservado à Founder.

## Próxima ordem de trabalho

1. Platform/Core continua auditoria de regressões e coerência da linha canônica.
2. Quality rebaseia/atualiza #43 e #39 com evidência do produto atual.
3. Platform/Core faz nova segunda leitura de `INV-CLIN-003`.
4. tratar fricção/keyboard-first restante com proteção.
5. validar interação real desktop/mobile.
6. validar PWA instalado/offline real.
7. resolver #50 externamente ou registrar aceite explícito do risco para piloto.
8. gerar novo preview da PR #30 identificado pelo HEAD final.
9. Founder homologa esse preview.
10. só então avaliar PR #30 → `main`.

## Restrições

- não escrever na lane ACTIVE de Quality;
- não reintroduzir `Workflow` como produto para tornar um único protocolo reachable;
- não alterar semântica clínica por inferência técnica;
- não mergear PR #30 antes da homologação;
- não tratar CI verde como homologação;
- não apagar patrimônio/microfunção sem prova de equivalência;
- não confundir código implementado com capacidade reachable;
- não fechar governança externa enquanto proteção real estiver ausente.
