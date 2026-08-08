import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'app.js',
  'src/clinical-state.js',
  'src/workflow-engine.js',
  'src/score-engine.js',
  'src/document-engine.js',
  'src/storage.js',
  'src/ui.js',
  'src/data.js',
  'src/templates.js',
  'protocols/sca.js'
];

test('temporal architecture files exist in the new house', async () => {
  const missing = [];
  for (const path of requiredFiles) {
    try { await access(path); } catch { missing.push(path); }
  }
  assert.deepEqual(missing, []);
});

test('app.html loads root app.js as ES module', async () => {
  const html = await readFile('app.html', 'utf8');
  assert.match(html, /<script\s+type="module"\s+src="app\.js"><\/script>/);
});

test('root app.js imports implementation from src and does not contain clinical scenario rules', async () => {
  const root = await readFile('app.js', 'utf8');
  assert.match(root, /src\/app\.js/);
  assert.doesNotMatch(root, /suspectedAcs|HEART|troponin/i);
});
