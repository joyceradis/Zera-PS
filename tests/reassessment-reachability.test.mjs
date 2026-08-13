import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const legacyApp = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
const temporalUi = await readFile(new URL('../src/temporal-ui.js', import.meta.url), 'utf8');

function bindingCount(source, id) {
  const pattern = new RegExp(`\\$\\(['\"]${id}['\"]\\)\\?*\\.addEventListener\\(['\"]click['\"]`, 'g');
  return (source.match(pattern) || []).length;
}

test('reassessment generation has one click owner and it is the temporal coordinator', () => {
  const legacyBindings = bindingCount(legacyApp, 'generate-reassessment');
  const temporalBindings = bindingCount(temporalUi, 'generate-reassessment');

  assert.equal(
    legacyBindings,
    0,
    'assets/app.js ainda disputa #generate-reassessment; a reavaliação precisa de um único owner temporal'
  );
  assert.equal(
    temporalBindings,
    1,
    'src/temporal-ui.js deve ser o único owner do clique de gerar reavaliação'
  );
});

test('reachable reassessment generation uses the temporal document contract', () => {
  assert.match(
    temporalUi,
    /function handleReassessmentGenerated\([\s\S]*?renderTemporalReassessment\(/,
    'o owner alcançável da reavaliação deixou de usar renderTemporalReassessment'
  );
  assert.match(
    temporalUi,
    /admissionSnapshot[\s\S]*?admissionHda/,
    'a geração alcançável deixou de carregar o contexto da admissão'
  );
});
