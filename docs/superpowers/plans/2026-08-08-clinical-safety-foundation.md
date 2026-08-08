# Clinical Safety Foundation Implementation Plan

> For agentic workers: implement task-by-task with review gates.

**Goal:** refactor the Zera PS MVP so clinical absence is never converted into a clinical assertion, scores require complete inputs, and documentation is generated from explicit state.

**Architecture:** split clinical state, document generation, scores, storage, UI, declarative data and app coordination. Preserve the static offline-first architecture and avoid introducing backend complexity.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Node.js built-in test runner, GitHub Actions, Service Worker.

## Global Constraints

- `main` remains untouched until review and regression.
- Every clinical behavior change requires a regression test.
- Empty input cannot become `NEGA`, normal, absent or a score of zero.
- Templates are prompts/structures, not preconfirmed clinical facts.
- Generated text remains editable and requires medical review.

### Task 1 — Clinical state
- Create explicit field states, sources, confirmation and timestamps.
- Test empty, denied, reported, observed and template-confirmed states.

### Task 2 — Score state
- Scores start `incomplete` with `score: null`.
- Require explicit true/false answers for all binary variables.
- Glasgow starts incomplete and requires all three components.

### Task 3 — Document engine
- Generate output only from confirmed clinical fields and non-empty raw sections.
- Omit unconfirmed HPP and exam fields.
- Keep reavaliação, internação and alta as separate deterministic renderers.

### Task 4 — Storage v2
- Introduce versioned storage keys.
- Migrate v1 raw data without inventing clinical confirmation.

### Task 5 — Modular UI/app
- Make `data.js` declarative.
- Move DOM behavior to `ui.js`.
- Keep coordination in `app.js`.
- Preserve quick choices, drafts, PWA and copy workflows.

### Task 6 — Templates
- Remove prewritten clinical negatives.
- Keep syndrome scaffolding and clinical tool metadata only.

### Task 7 — PWA
- Cache new modules.
- Restrict offline document fallback to navigation requests.

### Task 8 — Documentation
- Rewrite README around actual architecture and safety invariants.
- Add gated ROADMAP and architecture document.

### Task 9 — Verification
- Run automated tests in CI.
- Review diff against `main`.
- Perform browser regression before merge.
