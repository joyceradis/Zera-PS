# Quality / Verification Engineering — Active Work

## Setor
Claude / Quality & Verification Engineering.

## Responsabilidades
Auditoria independente, testes de regressão, invariant coverage, testes adversariais, investigação de bugs, arqueologia complementar, análise de PR, compatibilidade, revisão de segurança, detecção de teste removido/enfraquecido, testes de interação, observabilidade de CI e análise de maturidade.

## Estado atual

- **PR #37: INTEGRADA** por Platform/Core em `a5a5ade`. Gate de invariantes na linha canônica; branch removida. Lease encerrado.
- **PR #38: INTEGRADA** por Platform/Core em `3a23402`; branch removida. `INV-DOC-001` fechado na linha canônica.
- **PR #36:** auditoria de maturidade; PAUSADA em draft por instrução da Founder. Base `3577383`, desatualizada — rebase pendente quando a Founder liberar.
- **PR #33:** fechada por este setor. Apontava para `main` e ficou obsoleta: o mesmo P0 foi resolvido por outro caminho (hotfix `b098235` + PR #34). Verificado na `main` antes de fechar — 0 negativas fabricadas nos roteiros e `defaultDiarrheaHdaState` já corrigido. PR aberta sem trabalho pendente é ruído na memória compartilhada.
- **Gap `INV-DOC-001`: FECHADO.** A propriedade **se sustenta**, não há vazamento; os renderizadores operam por allow-list. Era cobertura ausente, não bug — nenhum handoff de core necessário. 6 vetores adversariais; 2 mutações do document engine confirmadas detectadas.
- **Lease:** nenhum `ACTIVE`. Owner liberado.

- **PR nova:** `audit/inv-clin-003-stage-context-gate` → canônica, rebaseada sobre `087a520`. Fecha a lacuna do `INV-CLIN-003`. Cobertura **10 integral / 0 parcial**; suíte 255/255. Aguarda leitura de Platform/Core.
- **Gap `INV-CLIN-003`: FECHADO.** A propriedade **se sustenta** — disclosure e contexto alteram só visibilidade/disponibilidade. Era cobertura ausente, não bug; nenhum handoff necessário. 160 combinações etapa×contexto exercidas, 8 mutações verificadas. Executado após Platform/Core responder na #39 que o espaço é enumerável e o bloco é deste setor.

### Reauditoria 2026-08-16 — base `652de53`

Entrada: `docs/audits/entries/2026-08-16T034000Z-quality-patient-boundary-and-api-readiness.md`. Suíte 300/300 → **311/311**.

- **Dez dos quinze achados anteriores FECHADOS**, todos reverificados por execução, nenhum aceito por mensagem de commit. Seguem abertos: keyboard-first, texto do aviso legal (Founder), proveniência contornada na justificativa, seletor legado no DOM; e UX-10 parcial.
- **Achado novo S1 — contaminação entre pacientes.** `#justification-output` vive fora do `#evolution-form` e não constava de `CONTINUATION_TEXT_IDS`: a justificativa do paciente anterior sobrevivia ao "Limpar". Provado por execução. Causa de fundo: o protetor da correção `652de53` era **auto-referente** — iterava a própria lista do módulo, então campo nunca adicionado jamais era coberto. Fechado com `tests/patient-boundary.test.mjs`, que deriva a exigência do próprio `app.html`. 3 mutações verificadas; a terceira revelou fraqueza na minha própria guarda (asserção global casando com outra ocorrência), corrigida com escopo à função.
- **Cruzamento de owner declarado:** uma linha em `src/product-coherence.js`. Justificativa na entrada de auditoria; Platform/Core pode realocar sem prejuízo da guarda.
- **`INV-CLIN-003` fechado.** `tests/context-composition-bridge.test.mjs` reexecutado sobre a canônica atual, 51 commits depois, passa sem alteração — a propriedade se manteve durante toda a convergência. Cobertura proposta **10 integral / 0 parcial**, sujeita a handshake.
- **Prontidão para API:** nenhuma chamada de rede na aplicação hoje — ponto de partida favorável. O registro central deste setor é que **cobertura de invariante no cliente não transfere para servidor**: os 10/10 descrevem o motor do navegador. Escopo de API (licença/ativação vs sincronização vs integração com HIS) altera materialmente o que precisa ser verificado e é decisão da Founder.

### Fronteira de rede — guarda preventiva (decisão da Founder: API de licença/ativação)

A Founder definiu o escopo: **licença/ativação, sem dado de paciente**. É o caminho que mantém verdadeira a afirmação do `README.md` de que o dado permanece no dispositivo — hoje a maior vantagem de segurança do projeto.

`tests/network-boundary.test.mjs` foi escrito **antes da API existir**, deliberadamente. A promessa existia só em prosa; nada na suíte reprovava se ela deixasse de valer. A guarda enumera todo módulo embarcado, exige lista declarada para qualquer acesso à rede, verifica que o service worker apenas encaminha requisições que o navegador já emitiu (nunca compõe uma), e proíbe que módulo com acesso à rede referencie campo clínico — ids derivados do `FORM_IDS` real, não de lista escrita à mão. Piso ancorado impede que a varredura encolha em silêncio.

Cinco mutações verificadas, todas detectadas: módulo clínico ganha `fetch`; service worker compõe requisição própria; service worker ganha corpo de requisição; módulo de rede referencia campo clínico; README abandona a promessa.

Limite declarado: protege a **fronteira de saída do cliente**. Não prova nada sobre o comportamento de um servidor.

Pendente de Platform/Core: registrar `INV-PRIV-001` no `docs/clinical/INVARIANT_REGISTRY.md` para que a guarda possa ser mapeada no gate de cobertura. Enquanto o invariante não existir no registry, o arquivo roda como teste independente.

### Harness de interação — entregue, sem dependência

`tests/helpers/mini-dom.mjs` + `tests/helpers/boot-surface.mjs` + `tests/interaction-shift.test.mjs`. Documentação: `docs/testing/INTERACTION_HARNESS.md`. Suíte 316 → **324/324**.

Carrega o `app.html` real, importa o entrypoint real (`app.js`) e interage **por evento** — clique e digitação com bolha —, nunca por chamada interna. Zero dependência: o `package.json` continua sem `dependencies` e sem `devDependencies`.

Princípio de desenho: **API não implementada lança**. Um shim que devolve silêncio faz o teste passar pelo motivo errado, que é a falsa segurança que estas auditorias combatem. O harness foi construído deixando cada falha de boot apontar a API faltante.

Cinco bugs históricos reintroduzidos, cinco detectados: vazamento da justificativa entre pacientes; guarda de sobrescrita removida; segundo dono no botão de reavaliação; `clearForm` sem limpar o documento final; campo de intake oculto.

**Achado do harness, em um comando:** `retireLegacyWorkflowSurface` executa `.workflow-card.remove()`, e com ela sai o único controle que monta um protocolo. O protocolo não tem porta de entrada — HEART, pendências, resultados seriados e todo o progressive disclosure estão inalcançáveis. O encounter foi corrigido (nasce da atividade clínica), o protocolo não. Fixado em teste que **falha quando a porta voltar**, forçando revisão consciente da leitura de alcance do `INV-CLIN-003`.

Estendido com dois percursos que faltavam: **recuperação** (`tests/interaction-recovery.test.mjs` — recarregar com autosave, e abrir rascunho depois da superfície montada, que é o percurso do UX-11) e **falha de armazenamento** (`tests/interaction-storage-failure.test.mjs` — exercita `INV-STOR-001` na borda, onde a auditoria o encontrara perdido). Três mutações adicionais verificadas, todas detectadas.

**Erro do próprio harness, registrado:** o vetor de restauração falhou na primeira escrita. A leitura fácil seria regressão no produto; era infidelidade do harness — a bolha de evento parava na raiz e não alcançava o documento, então a delegação em `document.addEventListener('click', ...)` nunca disparava. Corrigido. A lição vale mais que a correção: vermelho de harness novo é suspeito até a causa ser identificada.

**Decisão da Founder:** zero dependência vale também para ferramenta de teste. Consequência entregue: `docs/testing/MANUAL_GATES.md` enumera G1–G7 — tempo até registro copiável, sobrevivência do documento à colagem, teclado, PWA/offline real, layout na máquina do plantão, mobile e homologação clínica. Explícito e pequeno, em vez de área cinzenta. Nenhum relatório deste projeto deve afirmar cobertura sobre esses itens.

### Aberto e rastreado como issue

- **#39** — respondida por Platform/Core: espaço enumerável, bloco de Quality/Verification, sem mudança de workflow/estado. **Executado.** Pronta para fechar quando a PR empilhada for integrada.
- **#40 — FECHADA.** Platform/Core entregou o step de CI em `0ff8396`; verifiquei por execução e restava um elo: remover o próprio step não era detectado por nada, o que reabria o caso "apagar gate e âncora na mesma mudança". Fechado com `workflow-security.test.mjs :: 'the CI guard for critical safety sentinels cannot be removed silently'`, mapeado como protetor de `INV-GOV-001`. 3 mutações verificadas. `checks.yml` lido, não modificado.
- **github-advanced-security:** do setor; falha por infraestrutura do GitHub (`SessionModelError: 400`), não por código do repositório. Não silenciar. Próximo bloco candidato.

## Restrições

- não refatorar core arquitetural por iniciativa própria;
- não alterar UX/semântica clínica;
- correção localizada é permitida quando provada e sem cruzar owner de Platform/Core;
- toda garantia crítica exige evidência adversarial e segunda leitura.
