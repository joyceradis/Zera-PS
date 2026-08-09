# Integral HDA Output Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the Zera PS core value by composing a complete diarrhea-syndrome HDA from explicitly confirmed facts while preserving the current screen and manual clinical writing.

**Architecture:** A pure composer owns text generation and synchronization decisions. The existing application coordinator binds a syndrome-specific progressive panel to that composer and persists its state in the existing snapshot. The document engine remains the sole owner of the complete Markdown evolution.

**Tech Stack:** Static HTML/CSS, ES modules, Node.js built-in test runner, localStorage/PWA.

## Global Constraints

- Never render an unconfirmed negative, diagnosis, conduct, or physical finding.
- Never overwrite clinician-edited HDA text without explicit action.
- Preserve legacy `gea` and `geca` template selections through alias resolution.
- Keep the current visual shell; changes are surgical and desktop-first.
- Add no dependency and no backend.

---

### Task 1: Pure HDA composer

**Files:**
- Create: `src/hda-composer.js`
- Test: `tests/hda-composer.test.mjs`

**Interfaces:**
- Produces: `emptyDiarrheaHdaState()`, `composeDiarrheaHda(state)`, `synchronizeGeneratedHda(input)`.

- [ ] Write failing tests for base text, confirmed present/denied facts, omitted unknowns, chronology and manual-edit preservation.
- [ ] Run `node --test tests/hda-composer.test.mjs` and confirm the missing-module failure.
- [ ] Implement the minimal pure composer.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Template normalization and snapshot state

**Files:**
- Modify: `assets/templates.js`
- Modify: `assets/app.js`
- Modify: `tests/templates.test.mjs`

**Interfaces:**
- Produces: `resolveTemplateId(id)` and snapshot field `hdaComposer`.
- Consumes: composer interfaces from Task 1.

- [ ] Write failing tests proving a single visible diarrhea syndrome and legacy alias resolution.
- [ ] Replace duplicated GEA/GECA entries with `sindrome-diarreica` and aliases.
- [ ] Persist and restore composer state without changing old snapshots.
- [ ] Run the focused template and storage tests.

### Task 3: Progressive HDA controls in the current screen

**Files:**
- Modify: `app.html`
- Modify: `assets/app.js`
- Modify: `assets/styles.css`
- Modify: `tests/integration-static.test.mjs`

**Interfaces:**
- Consumes: `composeDiarrheaHda()` and `synchronizeGeneratedHda()`.
- Produces: DOM controls prefixed `hda-diarrhea-` and explicit manual-update action.

- [ ] Add a failing static integration test for the guided panel and Markdown output label.
- [ ] Add compact keyboard-accessible controls beneath the existing HDA field.
- [ ] Bind controls to automatic safe synchronization and explicit manual update.
- [ ] Preserve reset, draft loading and autosave behavior.
- [ ] Run integration and composer tests.

### Task 4: Product language and PWA inventory

**Files:**
- Modify: `app.html`
- Modify: `index.html`
- Modify: `service-worker.js`
- Modify: `README.md`
- Modify: `ROADMAP.md`

**Interfaces:**
- Consumes: the new module path in the app shell.

- [ ] Replace visible “aplicativo” language with “plataforma”.
- [ ] Add the composer module to the offline shell and increment cache version.
- [ ] Correct documentation so implemented and planned HDA cores are distinguishable.

### Task 5: Final audit

**Files:**
- Create: `docs/audits/clinical-safety/AUDIT_INTEGRAL_HDA_OUTPUT_2026-08-09.md`

- [ ] Run `npm run verify`.
- [ ] Run `git diff --check`.
- [ ] Inspect the complete diff for fabricated facts, destructive migration, stale ids and unrelated redesign.
- [ ] Record pre/post evidence and remaining limitations.
