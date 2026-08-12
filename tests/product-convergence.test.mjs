import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { StorageCorruptionError, StoragePersistenceError } from '../assets/storage-io.js';
import { ENCOUNTER_ACTION_VIEWS, PRIMARY_DESTINATIONS, readProductivityRecords } from '../src/product-convergence.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

function functionBody(source, name, nextName) {
  const start = source.indexOf(`function ${name}`);
  const end = nextName ? source.indexOf(`function ${nextName}`, start + 1) : source.length;
  return source.slice(start, end > start ? end : source.length);
}

test('product convergence module remains importable without a browser DOM', () => {
  assert.deepEqual(ENCOUNTER_ACTION_VIEWS.map(({ id }) => id), ['reavaliacao', 'internacao', 'alta', 'scores']);
});

test('definitive primary navigation exposes only Atendimento, Rascunhos and Resumo do Plantão', () => {
  assert.deepEqual(PRIMARY_DESTINATIONS.map(({ id, label }) => [id, label]), [
    ['evolucao', 'Atendimento'], ['rascunhos', 'Rascunhos'], ['plantao', 'Resumo do Plantão']
  ]);
});

test('productivity reader does not report corrupted encounter state as zero patients', () => {
  const adapter = { getItem: () => '{broken' };
  assert.throws(
    () => readProductivityRecords(adapter),
    (error) => error instanceof StorageCorruptionError && error.key === 'zera-ps:encounter:v3'
  );
});

test('productivity reader does not hide localStorage access failures', () => {
  const adapter = { getItem: () => { throw Object.assign(new Error('blocked'), { name: 'SecurityError' }); } };
  assert.throws(
    () => readProductivityRecords(adapter),
    (error) => error instanceof StoragePersistenceError
      && error.operation === 'read'
      && error.key === 'zera-ps:encounter:v3'
  );
});

test('product convergence is loaded after the existing application engines', async () => {
  const entry = await read('src/app.js');
  assert.match(entry, /import '\.\/product-convergence\.js';/);
  assert.ok(entry.indexOf('./product-convergence.js') > entry.indexOf('./temporal-ui.js'));
});

test('DOM composition waits for the base UI render instead of racing template initialization', async () => {
  const source = await read('src/product-convergence.js');
  assert.match(source, /document\.addEventListener\(['"]DOMContentLoaded['"],\s*initProductConvergence/);
  assert.doesNotMatch(source, /typeof document !== ['"]undefined['"]\)\s*initProductConvergence\(\)/);
});

test('productivity navigation remains compatible with the legacy generic nav listener', async () => {
  const source = await read('src/product-convergence.js');
  assert.match(source, /shiftButton\.dataset\.view\s*=\s*['"]plantao['"]/);
});

test('primary destination changes close the mobile sidebar just like the base navigation', async () => {
  const source = await read('src/product-convergence.js');
  assert.match(source, /getElementById\(['"]sidebar['"]\).*classList\.remove\(['"]open['"]\)/s);
  assert.match(source, /getElementById\(['"]sidebar-overlay['"]\).*classList\.remove\(['"]open['"]\)/s);
});

test('continuation actions are housed inside Atendimento instead of routing through hidden legacy navigation', async () => {
  const source = await read('src/product-convergence.js');
  assert.match(source, /openEncounterPanel/);
  assert.match(source, /encounter-continuation-workspace/);
  assert.doesNotMatch(source, /function selectView\(/);
  assert.doesNotMatch(source, /nav\.click\(\)/);
});

test('starting temporal reassessment no longer navigates to a legacy top-level view', async () => {
  const source = await read('src/temporal-ui.js');
  assert.doesNotMatch(source, /nav-button\[data-view=["']reavaliacao["']\]/);
  assert.match(source, /zera:reassessment-started/);
});

test('convergence layer preserves continuation controls while presenting them as encounter actions', async () => {
  const source = await read('src/product-convergence.js');
  for (const view of ['reavaliacao', 'internacao', 'alta', 'scores']) assert.match(source, new RegExp(`view-${view}|${view}`));
  assert.match(source, /AÇÕES DO ATENDIMENTO/i);
});

test('legacy context selection is hidden and no workflow selector is required on the clinical surface', async () => {
  const source = await read('src/product-convergence.js');
  assert.match(source, /workflow-card/);
  assert.match(source, /workflow-context/);
  assert.match(source, /template-grid/);
  assert.match(source, /hidden\s*=\s*true/);
  assert.doesNotMatch(functionBody(source, 'createZeroFrictionIntake', 'openEncounterPanel'), /getElementById\(['"]workflow-scenario['"]\)/);
  assert.match(source, /Queixa e contexto clínico \(QP\)/);
});

test('legacy reassessment controls are not exposed as a primary navigation destination', async () => {
  const source = await read('src/product-convergence.js');
  assert.match(source, /hideInternalNavigation/);
  assert.match(source, /ENCOUNTER_ACTION_VIEWS/);
  assert.match(source, /nav\.hidden\s*=\s*true/);
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

test('definitive shell reserves a Resumo do Plantão productivity component', async () => {
  const source = await read('src/product-convergence.js');
  for (const id of ['patients-per-hour', 'total-patients', 'zera-productivity-range', 'end-shift-button']) assert.match(source, new RegExp(id));
  assert.match(source, /createProductivityPanel/);
});

test('mobile document switch changes presentation only and keeps the canonical editable output node', async () => {
  const source = await read('src/product-convergence.js');
  const html = await read('app.html');
  const mobile = functionBody(source, 'createMobileDocumentSwitcher', 'formatProductivityRange');
  assert.match(mobile, /data-mobile-surface|mobile-surface/);
  assert.doesNotMatch(mobile, /createElement\(['"]textarea['"]\)|cloneNode\s*\(/);
  assert.equal((html.match(/id=["']evolution-output["']/g) || []).length, 1);
});

test('cycle 2 adds contextual QP triggers, image formatter and free exam justification without removing canonical fields', async () => {
  const source = await read('src/product-convergence.js');
  assert.match(source, /createZeroFrictionIntake/);
  assert.match(source, /conditional-clinical-triggers/);
  assert.match(source, /createImageFormatter/);
  assert.match(source, /Formatar Imagem/);
  assert.match(source, /justification-exam-name/);
});

test('current clinical document fields and safety microfunctions remain present in app html', async () => {
  const html = await read('app.html');
  for (const id of [
    'qp', 'hda', 'fill-negatives', 'fill-normal-exam', 'laboratoriais', 'imagem',
    'hipoteses', 'conduta', 'evolution-output', 'reassess-encounter', 'reassessment-output'
  ]) assert.match(html, new RegExp(`id=["']${id}["']`));
});
