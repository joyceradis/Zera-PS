# Definitive Encounter UI Design

## Objective

Finish the Zera PS product-convergence cycle by making **Atendimento** the only clinical workspace presented to the physician, while preserving all validated documentation engines and clinical-safety invariants.

This design is implementation-facing. It does not change clinical rules.

## Product model

Primary navigation:

```text
ATENDIMENTO
RASCUNHOS
RESUMO DO PLANTÃO
```

`Reavaliação`, `Internação`, `Alta` and `Scores` are not primary pages. They are contextual actions/panels within the current Atendimento.

## Definitive interaction shell

The existing evolution form remains the canonical document surface. The definitive shell adds an **Atendimento action workspace** below the core form and re-houses the existing reassessment/admission/discharge/score controls into that workspace without duplicating handlers, state or document engines.

A single action switcher controls which continuation panel is visible:

```text
REAVALIAR | INTERNAÇÃO | ALTA | FERRAMENTAS
```

Opening one continuation panel does not navigate away from the Atendimento, discard typed data or create a second patient context.

`Rascunhos` remains a separate operational surface until multi-Encounter persistence is implemented.

## Context selection

The physician sees one clinical concept: **Contexto clínico**.

Template-only contexts and temporal protocols remain technically distinct internally, but the UI exposes them through one launcher. Protocol/workflow terminology is not shown as a competing choice.

## Output and mobile behavior

The editable final text remains first-class. On wide screens it stays visible beside the form. On narrow screens a compact Formulário/Texto switch is allowed so the physician can move between input and final text without page navigation.

No mobile interaction may hide or destroy filled state.

## Productivity / Resumo do Plantão

Reserve and implement a dedicated `Resumo do Plantão` component, visually compatible with the approved card supplied by the Founder.

Initial contract:

- visible from primary navigation as `Resumo do Plantão`;
- primary metric placeholder/adapter for `Pacientes / Hora`;
- secondary metric for total attended;
- date/range label;
- explicit `Encerrar plantão` action;
- data source adapter isolated from clinical document rendering;
- no productivity number is fabricated when local data are insufficient.

The validated localStorage extraction from the Encounter v3 lineage is treated as infrastructure input. UI composition must not couple productivity semantics to the clinical document engine.

## PWA

The app shell must cache every new definitive-UI module and keep navigation fallback restricted to document navigations. Cache version increments with the structural UI change.

Offline status remains visible. No network-dependent feature may be required for core documentation.

## Safety invariants

The UI refactor must preserve:

- empty ≠ `NEGA`;
- template ≠ confirmed finding;
- score incomplete ≠ zero;
- available ≠ applicable ≠ calculable ≠ applied;
- reassessment preserves admission;
- temporal results remain chronological;
- generated output remains editable;
- no action switch may increase clinical certainty or fabricate content;
- moving controls in the DOM must not create a second owner for state or handlers.

## Architecture

`src/product-convergence.js` becomes the owner of the definitive encounter shell and continuation-panel composition. Existing engines remain owners of their current responsibilities.

A new pure `src/productivity.js` owns productivity aggregation/formatting. DOM mounting remains in the convergence/UI layer, so metrics logic is testable without a browser.

The old internal view nodes may remain as compatibility containers in source during this PR, but after initialization they are not independently navigable clinical destinations. Their controls are re-housed into the single Atendimento action workspace and the hidden legacy nav is not used for continuation actions.

## Testing

TDD gates cover:

1. primary navigation exposes Atendimento, Rascunhos and Resumo do Plantão only;
2. continuation actions do not depend on clicking hidden legacy navigation;
3. reassessment action still starts Encounter v3 reassessment before opening its panel;
4. existing form IDs/handlers remain present;
5. productivity renders no invented rate from insufficient data;
6. productivity aggregation is deterministic for valid Encounter timestamps;
7. mobile Formulário/Texto switch preserves state and does not create another document model;
8. PWA app shell includes all new modules;
9. full `npm run verify` is green before PR is marked ready for clinical homologation.

## Success criterion

The PR is ready for Founder homologation when automated verification is green and the code presents one coherent Atendimento workflow, with the productivity surface reserved/implemented and no clinical microfunction intentionally removed.