import test from 'node:test';
import assert from 'node:assert/strict';
import { renderEvolution } from '../assets/document-engine.js';

function render(raw) {
  return renderEvolution({ qp: 'DOR', hda: 'DOR HÁ 1 DIA', ...raw }, {});
}

test('compact LAB line is rendered directly under EXAMES COMPLEMENTARES', () => {
  const text = render({ laboratoriais: '- LAB: HB: 13,2 / HT: 39,8 / LEUCO: 14.320 (NEUT: 86%) / PCR: 72' });
  assert.match(text, /# EXAMES COMPLEMENTARES:\n- LAB: HB: 13,2 \/ HT: 39,8 \/ LEUCO: 14\.320 \(NEUT: 86%\) \/ PCR: 72/);
  assert.doesNotMatch(text, /LABORATORIAIS:/);
});

test('laboratory and image lines share one concise clinical section', () => {
  const text = render({
    laboratoriais: '- LAB: HB: 12,0 / PCR: 8',
    imagem: 'ECG: RITMO SINUSAL\nTC DE ABDOME: SEM ALTERAÇÕES AGUDAS'
  });
  assert.match(text, /# EXAMES COMPLEMENTARES:\n- LAB: HB: 12,0 \/ PCR: 8\n- ECG: RITMO SINUSAL\n- TC DE ABDOME: SEM ALTERAÇÕES AGUDAS/);
  assert.doesNotMatch(text, /IMAGEM:/);
});

test('empty complementary exam inputs still omit the whole section', () => {
  const text = render({});
  assert.doesNotMatch(text, /# EXAMES COMPLEMENTARES:/);
});
