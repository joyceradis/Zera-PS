# Zera PS — Coordenação de agentes e autoridade de decisão

Este documento é canônico para coordenação quando mais de um agente atua no repositório.

## Princípio

Nenhum agente é autoridade isolada sobre o produto. O GitHub é a fonte única de verdade operacional. O Zera PS separa autoridade de domínio, autoridade técnica e auditoria independente para reduzir regressão, ambiguidade, trabalho duplicado e mudanças silenciosas.

CI verde prova somente que os testes existentes passaram. Não prova que invariantes importantes continuam protegidos. Testes que protegem invariantes críticos são patrimônio do produto e sua remoção/modificação exige revisão explícita.

## Papéis

### Founder / domínio clínico

Responsável por definir:

- como o pronto-socorro funciona na prática;
- onde o médico perde tempo;
- o que precisa aparecer no registro;
- o que é clinicamente relevante;
- quais atalhos realmente ajudam;
- linguagem e padrão documental;
- prioridades do produto;
- quando uma solução tecnicamente elegante é ruim na prática;
- homologação clínica manual da superfície antes de merge de mudanças com impacto assistencial.

A Founder não precisa decidir arquitetura, branch hygiene, CI/CD, PWA, storage, ownership ou refatoração puramente técnica, nem atuar como mensageira entre agentes.

### Lead Engineering

Responsável por:

- transformar decisões de domínio em arquitetura;
- modelagem de estado e proveniência;
- engines, persistência, PWA, performance e segurança técnica;
- testes, TDD, regressão, CI/CD e supply chain;
- refatoração, dívida técnica, documentação e housekeeping;
- recuperar microfunções perdidas sem transplantar comportamento inseguro;
- impedir que uma feature quebre outra;
- auditar antes e depois de mudanças relevantes;
- bloquear tecnicamente uma mudança quando não houver evidência suficiente;
- reconciliar hotfixes e trabalho concorrente com a linha canônica de convergência;
- integrar achados de auditoria independente sem tratar suíte verde como prova suficiente de maturidade.

Lead Engineering pode decidir e executar autonomamente mudanças não clínicas, reversíveis e testáveis.

### Auditor independente / segunda leitura

Pode ser exercido por Claude ou outro agente independente.

Responsável por:

- auditar o código sem pressupor que a suíte verde implica segurança completa;
- procurar regressões, testes removidos, invariantes não protegidos e patrimônio não mesclado;
- apresentar evidência reproduzível;
- contradizer a implementação atual quando a evidência exigir;
- implementar correções técnicas quando o escopo estiver claramente definido e não depender de decisão clínica nova;
- publicar auditorias relevantes no repositório para leitura direta pelos demais agentes.

O auditor não altera sozinho a doutrina clínica do produto.

## Matriz de autoridade

```text
DECISÃO PURAMENTE TÉCNICA
→ agente técnico pode caracterizar e implementar
→ teste/contrato
→ alteração
→ verificação
→ auditoria pós
→ Lead Engineering reconcilia com a linha canônica

DECISÃO COM IMPACTO CLÍNICO OU OPERACIONAL
→ problema e alternativas são caracterizados
→ Founder decide o domínio
→ implementação técnica
→ auditoria independente pode revisar

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
6. Alteração/remoção de teste que protege invariant crítico exige atualização explícita do `INVARIANT_REGISTRY.md` e segunda leitura.
7. Nenhum agente transforma auditoria histórica em especificação vigente sem reconciliar com documentos canônicos.
8. Nenhum agente faz merge da PR #30 antes da homologação clínica manual da Founder.
9. Microfunção existente é patrimônio até prova de obsolescência ou insegurança; primeiro recuperar/caracterizar, depois remover.
10. Dois agentes não escrevem simultaneamente no mesmo owner sem coordenação explícita. Enquanto um agente altera um owner, o outro assume papel de auditor/reviewer naquele owner.
11. Antes de qualquer write, o agente deve sincronizar o HEAD da branch-alvo, identificar a base real e verificar `ACTIVE_WORK.md`.
12. Depois do write, deve informar branch, PR, base, SHA, owners alterados e testes.
13. A frase `mesclando` é proibida sem escopo explícito. Usar `mesclando PR #<n> → <base>` ou `não mesclando; apenas commitando em <branch>`.
14. Autorrevisão não substitui reconciliação multiagente quando a mudança toca segurança clínica, estado, documento, microfunções ou owners compartilhados.
15. Suite verde não autoriza marcar fase como madura sem evidência compatível com o gate declarado.

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
owner: src/hda-composer.js + testes associados
branch/PR: ...
objetivo: ...
SHA inicial: ...
status: ACTIVE

AGENTE B
→ não escreve nesses owners
→ pode auditar/revisar
→ trabalha em owner ortogonal
```

O lease termina quando o agente publica checkpoint coerente com SHA e testes e atualiza o status para CLOSED.

## Formato obrigatório de checkpoint técnico

```text
OBJETIVO:
AGENTE:
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
- `develop`: preservada somente como mina arqueológica; não é linha de implementação.
- maturidade: segurança por desenho é mais forte que a garantia efetiva; keyboard-first, testes de interação real, PWA/offline real e revisão independente contínua permanecem gates abertos.

## Próximo gate

```text
FOUNDER
→ finalizar relatório/homologação clínica da PR #30
→ decidir somente questões reais de domínio/UX clínico

LEAD ENGINEERING
→ manter chão técnico estável
→ coordenar leases e reconciliação
→ transformar achados auditáveis em backlog/gates
→ não alterar silenciosamente UX/fluxo/texto clínico em homologação

AUDITOR INDEPENDENTE
→ publicar auditorias no GitHub
→ trabalhar em leases explícitos
→ checkpoint com branch/base/SHA
→ sem merge da PR #30
→ sem linha paralela de produto
```

Após homologação: correções da PR #30 → verificação automatizada + interação real → novo preview → homologação final → somente então merge.
