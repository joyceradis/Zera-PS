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
6. não usar `docs/architecture/ACTIVE_WORK.md` nem `docs/audits/SHARED_AUDIT_LOG.md` como estado corrente — ambos são históricos/transicionais;
7. não interpretar CI verde como homologação ou prova absoluta de invariant;
8. PR filha que exige segunda leitura só pode ser integrada após handshake explícito `INTEGRATION READY — <HEAD SHA>` do setor revisor.

## Estado técnico verdadeiro — checkpoint atual

- divisão operacional vigente: Joyce = Founder/Produto/Domínio Clínico; ChatGPT = Platform/Core; Claude = Quality/Verification;
- PR #37 integrada à PR #30 em `a5a5ade`: gate executável de rastreabilidade invariant → teste;
- PR #38 integrada à PR #30 em `3a23402`: `INV-DOC-001` ganhou proteção adversarial de estado operacional → documento;
- PR #41 trouxe patrimônio útil de Quality para `INV-CLIN-003`, porém a segunda leitura identificou que os vetores stage×context calculavam plano/visibilidade e depois chamavam `renderEvolution(emptyForm(), {})`; portanto não atravessavam a composição real contexto → coordenador/estado → formulário → document engine;
- a integração prematura da #41 foi reconciliada: testes úteis preservados, alegação reduzida. Estado correto continua **9 invariants integrais / 1 parcial (`INV-CLIN-003`)**;
- `INV-CLIN-003` só pode virar integral quando existir protetor que atravesse a composição real, não apenas pontas isoladas;
- `INV-GOV-001`: `checks.yml` possui guard externo antes da suíte para sentinelas críticos; presença/fiação mínima são verificadas. Proteção externa de branch não deve ser presumida sem evidência;
- protocolo de integração endurecido após #41: CI verde, `mergeable=true`, lease fechado ou autorrevisão NÃO autorizam integração quando segunda leitura é exigida;
- coordenação corrente usa lanes por setor e auditorias append-only em `docs/audits/entries/`;
- PRs #33 e #35 fechadas como obsoletas; PR #36 permanece draft/pausada por instrução da Founder;
- `develop` permanece mina arqueológica, não linha de implementação;
- microfunções e patrimônio recuperado devem ser preservados por contrato/teste, nunca por cópia cega.

## Modelo epistemológico do time

A Founder fornece a evidência de uso real na linguagem natural do plantão: comportamento observado, fricção, resultado inesperado, prioridade e semântica clínica. Ela não precisa traduzir isso para invariant, arquitetura ou teste.

Quality/Verification transforma observações e achados em reprodução, RED, testes de regressão/adversariais, mutation testing e delimitação do que a evidência realmente prova.

Platform/Core verifica causalidade e composição arquitetural, implementa/reconcilia mudanças estruturais e impede que teste verde ou cobertura local sejam promovidos a garantia sistêmica sem evidência suficiente.

Regra: **quem implementa uma garantia crítica não é seu único validador**. Autorrevisão não substitui contraditório técnico.

## Trabalho aberto

1. fechar corretamente `INV-CLIN-003` ou manter PARTIAL com gap explícito;
2. segunda leitura/adversarial do guard de CI e observabilidade do `github-advanced-security`;
3. reduzir fricção operacional/keyboard-first sem antecipar decisões clínicas da Founder;
4. testes reais de interação desktop/mobile;
5. evidência real de PWA instalado/offline;
6. concluir homologação clínica da PR #30 e incorporar apenas decisões explicitamente aprovadas;
7. somente então avaliar merge final da PR #30.

## Restrições

- não escrever em owner declarado ACTIVE por Quality/Verification;
- não alterar UX/semântica clínica sem decisão da Founder;
- não mergear PR #30 antes da homologação;
- mudanças puramente técnicas devem ser reversíveis, testáveis e auditadas;
- nenhuma suíte verde será tratada como prova absoluta de maturidade;
- não apagar microfunções/patrimônio sem prova de equivalência ou decisão explícita.
