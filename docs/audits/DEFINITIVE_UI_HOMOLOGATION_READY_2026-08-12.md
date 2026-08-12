# Zera PS — UI definitiva pronta para homologação clínica

Data: 2026-08-12
PR: #30 — `chore/housekeeping-product-convergence`

## Escopo deste marco

Este documento registra o fechamento automatizado da camada de UX/PWA e da composição estrutural da interface. Não substitui a homologação clínica manual da Founder.

## Superfície implementada

Navegação primária:

```text
ATENDIMENTO
RASCUNHOS
RESUMO DO PLANTÃO
```

Dentro do Atendimento:

```text
CONTEXTO CLÍNICO
→ documentação principal
→ AÇÕES DO ATENDIMENTO
   ├── Reavaliar atendimento
   ├── Internação
   ├── Alta
   └── Ferramentas
```

Reavaliação, Internação, Alta e Scores/Ferramentas não dependem mais de navegação top-level oculta para compor a experiência clínica. Os controles existentes são realocados no DOM, sem clone, preservando IDs, handlers e engines já caracterizados.

A reavaliação temporal passa a emitir `zera:reassessment-started`; a camada de produto abre o painel correspondente no mesmo Atendimento sem navegar para a antiga view.

## Mobile

Foi recuperado o princípio histórico `Formulário ↔ Texto`, agora como alternância estritamente visual. O `evolution-output` continua sendo o único texto final editável; não existe clone ou segundo estado documental.

## Resumo do Plantão

Foi criada uma superfície operacional própria com o contrato visual aprovado:

- `Pacientes / Hora`;
- `Atendidos (total)`;
- faixa temporal;
- `Encerrar Plantão`.

A lógica de produtividade está isolada em `src/productivity.js`, fora do renderer clínico. Entradas inválidas ou série temporal insuficiente produzem `--`, não uma taxa estimada ou fabricada.

Nesta fase, a UI lê a linhagem versionada `zera-ps:encounter:v3`, mas somente uma coleção explícita reconhecida pode alimentar produtividade agregada. O objeto de Encounter ativo isolado não é reinterpretado como histórico de plantão. A expansão diária/mensal fica acoplada ao futuro repositório local de múltiplos Encounters, não ao documento clínico.

`Encerrar Plantão` atualiza/congela a apresentação do resumo e não apaga prontuário, rascunho ou estado clínico.

## PWA

O cache foi versionado para `zera-ps-v11` e o APP_SHELL inclui `src/productivity.js` junto aos módulos de convergência. O fallback offline continua restrito a navegações.

## Ciclos TDD relevantes

Foram observados ciclos RED → GREEN para:

1. shell definitivo e destinos primários;
2. produtividade determinística e no-data seguro;
3. reavaliação sem navegação legacy;
4. módulo de produtividade no APP_SHELL / cache v11;
5. compatibilidade do novo botão `Resumo do Plantão` com o listener genérico legado.

Um teste intermediário de mobile falhou por exigir referência literal ao id `evolution-output` dentro do compositor. A causa foi classificada como overfitting do teste: a implementação preserva o output por não criar/clonar textarea. O contrato foi corrigido para verificar a invariável real — um único `evolution-output` canônico e nenhum clone/novo textarea.

## Gate automatizado de referência

Primeiro run verde após UI + produtividade + PWA:

```text
GitHub Actions run 31557615317
npm run verify
191 tests
191 pass
0 fail
```

Após esse marco ainda houve uma regressão adicional específica para compatibilidade de navegação do `Resumo do Plantão`; o head final deve ser revalidado novamente antes de a PR sair de draft.

## Gate clínico manual

A única validação de produto ainda exigida para esta PR é a homologação manual da Founder em navegador real, incluindo:

```text
DESKTOP
- Atendimento principal
- troca de Contexto clínico
- HDA manual
- organizador/restauração de laboratório
- Reavaliar
- Internação
- Alta
- Ferramentas
- Rascunhos
- Resumo do Plantão

MOBILE
- Formulário ↔ Texto final
- ações do Atendimento
- nenhuma perda de estado ao alternar superfície

PWA
- instalação/abertura
- atualização de cache para v11
- reload/autosave
- funcionamento offline do núcleo
```

A PR não deve ser mesclada antes desta homologação.