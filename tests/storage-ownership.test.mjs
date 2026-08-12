import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOTS = ['assets', 'src'];
const ALLOWED_DIRECT_STORAGE = new Set(['assets/storage-io.js']);

async function listJavascriptFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await listJavascriptFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(full.replaceAll('\\', '/'));
  }
  return files;
}

test('only the canonical storage IO owner may access localStorage directly', async () => {
  const files = (await Promise.all(ROOTS.map(listJavascriptFiles))).flat();
  const violations = [];

  for (const file of files) {
    if (ALLOWED_DIRECT_STORAGE.has(file)) continue;
    const source = await readFile(file, 'utf8');
    if (/\blocalStorage\b/.test(source)) violations.push(file);
  }

  assert.deepEqual(violations, []);
});
