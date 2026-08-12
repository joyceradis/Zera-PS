import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

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

test('current clinical document fields and safety microfunctions remain present in app html', async () => {
  const html = await read('app.html');
  for (const id of [
    'qp', 'hda', 'fill-negatives', 'fill-normal-exam', 'laboratoriais', 'imagem',
    'hipoteses', 'conduta', 'evolution-output', 'reassess-encounter', 'reassessment-output'
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});
