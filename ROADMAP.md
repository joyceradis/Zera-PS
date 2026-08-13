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
- `Reachable` = existe caminho real da superfície entregue até a capacidade; motor isolado/teste puro não basta.

## Estado executivo atual

| Área | Estado | Gate principal |
| --- | --- | --- |
| Segurança clínica — desenho | Forte / implementado | Estado/proveniência explícitos e invariantes nomeados |
| Segurança clínica — garantia efetiva | **Em desenvolvimento avançado** | Registry + gate + contraditório + composição real |
| Invariant coverage | **9 integrais / 1 parcial** | `INV-CLIN-003` só muda após PR #43 rebaseada + segunda leitura + handshake |
| Workflow temporal / lifecycle | **Implementado e alcançável** | atividade real inicia Encounter sem exigir cenário |
| Protocolo dinâmico / progressive disclosure | **Implementado, reachability parcial** | expor capacidade sem reintroduzir Workflow como produto concorrente |
| Ferramentas estáticas | **Alcançáveis em Atendimento → Ferramentas** | CRB-65/qSOFA/CURB-65 protegidos contra perda de reachability |
| Ferramentas protocol-bound | **Reachability aberta** | HEART/contexto SCA e demais ferramentas declarativas precisam de porta canônica |
| Documento temporal | Implementado; proteção fortalecida | `INV-DOC-001` adversarialmente protegido |
| Persistência/histórico | Parcial | sem perda/reinterpretação; multi-Atendimento ainda futuro |
| Proteção contra overwrite/restore | **Implementada** | edição manual e rascunho não podem ser destruídos por sincronização silenciosa |
| UX operacional / keyboard-first | **Lacuna real** | orientação inicial, atalhos, diálogos e escolhas concorrentes |
| Testes de lógica | Ativos e rastreados | não equivalem a interação real |
| Testes de interação / PWA offline real | **Lacuna / em desenvolvimento** | navegador, mobile, instalação e offline de fato |
| PWA app shell | **Hardening implementado** | grafo de imports fechado; cache atual v16; falta prova instalada/offline |
| Governança interna de CI | **Implementada** | sentinelas antes da suíte + anti-erosão do próprio guard |
| Governança externa GitHub | **Lacuna comprovada — #50** | `main` e PR #30 estão `protected:false`; required checks off |
| Housekeeping + Product Convergence | Em homologação | uma experiência de Atendimento sem perda de microfunções |
| Recuperação de microfunções | Avançada | recuperar por contrato/teste, não cópia cega |
| Piloto | Futuro próximo, ainda não liberado | homologação + interação real + gates V1 |
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

Regra epistemológica: **quem implementa uma garantia crítica não é seu único validador**. Um teste sofisticado pode estar correto e ainda sustentar uma conclusão maior do que aquilo que efetivamente exercitou.

Regra de fronteira:

- setor vem antes do lease;
- cada setor registra estado apenas no próprio arquivo em `docs/coordination/active/`;
- auditorias novas usam uma entrada append-only própria;
- RED arquitetural faz handoff para Platform/Core;
- decisão de fluxo/semântica clínica retorna à Founder;
- PR filha sujeita a segunda leitura só pode ser integrada após `INTEGRATION READY — <HEAD SHA>` do setor revisor;
- PR #30 é a linha canônica de convergência e **não será mergeada antes da homologação manual da Founder**.

## Âncora — checkpoint corrente

### Segurança/documento

- P0 de negativas clínicas pré-escritas foi corrigido e reconciliado;
- justificativa de alto custo deixou de fabricar urgência/gravidade não confirmadas; issue #45 encerrada com RED→GREEN;
- `Atualizar evolução` não pode mais sobrescrever edição manual silenciosamente; issue #47 encerrada;
- abrir rascunho e digitar não pode mais destruir QP/HDA por campo visível obsoleto; issue #49 encerrada;
- troponina é assay-dependent: valor + unidade + ensaio/referência local; `0,0019` do Meridional não é cutoff universal.

### Reachability / patrimônio

- lifecycle do Atendimento foi desacoplado do seletor oculto de workflow: atividade clínica real inicia Encounter protocol-agnostic e alimenta storage/produtividade;
- issue #44 foi refinada: **scores estáticos estão alcançáveis** em Atendimento → Ferramentas e têm protetor dedicado; o gap restante é do motor declarativo de protocolo, progressive disclosure e ferramentas protocol-bound;
- não desocultar `.workflow-card` como atalho: isso ressuscitaria implementação interna como escolha cognitiva para a médica;
- parser LAB, formatação de imagem, hidratação graduada, produtividade, scores estáticos e demais microfunções recuperadas continuam patrimônio protegido.

### Invariantes / Quality

- PR #37: gate invariant→teste integrado após três leituras;
- PR #38: `INV-DOC-001` fortalecido;
- PR #41: alegação de `INV-CLIN-003 = FULL` foi revertida após segunda leitura detectar falsa ponte de composição;
- PR #43 elevou o rigor, mas está **BLOCKED** no HEAD atual até rebase e atualização da evidência. Estado oficial continua **9 FULL / 1 PARTIAL**;
- nenhuma contagem de testes ou alegação da PR filha altera o estado canônico sem handshake válido para o SHA revisado.

### CI / governança

- `INV-GOV-001` possui proteção interna em camadas: guard pré-suíte, âncora mútua e teste que detecta remoção/enfraquecimento do guard. Issue #40 encerrada **apenas no escopo interno**;
- o limite externo está separado em #50: a API do GitHub confirmou `protected:false` e required status enforcement `off` em `main` e na branch da PR #30;
- portanto, o handshake multiagente é disciplina operacional hoje, não branch protection real.

### Branches / housekeeping

- inventário atual: 7 branches;
- `fix/pr30-priority-blockers` = `SAFE TO PRUNE` por diff de arquivos vazio contra a canônica;
- `fix/p0-fabricated-negatives` = `SAFE TO PRUNE` após leitura semântica: residual reintroduz placeholders `[CONFIRMAR AUSÊNCIA...]` já superados pela direção clínica/UX e pela solução canônica;
- o conector atual não oferece delete-ref seguro; refs não serão apagados por force update;
- preservar `main`, PR #30, PR #43, PR #36 pausada e `develop` como mina arqueológica.

### Homologação da Founder

A homologação é **contínua no preview publicado**. Achados observados durante o uso já entram no fluxo Quality/Core; não existe uma segunda bateria escondida que a Founder ainda deva começar. Permanecem como decisões explícitas de domínio antes de alteração semântica:

- #46 — relação QP × HDA no percurso de intake livre;
- #48 — orientação inicial, hierarquia/estado da superfície e fricção cognitiva;
- aceite final da V1 para piloto.

## Prioridade atual — fechamento da V1

```text
P0 — impedir fabricação/perda silenciosa de conteúdo clínico
      [núcleo atual tratado; manter regressão]
↓
P1 — fechar reachability do motor protocolar sem criar um segundo produto
↓
P1 — PR #43: rebase → segunda leitura → decidir INV-CLIN-003
↓
P1 — decisões Founder #46/#48 + reduzir fricção/keyboard-first
↓
P1 — branch protection/ruleset externo (#50)
↓
P1 — interação real desktop/mobile
↓
P1 — PWA instalado/offline real
↓
P1 — homologação final da Founder
↓
V1 CANDIDATA A PILOTO
↓
piloto controlado + métricas de tempo/fricção/erros
↓
V1 LANÇAMENTO
```

## Gate da PR #30

A PR #30 só pode avançar para merge quando:

1. homologação clínica contínua da Founder estiver incorporada e houver aceite explícito do comportamento para o estágio definido;
2. achados de Quality estiverem reconciliados contra a PR #30, não apenas `main`;
3. `INV-CLIN-003` tiver estado final honesto (`FULL` ou `PARTIAL` com gap explícito) após segunda leitura válida;
4. reachability do motor protocolar tiver decisão/implementação coerente com o mapa de produto único, ou deferimento explícito para fora da V1;
5. #46 e #48 tiverem decisão de domínio ou deferimento explícito;
6. fricções P1/keyboard-first tiverem sido tratadas ou explicitamente deferidas com justificativa de piloto;
7. suíte lógica estiver verde;
8. interação desktop/mobile estiver validada;
9. PWA instalado/offline tiver evidência real suficiente para o gate declarado;
10. governança externa #50 estiver configurada ou o risco for explicitamente aceito para o estágio de piloto — nunca presumido;
11. novo preview for homologado manualmente;
12. somente então o draft pode ser convertido para merge final.

## Patrimônio e arquitetura já preservados

- Encounter v3 temporal e snapshot de admissão;
- início protocol-agnostic do Atendimento;
- resultados seriados como eventos distintos;
- estado genérico de scores e HEART contextual;
- CRB-65/qSOFA/CURB-65 alcançáveis pela superfície Ferramentas;
- parser laboratorial e formatação compacta;
- formatação de imagem/laudo;
- produtividade de plantão;
- proteção de texto gerado versus edição manual;
- sincronização segura de restore de rascunho;
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
- progressive disclosure útil **e alcançável**;
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
- mecanismo claro de recuperação e suporte;
- risco de governança externa explicitamente tratado.

### Produção / assinatura

Somente após piloto: identidade/autenticação, isolamento, privacidade/LGPD, backup/retention, observabilidade, billing, suporte, termos e operação SaaS.
