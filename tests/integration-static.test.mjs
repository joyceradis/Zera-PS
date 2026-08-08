import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const appHtml = await readFile('app.html', 'utf8');
const appJs = await readFile('assets/app.js', 'utf8');
const serviceWorker = await readFile('service-worker.js', 'utf8');

test('application loads the coordinator as an ES module', () => {
  assert.match(appHtml, /<script\s+type="module"\s+src="assets\/app\.js"><\/script>/);
});

test('every direct DOM id referenced by app.js exists in app.html', () => {
  const ids = [...appJs.matchAll(/(?<!\$)\$\('([^']+)'\)/g)].map((match) => match[1]);
  const uniqueIds = [...new Set(ids)];
  const missing = uniqueIds.filter((id) => !appHtml.includes(`id="${id}"`));
  assert.deepEqual(missing, []);
});

test('PWA app shell contains only existing local files', async () => {
  const entries = [...serviceWorker.matchAll(/'\.\/(.*?)'/g)].map((match) => match[1]).filter(Boolean);
  const uniqueEntries = [...new Set(entries)];
  const missing = [];
  for (const entry of uniqueEntries) {
    try { await access(entry); } catch { missing.push(entry); }
  }
  assert.deepEqual(missing, []);
});

test('offline fallback is limited to navigation requests', () => {
  assert.match(serviceWorker, /event\.request\.mode === 'navigate'/);
  assert.doesNotMatch(serviceWorker, /cached \|\|\s*caches\.match\('\.\/app\.html'\)/);
});
