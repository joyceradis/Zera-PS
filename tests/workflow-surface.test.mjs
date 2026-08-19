// Superfície de CI — derivada do diretório, não de uma lista escrita à mão.
//
// `workflow-security.test.mjs` verifica propriedades de `checks.yml` e `pr-preview.yml` por
// nome. É correto para esses dois e cego para qualquer arquivo novo: um workflow acrescentado
// depois não é olhado por ninguém, e `.github/workflows/` é diretório sensível — quem escreve
// ali executa código com credenciais do repositório.
//
// Duas evidências reais motivaram este arquivo, ambas na branch padrão:
//
//   1. `.github/workflows/main.yml` é uma linha de bash truncada, não um workflow. Foi
//      commitada por engano e nada acusou.
//   2. `codeql.yml` usa `actions/checkout@v7` e `github/codeql-action/*@v4` — tags móveis. O
//      projeto exige SHA imutável, e a exigência não alcançava arquivos não nomeados.
//
// Aqui a exigência é derivada: todo arquivo do diretório entra sozinho. Workflow novo passa a
// ser verificado sem que ninguém lembre de atualizar teste.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const WORKFLOW_DIR = new URL('../.github/workflows/', import.meta.url);

function workflowFiles() {
  return readdirSync(WORKFLOW_DIR)
    .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
    .sort();
}

const FILES = workflowFiles();
const read = (name) => readFileSync(new URL(name, WORKFLOW_DIR), 'utf8');

/** Piso ancorado: a varredura não pode encolher em silêncio. */
const WORKFLOW_FLOOR = 2;

test('every workflow file is enumerated and the surface never shrinks silently', () => {
  assert.ok(
    FILES.length >= WORKFLOW_FLOOR,
    `A superfície de CI caiu de ${WORKFLOW_FLOOR} para ${FILES.length} workflows. Ou arquivos ` +
    'foram removidos, ou a enumeração deixou de encontrá-los — nos dois casos esta guarda passou ' +
    'a exigir menos. Atualize WORKFLOW_FLOOR conscientemente.'
  );
  assert.ok(FILES.includes('checks.yml'), 'O workflow de verificação saiu do diretório.');
});

test('every file under .github/workflows is actually a workflow', () => {
  // `.github/workflows/` executa com credenciais do repositório. Arquivo que não é workflow
  // ali é, na melhor hipótese, ruído que mascara sinal de CI; na pior, script commitado por
  // engano. Já aconteceu: um `main.yml` de uma linha de bash na branch padrão.
  for (const name of FILES) {
    const source = read(name);
    assert.match(
      source,
      /^\s*on:/m,
      `${name} não declara gatilho "on:". Isso não é um workflow válido — GitHub Actions não ` +
      'consegue interpretá-lo, e o arquivo fica em um diretório que executa com credenciais.'
    );
    assert.match(
      source,
      /^\s*jobs:/m,
      `${name} não declara "jobs:". Não é um workflow válido.`
    );
    assert.ok(
      source.split('\n').length > 3,
      `${name} tem ${source.split('\n').length} linha(s). Um workflow legítimo não cabe nisso; ` +
      'isto tem cara de comando colado por engano dentro de .github/workflows/.'
    );
  }
});

test('every workflow declares its permissions instead of inheriting the default', () => {
  for (const name of FILES) {
    assert.match(
      read(name),
      /^\s*permissions:/m,
      `${name} não declara "permissions:". Sem declaração, o job herda o token padrão do ` +
      'repositório, que é mais amplo do que qualquer workflow deste projeto precisa.'
    );
  }
});

test('every third-party action in every workflow is pinned to an immutable commit SHA', () => {
  // A regra já existia, verificada em dois arquivos por nome. Aqui vale para o diretório
  // inteiro: um workflow novo com `@v4` deixa de passar despercebido.
  const unpinned = [];
  for (const name of FILES) {
    for (const match of read(name).matchAll(/uses:\s*([^\s#]+)/g)) {
      const reference = match[1];
      if (reference.startsWith('./') || reference.startsWith('docker://')) continue;
      const [, version] = reference.split('@');
      if (!version || !/^[0-9a-f]{40}$/.test(version)) unpinned.push(`${name}: ${reference}`);
    }
  }
  assert.deepEqual(
    unpinned,
    [],
    `Ação de terceiro sem SHA imutável: ${unpinned.join(', ')}. Tag móvel pode ser reapontada ` +
    'pelo autor da ação a qualquer momento, e o job executa com credenciais deste repositório.'
  );
});
