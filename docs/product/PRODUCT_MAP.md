# Mapa canônico do produto — Zera PS

## Finalidade

Este documento define o modelo mental que deve ser apresentado à médica. Engines, schemas, protocolos, templates e persistência podem permanecer tecnicamente separados, mas não devem gerar múltiplas portas concorrentes na interface.

> O Zera PS existe para comprimir a distância entre o raciocínio que já aconteceu no atendimento e o registro que precisa existir no prontuário.

## Entidade principal

A entidade de produto é o **Atendimento**.

```text
ATENDIMENTO
├── contexto / apresentação clínica
├── avaliação inicial
│   ├── QP
│   ├── HDA
│   ├── HPP
│   ├── exame físico
│   ├── exames complementares
│   ├── hipóteses
│   └── conduta
├── eventos temporais
│   ├── pendências
│   ├── resultados
│   ├── pareceres
│   └── reavaliações
└── destino / documentos
    ├── alta
    ├── internação
    ├── transferência
    └── outros conforme necessidade
```

## Navegação clínica

A navegação primária deve responder apenas a tarefas reais da médica:

```text
NOVO ATENDIMENTO
ATENDIMENTOS EM ANDAMENTO
RASCUNHOS
```

Enquanto não existir persistência de múltiplos atendimentos ativa na `main`, a implementação pode manter somente Atendimento atual + Rascunhos. O mapa de produto não autoriza inventar um dashboard de pacientes antes da infraestrutura necessária.

`Reavaliação`, `Internação`, `Alta` e `Scores` não são destinos primários independentes por definição de produto:

- **Reavaliação** é evento/etapa temporal do Atendimento;
- **Internação** é decisão/desfecho e documento derivado do Atendimento;
- **Alta** é decisão/desfecho e documento derivado do Atendimento;
- **Scores** são ferramentas contextuais chamadas pelo Atendimento.

## Uma única porta para contexto clínico

A médica não deve escolher entre “roteiro” e “workflow”.

A interface deve apresentar uma única noção clínica, provisoriamente denominada **Contexto clínico**.

Exemplos:

```text
DOR TORÁCICA
CEFALEIA
SÍNDROME DIARREICA
SÍNDROME GRIPAL
DISPNEIA
DOR ABDOMINAL
...
```

Internamente, um contexto pode usar:

- somente um template documental;
- um protocolo declarativo temporal;
- ferramentas clínicas;
- compositor de HDA;
- regras de progressive disclosure;
- nenhuma dessas camadas além do texto livre.

Essa diferença é responsabilidade do software, não uma escolha adicional da médica.

## Superfície do Atendimento

A evolução mantém a estrutura institucional como eixo visual:

```text
# QP: "..."

# SCORES:
- ...                         ← somente quando aplicado/documentado

# HDA:
...

# HPP:
...

# EXAME FÍSICO:
...

# EXAMES COMPLEMENTARES:
...

# HIPÓTESES DIAGNÓSTICAS:
...

# CONDUTA:
...
```

A interface pode usar cards, atalhos e campos condicionais, mas o médico deve conseguir chegar ao texto livre rapidamente.

## HDA — três caminhos, um único documento

A HDA é uma única entidade editável com três formas possíveis de entrada:

1. **modelo rápido** — texto clínico semipronta para editar;
2. **construção assistida** — poucos controles de alto rendimento modificam o texto;
3. **texto livre** — a médica escreve diretamente quando isso for mais rápido.

Todas convergem para o mesmo texto. Nenhuma interface estruturada deve sequestrar a HDA ou sobrescrever edição manual sem confirmação.

## Microferramentas contextuais

Uma microferramenta deve aparecer no ponto em que reduz trabalho.

### Scores

```text
ferramenta disponível
≠ aplicável
≠ calculável
≠ aplicada/documentada
```

Dados já informados devem ser reutilizados. A médica não deve reabrir uma calculadora e redigitar idade, PA, FR ou outro dado que o Atendimento já conhece.

### Laboratório

O organizador laboratorial pertence a `# EXAMES COMPLEMENTARES:`.

Fluxo pretendido:

```text
COLAR LABORATÓRIO BRUTO
→ parser determinístico
→ revisão
→ saída compacta
→ inserir em EXAMES COMPLEMENTARES
```

Contrato-alvo:

```text
- LAB: HB: ... / HT: ... / LEUCO: ... (NEUT: ...%) / PLAQ: ... / PCR: ... / UR: ... / CR: ... / NA: ... / K: ...
```

Somente analitos encontrados podem ser emitidos. O parser não interpreta ausência como normalidade e não cria predominância diferencial sem dado de origem.

### Justificativas

Justificativa de exame/internação reutiliza o que já foi documentado. É microferramenta/documento derivado; não deve competir com HDA como eixo principal da tela.

## Temporalidade

O Atendimento muda com o tempo.

```text
avaliação inicial
→ conduta
→ pendências/resultados
→ reavaliação
→ nova conduta / destino
```

Reavaliar não cria outro paciente nem apaga a admissão.

Contrato documental vigente da reavaliação:

```text
## REAVALIAÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##

# QP: "DOR TORÁCICA"

# SCORES:
- HEART: ...

# HDA (ADMISSÃO): ...

... EM TEMPO (REAVALIAÇÃO): ...

[continuidade das demais seções conforme regra documental]

# CONDUTA:
- ...
```

A QP permanece inline e entre aspas. `EM TEMPO (REAVALIAÇÃO)` faz parte da continuidade narrativa e não deve ser renomeado silenciosamente pela implementação.

## Princípios de interação

### Write once

Dado informado uma vez deve ser reutilizável quando contexto, proveniência e tempo permitirem.

### Free text first-class

Se clicar for mais lento que escrever, escrever precisa continuar disponível.

### Context over forms

Contexto revela ajuda; não abre questionário infinito.

### Progressive disclosure

Mostrar o que ajuda agora. Não esconder dado já preenchido só porque a etapa mudou.

### Operational state ≠ document content

`troponina pendente`, `HEART incompleto` e `reavaliação necessária` podem existir no workspace sem entrar automaticamente no prontuário.

### Confidence cannot increase

O sistema não produz uma afirmação clínica com certeza maior que a informação que a originou.

### Documentation ≠ decision

O Zera organiza, calcula deterministicamente quando autorizado pelos dados e ajuda a documentar. Não converte automaticamente cenário em diagnóstico, prescrição, exame ou destino.

## Critério para manter uma interação

Antes de adicionar um controle estruturado, perguntar:

> Esta interação economiza tempo ou reduz erro comparada à escrita direta?

Se não, ela não merece ocupar a superfície principal.

Métricas de produto prioritárias:

- cliques;
- teclas;
- tempo até texto copiável;
- retrabalho/edição necessária;
- perda de dados;
- afirmações não confirmadas — meta zero.

## Fora do mapa principal

Não transformar o produto, nesta fase, em:

- dashboard administrativo;
- prontuário longitudinal completo;
- catálogo de scores;
- plataforma de guideline;
- sistema de prescrição automática;
- mecanismo de autorização automática de convênio;
- interface que exponha diretamente a organização interna de arquivos/engines.
