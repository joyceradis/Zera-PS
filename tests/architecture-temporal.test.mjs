import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'app.js',
  'src/clinical-state.js',
  'src/workflow-engine.js',
  'src/score-engine.js',
  'src/protocol-schema.js',
  'src/protocol-engine.js',
  'src/protocol-registry.js',
  'src/protocol-renderer.js',
  'src/context-coordination.js',
  'src/tool-presentation.js',
  'src/document-engine.js',
  'src/storage.js',
  'src/ui.js',
  'src/data.js',
  'src/templates.js',
  'protocols/sca.js'
];

const GENERIC_MODULES = [
  'src/workflow-engine.js',
  'src/score-engine.js',
  'src/protocol-schema.js',
  'src/protocol-engine.js',
  'src/protocol-renderer.js',
  'src/temporal-ui.js',
  'src/context-coordination.js',
  'src/tool-presentation.js'
];

const CLINICAL_TERMS = [/\bheart\b/i, /tropon/i, /angin/i, /suspectedAcs/, /\becg\b/i, /\bsca\b/i];

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

test('generic engines carry no scenario specific clinical vocabulary', async () => {
  for (const path of GENERIC_MODULES) {
    const source = await readFile(path, 'utf8');
    for (const term of CLINICAL_TERMS) {
      assert.doesNotMatch(source, term, `${path} não deve conhecer conceitos clínicos de um cenário específico`);
    }
  }
});

test('only the registry resolves concrete protocol configurations', async () => {
  const registry = await readFile('src/protocol-registry.js', 'utf8');
  assert.match(registry, /from '\.\.\/protocols\/sca\.js'/);

  const temporalUi = await readFile('src/temporal-ui.js', 'utf8');
  assert.doesNotMatch(temporalUi, /protocols\//);
  assert.match(temporalUi, /protocol-registry\.js/);
});

test('service worker caches every protocol and context infrastructure module', async () => {
  const serviceWorker = await readFile('service-worker.js', 'utf8');
  for (const path of ['src/protocol-schema.js', 'src/protocol-engine.js', 'src/protocol-registry.js', 'src/protocol-renderer.js', 'src/context-coordination.js', 'src/tool-presentation.js', 'protocols/sca.js']) {
    assert.match(serviceWorker, new RegExp(`'\\./${path.replace('/', '\\/')}'`));
  }
});
