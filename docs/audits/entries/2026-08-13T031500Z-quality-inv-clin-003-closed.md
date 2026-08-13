# Fechamento da lacuna INV-CLIN-003 — exaustão do espaço etapa × contexto

```text
AGENTE/SETOR:      Quality / Verification Engineering (Claude)
BRANCH/PR/BASE/SHA: audit/inv-clin-003-stage-context-gate / base chore/housekeeping-product-convergence @ 087a520
ESCOPO:            provar ou refutar que disclosure/contexto produz hipótese ou conduta
SEVERIDADE:        lacuna de cobertura (não era bug)
STATUS:            IN REVIEW
FOUNDER:           não necessária
```

## Origem — decisão prévia registrada, não presumida

A lacuna do `INV-CLIN-003` foi deixada aberta na PR #38 porque a pergunta anterior ao teste não tinha resposta: *o espaço etapa × contexto é enumerável por teste, ou fechar exige mudança de arquitetura?* A resposta definia o setor dono do bloco, e por isso não foi escolhida unilateralmente.

Platform/Core respondeu na [issue #39](https://github.com/joyceradis/Zera-PS/issues/39): o espaço **é** enumerável para a arquitetura atual, não é necessário mudar workflow/estado, e o bloco pertence a Quality/Verification. Estratégia recomendada: teste table-driven sobre todos os stages declarados mais variações contextuais/progressive-disclosure, exercitando a fronteira até a projeção documental; enumerar transições/estados declarativos finitos, nunca valores clínicos infinitos; parar no RED e fazer handoff se qualquer combinação produzisse hipótese/conduta sem input explícito.

Nenhuma combinação produziu. Não houve handoff.

## Achado

A propriedade do `INV-CLIN-003` **se sustenta**. Contexto e progressive disclosure alteram somente visibilidade e disponibilidade.

A razão é estrutural, não acidental:

- `buildRenderPlan` devolve, por campo, exclusivamente `{ id, visible }` — não há chave capaz de transportar valor;
- `getRenderableFields` filtra por `isProtocolField`, então `qp`, `hda` e `conduta` (declarados `source: 'evolution_form'`) nunca são renderizados nem escritos pela camada de protocolo;
- `defaultContext` aplica o mesmo filtro, e por isso o contexto default sequer possui as chaves `hipoteses`/`conduta`;
- `renderEvolution` lê hipótese e conduta apenas de `raw.hipoteses`/`raw.conduta`, por allow-list.

Era cobertura ausente, não defeito. **Nenhuma linha de `src/`, `assets/`, `protocols/` ou `app.html` foi alterada.** Nenhuma mudança de semântica clínica ou de UX.

## Evidência

`tests/context-never-diagnoses.test.mjs` — 11 vetores, enumeração exaustiva.

O espaço não é escrito à mão: etapas vêm de `WORKFLOW_STAGES`, protocolos são carregados de `protocols/`, os campos de contexto são coletados das próprias regras declarativas (`visibleWhen`, `applicableWhen`, `availableWhen`, `pendingWhen`) e seus valores possíveis saem das `options`/`type` declarados. Hoje isso dá:

```text
campos de disclosure: ecgStatus (4) × suspectedAcs (2) × troponinStatus (4) = 32 contextos
32 contextos × 5 etapas = 160 combinações, todas exercidas até a projeção documental
```

Etapa nova, protocolo novo, template novo ou regra de disclosure nova entram no espaço automaticamente.

### Teste de mutação — 8 mutações antes de propor

| Mutação | Resultado | Leitura |
| --- | --- | --- |
| camada de protocolo deixa de filtrar campos do formulário | detectada | correta |
| `defaultContext` passa a carregar `qp`/`hda`/`conduta` | detectada | correta |
| plano de renderização passa a carregar `value` | detectada | correta |
| template passa a declarar `conduta` | detectada | correta |
| `updateEncounterContext` escreve conduta no contexto | detectada | correta |
| documento emite `# CONDUTA:` incondicionalmente | detectada (4 vetores) | correta |
| enumeração colapsa `select` ao default (32 → 2 contextos) | detectada | correta |
| `suspectedAcs` removido de todos os sítios de regra | detectada | correta |

Duas mutações adicionais **não** foram detectadas, e a análise mostrou que a não detecção estava correta: remover *uma* regra que referencia `ecgStatus`, e remover o coletor de `visibleWhen` de seção. Nos dois casos o campo continua referenciado por outros sítios, o conjunto enumerado é idêntico e não houve encolhimento real. Registro aqui porque minha leitura inicial foi de que a primeira revelava fraqueza — estava errada, e a correção veio de verificar o espaço resultante em vez de confiar no resultado do teste.

### Fraqueza corrigida durante a construção

A guarda de exaustão inicial era **auto-referente**: comparava `contexts.length >= 2 ** fieldIds.length`. Como `fieldIds` encolhe junto com o espaço, remover regras faria o teste continuar "exaustivo" sobre um universo menor — passando pelo motivo errado. É o mesmo defeito de desenho que a segunda leitura apontou no gate original (`INV-GOV-001` circular).

Corrigido com `DISCLOSURE_FLOOR`: piso ancorado por protocolo, declarando campos mínimos e contagem mínima de contextos. Encolher o espaço passa a exigir edição consciente desse bloco — que é exatamente a segunda leitura que a política do registry exige. As mutações 7 e 8 da tabela acima só passam a ser detectadas por causa dele.

### Enforcement do mapeamento

| Mutação no gate | Resultado |
| --- | --- |
| renomear um protetor mapeado | gate reprova |
| apagar o arquivo de teste inteiro | gate reprova |

## Ação

`INV-CLIN-003` reclassificado `PARTIAL` → `FULL` em `tests/invariant-coverage.test.mjs`, com 11 protetores novos mapeados, incluindo as três guardas da própria exaustão e a contraprova.

**Cobertura declarada: 10 integral / 0 parcial de 10** (era 9/1).

```text
npm run verify: 255 testes, 255 aprovados, 0 falhas
```

Pré-auditoria: 244/244, 9 integral / 1 parcial. Pós-auditoria: 255/255, 10 integral / 0 parcial. Nenhum teste pré-existente foi alterado, enfraquecido ou removido.

## O que 10/10 não significa

Cobertura integral declarada significa que cada invariante do registry tem protetor que reprova quando a propriedade é violada. **Não** significa homologação clínica, nem teste de interação real, nem PWA/offline real. O gate de homologação do próprio registry permanece aberto e é da Founder.

Especificamente para este invariante: a exaustão é sobre o espaço **declarativo** — etapas, protocolos, regras de disclosure e templates declarados. Ela não cobre, e não pretende cobrir, comportamento de DOM real nem combinações clinicamente possíveis versus impossíveis. Se um protocolo futuro introduzir disclosure que dependa de algo fora das regras declarativas, a coleta não o enxerga; o piso ancorado protege contra encolhimento dos protocolos conhecidos, não contra uma forma nova de declarar disclosure.

## Bloco adjacente — último elo do INV-GOV-001 (issue #40)

Platform/Core endereçou a issue #40 em `0ff8396`, com o step de CI `Guard critical safety sentinels`, que reprova o job se o registry, o gate ou a âncora sumirem. Verifiquei o resultado por execução, não por leitura:

| Cenário | Detectado por |
| --- | --- |
| `integration-static.test.mjs` esvaziado | suíte — 2 falhas (o gate lê os protetores declarados nele) |
| `invariant-coverage.test.mjs` esvaziado | suíte — 1 falha (âncora externa lê o gate de volta) |
| um dos dois apagado | suíte, pelo outro; e também pelo step de CI |
| **os dois apagados na mesma mudança** | **somente o step de CI** — nenhum dos dois testes chega a rodar |
| **step de CI removido** | **nada** |

O último cenário reabria o penúltimo: sem o step, apagar os dois arquivos de uma vez voltava a passar em silêncio. Fechado com `workflow-security.test.mjs :: 'the CI guard for critical safety sentinels cannot be removed silently'`, mapeado como protetor de `INV-GOV-001`.

Três mutações verificadas, todas detectadas: remover o step; rebaixá-lo a aviso (tirar `exit 1`); tirar um arquivo da lista protegida.

Owner tocado: `tests/workflow-security.test.mjs` apenas. `.github/workflows/checks.yml` foi **lido, não modificado** — o arquivo de CI é de Platform/Core; o que este setor acrescenta é a asserção de que ele continua existindo e reprovando.

## Owner e fronteira

Owner tocado: `tests/` apenas. `docs/clinical/INVARIANT_REGISTRY.md` continua **lido, não modificado** — pertence ao owner `documentação canônica` de Platform/Core e está `ACTIVE`.

Este bloco foi construído empilhado sobre a PR #38, para evitar que duas branches editassem `tests/invariant-coverage.test.mjs` em paralelo e recriassem a colisão de integração registrada em `AUD-2026-08-13-006`. Durante a construção, Platform/Core integrou a #38 na linha canônica (`3a23402`) e removeu a branch base. A branch foi então rebaseada sobre `chore/housekeeping-product-convergence @ 087a520`, sem conflito, e a contagem 10/0 permanece válida — agora diretamente sobre a canônica, porque `INV-DOC-001` já chegou a `FULL` nela.
