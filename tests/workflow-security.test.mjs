import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const checks = await readFile('.github/workflows/checks.yml', 'utf8');
const preview = await readFile('.github/workflows/pr-preview.yml', 'utf8');

test('checks workflow declares read-only repository permissions', () => {
  assert.match(checks, /permissions:\s*\n\s+contents:\s*read/);
  assert.doesNotMatch(checks, /contents:\s*write/);
});

test('checks workflow has a bounded execution time', () => {
  assert.match(checks, /timeout-minutes:\s*\d+/);
});

test('preview workflow grants only the write scope needed for PR conversation comments', () => {
  assert.match(preview, /permissions:\s*\n\s+contents:\s*read\s*\n\s+issues:\s*write/);
  assert.doesNotMatch(preview, /pull-requests:\s*write/);
});

test('preview checkout does not persist GitHub credentials into the worktree', () => {
  assert.match(preview, /persist-credentials:\s*false/);
});

test('preview tunnel binary is version-pinned and checksum-verified', () => {
  assert.doesNotMatch(preview, /releases\/latest\/download/);
  assert.match(preview, /releases\/download\/2026\.7\.3\/cloudflared-linux-amd64\.deb/);
  assert.match(preview, /049777d30f9bf93da6df8bbe31383460eb2aa51a832c6551824d56f9fcc55974/);
  assert.match(preview, /sha256sum\s+-c/);
});
