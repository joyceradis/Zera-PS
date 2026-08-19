# Harness de interação — o que cobre e o que não cobre

## Por que existe

Todos os defeitos que a Founder encontrou operando o produto são de **fiação entre módulo e
documento**, não de lógica de motor:

| Relato | Classe |
| --- | --- |
| "apertei o botão errado e não tem como voltar" | escritor sobrescreve conteúdo sem consultar seu estado |
| "fiquei perdida, onde clicar e por quê" | controle sem estado inicial ou sem alcance |
| dados do paciente anterior reaparecendo | fronteira entre atendimentos incompleta |
| `ATENDIDOS: 0` com atendimento em curso | motor correto sem produtor do dado |

A suíte cobria motores puros com rigor e **não enxergava nenhum deles**. O padrão está registrado
na auditoria de superfície: o motor está correto e coberto; o ponto de chamada que o liga ao
usuário, não.

Este harness fecha essa lacuna sem introduzir dependência.

## Como funciona

```text
app.html real
   → mini-dom.mjs      (árvore, seletores, eventos, propriedades)
   → boot-surface.mjs  (globais mínimos + import do entrypoint real app.js)
   → DOMContentLoaded
   → interação por evento: clique e digitação com bolha
```

Nada é chamado por dentro. `app.click('generate-evolution')` despacha um evento de clique real
que sobe a árvore até quem o escuta — do mesmo jeito que o navegador faria.

## Princípio de desenho

> **API não implementada lança. Nunca vira no-op silencioso.**

Um shim que devolve `null` de um `closest()` não implementado faz o teste passar pelo motivo
errado — a exata falsa segurança que estas auditorias vêm combatendo. Aqui, código que use algo
fora do subconjunto suportado quebra alto, e o harness precisa ser estendido conscientemente.

Foi assim que ele foi construído: cada falha de boot apontou a API faltante.

## Um boot por arquivo de teste

Os módulos guardam estado no escopo do módulo, e o registro de módulos do Node é por processo.
`node --test` isola arquivos em processos distintos, então **um boot por arquivo**.

Isso não é contorno: é fidelidade. Um plantão real também é um carregamento só, com pacientes em
sequência sobre o mesmo estado. Os cenários são escritos nessa ordem, deliberadamente — e foi
exatamente essa ordem que permitiu exercitar a troca de paciente de ponta a ponta.

## O que o harness prova

Verificado por mutação: cada bug histórico foi reintroduzido e o harness o detectou.

| Bug reintroduzido | Detectado por |
| --- | --- |
| justificativa do paciente anterior sobrevive ao limpar | troca de paciente |
| guarda de sobrescrita removida | edição manual preservada |
| segundo dono no botão de reavaliação | contagem de donos por controle |
| `clearForm` deixa de limpar o documento final | troca de paciente |
| campo de intake oculto | alcance da superfície |

## O que o harness **não** prova

Explicitamente fora de alcance, e nenhum teste escrito aqui autoriza afirmação sobre:

- **layout e CSS** — não há caixa, cascata nem media query;
- **foco real e ordem de tabulação** — `focus()` registra o nó, não move foco de verdade;
- **viewport e mobile** — não há dimensão;
- **service worker, PWA e offline real** — o service worker não é executado;
- **acessibilidade visual** — contraste, leitura por leitor de tela, tamanho de alvo;
- **tempo real até um registro copiável** — o critério operacional da Founder.

Esses gates continuam abertos e exigem navegador real. Este harness **não os substitui**; ele
retira do caminho a classe de defeito que não precisava de navegador para ser pega.

Por decisão registrada da Founder, a restrição de zero dependência vale também para ferramenta
de teste. O que exige navegador fica como gate manual, enumerado em
[`MANUAL_GATES.md`](MANUAL_GATES.md) — explícito e pequeno, em vez de área cinzenta.

## Fidelidade: um erro do próprio harness, e como apareceu

Ao escrever o vetor de restauração de rascunho, ele falhou. A leitura fácil seria "regressão no
produto". Era falha do harness: a bolha de evento parava na raiz da árvore e **não alcançava o
documento**, então `document.addEventListener('click', ...)` — delegação usada por
`intake-restore-bridge.js` — nunca disparava.

Registrado aqui porque a lição vale mais que a correção: **vermelho de harness novo é suspeito
até que a causa seja identificada.** Um harness infiel produz alarme falso e queima a confiança
de quem lê o relatório.

## Como estender

1. escreva o cenário como interação — evento, nunca chamada interna;
2. se o boot falhar, a mensagem nomeia a API faltante: implemente-a em `mini-dom.mjs`;
3. nunca transforme um `unsupported()` em retorno silencioso para "fazer passar";
4. todo vetor novo deve ter uma mutação que o faça falhar, verificada antes de propor.
