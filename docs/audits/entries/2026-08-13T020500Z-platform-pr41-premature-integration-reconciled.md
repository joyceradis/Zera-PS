# PR #41 integrada antes da conclusão da segunda leitura — reconciliação de cobertura

```text
AGENTE/SETOR:       Platform / Core Engineering (ChatGPT)
LINHA:              chore/housekeeping-product-convergence / PR #30
INCIDENTE:          PR #41 / merge 398b1a63
SEVERIDADE:         governança / garantia; sem alteração de runtime clínico
STATUS:             RECONCILED na linha canônica
FOUNDER:            não necessária
```

## Sequência

1. Quality / Verification abriu a PR #41 propondo promover `INV-CLIN-003` de `PARTIAL` para `FULL` e acrescentar proteção para `INV-GOV-001`.
2. Platform/Core iniciou segunda leitura e publicou bloqueio explícito de integração ao identificar que os testes de `INV-CLIN-003` não atravessavam a composição real contexto → coordenador → estado/formulário → documento.
3. Antes da conclusão desse contraditório, a PR #41 foi integrada à branch canônica por merge `398b1a63e5048b153f8050fed0ec485aef92b108`.
4. A integração levou à canônica uma declaração de cobertura `10 integral / 0 parcial` que não era sustentada pela segunda leitura.
5. Platform/Core reclassificou imediatamente `INV-CLIN-003` de volta para `PARTIAL`, preservando os testes úteis da PR #41, mas nomeando a lacuna de composição. Correção: `7a947f44dd23d015011e9f0b6c9b7650e0299b79`.
6. GitHub Actions `checks`, run `31659528779`, terminou `success` após a reconciliação.

## Achado técnico

Os vetores de Quality enumeram `protocol × stage × context` e calculam `buildRenderPlan(...)` / `getVisibleSections(...)`, porém a projeção documental testada é independente:

```js
renderEvolution(emptyForm(), {})
```

`context`, `stage`, `plan` e o encounter não atravessam a chamada que gera o documento. Portanto os testes caracterizam bem as duas extremidades, mas não provam a ponte intermediária.

A classificação correta permanece:

```text
INV-CLIN-003 = PARTIAL
```

até existir um protetor que atravesse a composição real já usada pela aplicação ou, se essa fronteira não existir de forma testável, até Platform/Core explicitá-la sem mudar semântica clínica.

## Ação de governança

- regra canônica adicionada a `AGENT_COORDINATION.md`: invariant transversal só recebe cobertura integral quando ao menos um protetor atravessa a composição real entre as camadas;
- `ACTIVE_WORK.md` foi congelado como histórico; novas PRs não devem escrever leases nele;
- lanes por setor permanecem a superfície operacional;
- merge de PR filha com revisão bloqueante pendente deve ser tratado como incidente de processo e reconciliado antes de qualquer afirmação de maturidade.

## O que foi preservado da PR #41

Os testes locais de enumeração, pisos de disclosure e contraprovas continuam patrimônio de Quality. Eles aumentam cobertura e detectam regressões importantes; apenas não são suficientes, sozinhos, para sustentar `FULL` de `INV-CLIN-003`.

O protetor adicional de CI para `INV-GOV-001` também foi mantido, sujeito à revisão contínua do owner Platform/Core.

## Impacto clínico

Nenhuma mudança em `assets/`, `src/`, `protocols/` ou `app.html` foi necessária para reconciliar o incidente. Não houve alteração silenciosa da UX ou da semântica clínica em homologação.
