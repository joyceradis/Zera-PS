import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('product shell retires the legacy workflow surface without deleting the temporal engine', async () => {
  const source = await read('src/product-coherence.js');
  assert.match(source, /workflow-card/);
  assert.match(source, /\.remove\(\)/);
  assert.match(source, /workflow-stage/);
  assert.match(source, /hidden\s*=\s*true/);
  assert.doesNotMatch(source, /SCA|HEART|troponin|diagn[oó]stico|conduta/i);
});

test('reassessment keeps a neutral internal bridge after the legacy workflow card is removed', async () => {
  const source = await read('src/product-coherence.js');
  assert.match(source, /temporal-action-bridge/);
  assert.match(source, /reassess-encounter/);
  assert.match(source, /appendChild\(reassessmentBridge\)/);
});

test('reassessment action waits for the temporal owner to confirm a real encounter before opening its panel', async () => {
  const source = await read('src/product-coherence.js');
  assert.match(source, /data-encounter-action=["']reavaliacao["']/);
  assert.match(source, /stopImmediatePropagation\(\)/);
  assert.match(source, /reassess-encounter/);
  assert.match(source, /addEventListener\(['"]click['"],[\s\S]*?true\)/);
  assert.doesNotMatch(source, /openEncounterPanel\(['"]reavaliacao['"]\)/);

  const convergence = await read('src/product-convergence.js');
  assert.match(convergence, /addEventListener\(['"]zera:reassessment-started['"],[\s\S]*?openEncounterPanel\(['"]reavaliacao['"]\)/);
});

test('coherence pass runs after convergence and is part of the offline app shell', async () => {
  const entry = await read('src/app.js');
  const worker = await read('service-worker.js');
  assert.match(entry, /import '\.\/product-coherence\.js';/);
  assert.ok(entry.indexOf('./product-coherence.js') > entry.indexOf('./product-convergence.js'));
  assert.match(worker, /\.\/src\/product-coherence\.js/);
});
