# Gates manuais — o que a automação deste projeto não alcança

Decisão registrada: **zero dependência também na ferramenta de teste**. O harness de interação
(`docs/testing/INTERACTION_HARNESS.md`) cobre fiação, estado e ciclo de vida sem navegador. O que
exige navegador real fica sendo gate manual.

Este documento existe para que essa fronteira seja **explícita e pequena**, em vez de virar uma
área cinzenta onde ninguém sabe se algo foi verificado. Nenhum item abaixo tem cobertura
automatizada, e nenhum relatório deste projeto deve afirmar o contrário.

Ordem por risco, não por esforço.

---

## G1 — Tempo real até um registro copiável

**Por que é o primeiro:** é o critério operacional definido pela Founder. Funcionalidade que
economiza texto mas adiciona cliques, escolhas ou navegação **não é ganho**.

**Como verificar:** cronometrar, na máquina real do plantão, do início do atendimento até o texto
estar copiado. Comparar com o tempo de digitar direto no sistema do hospital.

**Reprova se:** o Zera PS for mais lento que digitar à mão em qualquer caso de uso frequente.

---

## G2 — O documento sobrevive à colagem no sistema do hospital

**Por que importa:** todo o valor do produto termina no ato de colar. Nenhum teste deste
repositório observa o destino.

**Como verificar:** gerar evolução, reavaliação, internação e alta; colar cada uma no sistema do
hospital; conferir se acentuação, quebras de linha, maiúsculas e os prefixos `- ` chegam intactos.

**Reprova se:** qualquer seção perder formatação, juntar linhas ou corromper acentuação.

---

## G3 — Operação por teclado

**Por que ainda é manual:** o harness registra foco como estado, não move foco de verdade. E o
recurso ainda não existe — `ROADMAP.md` classifica keyboard-first como lacuna P1.

**Como verificar:** percorrer um atendimento inteiro sem tocar no mouse. Observar se a ordem de
tabulação segue a ordem clínica de raciocínio, e se algum controle fica inalcançável.

**Reprova se:** for necessário usar o mouse para completar um atendimento, ou se a ordem de
tabulação saltar de forma imprevisível.

---

## G4 — PWA instalado e offline de verdade

**Por que é manual:** o service worker não é executado pelo harness. Nenhuma afirmação sobre
offline neste repositório é sustentada por teste.

**Como verificar:** instalar o PWA na máquina-alvo; desligar a rede; abrir, documentar um
atendimento completo, salvar rascunho, fechar e reabrir.

**Reprova se:** a aplicação não abrir offline, perder rascunho, ou servir versão desatualizada
após uma publicação nova.

---

## G5 — Layout e legibilidade na máquina real do plantão

**Por que é manual:** não há caixa, cascata nem media query no harness.

**Como verificar:** abrir na máquina e na resolução reais. Conferir se o documento final e o
formulário convivem sem rolagem horizontal, e se o texto é legível na distância de trabalho.

**Reprova se:** for preciso rolar horizontalmente, ou se o texto do documento final exigir zoom.

---

## G6 — Mobile

**Como verificar:** abrir no celular; alternar entre Formulário e Texto final; documentar um
atendimento completo e copiar.

**Reprova se:** o alternador sumir, os campos ficarem menores que o alvo de toque confortável, ou
copiar não funcionar.

---

## G7 — Homologação clínica

**Por que não é automatizável, em nenhuma hipótese:** adequação clínica do texto produzido é
domínio, não engenharia. Nenhuma cobertura de invariante substitui isso, e este projeto nunca
deve afirmar o contrário.

**Como verificar:** usar em atendimentos reais e julgar se o texto é o que a médica assinaria.

---

## Relação com a cobertura automatizada

```text
motores puros          → suíte de testes
fiação módulo↔documento → harness de interação
tudo acima              → GATE MANUAL, sem automação por decisão
```

Cobertura declarada como "integral" neste projeto significa integral **no escopo mapeado**.
Nenhum item G1–G7 está nesse escopo.
