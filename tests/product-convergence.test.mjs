import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ENCOUNTER_ACTION_VIEWS } from '../src/product-convergence.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('product convergence module remains importable without a browser DOM', () => {
  assert.deepEqual(
    ENCOUNTER_ACTION_VIEWS.map(({ id }) => id),
    ['reavaliacao', 'internacao', 'alta', 'scores']
  );
});

test('product convergence is loaded after the existing application engines', async () => {
  const entry = await read('src/app.js');
  assert.match(entry, /import '\.\/product-convergence\.js';/);
  assert.ok(entry.indexOf("./product-convergence.js") > entry.indexOf("./temporal-ui.js"));
});

test('convergence layer preserves existing views while presenting them as encounter actions', async () => {
  const source = await read('src/product-convergence.js');
  for (const view of ['reavaliacao', 'internacao', 'alta', 'scores']) {
    assert.match(source, new RegExp(`data-view=["']${view}["']|${view}`));
  }
  assert.match(source, /AÇÕES DO ATENDIMENTO/i);
  assert.match(source, /CONTEXTO CLÍNICO/i);
});

test('workflow/protocol infrastructure remains internal and the duplicate workflow card is collapsed from the clinician surface', async () => {
  const source = await read('src/product-convergence.js');
  assert.match(source, /workflow-card/);
  assert.match(source, /workflow-context/);
  assert.match(source, /workflow-scenario/);
  assert.match(source, /hidden\s*=\s*true|setAttribute\(['"]hidden/);
});

test('legacy reassessment launcher is hidden when reassessment is exposed as an encounter action', async () => {
  const source = await read('src/product-convergence.js');
  assert.match(source, /getElementById\(['"]reassess-encounter['"]\)/);
  assert.match(source, /reassess[^\n]*hidden\s*=\s*true|legacyReassess[^\n]*hidden\s*=\s*true/i);
});

test('convergence DOM is built with text nodes instead of injecting protocol or action labels as HTML', async () => {
  const source = await read('src/product-convergence.js');
  assert.doesNotMatch(source, /innerHTML\s*=/);
  assert.match(source, /textContent\s*=/);
});

test('laboratory restore state is isolated from DOM attributes and invalidated after a manual edit', async () => {
  const source = await read('src/product-convergence.js');
  assert.match(source, /new WeakMap\(\)/);
  assert.match(source, /labSnapshots\.delete\(input\)/);
  assert.doesNotMatch(source, /dataset\.rawLaboratory/);
});

test('current clinical document fields and safety microfunctions remain present in app html', async () => {
  const html = await read('app.html');
  for (const id of [
    'qp', 'hda', 'fill-negatives', 'fill-normal-exam', 'laboratoriais', 'imagem',
    'hipoteses', 'conduta', 'evolution-output', 'reassess-encounter', 'reassessment-output'
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});
