# Zera PS — Coordenação de agentes e autoridade de decisão

Este documento é canônico para coordenação quando mais de um agente atua no repositório.

## Princípio

Nenhum agente é autoridade isolada sobre o produto. O Zera PS separa autoridade de domínio, autoridade técnica e auditoria independente para reduzir regressão, ambiguidade e mudanças silenciosas.

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

A Founder não precisa decidir arquitetura, branch hygiene, CI/CD, PWA, storage, ownership ou refatoração puramente técnica.

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
- reconciliar hotfixes e trabalho concorrente com a linha canônica de convergência.

Lead Engineering pode decidir e executar autonomamente mudanças não clínicas, reversíveis e testáveis.

### Auditor independente / segunda leitura

Pode ser exercido por Claude ou outro agente independente.

Responsável por:

- auditar o código sem pressupor que a suíte verde implica segurança completa;
- procurar regressões, testes removidos, invariantes não protegidos e patrimônio não mesclado;
- apresentar evidência reproduzível;
- contradizer a implementação atual quando a evidência exigir;
- implementar correções técnicas quando o escopo estiver claramente definido e não depender de decisão clínica nova.

O auditor não altera sozinho a doutrina clínica do produto. Achados são validados contra o repositório real antes de incorporação.

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

## Regra para trabalho concorrente

1. PR #30 é a linha canônica de convergência enquanto estiver em homologação.
2. A `main` recebe apenas hotfix isolado quando existir risco real que não pode aguardar a homologação da PR #30.
3. Hotfix na `main` deve ser mínimo, ter teste de regressão e ser reconciliado imediatamente com a PR #30.
4. Nenhum agente cria arquitetura paralela para a mesma responsabilidade sem registrar owner e motivo.
5. Nenhum agente remove teste de segurança para fazer a suíte passar.
6. Nenhum agente transforma auditoria histórica em especificação vigente sem reconciliar com documentos canônicos.
7. Nenhum agente faz merge da PR #30 antes da homologação clínica manual da Founder.
8. Microfunção existente é patrimônio até prova de obsolescência ou insegurança; primeiro recuperar/caracterizar, depois remover.
9. Dois agentes não escrevem simultaneamente no mesmo owner sem coordenação explícita. Enquanto um agente altera um owner, o outro assume papel de auditor/reviewer naquele owner.
10. Antes de qualquer write, o agente deve sincronizar o HEAD da branch-alvo e identificar a base real. Depois do write, deve informar branch, PR, base e SHA exatos.
11. A frase `mesclando` é proibida sem escopo explícito. A comunicação deve usar: `mesclando PR #<n> → <base>` ou `não mesclando; apenas commitando em <branch>`.
12. Autorrevisão não substitui reconciliação multiagente quando a mudança toca segurança clínica, estado, documento, microfunções ou owners compartilhados.

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
merge do hotfix
↓
RECONCILIAR IMEDIATAMENTE com PR #30
```

`merge na main` nunca significa que a PR #30 herdou automaticamente a correção. A reconciliação precisa ser comprovada por diff/teste.

## Lease de ownership

Durante mudanças concorrentes, cada bloco deve declarar implicitamente um owner de escrita:

```text
AGENTE A — WRITE LEASE
src/hda-composer.js + testes associados

AGENTE B
→ não escreve nesses owners
→ pode auditar/revisar
→ trabalha em owner ortogonal
```

O lease termina quando o agente publica um checkpoint coerente com SHA e testes. Isso evita sobrescrita, non-fast-forward e correções concorrentes divergentes.

## Formato obrigatório de checkpoint técnico

Todo agente que concluir um bloco relevante deve reportar:

```text
OBJETIVO:
BRANCH:
PR:
BASE:
HEAD SHA:
ARQUIVOS/OWNERS ALTERADOS:
TESTES:
MERGE:
- não realizado
ou
- PR #N → main/branch, SHA ...
PENDÊNCIA DE RECONCILIAÇÃO:
IMPACTO CLÍNICO:
```

A Founder não precisa acompanhar esses campos; eles existem para coordenação entre agentes.

## Invariantes compartilhados

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

- `main`: hotfixes #32 e #34 corrigem negativas automáticas dos templates e do compositor da síndrome diarreica.
- PR #30: aberta, draft e bloqueada para merge até homologação clínica manual da Founder.
- PR #30: proteção adicional de invariant clínico presente; hotfix do compositor deve permanecer reconciliado na linha canônica.
- `develop`: preservada somente como mina arqueológica; não é linha de implementação.

## Próximo gate

```text
FOUNDER
→ finalizar relatório/homologação clínica da PR #30
→ classificar feedback por impacto e prioridade

LEAD ENGINEERING
→ manter chão técnico estável
→ reconciliar hotfixes da main com a PR #30
→ auditar blocos do auditor independente
→ não alterar silenciosamente UX/fluxo/texto clínico em homologação

AUDITOR INDEPENDENTE
→ implementar/auditar blocos claramente técnicos
→ checkpoint com branch/base/SHA
→ sem merge da PR #30
→ sem linha paralela de produto
```

Após homologação: correções da PR #30 → nova verificação automatizada → novo preview → homologação final → somente então merge.
