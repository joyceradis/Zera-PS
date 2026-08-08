import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const appHtml = await readFile('app.html', 'utf8');
const legacyApp = await readFile('assets/app.js', 'utf8');
const temporalUi = await readFile('src/temporal-ui.js', 'utf8');
const rootApp = await readFile('app.js', 'utf8');
const serviceWorker = await readFile('service-worker.js', 'utf8');

test('application loads the root coordinator as an ES module', () => {
  assert.match(appHtml, /<script\s+type="module"\s+src="app\.js"><\/script>/);
  assert.match(rootApp, /src\/app\.js/);
});

test('every direct DOM id referenced by application layers exists in app.html', () => {
  const source = `${legacyApp}\n${temporalUi}`;
  const ids = [...source.matchAll(/(?<!\$)\$\('([^']+)'\)/g)].map((match) => match[1]);
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
