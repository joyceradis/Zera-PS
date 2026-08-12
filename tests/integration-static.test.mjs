import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const appHtml = await readFile('app.html', 'utf8');
const legacyApp = await readFile('assets/app.js', 'utf8');
const temporalUi = await readFile('src/temporal-ui.js', 'utf8');
const rootApp = await readFile('app.js', 'utf8');
const serviceWorker = await readFile('service-worker.js', 'utf8');
const DYNAMIC_IDS = new Set(['zera-temporal-styles']);

function appShellEntries() {
  return [...serviceWorker.matchAll(/'\.\/(.*?)'/g)].map((match) => match[1]).filter(Boolean);
}

test('application loads the root coordinator as an ES module', () => {
  assert.match(appHtml, /<script\s+type="module"\s+src="app\.js"><\/script>/);
  assert.match(rootApp, /src\/app\.js/);
});

test('every static DOM id referenced by application layers exists in app.html', () => {
  const source = `${legacyApp}\n${temporalUi}`;
  const ids = [...source.matchAll(/(?<!\$)\$\('([^']+)'\)/g)].map((match) => match[1]);
  const uniqueIds = [...new Set(ids)].filter((id) => !DYNAMIC_IDS.has(id));
  const missing = uniqueIds.filter((id) => !appHtml.includes(`id="${id}"`));
  assert.deepEqual(missing, []);
});

test('declared dynamic ids are actually created by application code', () => {
  for (const id of DYNAMIC_IDS) {
    assert.match(temporalUi, new RegExp(`(?:id\\s*=\\s*['\"]${id}['\"]|\\.id\\s*=\\s*['\"]${id}['\"])`));
  }
});

test('PWA app shell contains only existing local files', async () => {
  const uniqueEntries = [...new Set(appShellEntries())];
  const missing = [];
  for (const entry of uniqueEntries) {
    try { await access(entry); } catch { missing.push(entry); }
  }
  assert.deepEqual(missing, []);
});

test('PWA app shell is closed over local ES module imports', async () => {
  const shell = new Set(appShellEntries());
  const missingImports = [];

  for (const entry of shell) {
    if (!entry.endsWith('.js')) continue;
    const source = await readFile(entry, 'utf8');
    const imports = [...source.matchAll(/(?:from\s+|import\s*\()(['"])(\.\.?\/[^'"]+)\1/g)].map((match) => match[2]);

    for (const specifier of imports) {
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(entry), specifier));
      if (!shell.has(resolved)) missingImports.push(`${entry} -> ${resolved}`);
    }
  }

  assert.deepEqual(missingImports, []);
});

test('PWA caches cycle 2 interaction modules and persistence IO under a new cache generation', () => {
  assert.match(serviceWorker, /\.\/src\/productivity\.js/);
  assert.match(serviceWorker, /\.\/src\/clinical-intake\.js/);
  assert.match(serviceWorker, /\.\/src\/text-formatters\.js/);
  assert.match(serviceWorker, /\.\/assets\/storage-io\.js/);
  assert.match(serviceWorker, /const CACHE_NAME = 'zera-ps-v14'/);
});

test('PWA activation only prunes Zera PS caches and never foreign origin caches', () => {
  assert.match(serviceWorker, /const CACHE_PREFIX = 'zera-ps-'/);
  assert.match(serviceWorker, /key\.startsWith\(CACHE_PREFIX\)\s*&&\s*key !== CACHE_NAME/);
  assert.doesNotMatch(serviceWorker, /filter\(\(key\) => key !== CACHE_NAME\)/);
});

test('offline fallback is limited to navigation requests', () => {
  assert.match(serviceWorker, /event\.request\.mode === 'navigate'/);
  assert.doesNotMatch(serviceWorker, /cached \|\|\s*caches\.match\('\.\/app\.html'\)/);
});

test('legacy guided diarrhea controls remain in source as recoverable heritage, not the primary cycle 2 surface', () => {
  assert.match(appHtml, /id="hda-diarrhea-guide"/);
  assert.match(appHtml, /id="hda-diarrhea-onset-value"/);
  assert.match(appHtml, /data-hda-finding="blood"/);
});

test('legacy template engine remains recoverable without being the primary clinical entry point', () => {
  assert.match(legacyApp, /\$\('hda'\)\.value = template\.hdaDraft/);
  assert.match(legacyApp, /function readDiarrheaComposer[\s\S]*?draft:\s*true/);
});
