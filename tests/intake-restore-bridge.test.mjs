import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CONTEXT_EVENTS } from '../src/context-coordination.js';

test('opening a draft emits a post-restore synchronization event for the converged intake', async () => {
  const [entry, bridge, convergence] = await Promise.all([
    readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/intake-restore-bridge.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/product-convergence.js', import.meta.url), 'utf8')
  ]);

  assert.equal(CONTEXT_EVENTS.DOCUMENTATION_RESTORED, 'zera:documentation-restored');
  assert.match(entry, /import ['"]\.\/intake-restore-bridge\.js['"]/);
  assert.match(bridge, /data-load-draft/);
  assert.match(bridge, /queueMicrotask/);
  assert.match(bridge, /CONTEXT_EVENTS\.DOCUMENTATION_RESTORED/);
  assert.match(convergence, /CONTEXT_EVENTS\.DOCUMENTATION_RESTORED/);
  assert.match(convergence, /free\.value = hdaInput\.value \|\| qpInput\.value \|\| ''/);
});
