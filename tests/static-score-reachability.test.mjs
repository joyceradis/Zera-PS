import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SCORE_DEFINITIONS } from '../assets/scores.js';
import { ENCOUNTER_ACTION_VIEWS } from '../src/product-convergence.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('static score microfunctions remain reachable through Atendimento/Ferramentas', async () => {
  const html = await read('app.html');
  const convergence = await read('src/product-convergence.js');
  const legacyApp = await read('assets/app.js');

  assert.ok(
    ENCOUNTER_ACTION_VIEWS.some(({ id, label }) => id === 'scores' && label === 'Ferramentas'),
    'a superfície convergida deixou de expor a ação Ferramentas dentro do Atendimento'
  );

  assert.match(html, /id=["']view-scores["']/);
  assert.match(html, /id=["']scores-container["']/);

  assert.match(
    convergence,
    /const legacyView = document\.getElementById\(`view-\$\{action\.id\}`\)[\s\S]*?while \(legacyView\.firstChild\) panel\.appendChild\(legacyView\.firstChild\)/,
    'a convergência deixou de realocar o conteúdo real do view-scores para o painel de Ferramentas'
  );

  assert.match(
    legacyApp,
    /renderScores\(SCORE_LIST,\s*handleScoreAnswer,\s*handleGlasgowChange\)/,
    'os scores estáticos deixaram de ser montados pelo coordenador existente'
  );

  for (const id of ['crb65', 'qsofa', 'curb65']) {
    assert.ok(SCORE_DEFINITIONS[id], `microfunção de score estático perdida: ${id}`);
  }
});
