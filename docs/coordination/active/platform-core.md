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
- **PR #43 está DRAFT e BLOQUEADA neste HEAD.** Quality elevou o rigor: reconheceu a superestimação anterior, separou composição de DOM/PWA/tempo real, adicionou ponte com escritores reais, âncora anti-trivialidade, contraprova e mutation testing. O núcleo é candidato legítimo a `INV-CLIN-003 = FULL` no escopo de código, mas a PR precisa rebasear e atualizar evidência após correções Core abaixo;
- P0 justificativa de exame: RED `915c1c58` / run 669 confirmou fabricação de `EM CARÁTER DE URGÊNCIA`, `CONDUTA IMEDIATA` e `COMPLICAÇÕES POTENCIALMENTE GRAVES`; GREEN `db1d5347` / run 670 removeu os predicados não confirmados e preservou a utilidade documental com fechamento conservador. Achado histórico válido, defeito corrente corrigido tecnicamente; redação clínica final continua sujeita à Founder;
- reachability do Atendimento: RED `4d364b33` e teste refinado `248ef744` provaram ausência de lifecycle canônico independente de protocolo; `a5e6d8e5` adicionou primitivas puras `ensureEncounterStarted` + `attachWorkflow`; GREEN `8b793045` / run 676 ligou o owner temporal diretamente à atividade real do `#evolution-form`, criou Encounter protocol-agnostic sem inventar cenário, atualizou snapshot de admissão, preservou identidade ao anexar protocolo posteriormente e limpou `zera-ps:encounter:v3` no reset do formulário;
- consequência: produtividade e reavaliação deixam de depender do seletor `#workflow-scenario` oculto para existir. O falso `ATENDIDOS: 0` por ausência absoluta de Encounter foi tratado na origem, não no contador;
- **não confundir lifecycle com reachability de ferramentas:** `.workflow-card` e `workflow-context` ainda podem manter a camada protocolo/ferramentas fora do alcance visual da médica. Isso permanece problema separado e aberto. A correção do lifecycle NÃO autoriza declarar ferramentas/protocolo acessíveis;
- revisão #43 recebeu comentário `BLOCKED` no HEAD `eac1b05f`: rebase obrigatório; seu teste `converged-surface-reachability` deve deixar de fixar o defeito corrigido e virar protetor positivo do lifecycle, preservando separadamente o gap de ferramentas/protocolo;
- QP×HDA redundantes: problema documental demonstrável, mas semântica/solução não será decidida unilateralmente por Core;
- keyboard-first: ausência demonstrada; benefício/ordem final depende de homologação real;
- estado de invariant permanece **9 FULL / 1 PARTIAL** até novo HEAD da #43 + segunda leitura + handshake válido;
- `INV-GOV-001`: guard externo antes da suíte; presença/fiação mínima de sentinelas verificadas;
- Founder lane registra achados de homologação já fornecidos e que não devem ser pedidos novamente;
- troponina é dependente de ensaio/kit + unidade + referência local; `0,0019` no Meridional não é cutoff universal;
- branch audit: `fix/pr30-priority-blockers` forte candidata à poda por equivalência; `fix/p0-fabricated-negatives` ainda exige prova semântica;
- PRs #33 e #35 fechadas; PR #36 permanece draft/pausada; `develop` é mina arqueológica.

## Modelo epistemológico do time

A Founder fornece evidência de uso real na linguagem natural do plantão. Quality transforma em reprodução, RED, testes e delimitação do que a evidência prova. Platform/Core verifica causalidade/composição, implementa/reconcilia mudanças estruturais e impede que cobertura local seja promovida a garantia sistêmica sem evidência.

Regra: **quem implementa uma garantia crítica não é seu único validador**.

## Trabalho aberto — ordem atual

1. **P1 Core:** fechar o segundo ramo de reachability: ferramentas/protocolo precisam ficar acessíveis sem reintroduzir `Workflow`/`Roteiro` como escolhas concorrentes no topo da experiência;
2. concluir terceira leitura da PR #43 após rebase e decidir handshake de `INV-CLIN-003` com escopo explicitamente limitado a código/composição;
3. pedir/receber adversarial de Quality sobre o lifecycle corrigido e garantir que o novo protetor falha se a ponte `form activity → Encounter storage` for removida;
4. reduzir fricção operacional/keyboard-first após estabilizar o caminho canônico;
5. testes reais de interação desktop/mobile;
6. evidência real de PWA instalado/offline;
7. provar equivalência de `fix/p0-fabricated-negatives` antes de poda;
8. concluir homologação clínica contínua da PR #30;
9. somente então avaliar merge final da PR #30.

## Restrições

- não escrever em owner ACTIVE de Quality/Verification;
- não alterar UX/semântica clínica sem decisão da Founder;
- não mergear PR #30 antes da homologação;
- mudanças técnicas devem ser reversíveis, testáveis e auditadas;
- nenhuma suíte verde será tratada como prova absoluta de maturidade;
- não apagar microfunções/patrimônio sem prova de equivalência ou decisão explícita;
- não corrigir reachability simplesmente desocultando a `.workflow-card`: a solução deve preservar o mapa de produto único e evitar ressuscitar Workflow/Roteiro como conceitos concorrentes.
