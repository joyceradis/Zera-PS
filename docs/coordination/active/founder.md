# Founder — Active Work

## Setor
Joyce — Founder / Produto / Domínio Clínico.

## Estado atual

- **Linha:** PR #30 (`chore/housekeeping-product-convergence`).
- **Owner:** superfície clínica, produto e homologação manual.
- **Objetivo:** homologação clínica contínua do preview publicado; achados são capturados incrementalmente, não aguardam um relatório final único.
- **Status:** ACTIVE.
- **Merge da PR #30:** BLOQUEADO até homologação explícita da Founder.

## O que pertence à Founder

- fluxo real do pronto-socorro;
- onde a médica perde tempo;
- prioridade de produto;
- UX clínica;
- linguagem documental;
- relevância clínica;
- microfunções que realmente ajudam no plantão;
- comportamento observado em teste manual;
- homologação;
- decisão final quando houver trade-off de domínio.

## Contrato de comunicação

A Founder **não precisa traduzir um problema para linguagem de engenharia**. Relatos como “fiz X, aconteceu Y e eu esperava Z” são evidência válida de produto e devem ser recebidos como dado bruto.

A tradução é responsabilidade dos setores técnicos:

```text
OBSERVAÇÃO DA FOUNDER
→ Quality reproduz/caracteriza/testa
→ Platform/Core localiza causalidade e owner arquitetural
→ correção/reconciliação
→ Quality tenta quebrar novamente quando crítico
→ Founder homologa comportamento clínico
```

A Founder não:

- transporta relatório entre agentes;
- coordena branch;
- arbitra lease;
- decide estratégia de merge;
- precisa explicar para um agente o que o outro registrou no GitHub;
- valida sozinha garantias técnicas.

Se um agente novo chegar, deve reconstruir o estado diretamente da documentação canônica e das lanes de coordenação, não pedir à Founder que reconte a história.

## Achados de homologação já capturados — NÃO pedir novamente à Founder

Estes pontos vieram do uso real do preview e já constituem evidência de produto/domínio:

1. **Lacunas `[CHAVES]` / HDA rígida:** preencher placeholders explícitos e textos estruturados em excesso está cansativo e devolve digitação/carga cognitiva para a médica. A direção aprovada é ficha coringa/contexto livre com progressive disclosure, sem fabricar negativas clínicas.
2. **Tempo/fricção operacional:** a experiência precisa ser avaliada pelo tempo real até um registro copiável; funcionalidade que economiza texto mas adiciona cliques, escolhas ou preenchimento não é ganho. Keyboard-first e redução de caminhos concorrentes são P1.
3. **Exame físico — hidratação:** remover `HIPOHIDRATADO`. Manter `HIDRATADO` e usar graduação médica em cruzes como opções independentes: `DESIDRATADO +/4+`, `DESIDRATADO ++/4+`, `DESIDRATADO +++/4+`, `DESIDRATADO ++++/4+`.
4. **Laboratório — diferencial leucocitário:** no resumo compacto, frações leucocitárias só entram quando acima do valor de referência relativo e em abreviação/letra + percentual, por exemplo `LEUCO 23.400 (S 74%)`. Referências de domínio fornecidas: S 45–70%; B 0–5%; L 20–45%; M 2–10%; E 1–5%; Bas 0–1%.
5. **Conduta/documento:** texto digitado pode permanecer natural na UI, mas saída final deve normalizar para UPPERCASE e prefixar linhas da conduta com `- `.
6. **Imagem/laudo:** microfunção `Formatar Imagem` deve gerar UPPERCASE e condensar o laudo colado em parágrafo único, removendo quebras de linha.
7. **Justificativa de alto custo:** evitar dropdowns engessados; campo livre para nome do exame + geração de justificativa contínua em UPPERCASE, usando QP/HDA, exame físico e hipóteses, com botão evidente de copiar.
8. **Produtividade:** resumo do plantão deve reconhecer snapshots/rascunhos correntes do Atendimento e contabilizar imediatamente, sem falso `ATENDIDOS: 0`/`SÉRIE INSUFICIENTE` quando já há atividade válida na sessão.
9. **Poluição visual:** aviso legal não deve competir com a tarefa clínica; mover/reduzir para rodapé ou apresentação discreta.
10. **Princípio transversal:** o teste da Founder é contínuo no preview publicado. Não existe uma segunda bateria escondida que ela ainda precise cumprir. O único gate final de domínio é o aceite explícito para piloto após as correções decorrentes.

Os setores técnicos devem verificar no código/PR quais itens já estão implementados, quais estão apenas registrados e quais precisam de nova rodada. Não marcar como resolvido apenas porque consta nesta lista.

## Gate clínico vigente

A PR #30 permanece sem merge em `main`. A Founder continua homologando a superfície clínica no preview publicado. Nenhuma decisão de UX/semântica clínica pode ser inferida de teste automatizado ou implementada silenciosamente. Achados acima são decisões/observações já fornecidas e não devem ser solicitados novamente.
