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
- bloquear tecnicamente uma mudança quando não houver evidência suficiente.

Lead Engineering pode decidir e executar autonomamente mudanças não clínicas, reversíveis e testáveis.

### Auditor independente / segunda leitura

Pode ser exercido por Claude ou outro agente independente.

Responsável por:

- auditar o código sem pressupor que a suíte verde implica segurança completa;
- procurar regressões, testes removidos, invariantes não protegidos e patrimônio não mesclado;
- apresentar evidência reproduzível;
- contradizer a implementação atual quando a evidência exigir.

O auditor não altera sozinho a doutrina clínica do produto. Achados são validados contra o repositório real antes de incorporação.

## Matriz de autoridade

```text
DECISÃO PURAMENTE TÉCNICA
→ Lead Engineering decide
→ teste/contrato
→ alteração
→ verificação
→ auditoria pós

DECISÃO COM IMPACTO CLÍNICO OU OPERACIONAL
→ Lead Engineering caracteriza problema e alternativas
→ Founder decide o domínio
→ Lead Engineering implementa
→ auditor independente pode revisar

DÚVIDA SE É TÉCNICA OU CLÍNICA
→ tratar como clínica
→ não assumir
```

## Regra para trabalho concorrente

1. PR #30 é a linha canônica de convergência enquanto estiver em homologação.
2. A `main` recebe apenas hotfix isolado quando existir risco real que não pode aguardar a homologação da PR #30.
3. Hotfix na `main` deve ser mínimo, ter teste de regressão e ser reconciliado documentalmente com a PR #30.
4. Nenhum agente cria arquitetura paralela para a mesma responsabilidade sem registrar owner e motivo.
5. Nenhum agente remove teste de segurança para fazer a suíte passar.
6. Nenhum agente transforma auditoria histórica em especificação vigente sem reconciliar com documentos canônicos.
7. Nenhum agente faz merge da PR #30 antes da homologação clínica manual da Founder.
8. Microfunção existente é patrimônio até prova de obsolescência ou insegurança; primeiro recuperar/characterize, depois remover.

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

- `main`: hotfix de segurança clínico-documental #32 mesclado; negativas automáticas removidas dos cinco roteiros legados; trava de regressão restaurada.
- PR #30: aberta, draft e bloqueada para merge até homologação clínica manual da Founder.
- PR #30: proteção adicional de invariant clínico adicionada; suíte verificada em 230/230 testes.
- `develop`: preservada somente como mina arqueológica; não é linha de implementação.

## Próximo gate

```text
FOUNDER
→ finalizar relatório/homologação clínica da PR #30
→ classificar feedback por impacto e prioridade

LEAD ENGINEERING
→ manter chão técnico estável
→ reconciliar qualquer hotfix da main com a PR #30
→ não alterar silenciosamente UX/fluxo/texto clínico em homologação
→ preparar correções após o relatório

AUDITOR INDEPENDENTE
→ segunda leitura de regressão/invariantes
→ evidência reproduzível
→ sem criar linha paralela de produto
```

Após homologação: correções da PR #30 → nova verificação automatizada → novo preview → homologação final → somente então merge.