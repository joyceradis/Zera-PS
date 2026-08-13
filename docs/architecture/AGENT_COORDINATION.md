# Zera PS — Coordenação de agentes e autoridade de decisão

Este documento é canônico para coordenação quando mais de um agente atua no repositório.

## Princípio

Nenhum agente é autoridade isolada sobre o produto. O GitHub é a fonte única de verdade operacional. O Zera PS separa autoridade de domínio, Platform/Core Engineering e Quality/Verification Engineering para reduzir regressão, ambiguidade, trabalho duplicado e mudanças silenciosas.

CI verde prova somente que os testes existentes passaram. Não prova que invariantes importantes continuam protegidos. Testes que protegem invariantes críticos são patrimônio do produto e sua remoção/modificação exige revisão explícita.

## Divisão operacional por setor

### Joyce — Founder / Produto / Domínio Clínico

Responsável por:

- fluxo real do pronto-socorro;
- prioridade de produto;
- UX clínica;
- linguagem documental;
- relevância clínica;
- microfunções úteis;
- homologação clínica;
- decisão final quando houver trade-off de domínio.

A Founder não precisa decidir arquitetura, branch hygiene, CI/CD, PWA, storage, ownership ou refatoração puramente técnica, nem atuar como mensageira entre agentes.

### ChatGPT — Platform / Core Engineering

Owner primário de:

- arquitetura canônica;
- modelagem de estado e proveniência;
- document engine;
- workflow/temporalidade;
- storage/persistência;
- PWA/offline;
- integração entre módulos;
- CI/CD estrutural e supply chain;
- segurança técnica de plataforma;
- ownership;
- housekeeping;
- roadmap e documentação canônica;
- merge/reconciliação;
- dívida técnica estrutural.

Também é responsável por transformar decisões de domínio em arquitetura, recuperar microfunções sem transplantar comportamento inseguro, impedir regressões entre módulos e integrar achados de Quality/Verification sem tratar suíte verde como prova suficiente de maturidade.

Platform/Core pode decidir e executar autonomamente mudanças não clínicas, reversíveis e testáveis dentro do próprio setor.

### Claude — Quality / Verification Engineering

Owner primário de:

- auditoria independente;
- testes de regressão;
- invariant coverage;
- testes adversariais;
- investigação e reprodução de bugs;
- arqueologia complementar;
- análise de PR;
- compatibilidade;
- revisão de segurança;
- detecção de teste removido/enfraquecido;
- testes de interação;
- observabilidade de CI;
- análise de maturidade;
- correções técnicas localizadas demonstradas por auditoria, desde que não alterem silenciosamente arquitetura canônica, UX clínica ou semântica clínica.

Quality/Verification pode escrever código dentro desse setor. Se provar uma lacuna cuja correção exige mudança de arquitetura canônica, estado, document engine, workflow, storage, PWA ou UX/semântica clínica, registra o gap e faz handoff ao owner correto em vez de refatorar o core por iniciativa própria.

## Regra de fronteira entre setores

Setor vem antes do lease.

```text
QUALITY encontra bug/invariant gap
→ reproduz
→ cria/fortalece teste quando isso pertence a Quality
→ pode corrigir bug técnico localizado se não mudar Core/domínio
→ se exigir Core: registra handoff para Platform/Core
→ se exigir decisão clínica/UX: registra handoff para Founder

PLATFORM/CORE implementa arquitetura/correção estrutural
→ Quality faz segunda leitura/adversarial quando crítico

FOUNDER
→ entra somente em decisão real de domínio, produto ou homologação
```

Nenhum agente usa a Founder como canal de transporte de contexto. O estado deve ser publicado no GitHub.

## Matriz de autoridade

```text
DECISÃO PURAMENTE TÉCNICA DENTRO DO SETOR
→ owner do setor caracteriza e implementa
→ teste/contrato
→ alteração
→ verificação
→ checkpoint no GitHub

MUDANÇA QUE CRUZA SETOR
→ registrar evidência e handoff
→ owner receptor decide implementação
→ agente originador pode revisar/adversarialmente testar

DECISÃO COM IMPACTO CLÍNICO OU OPERACIONAL
→ problema e alternativas são caracterizados
→ Founder decide o domínio
→ implementação técnica
→ Quality pode revisar

DÚVIDA SE É TÉCNICA OU CLÍNICA
→ tratar como clínica
→ não assumir
```

## Fonte única de verdade multiagente

O repositório substitui a Founder como canal de transporte de contexto entre agentes.

Artefatos canônicos:

- `docs/audits/SHARED_AUDIT_LOG.md`: índice cronológico de auditorias, achados e reconciliações;
- `docs/architecture/ACTIVE_WORK.md`: leases de escrita e trabalho técnico em andamento;
- `docs/clinical/INVARIANT_REGISTRY.md`: invariantes críticos, proteção automatizada e owner;
- `docs/architecture/AGENT_COORDINATION.md`: este contrato de governança.

Auditoria relevante deve ser registrada no GitHub. O outro agente deve lê-la do repositório, não depender de retransmissão manual pela Founder.

## Regra para trabalho concorrente

1. PR #30 é a linha canônica de convergência enquanto estiver em homologação.
2. A `main` recebe apenas hotfix isolado quando existir risco real que não pode aguardar a homologação da PR #30.
3. Hotfix na `main` deve ser mínimo, ter teste de regressão e ser reconciliado imediatamente com a PR #30.
4. Nenhum agente cria arquitetura paralela para a mesma responsabilidade sem registrar owner e motivo.
5. Nenhum agente remove ou enfraquece teste de invariant crítico para fazer a suíte passar.
6. Alteração/remoção de teste que protege invariant crítico exige segunda leitura explícita e reconciliação com o registry/gate vigente.
7. Nenhum agente transforma auditoria histórica em especificação vigente sem reconciliar com documentos canônicos.
8. Nenhum agente faz merge da PR #30 antes da homologação clínica manual da Founder.
9. Microfunção existente é patrimônio até prova de obsolescência ou insegurança; primeiro recuperar/caracterizar, depois remover.
10. Dois agentes não escrevem simultaneamente no mesmo owner sem coordenação explícita. Enquanto um agente altera um owner, o outro assume papel de auditor/reviewer naquele owner.
11. Antes de qualquer write, o agente deve sincronizar o HEAD da branch-alvo, identificar a base real, verificar o setor/owner e consultar `ACTIVE_WORK.md`.
12. Depois do write, deve informar branch, PR, base, SHA, owners alterados e testes.
13. A frase `mesclando` é proibida sem escopo explícito. Usar `mesclando PR #<n> → <base>` ou `não mesclando; apenas commitando em <branch>`.
14. Autorrevisão não substitui reconciliação multiagente quando a mudança toca segurança clínica, estado, documento, microfunções ou owners compartilhados.
15. Suíte verde não autoriza marcar fase como madura sem evidência compatível com o gate declarado.
16. Quality/Verification não avança para Core apenas porque encontrou o bug; handoff é obrigatório quando a correção cruza o setor.
17. Platform/Core não valida sozinho garantias críticas quando uma segunda leitura independente é viável.

## Protocolo de branches

### Trabalho da convergência

```text
base lógica: main
linha canônica: chore/housekeeping-product-convergence
PR: #30 → main
merge: BLOQUEADO até homologação da Founder
```

Mudanças que pertencem ao produto convergente devem entrar na PR #30 diretamente ou por PR filha apontando para a branch da PR #30. Não criar uma terceira linha de produto.

### Hotfix P0 na main

```text
main
↓
hotfix/<problema>
↓
PR isolada → main
↓
RED reproduzível
↓
correção mínima
↓
GREEN
↓
segunda leitura quando tocar invariant crítico
↓
merge do hotfix
↓
RECONCILIAR IMEDIATAMENTE com PR #30
```

`merge na main` nunca significa que a PR #30 herdou automaticamente a correção. A reconciliação precisa ser comprovada por diff/teste.

## Lease de ownership

Todo bloco concorrente deve ser registrado em `docs/architecture/ACTIVE_WORK.md` antes do write.

```text
AGENTE A — WRITE LEASE
setor: Quality / Verification
owner: tests/invariant-coverage.test.mjs
branch/PR: ...
objetivo: ...
SHA inicial: ...
status: ACTIVE

AGENTE B
→ não escreve nesse owner
→ pode auditar/revisar
→ trabalha em owner ortogonal do próprio setor
```

O lease termina quando o agente publica checkpoint coerente com SHA e testes e atualiza o status para CLOSED.

## Formato obrigatório de checkpoint técnico

```text
OBJETIVO:
AGENTE:
SETOR:
BRANCH:
PR:
BASE:
HEAD SHA:
ARQUIVOS/OWNERS ALTERADOS:
TESTES:
INVARIANTS TOCADOS:
MERGE:
- não realizado
ou
- PR #N → main/branch, SHA ...
PENDÊNCIA DE RECONCILIAÇÃO:
IMPACTO CLÍNICO:
```

A Founder não precisa acompanhar esses campos; eles existem para coordenação entre agentes.

## Invariantes compartilhados

O registry canônico vive em `docs/clinical/INVARIANT_REGISTRY.md`. No mínimo:

- ausência de confirmação nunca vira afirmação clínica;
- template não equivale a achado confirmado;
- contexto/sugestão não equivale a diagnóstico;
- score incompleto não equivale a zero;
- resultado calculável não equivale a ferramenta aplicada;
- estado operacional não vaza para o prontuário;
- reavaliação não sobrescreve admissão;
- falha de persistência não equivale a ausência de dado;
- nenhuma métrica ou informação clínica pode ser fabricada;
- mudança clinicamente relevante exige evidência antes e depois.

## Estado ancorado em 2026-08-13

- `main`: P0 das negativas automáticas corrigido; auditoria independente demonstrou que a proteção efetiva precisa ser tratada separadamente do desenho de segurança.
- PR #30: aberta, draft e bloqueada para merge até homologação clínica manual da Founder.
- PR #30: linha canônica de convergência e reconciliação de hotfixes.
- divisão operacional vigente: Joyce = Founder/Produto/Domínio; ChatGPT = Platform/Core Engineering; Claude = Quality/Verification Engineering.
- `develop`: preservada somente como mina arqueológica; não é linha de implementação.
- maturidade: segurança por desenho é mais forte que a garantia efetiva; keyboard-first, testes de interação real, PWA/offline real e revisão independente contínua permanecem gates abertos.

## Próximo gate

```text
FOUNDER
→ finalizar relatório/homologação clínica da PR #30
→ decidir somente questões reais de domínio/UX clínico

PLATFORM / CORE ENGINEERING
→ manter chão técnico estável
→ coordenar integração/reconciliação
→ transformar achados auditáveis em correções estruturais quando pertencem ao Core
→ não alterar silenciosamente UX/fluxo/texto clínico em homologação

QUALITY / VERIFICATION ENGINEERING
→ publicar auditorias no GitHub
→ trabalhar em leases explícitos do próprio setor
→ reproduzir bugs e fortalecer garantias
→ fazer handoff quando a correção exigir Core ou domínio
→ sem merge da PR #30
→ sem linha paralela de produto
```

Após homologação: correções da PR #30 → verificação automatizada + interação real → novo preview → homologação final → somente então merge.
