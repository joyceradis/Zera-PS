# Coerência entre roteiro e protocolo — desenho

## Objetivo

Impedir que um roteiro de documentação sem protocolo correspondente permaneça ativo ao mesmo tempo que um workflow clínico específico, sem apagar ou reinterpretar dados clínicos já digitados.

## Diagnóstico

O formulário documental e o workflow temporal são controlados e persistidos por módulos independentes. `assets/app.js` aplica roteiros e restaura o autosave v2; `src/temporal-ui.js` monta protocolos e restaura o encounter v3. Nenhum dos lados negocia a troca de contexto com o outro. Por isso, um clique em Rinossinusite pode alterar a QP enquanto o encounter SCA permanece ativo.

## Alternativas consideradas

1. **Limpar sempre o workflow ao clicar em roteiro.** Simples, mas pode apagar estado temporal relevante sem consentimento.
2. **Inferir compatibilidade pela QP.** Rejeitada: texto clínico não pode ser convertido automaticamente em diagnóstico ou protocolo.
3. **Coordenação explícita por eventos e decisões puras.** Escolhida: mantém os controladores desacoplados, permite testes sem DOM real e exige confirmação quando a troca descartaria vínculo temporal significativo.

## Arquitetura escolhida

Um novo módulo puro, `src/context-coordination.js`, define:

- a representação mínima do contexto documental (`templateId` e `protocolId` opcional);
- compatibilidade entre roteiro e workflow;
- detecção conservadora de conteúdo significativo no encounter;
- decisões de troca (`allow`, `confirm`, `cancel`) sem acessar DOM ou armazenamento;
- nomes dos eventos síncronos usados pelos dois controladores.

`assets/app.js` passa a persistir somente a identidade explícita do roteiro escolhido, sem inferi-la pela QP. Antes de aplicar um roteiro, solicita ao workflow a liberação da troca. `src/temporal-ui.js` pode cancelar a solicitação ou remover apenas o encounter incompatível. O caminho inverso funciona da mesma forma ao selecionar um workflow.

Na restauração, uma combinação incompatível é reconciliada antes de ficar visível. Se há estado temporal significativo, o usuário escolhe qual contexto manter; nenhum texto clínico é apagado. Na ausência de estado significativo, prevalece a seleção explícita mais recente; formatos antigos sem metadado usam a opção mais conservadora: sem workflow específico.

## Regras de segurança

- Roteiro não é protocolo e a interface deve nomeá-lo corretamente.
- Ausência de `protocolId` no roteiro significa que ele não autoriza workflow específico.
- Troca não apaga QP, HDA, resultados, hipóteses ou conduta.
- Cancelamento não altera roteiro, encounter, select ou persistência.
- Compatibilidade nunca é inferida de conteúdo textual.
- Registry permanece somente com SCA.
- Ferramenta `unavailable` é renderizada antes da aplicabilidade e nunca oferece botão.
- `section.stages` aceita somente array; `section.stage` permanece singular.

## Verificação

Testes unitários cobrem decisões puras, persistência de roteiro, schema e ferramenta indisponível. Testes de integração estática garantem a microcópia e a ligação dos eventos. O gate final é `npm run verify`, `git diff --check main...HEAD` e smoke test desktop/mobile com reload.
