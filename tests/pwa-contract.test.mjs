import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
const ui = await readFile('assets/ui.js', 'utf8');
const serviceWorker = await readFile('service-worker.js', 'utf8');

test('PWA manifest remains portable under GitHub Pages repository subpaths', () => {
  assert.equal(manifest.start_url, './app.html');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.lang, 'pt-BR');
  assert.equal(manifest.start_url.startsWith('/'), false);
  assert.equal(manifest.scope.startsWith('/'), false);
});

test('service worker registration is relative to the deployed application path', () => {
  assert.match(ui, /serviceWorker\.register\('\.\/service-worker\.js'\)/);
  assert.doesNotMatch(ui, /serviceWorker\.register\('\/service-worker\.js'\)/);
});

test('manifest icon assets exist and use deploy-relative paths', async () => {
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
  for (const icon of manifest.icons) {
    assert.equal(String(icon.src).startsWith('/'), false);
    await access(icon.src);
  }
});

test('offline document fallback points to the canonical app document', () => {
  assert.match(serviceWorker, /caches\.match\('\.\/app\.html'\)/);
});
