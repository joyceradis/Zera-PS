import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');

function clearFormBody() {
  const match = source.match(/function clearForm\(\) \{([\s\S]*?)\n\}\n\nfunction toggleEmTempo/);
  assert.ok(match, 'clearForm must remain identifiable for storage-boundary regression');
  return match[1];
}

test('clear form attempts durable autosave removal before mutating visible clinical state', () => {
  const body = clearFormBody();
  const clearIndex = body.indexOf('storage.clearAutosave()');
  const resetIndex = body.indexOf("$('evolution-form').reset()");
  assert.notEqual(clearIndex, -1, 'clearForm must remove the persisted autosave');
  assert.notEqual(resetIndex, -1, 'clearForm must reset the visible form only after persistence succeeds');
  assert.ok(clearIndex < resetIndex, 'persisted autosave must be cleared before destructive UI reset');
});

test('clear form surfaces storage removal failure and preserves visible fields', () => {
  const body = clearFormBody();
  assert.match(body, /try\s*\{[\s\S]*?storage\.clearAutosave\(\)[\s\S]*?\}\s*catch/);
  assert.match(body, /catch\s*\{[\s\S]*?NÃO SALVO[\s\S]*?showFeedback\([\s\S]*?return;/);
  const catchIndex = body.indexOf('catch');
  const resetIndex = body.indexOf("$('evolution-form').reset()");
  assert.ok(catchIndex < resetIndex, 'failure path must exist before any visible reset');
});
