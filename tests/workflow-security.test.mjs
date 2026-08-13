import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const checks = await readFile('.github/workflows/checks.yml', 'utf8');
const preview = await readFile('.github/workflows/pr-preview.yml', 'utf8');
const CHECKOUT_SHA = 'fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09';
const SETUP_NODE_SHA = 'a0853c24544627f65ddf259abe73b1d18a591444';

test('checks workflow declares read-only repository permissions', () => {
  assert.match(checks, /permissions:\s*\n\s+contents:\s*read/);
  assert.doesNotMatch(checks, /contents:\s*write/);
});

test('checks workflow has a bounded execution time', () => {
  assert.match(checks, /timeout-minutes:\s*\d+/);
});

test('preview workflow is read-only and does not require PR mutation permissions', () => {
  assert.match(preview, /permissions:\s*\n\s+contents:\s*read/);
  assert.doesNotMatch(preview, /issues:\s*write|pull-requests:\s*write|contents:\s*write/);
  assert.doesNotMatch(preview, /gh\s+(?:pr|api)|GH_TOKEN/);
});

test('preview checkout does not persist GitHub credentials into the worktree', () => {
  assert.match(preview, /persist-credentials:\s*false/);
});

test('preview tunnel binary is version-pinned and checksum-verified', () => {
  assert.doesNotMatch(preview, /releases\/latest\/download/);
  assert.match(preview, /CLOUDFLARED_VERSION:\s*['"]2026\.7\.3['"]/);
  assert.match(preview, /releases\/download\/\$\{CLOUDFLARED_VERSION\}\/cloudflared-linux-amd64\.deb/);
  assert.match(preview, /049777d30f9bf93da6df8bbe31383460eb2aa51a832c6551824d56f9fcc55974/);
  assert.match(preview, /sha256sum\s+-c/);
});

test('the CI guard for critical safety sentinels cannot be removed silently', () => {
  // Fecha o último elo do INV-GOV-001 (issue #40).
  //
  // Apagar UM dos arquivos-sentinela já é detectado pela própria suíte, porque o gate e a
  // âncora se protegem mutuamente: `invariant-coverage.test.mjs` lê os protetores declarados
  // em `integration-static.test.mjs`, e este lê o gate de volta. Apagar OS DOIS de uma vez
  // não é, porque nenhum dos dois testes chega a rodar — esse caso depende exclusivamente do
  // step de CI. Sem esta asserção, remover o step reabriria o buraco em silêncio.
  assert.match(
    checks,
    /Guard critical safety sentinels/,
    'O step de CI que protege os arquivos-sentinela sumiu de checks.yml. Sem ele, apagar o ' +
    'registry e o gate na mesma mudança não é detectado por nada.'
  );
  for (const sentinel of [
    'docs/clinical/INVARIANT_REGISTRY\\.md',
    'tests/invariant-coverage\\.test\\.mjs',
    'tests/integration-static\\.test\\.mjs'
  ]) {
    assert.match(
      checks,
      new RegExp(sentinel),
      `O arquivo-sentinela "${sentinel}" saiu da lista protegida pelo CI.`
    );
  }
  // O step precisa reprovar o job, não apenas registrar aviso.
  assert.match(checks, /exit 1/, 'O guard deixou de reprovar o job quando um sentinela some.');
});

test('GitHub Actions dependencies are pinned to immutable commit SHAs', () => {
  assert.match(checks, new RegExp(`actions/checkout@${CHECKOUT_SHA}`));
  assert.match(checks, new RegExp(`actions/setup-node@${SETUP_NODE_SHA}`));
  assert.match(preview, new RegExp(`actions/checkout@${CHECKOUT_SHA}`));
  assert.doesNotMatch(`${checks}\n${preview}`, /actions\/(?:checkout|setup-node)@v\d+/);
});
