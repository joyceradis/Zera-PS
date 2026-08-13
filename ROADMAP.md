# Zera PS — Roadmap

Roadmap orientado por **risco + gate verificável**. Quantidade de telas ou CI verde não define maturidade.

## Doutrina permanente do produto

> **O paciente deve ser ouvido; o médico deve ser poupado de redigitar a mesma informação.**

O Zera PS é um acelerador de documentação clínica orientado pelo contexto do Atendimento. Protocolos, scores, pendências, temporalidade, parser de exames e demais ferramentas são camadas subordinadas à finalidade principal: reduzir cliques, digitação repetida, troca de contexto e tempo até um registro seguro e copiável.

A entidade central é o **Atendimento**. A interface não deve expor a organização interna de templates, protocolos e engines como escolhas concorrentes para a médica.

Mapa canônico: [`docs/product/PRODUCT_MAP.md`](docs/product/PRODUCT_MAP.md).

Ordem obrigatória de prioridade:

1. segurança clínica demonstrável e invariantes preservados;
2. tempo de escuta e exame;
3. HDA editável e útil no plantão;
4. mínima digitação repetida, mínima carga de interação e keyboard-first;
5. contexto clínico e progressive disclosure;
6. reutilização responsável ao longo do Atendimento;
7. microferramentas contextuais;
8. expansão de funcionalidades.

Nenhuma funcionalidade é avanço se economizar texto, mas aumentar cliques, navegação, dúvida operacional ou risco de informação presumida.

## Regra de maturidade

- `CI verde` = os testes presentes passaram.
- `Invariant protegido` = existe contrato + proteção automatizada rastreável + revisão de mudanças nessa proteção.
- `Coverage integral` = nenhuma lacuna conhecida **no escopo explicitamente mapeado**; não significa prova absoluta sobre todos os estados possíveis.
- `Coverage parcial` = há proteção real, mas existe gap nomeado e rastreado.
- `Implementado` = código existe e passou o gate técnico declarado.
- `Homologado` = comportamento foi validado na experiência real definida pela Founder.
- `Maduro` = evidência compatível com uso real, não apenas leitura de código.

## Estado executivo atual

| Área | Estado | Gate principal |
| --- | --- | --- |
| Segurança clínica — desenho | Forte / implementado | Estado/proveniência explícitos e invariantes nomeados |
| Segurança clínica — garantia efetiva | **Em desenvolvimento** | Registry + gate rastreável + contraditório técnico + interação real |
| Invariant coverage | **9 integrais / 1 parcial** | `INV-CLIN-003` permanece parcial até teste da composição real |
| Workflow temporal | Implementado; homologação aberta | Reavaliação única deve preservar admissão e funcionar sem caminhos concorrentes |
| Progressive disclosure | Infraestrutura implementada | Validar que reduz, e não aumenta, carga cognitiva |
| Ferramentas clínicas | Implementadas parcialmente | `available ≠ applicable ≠ calculable ≠ applied` + contexto real |
| Documento temporal | Implementado; proteção fortalecida | `INV-DOC-001` verificado adversarialmente |
| Persistência/histórico | Parcial | Sem perda/reinterpretação; multi-Atendimento ainda futuro |
| UX operacional / keyboard-first | **Lacuna real** | atalhos, remoção de `confirm()` nativo e eliminação de caminhos/seletores concorrentes |
| Testes de lógica | Ativos e rastreados | Não equivalem a interação real |
| Testes de interação / PWA offline real | **Lacuna / em desenvolvimento** | navegador, mobile, PWA instalado e offline de fato |
| Housekeeping + Product Convergence | Em homologação | uma experiência de Atendimento sem perda de microfunções |
| Recuperação de microfunções | Avançada | recuperar por contrato/teste, não cópia cega |
| Piloto | Futuro | zero informação fabricada + ganho operacional mensurável |
| Produção/assinatura | Futuro | requisitos SaaS, segurança, privacidade e operação |

## Coordenação multiagente — modelo vigente

Bootstrap obrigatório de qualquer agente novo:

1. `docs/architecture/AGENT_COORDINATION.md`;
2. `docs/coordination/active/founder.md`;
3. `docs/coordination/active/platform-core.md`;
4. `docs/coordination/active/quality-verification.md`;
5. este `ROADMAP.md`;
6. `docs/clinical/INVARIANT_REGISTRY.md`;
7. PRs/issues citadas na lane do próprio setor.

Nenhum agente novo deve pedir à Founder que reconte o estado técnico.

```text
JOYCE — FOUNDER / PRODUTO / DOMÍNIO CLÍNICO
→ prática real do PS, prioridade, linguagem, fluxo cognitivo e homologação
→ pode relatar comportamento em linguagem natural: "fiz X, ocorreu Y, esperava Z"
→ não atua como mensageira nem precisa traduzir o relato para engenharia

CHATGPT — PLATFORM / CORE ENGINEERING
→ arquitetura, estado, document engine, workflow, storage, PWA, CI/CD,
  integração, segurança técnica, ownership, housekeeping e roadmap
→ valida causalidade/composição e reconcilia mudanças estruturais

CLAUDE — QUALITY / VERIFICATION ENGINEERING
→ auditoria independente, regressão, invariantes, testes adversariais,
  reprodução de bugs, mutation testing, interação, segurança e CI observability
→ transforma observações/achados em evidência testável e delimita o que ela prova
```

Regra epistemológica: **quem implementa uma garantia crítica não é seu único validador**. Um teste sofisticado pode estar correto e ainda sustentar uma conclusão maior do que aquilo que efetivamente exercitou. Segunda leitura deve verificar não apenas mecanismo, mas a ponte de composição real.

Regra de fronteira:

- setor vem antes do lease;
- cada setor registra estado apenas no próprio arquivo em `docs/coordination/active/`;
- auditorias novas usam uma entrada append-only própria;
- Quality pode corrigir bug técnico localizado do próprio escopo, mas não refatora Core por iniciativa própria;
- RED arquitetural faz handoff para Platform/Core;
- decisão de fluxo/semântica clínica retorna à Founder;
- PR filha sujeita a segunda leitura só pode ser integrada após `INTEGRATION READY — <HEAD SHA>` do setor revisor;
- PR #30 é a linha canônica de convergência e **não será mergeada antes da homologação manual da Founder**.

## Âncora — checkpoint corrente

- P0 de negativas clínicas pré-escritas foi confirmado, corrigido e reconciliado;
- o incidente demonstrou que suíte verde não basta: um teste protetor havia sido removido junto com a regressão;
- PR #37 criou gate executável de rastreabilidade invariant→teste e foi integrada à PR #30 após três leituras;
- PR #38 fortaleceu `INV-DOC-001` com adversarial testing e foi integrada;
- PR #41 produziu testes úteis para `INV-CLIN-003`, mas a segunda leitura demonstrou que os vetores não atravessavam contexto → estado/formulário → document engine. A integração prematura foi reconciliada e a cobertura voltou ao estado correto: **9 integral / 1 parcial**;
- após #41, integração de PR filha crítica exige handshake explícito `INTEGRATION READY — <HEAD SHA>`; CI verde/mergeable/lease fechado não substituem segunda leitura;
- `INV-GOV-001` possui guard externo no workflow `checks` antes da suíte; presença e fiação mínima dos sentinelas são verificadas;
- coordenação usa lanes por setor + auditorias append-only; `ACTIVE_WORK.md` e `SHARED_AUDIT_LOG.md` são históricos/transicionais;
- PRs #33 e #35 estão fechadas; #36 permanece pausada/draft;
- PR #30 continua aberta/draft para homologação clínica;
- `develop` permanece mina arqueológica, não linha de implementação;
- keyboard-first, diálogos nativos, caminhos concorrentes, interação real e PWA/offline real permanecem trabalho aberto;
- expansão clínica continua subordinada a segurança demonstrável + redução de fricção operacional.

## Prioridade atual

```text
P0 — preservar invariantes críticos e impedir fabricação clínica
↓
P1 — fechar corretamente INV-CLIN-003 ou manter PARTIAL com gap explícito
↓
P1 — convergir para UM fluxo de Atendimento e UMA reavaliação temporal
↓
P1 — reduzir fricção operacional: keyboard-first, remover diálogos nativos e escolhas concorrentes
↓
P1 — testes de interação real + PWA/mobile/offline real
↓
P1 — homologação clínica da Founder e correções decorrentes
↓
P2 — dívida arquitetural residual / adapters / assets legado
↓
P2 — histórico e multi-Atendimento
↓
P3 — expansão de contextos, scores e ferramentas
↓
PILOTO
↓
PRODUÇÃO / ASSINATURA
```

## Gate da PR #30

A PR #30 só pode avançar para merge quando:

1. relatório/homologação clínica da Founder estiver incorporado;
2. achados do Quality/Verification estiverem reconciliados contra a PR #30, não apenas `main`;
3. invariantes críticos tiverem proteção rastreável e gaps remanescentes estiverem explicitamente classificados;
4. fluxo concorrente de Reavaliação/Contexto estiver resolvido conforme decisão de domínio;
5. fricções P1 forem tratadas ou explicitamente deferidas com justificativa;
6. suíte lógica estiver verde;
7. interação desktop/mobile estiver validada;
8. PWA instalado/offline tiver evidência real suficiente para o gate declarado;
9. novo preview for homologado manualmente;
10. somente então o draft pode ser convertido para merge final.

## Patrimônio e arquitetura já preservados

- Encounter v3 temporal e snapshot de admissão;
- resultados seriados como eventos distintos;
- estado genérico de scores e HEART contextual;
- parser laboratorial e formatação compacta;
- formatação de imagem/laudo;
- produtividade de plantão;
- storage owner e proteção contra corrupção/falso vazio;
- hardening de PWA/CI/supply chain;
- invariant registry + gate de cobertura rastreável;
- mineração de `develop` sem merge bruto;
- ownership semântico documentado.

A reorganização física agressiva de `assets/`/`src/`, adapters e containers legados permanece posterior à homologação da superfície. Não trocar estabilidade comportamental por árvore de arquivos mais bonita.

## Fases futuras

### Persistência/histórico avançado

```text
Encounter v3
→ lista local de Atendimentos
→ Atendimento atual
→ retomar Atendimento em andamento
→ finalizar/desfecho sem apagar história
```

Avaliar IndexedDB, retenção, exportação/importação e recuperação somente após a convergência atual.

### Expansão clínica

Novo contexto clínico só entra após o motor atual provar:

- zero fabricação clínica;
- progressive disclosure útil;
- score contextual sem obrigação indevida;
- documento final coerente;
- ganho operacional real.

### Piloto

Critérios mínimos:

- homologação assistencial explícita;
- interação real testada;
- segurança clínica demonstrável;
- PWA/offline compatível com ambiente-alvo;
- produtividade/tempo mensuráveis;
- mecanismo claro de recuperação e suporte.

### Produção / assinatura

Somente após piloto: identidade/autenticação, isolamento, privacidade/LGPD, backup/retention, observabilidade, billing, suporte, termos e operação SaaS.
