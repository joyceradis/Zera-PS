import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');

test('draft reads no longer coerce persistence failure into an empty history', () => {
  assert.doesNotMatch(source, /function getDrafts\(\)\s*\{\s*try\s*\{[^}]*loadDrafts\(\)[^}]*\}\s*catch\s*\{\s*return \[\]/s);
  assert.match(source, /function readDrafts\(\)[\s\S]*?storage\.loadDrafts\(\)[\s\S]*?NÃO SALVO[\s\S]*?return null;/);
});

test('draft writes expose storage failure before claiming success', () => {
  assert.match(source, /function persistDrafts\([\s\S]*?storage\.saveDrafts\(drafts\)[\s\S]*?catch[\s\S]*?NÃO SALVO[\s\S]*?return false;/);
  assert.match(source, /function saveDraft\([\s\S]*?if \(!persistDrafts\([\s\S]*?\)\) return;[\s\S]*?textContent = 'SALVO'/);
  assert.match(source, /function deleteDraft\([\s\S]*?if \(!persistDrafts\([\s\S]*?\)\) return;[\s\S]*?renderDrafts\(\)/);
  assert.match(source, /function clearAllDrafts\([\s\S]*?if \(!persistDrafts\(\[\][\s\S]*?\)\) return;[\s\S]*?renderDrafts\(\)/);
});

test('context replacement aborts when the safety archive cannot be persisted', () => {
  assert.match(source, /function archiveDocumentationForContextSwitch\([\s\S]*?if \(!persistDrafts\([\s\S]*?\)\) return null;/);
  assert.match(source, /function prepareFreshDocumentation\([\s\S]*?if \(archived === null\) return false;[\s\S]*?resetDocumentationSurface\(\)/);
  assert.match(source, /if \(decision\.resetDocument\)[\s\S]*?if \(!prepareFreshDocumentation\(\)\)[\s\S]*?event\.preventDefault\(\)/);
  assert.match(source, /if \(resetDocument && !prepareFreshDocumentation\(\)\) return;/);
});
