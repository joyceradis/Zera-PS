import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const appHtml = await readFile('app.html', 'utf8');
const legacyApp = await readFile('assets/app.js', 'utf8');
const temporalUi = await readFile('src/temporal-ui.js', 'utf8');
const rootApp = await readFile('app.js', 'utf8');
const serviceWorker = await readFile('service-worker.js', 'utf8');
const DYNAMIC_IDS = new Set(['zera-temporal-styles']);

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
  const entries = [...serviceWorker.matchAll(/'\.\/(.*?)'/g)].map((match) => match[1]).filter(Boolean);
  const uniqueEntries = [...new Set(entries)];
  const missing = [];
  for (const entry of uniqueEntries) {
    try { await access(entry); } catch { missing.push(entry); }
  }
  assert.deepEqual(missing, []);
});

test('PWA caches the definitive productivity module under a new cache generation', () => {
  assert.match(serviceWorker, /\.\/src\/productivity\.js/);
  assert.match(serviceWorker, /const CACHE_NAME = 'zera-ps-v11'/);
});

test('offline fallback is limited to navigation requests', () => {
  assert.match(serviceWorker, /event\.request\.mode === 'navigate'/);
  assert.doesNotMatch(serviceWorker, /cached \|\|\s*caches\.match\('\.\/app\.html'\)/);
});

test('evolution screen contains the guided diarrhea HDA controls and an explicit complete Markdown output', () => {
  assert.match(appHtml, /id="hda-diarrhea-guide"/);
  assert.match(appHtml, /id="hda-diarrhea-onset-value"/);
  assert.match(appHtml, /data-hda-finding="blood"/);
  assert.match(appHtml, /data-hda-finding="mucus"/);
  assert.match(appHtml, /data-hda-finding="pus"/);
  assert.match(appHtml, /id="apply-generated-hda"/);
  assert.match(appHtml, /TEXTO COMPLETO · MARKDOWN/);
  assert.match(appHtml, />Copiar evolução completa</);
});

test('selecting a roteiro inserts its complete HDA draft into the editable HDA field', () => {
  assert.match(legacyApp, /\$\('hda'\)\.value = template\.hdaDraft/);
  assert.match(legacyApp, /function readDiarrheaComposer[\s\S]*?draft:\s*true/);
  assert.match(appHtml, /HDA · RASCUNHO CLÍNICO PRONTO PARA EDITAR/);
});
