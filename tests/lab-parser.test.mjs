import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLaboratoryText, renderCompactLabLine } from '../src/lab-parser.js';

const RAW = `
HEMOGRAMA
Hemoglobina 13,2 g/dL
Hematócrito 39,8 %
Leucócitos 14320 /mm3
Segmentados 86 %
Contagem de Plaquetas 245000 /mm3
PROTEINA C REATIVA RESULTADO 72 mg/L
UREIA 38 mg/dL
CREATININA RESULTADO 0,9 mg/dL
SÓDIO RESULTADO 138 mmol/L
POTÁSSIO RESULTADO 4,1 mmol/L
Assinado eletronicamente por Fulano
Responsável técnico: CRM 0000
`;

test('recovers laboratory values from noisy pasted output', () => {
  const parsed = parseLaboratoryText(RAW);
  assert.deepEqual(parsed, {
    hb: '13,2',
    ht: '39,8',
    leuco: '14320',
    neut: '86',
    plaq: '245000',
    pcr: '72',
    ur: '38',
    cr: '0,9',
    na: '138',
    k: '4,1'
  });
});

test('renders the Founder compact PS format in one LAB line', () => {
  assert.equal(
    renderCompactLabLine(parseLaboratoryText(RAW)),
    '- LAB: HB: 13,2 / HT: 39,8 / LEUCO: 14.320 (NEUT: 86%) / PLAQ: 245.000 / PCR: 72 / UR: 38 / CR: 0,9 / NA: 138 / K: 4,1'
  );
});

test('never invents differential or missing analytes', () => {
  const parsed = parseLaboratoryText('Hemoglobina 12,1\nLeucócitos 8700\nCREATININA RESULTADO 1,0');
  const line = renderCompactLabLine(parsed);
  assert.equal(line, '- LAB: HB: 12,1 / LEUCO: 8.700 / CR: 1,0');
  assert.doesNotMatch(line, /NEUT|PCR|PLAQ|NA:|K:/);
});

test('empty or unrecognized input does not fabricate a LAB line', () => {
  assert.equal(renderCompactLabLine(parseLaboratoryText('')), '');
  assert.equal(renderCompactLabLine(parseLaboratoryText('LAUDO SEM ANALITOS RECONHECIDOS')), '');
});
