# Founder — Active Work

## Setor
Joyce — Founder / Produto / Domínio Clínico.

## Estado atual

- **Linha:** PR #30 (`chore/housekeeping-product-convergence`).
- **Owner:** superfície clínica, produto e homologação manual.
- **Objetivo:** concluir homologação clínica/relatório de domínio sem decidir Git, CI, leases ou arquitetura.
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

## Gate clínico vigente

A PR #30 permanece sem merge em `main`. A Founder continua homologando a superfície clínica. Nenhuma decisão de UX/semântica clínica pode ser inferida de teste automatizado ou implementada silenciosamente.
