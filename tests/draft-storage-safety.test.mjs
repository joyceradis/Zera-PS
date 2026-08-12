import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile('assets/app.js', 'utf8');

test('draft reader never converts storage failure or corruption into an empty draft list', () => {
  assert.doesNotMatch(app, /function getDrafts\(\)\s*\{\s*try\s*\{\s*return storage\.loadDrafts\(\);?\s*\}\s*catch\s*\{\s*return \[\];?\s*\}\s*\}/s);
  assert.match(app, /function getDrafts\(\)\s*\{\s*return storage\.loadDrafts\(\);?\s*\}/s);
});

test('draft rendering distinguishes unavailable local data from a genuinely empty list', () => {
  assert.match(app, /RASCUNHOS INDISPONÍVEIS/);
  assert.match(app, /Nenhum dado foi apagado\./);
});
