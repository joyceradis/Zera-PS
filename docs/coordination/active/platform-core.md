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
- PR #41 trouxe patrimônio útil, mas a segunda leitura encontrou falha de composição na alegação de `INV-CLIN-003 = FULL`; integração prematura foi reconciliada. Estado correto: **9 invariants integrais / 1 parcial (`INV-CLIN-003`)**;
- `INV-GOV-001`: guard externo antes da suíte; presença/fiação mínima de sentinelas verificadas;
- handshake de integração crítico vigente após incidente #41;
- Founder lane registra achados de homologação já fornecidos e que não devem ser pedidos novamente;
- nova regra de domínio registrada: **troponina é dependente de ensaio/kit + unidade + referência local; nenhum cutoff absoluto é universal**. Referência `0,0019` informada pela Founder para troponina ultrassensível no Meridional é dado de perfil/local, não default do produto;
- `PROTOCOL_CONTRACT.md` agora proíbe cutoff assay-dependent hard-coded como universal e exige referência explícita para relação/interpretação;
- TDD da regra de SCA: commit `909409b6` adicionou teste que exigia guidance assay-specific e falhou no `checks` (run 661); commit `6091a3f7` adicionou guidance no campo `troponinRatio` sem hard-code de `0,0019` e passou no `checks` (run 662). RED → GREEN confirmado no CI;
- branch audit: `fix/pr30-priority-blockers` está 6 commits à frente/224 atrás, mas sem diff de arquivos contra a canônica — forte candidata à poda por equivalência; `fix/p0-fabricated-negatives` está 7 à frente/224 atrás e ainda mostra diferenças em templates/HDA/tests, portanto não apagar até provar equivalência semântica;
- PRs #33 e #35 fechadas; PR #36 permanece draft/pausada; `develop` é mina arqueológica, não linha de implementação.

## Modelo epistemológico do time

A Founder fornece evidência de uso real na linguagem natural do plantão. Quality transforma em reprodução, RED e testes. Platform/Core verifica causalidade/composição, implementa/reconcilia mudanças estruturais e impede que cobertura local seja promovida a garantia sistêmica sem evidência.

Regra: **quem implementa uma garantia crítica não é seu único validador**.

## Trabalho aberto

1. fechar corretamente `INV-CLIN-003` ou manter PARTIAL com gap explícito;
2. segunda leitura/adversarial do guard de CI e observabilidade do `github-advanced-security`;
3. reduzir fricção operacional/keyboard-first sem antecipar decisões clínicas da Founder;
4. testes reais de interação desktop/mobile;
5. evidência real de PWA instalado/offline;
6. provar equivalência de `fix/p0-fabricated-negatives` antes de poda;
7. concluir homologação clínica contínua da PR #30 e incorporar decisões aprovadas;
8. somente então avaliar merge final da PR #30.

## Restrições

- não escrever em owner ACTIVE de Quality/Verification;
- não alterar UX/semântica clínica sem decisão da Founder;
- não mergear PR #30 antes da homologação;
- mudanças técnicas devem ser reversíveis, testáveis e auditadas;
- nenhuma suíte verde será tratada como prova absoluta de maturidade;
- não apagar microfunções/patrimônio sem prova de equivalência ou decisão explícita.
