# Founder — Active Work

## Setor
Joyce — Founder / Produto / Domínio Clínico.

## Estado atual

- **Linha:** PR #30 (`chore/housekeeping-product-convergence`).
- **Owner:** superfície clínica, produto e homologação manual.
- **Status ao encerrar esta sessão:** PAUSA DE HOMOLOGAÇÃO, sem aceite final para piloto.
- **Merge da PR #30:** BLOQUEADO até homologação explícita da Founder.
- **Checkpoint técnico de retomada:** `docs/audits/entries/2026-08-13T053000Z-platform-session-handoff.md`.

## Correção importante sobre o ambiente testado

O screenshot final enviado pela Founder mostra URL `joyceradis.github.io/Zera-PS/...`, portanto a interface aberta naquele momento era a publicação GitHub Pages da linha publicada/main, **não** o preview efêmero da PR #30.

Isso muda o escopo da evidência, não apaga o que foi observado:

- as observações de UX/fricção continuam válidas como evidência de produto;
- achados já reproduzidos por Quality/Core e convertidos em issues/testes continuam válidos;
- porém o uso desse link **não equivale a homologação do HEAD atual da PR #30**;
- quando a Founder retomar, o time deve fornecer/identificar um preview da PR #30 pelo HEAD exato e só então usar esse ciclo como gate final.

Não pedir à Founder que repita os achados já registrados apenas por causa dessa correção de escopo.

## O que pertence à Founder

- fluxo real do pronto-socorro;
- onde a médica perde tempo;
- prioridade de produto;
- UX clínica;
- linguagem documental;
- relevância clínica;
- microfunções úteis;
- comportamento observado em teste manual;
- homologação;
- decisão final em trade-off de domínio.

## O que NÃO pertence à Founder

A Founder não:

- transporta relatório entre agentes;
- coordena branch;
- arbitra lease;
- decide estratégia técnica de merge;
- precisa explicar a um agente o que outro já registrou no GitHub;
- valida sozinha garantias técnicas;
- precisa produzir um relatório final de homologação.

Relato natural `fiz X → ocorreu Y → eu esperava Z` é evidência suficiente de produto. Quality e Platform/Core fazem a tradução técnica.

## Achados de domínio já fornecidos — NÃO pedir novamente

1. Lacunas `[CHAVES]` / HDA rígida aumentam carga cognitiva e digitação. Direção: texto/contexto livre + progressive disclosure, sem fabricar negativas.
2. Tempo/fricção operacional é critério de produto. Feature que economiza texto mas aumenta cliques/dúvida não é ganho. Keyboard-first é prioridade.
3. Hidratação: remover `HIPOHIDRATADO`; manter `HIDRATADO` e `DESIDRATADO +/4+` a `++++/4+`.
4. Diferencial leucocitário compacto: só exibir frações relativas explicitamente informadas e acima da referência; formato abreviado + percentual.
5. Troponina: assay-dependent. Interpretação exige valor + unidade + referência do kit/laboratório. `0,0019` no Meridional é referência local de troponina ultrassensível, não default universal.
6. Documento final em UPPERCASE; conduta com prefixo `- ` por linha.
7. `Formatar Imagem`: UPPERCASE + parágrafo único.
8. Justificativa de alto custo: nome do exame livre; texto contextual; saída editável/copiar; não fabricar urgência/gravidade.
9. Produtividade deve reconhecer atendimento real sem falso `ATENDIDOS: 0`.
10. Aviso legal não deve competir visualmente com a tarefa clínica.
11. Homologação é contínua e incremental; o único ato final da Founder é aprovar ou não a versão candidata a piloto.

## Decisões de domínio ainda abertas

- **#46:** relação documental QP × HDA no intake livre.
- **#48:** orientação inicial, hierarquia/estado da superfície e fricção cognitiva.
- eventual escolha de como expor ferramentas protocol-bound sem transformar Workflow/Roteiro em segunda porta de entrada.
- aceite final da V1 candidata a piloto.

## Gate clínico de retomada

Quando a Founder quiser retomar:

1. o time técnico deve apresentar um **preview atual da PR #30 identificado por HEAD**;
2. a Founder usa o produto normalmente como médica, sem checklist técnico obrigatório;
3. Quality captura/reproduz os achados;
4. Core corrige/reconcilia o que for estrutural;
5. só no fim a Founder decide se aquela versão está aprovada para piloto.
