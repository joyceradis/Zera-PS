# Definitive Encounter UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the transitional multi-view clinical surface with one coherent Atendimento workspace, add the Resumo do Plantão component, and finish the PWA/UI gate without changing clinical semantics.

**Architecture:** Keep all current clinical/document engines as owners of clinical behavior. `src/product-convergence.js` becomes the UI-composition owner that re-houses existing continuation controls inside Atendimento; a pure `src/productivity.js` handles productivity calculations. Existing DOM ids are preserved so current handlers keep working.

**Tech Stack:** Vanilla HTML/CSS/ES modules, Node.js 24 test runner, localStorage, Service Worker/PWA.

## Global Constraints

- No fabricated clinical information.
- No second state engine for reassessment, admission, discharge, scores or productivity.
- Atendimento is the only primary clinical workspace.
- Rascunhos remains a separate operational surface.
- Productivity data never enters the clinical document engine.
- Core documentation must remain offline-capable.

---

### Task 1: Characterize the definitive shell before implementation

**Files:**
- Modify: `tests/product-convergence.test.mjs`
- Test: `tests/product-convergence.test.mjs`

**Interfaces:**
- Consumes: current `src/product-convergence.js`, `src/app.js`, `app.html`.
- Produces: regression contract for primary navigation, action panels, mobile output switch and productivity mount anchors.

- [ ] **Step 1: Write failing tests** asserting that the convergence module defines primary destinations `Atendimento`, `Rascunhos`, `Resumo do Plantão`, does not route continuation actions through hidden legacy nav clicks, and exposes a productivity mount plus mobile output switch.
- [ ] **Step 2: Run** `node --test tests/product-convergence.test.mjs` and confirm failures are caused by missing definitive-shell behavior.
- [ ] **Step 3: Do not change production code in this task. Commit the red characterization.**

### Task 2: Add pure productivity aggregation

**Files:**
- Create: `src/productivity.js`
- Create: `tests/productivity.test.mjs`

**Interfaces:**
- Produces: `normalizeEncounterRecord(value)`, `summarizeProductivity(records, options)`, `formatPatientsPerHour(summary)`.

- [ ] **Step 1: Write failing tests** for empty input, one valid encounter, multiple encounters in a time range, invalid timestamps, zero-duration windows and rate formatting.
- [ ] **Step 2: Run** `node --test tests/productivity.test.mjs` and confirm RED.
- [ ] **Step 3: Implement minimal pure functions.** Valid encounters require a start timestamp; completed encounters use `finishedAt` when present. Insufficient duration returns `rate: null` rather than a fabricated number.
- [ ] **Step 4: Run the focused test and then `npm run verify`.**
- [ ] **Step 5: Commit.**

### Task 3: Build the definitive Atendimento shell

**Files:**
- Modify: `src/product-convergence.js`
- Modify: `tests/product-convergence.test.mjs`

**Interfaces:**
- Produces: `openEncounterPanel(panelId)`, `createEncounterContinuationWorkspace()`, `createProductivityPanel()`, `createMobileDocumentSwitcher()`.
- Consumes: existing DOM nodes `view-reavaliacao`, `view-internacao`, `view-alta`, `view-scores`, `view-rascunhos` and their existing field ids.

- [ ] **Step 1: Verify Task 1 tests are red.**
- [ ] **Step 2: Replace the hidden-nav continuation mechanism with an in-Attendimento workspace.** Move the existing continuation view contents into named panels under one action workspace; do not clone controls.
- [ ] **Step 3: Keep Reavaliar semantically special:** action starts the temporal reassessment through the existing `reassess-encounter` pathway/event before the reassessment panel becomes visible.
- [ ] **Step 4: Keep Rascunhos as a real primary view.**
- [ ] **Step 5: Add `Resumo do Plantão` as a primary operational panel and mount the approved visual hierarchy: Pacientes/Hora, total, range and Encerrar Plantão.
- [ ] **Step 6: Add narrow-screen Formulário/Texto switch by toggling presentation classes only; never duplicate or serialize the document separately.**
- [ ] **Step 7: Run focused tests then `npm run verify`.**
- [ ] **Step 8: Commit.**

### Task 4: Integrate productivity with local Encounter data safely

**Files:**
- Modify: `src/product-convergence.js`
- Modify: `src/productivity.js`
- Modify: `tests/productivity.test.mjs`
- Modify: `tests/product-convergence.test.mjs`

**Interfaces:**
- Consumes: versioned Encounter v3 localStorage lineage.
- Produces: UI summary with explicit no-data state.

- [ ] **Step 1: Write failing tests** proving that malformed/insufficient local data cannot display a numeric patients/hour value.
- [ ] **Step 2: Implement an adapter that reads only known versioned Encounter data and feeds pure aggregation.** Unknown shapes are ignored.
- [ ] **Step 3: `Encerrar Plantão` freezes/displays the summary UI but does not delete clinical state or draft data.**
- [ ] **Step 4: Run focused tests and `npm run verify`.**
- [ ] **Step 5: Commit.**

### Task 5: Finish visual integration and PWA cache

**Files:**
- Modify: `src/product-convergence.js`
- Modify: `service-worker.js`
- Modify: `tests/integration.test.mjs` or existing PWA integration test file
- Modify: `tests/product-convergence.test.mjs`

**Interfaces:**
- Consumes: new productivity module and definitive shell.
- Produces: responsive styling and offline app-shell coverage.

- [ ] **Step 1: Write failing PWA test** requiring `src/productivity.js` in `APP_SHELL` and a cache version bump.
- [ ] **Step 2: Add definitive UI styles using existing Zera design tokens; do not introduce a competing design system.**
- [ ] **Step 3: Ensure mobile action buttons are touch-safe and the output switch is keyboard accessible.**
- [ ] **Step 4: Update service worker cache.**
- [ ] **Step 5: Run `npm run verify`.**
- [ ] **Step 6: Commit.**

### Task 6: Post-refactor audit and PR readiness

**Files:**
- Modify: `docs/audits/HOUSEKEEPING_AND_RECOVERY_POST_2026-08-12.md`
- Modify: `ROADMAP.md`
- Modify: PR #30 body/status

**Interfaces:**
- Produces: final automated evidence and manual-homologation checklist.

- [ ] **Step 1: Run fresh `npm run verify` through CI and record exact test count/result.**
- [ ] **Step 2: Review PR diff for accidental clinical-copy changes, duplicate state owners and missing PWA files.**
- [ ] **Step 3: Update post-audit and Roadmap: automated gate complete; Founder manual clinical homologation remains the only open UI gate.**
- [ ] **Step 4: Update PR description with exact current evidence and the Resumo do Plantão implementation.**
- [ ] **Step 5: Mark PR ready for review, but do not merge.**
