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
- `Implementado` = código existe e passou o gate técnico declarado.
- `Homologado` = comportamento foi validado na experiência real definida pela Founder.
- `Maduro` = evidência compatível com uso real, não apenas leitura de código.

## Estado executivo — reclassificado após auditoria independente

| Área | Estado | Gate principal |
| --- | --- | --- |
| Segurança clínica — desenho | Forte / implementado | Estado/proveniência explícitos e invariantes nomeados |
| Segurança clínica — garantia efetiva | **Em desenvolvimento** | Registry + testes críticos preservados + segunda leitura + interação real |
| Workflow temporal | Implementado; homologação aberta | Reavaliação única deve preservar admissão e funcionar sem caminhos concorrentes |
| Progressive disclosure | Infraestrutura implementada | Validar que reduz, e não aumenta, carga cognitiva |
| Ferramentas clínicas | Implementadas parcialmente | `available ≠ applicable ≠ calculable ≠ applied` + contexto real |
| Documento temporal | Implementado; homologação aberta | Estado operacional não vaza para prontuário |
| Persistência/histórico | Parcial | Sem perda/reinterpretação; multi-Atendimento ainda futuro |
| UX operacional / keyboard-first | **Lacuna real** | atalhos, remoção de `confirm()` nativo e eliminação de caminhos/seletores concorrentes |
| Testes de lógica | Ativos | Não equivalem a interação real |
| Testes de interação / PWA offline real | **Lacuna / em desenvolvimento** | navegador, mobile, PWA instalado e offline de fato |
| Housekeeping + Product Convergence | Em homologação | uma experiência de Atendimento sem perda de microfunções |
| Recuperação de microfunções | Avançada | recuperar por contrato/teste, não cópia cega |
| Piloto | Futuro | zero informação fabricada + ganho operacional mensurável |
| Produção/assinatura | Futuro | requisitos SaaS, segurança, privacidade e operação |

## Coordenação multiagente — gate operacional atual

Documentos canônicos:

- [`docs/architecture/AGENT_COORDINATION.md`](docs/architecture/AGENT_COORDINATION.md)
- [`docs/architecture/ACTIVE_WORK.md`](docs/architecture/ACTIVE_WORK.md)
- [`docs/audits/SHARED_AUDIT_LOG.md`](docs/audits/SHARED_AUDIT_LOG.md)
- [`docs/clinical/INVARIANT_REGISTRY.md`](docs/clinical/INVARIANT_REGISTRY.md)

```text
FOUNDER / DOMÍNIO CLÍNICO
→ prática real do PS, prioridade, linguagem, fluxo cognitivo e homologação
→ não atua como mensageira entre agentes

LEAD ENGINEERING
→ arquitetura, estado, engines, persistência, PWA, testes, CI/CD, segurança, dívida, regressão e integração

AUDITOR INDEPENDENTE
→ segunda leitura, procura regressões/invariantes removidos, publica evidência reproduzível e pode corrigir blocos técnicos com lease explícito
```

Regras vigentes:

- GitHub é a fonte única de verdade operacional entre agentes;
- PR #30 é a linha canônica de convergência e **não será mergeada antes da homologação manual da Founder**;
- `main` recebe apenas hotfix mínimo quando risco real não puder aguardar;
- hotfix na `main` exige teste e reconciliação comprovada com PR #30;
- nenhum agente remove/enfraquece proteção de invariant crítico silenciosamente;
- antes de write em owner compartilhado, verificar/registrar `ACTIVE_WORK.md`;
- auditorias relevantes são publicadas em `SHARED_AUDIT_LOG.md` ou arquivo referenciado;
- nenhuma decisão de domínio clínico é tomada silenciosamente por Engineering ou auditor;
- microfunções existentes são patrimônio até prova de obsolescência ou insegurança.

## Âncora — 2026-08-13

- P0 de negativas clínicas pré-escritas foi confirmado por auditoria independente e corrigido/reconciliado;
- o incidente demonstrou que suíte verde não basta: o teste que protegia o invariant havia sido removido junto da regressão;
- `INVARIANT_REGISTRY.md` passa a registrar propriedades críticas independentemente da implementação;
- `ACTIVE_WORK.md` e `SHARED_AUDIT_LOG.md` passam a coordenar múltiplos agentes sem usar a Founder como barramento humano;
- PR #30 continua aberta/draft para homologação clínica;
- keyboard-first, `confirm()` nativos, seletores/caminhos concorrentes, testes de interação real, PWA/offline real e revisão independente contínua permanecem trabalho aberto;
- expansão clínica fica subordinada a segurança demonstrável + redução de fricção operacional.

## Prioridade atual

```text
P0 — preservar invariantes críticos e impedir fabricação clínica
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
2. achados do auditor independente estiverem reconciliados contra a PR #30, não apenas `main`;
3. invariantes críticos tiverem proteção rastreável;
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
