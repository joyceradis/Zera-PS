# Release notes — 2026-08-16

Este arquivo publica o resumo das mudanças mescladas em 16 de agosto de 2026 para que fique imediatamente visível na raiz do repositório.

Merged PRs #69–#71

- PR #71 — fix(safety): impedir estado do paciente anterior após limpar Atendimento
  - Auditoria identificou vazamento de estado entre atendimentos quando o botão "Limpar" não esvaziava campos/outputs de reavaliação, internação e alta, e scores estáticos permaneciam. O reset agora limpa toda a superfície de continuação, restaura destino de internação ao padrão, fecha painéis/ações ativas e zera controles de score disparando os handlers existentes para sincronizar o estado.
  - Link: https://github.com/joyceradis/ZeraPS/pull/71

- PR #70 — docs(coordination): atualizar lane Platform/Core após convergência de workflow
  - Atualização de documentação da lane Platform/Core para refletir o estado real após convergência de várias PRs e integrações; nenhuma alteração de produto/UX/regras clínicas — orientações para Quality sobre rebasing e evidência também atualizadas.
  - Link: https://github.com/joyceradis/ZeraPS/pull/70

- PR #69 — fix(ux): manter orientação do Atendimento legível e sincronizada após limpar
  - Correção de acabamento: orientação passa a usar heading + parágrafos (melhor legibilidade) e o reset passa a atualizar o estado visual ("EM REGISTRO") em microtask após limpeza efetiva do formulário/output, evitando indicadores visuais stale.
  - Link: https://github.com/joyceradis/ZeraPS/pull/69

---

Publicado automaticamente por Copilot - Estevão Radis