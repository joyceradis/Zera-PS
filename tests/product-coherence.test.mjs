import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('product shell retires the legacy workflow surface without deleting the temporal engine', async () => {
  const source = await read('src/product-coherence.js');
  assert.match(source, /workflow-card/);
  assert.match(source, /\.remove\(\)/);
  assert.match(source, /workflow-stage/);
  assert.match(source, /hidden\s*=\s*true/);
  assert.doesNotMatch(source, /SCA|HEART|troponin/i);
});

test('Atendimento gets an explicit starting point without inventing a linear workflow', async () => {
  const source = await read('src/product-coherence.js');
  assert.match(source, /atendimento-orientation/);
  assert.match(source, /Atendimento atual/);
  assert.match(source, /Comece pela queixa e pelo contexto clínico/);
  assert.match(source, /Reavaliação, internação, alta e ferramentas são ações do mesmo atendimento/);
  assert.match(source, /NOVO ATENDIMENTO/);
  assert.match(source, /EM REGISTRO/);
  assert.doesNotMatch(source, /ETAPA\s+\d|PASSO\s+\d|PROGRESSO|\d+\s*\/\s*\d+/i);
});

test('Atendimento orientation uses block copy and reset clears the whole encounter continuation surface', async () => {
  const source = await read('src/product-coherence.js');
  assert.match(source, /const start = document\.createElement\('p'\)/);
  assert.match(source, /const continuation = document\.createElement\('p'\)/);
  assert.match(source, /const help = document\.createElement\('p'\)/);
  assert.match(source, /CONTINUATION_TEXT_IDS/);
  for (const id of ['reav-evolucao', 'reassessment-output', 'int-diagnostico', 'admission-output', 'alta-diagnostico', 'discharge-output']) {
    assert.match(source, new RegExp(`['\"]${id}['\"]`));
  }
  assert.match(source, /function resetContinuationState\(\)[\s\S]*?data-score-answer[\s\S]*?data-glasgow[\s\S]*?dispatchEvent\(new Event\('change'/);
  assert.match(source, /function queueAtendimentoReset\(\)[\s\S]*?queueMicrotask[\s\S]*?resetContinuationState\(\)[\s\S]*?updateAtendimentoState\(\)/);
  assert.match(source, /addEventListener\('reset', queueAtendimentoReset\)/);
});

test('Atendimento state ignores default values from auxiliary hidden controls', async () => {
  const source = await read('src/product-coherence.js');
  assert.match(source, /ATENDIMENTO_CONTENT_IDS/);
  for (const id of ['qp-free', 'qp', 'hda', 'laboratoriais', 'imagem', 'hipoteses', 'conduta', 'evolution-output']) {
    assert.match(source, new RegExp(`['\"]${id}['\"]`));
  }
  const body = source.slice(source.indexOf('function hasCurrentDocumentation'), source.indexOf('function updateAtendimentoState'));
  assert.doesNotMatch(body, /querySelectorAll\(['"]input, textarea, select['"]\)/);
});

test('save status semantics are explained instead of relying on unexplained labels', async () => {
  const source = await read('src/product-coherence.js');
  assert.match(source, /atendimento-save-help/);
  assert.match(source, /Autossalvo mantém o estado atual neste dispositivo/);
  assert.match(source, /Salvar rascunho cria uma cópia separada/);
});

test('reassessment keeps a neutral internal bridge after the legacy workflow card is removed', async () => {
  const source = await read('src/product-coherence.js');
  assert.match(source, /temporal-action-bridge/);
  assert.match(source, /reassess-encounter/);
  assert.match(source, /appendChild\(reassessmentBridge\)/);
});

test('reassessment action waits for the temporal owner to confirm a real encounter before opening its panel', async () => {
  const source = await read('src/product-coherence.js');
  assert.match(source, /data-encounter-action=["']reavaliacao["']/);
  assert.match(source, /stopImmediatePropagation\(\)/);
  assert.match(source, /reassess-encounter/);
  assert.match(source, /addEventListener\(['"]click['"],[\s\S]*?true\)/);
  assert.doesNotMatch(source, /openEncounterPanel\(['"]reavaliacao['"]\)/);

  const convergence = await read('src/product-convergence.js');
  assert.match(convergence, /addEventListener\(['"]zera:reassessment-started['"],[\s\S]*?openEncounterPanel\(['"]reavaliacao['"]\)/);
});

test('coherence pass runs after convergence and is part of the offline app shell', async () => {
  const entry = await read('src/app.js');
  const worker = await read('service-worker.js');
  assert.match(entry, /import '\.\/product-coherence\.js';/);
  assert.ok(entry.indexOf('./product-coherence.js') > entry.indexOf('./product-convergence.js'));
  assert.match(worker, /\.\/src\/product-coherence\.js/);
});
