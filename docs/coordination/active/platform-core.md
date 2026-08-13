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
- **PR #43 está DRAFT e NÃO autorizada para merge ainda.** Quality atualizou o rigor: reconhece explicitamente a superestimação anterior, distingue composição de DOM/PWA/tempo real e propõe nova ponte com escritores reais + âncora anti-trivialidade + mutation testing;
- terceira leitura de Platform/Core da #43: a nova ponte é materialmente superior e candidata legítima a sustentar `INV-CLIN-003 = FULL` no escopo de código, mas o handshake só será emitido após revisão integral dos protetores e compatibilidade com reachability;
- achado crítico da #43 confirmado: a superfície convergida oculta `.workflow-card`, enquanto `createEncounter()` depende de `#workflow-scenario`; isso deixa o Encounter temporal sem caminho de criação na superfície entregue, quebra o alcance da produtividade e torna parte da camada temporal/protocolar implementada porém inacessível;
- achado crítico da auditoria de superfície confirmado: justificativa de exame pode emitir predicados de urgência/gravidade sem entrada confirmatória; classificado Platform/Core P0 quanto ao mecanismo, com redação final subordinada à Founder;
- QP×HDA redundantes: problema documental demonstrável, mas semântica/solução não será decidida unilateralmente por Core;
- keyboard-first: ausência demonstrada; benefício/ordem final depende de homologação real;
- estado de invariant permanece **9 FULL / 1 PARTIAL** até handshake e integração válida da #43;
- `INV-GOV-001`: guard externo antes da suíte; presença/fiação mínima de sentinelas verificadas;
- Founder lane registra achados de homologação já fornecidos e que não devem ser pedidos novamente;
- troponina é dependente de ensaio/kit + unidade + referência local; `0,0019` no Meridional não é cutoff universal;
- branch audit: `fix/pr30-priority-blockers` forte candidata à poda por equivalência; `fix/p0-fabricated-negatives` ainda exige prova semântica;
- PRs #33 e #35 fechadas; PR #36 permanece draft/pausada; `develop` é mina arqueológica.

## Modelo epistemológico do time

A Founder fornece evidência de uso real na linguagem natural do plantão. Quality transforma em reprodução, RED, testes e delimitação do que a evidência prova. Platform/Core verifica causalidade/composição, implementa/reconcilia mudanças estruturais e impede que cobertura local seja promovida a garantia sistêmica sem evidência.

Regra: **quem implementa uma garantia crítica não é seu único validador**.

## Trabalho aberto — ordem atual

1. **P0:** remover fabricação de urgência/gravidade da justificativa de alto custo sem degradar utilidade documental;
2. **P1 Core:** restaurar uma ponte canônica e alcançável entre superfície convergida → Encounter temporal/storage → produtividade/protocolo, sem reexpor dois produtos concorrentes;
3. concluir terceira leitura da PR #43 e decidir handshake de `INV-CLIN-003` com escopo explicitamente limitado a código/composição;
4. tratar produtividade falsa `ATENDIDOS: 0` como consequência da ponte de Encounter, não patch cosmético do contador;
5. reduzir fricção operacional/keyboard-first após estabilizar o caminho canônico;
6. testes reais de interação desktop/mobile;
7. evidência real de PWA instalado/offline;
8. provar equivalência de `fix/p0-fabricated-negatives` antes de poda;
9. concluir homologação clínica contínua da PR #30;
10. somente então avaliar merge final da PR #30.

## Restrições

- não escrever em owner ACTIVE de Quality/Verification;
- não alterar UX/semântica clínica sem decisão da Founder;
- não mergear PR #30 antes da homologação;
- mudanças técnicas devem ser reversíveis, testáveis e auditadas;
- nenhuma suíte verde será tratada como prova absoluta de maturidade;
- não apagar microfunções/patrimônio sem prova de equivalência ou decisão explícita;
- não corrigir reachability simplesmente desocultando a `.workflow-card`: a solução deve preservar o mapa de produto único e evitar ressuscitar Workflow/Roteiro como conceitos concorrentes.
