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

const LEGACY_HERITAGE = `
HEMOGRAMA
Hemoglobina 12,8
Hematócrito 38,1
Leucócitos 11800
Bastonetes 2
Segmentados 78
Eosinófilos 1
Basófilos 0
Linfócitos Típicos 14
Monócitos 5
Contagem de Plaquetas 321000
NITROGENIO UREICO 18
TAXA FILTRAÇÃO GLOMERULAR SUPERIOR A 90
TRANSAMINASE GLUTAMICO OXALACETICA RESULTADO 31
TRANSAMINASE GLUTAMICO PIRUVICA RESULTADO 27
AMILASE SERICA RESULTADO 55
LIPASE RESULTADO 42
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

test('accepts the compact aliases already used in PS documentation', () => {
  const parsed = parseLaboratoryText('HB 11,5 / HT 34 / LEUCO 9000 / SEG 82 / PLAQ 200000 / PCR 14 / UR 35 / CR 1,2 / NA 140 / K 4,0');
  assert.deepEqual(parsed, {
    hb: '11,5',
    ht: '34',
    leuco: '9000',
    neut: '82',
    plaq: '200000',
    pcr: '14',
    ur: '35',
    cr: '1,2',
    na: '140',
    k: '4,0'
  });
  assert.equal(
    renderCompactLabLine(parsed),
    '- LAB: HB: 11,5 / HT: 34 / LEUCO: 9.000 (NEUT: 82%) / PLAQ: 200.000 / PCR: 14 / UR: 35 / CR: 1,2 / NA: 140 / K: 4,0'
  );
});

test('preserves additional explicit analytes recovered from the predecessor without forcing them into the compact renderer', () => {
  const parsed = parseLaboratoryText(LEGACY_HERITAGE);
  assert.deepEqual(parsed, {
    hb: '12,8',
    ht: '38,1',
    leuco: '11800',
    neut: '78',
    bast: '2',
    eos: '1',
    baso: '0',
    linf: '14',
    mono: '5',
    plaq: '321000',
    bun: '18',
    rfg: 'SUPERIOR A 90',
    tgo: '31',
    tgp: '27',
    amilase: '55',
    lipase: '42'
  });

  const line = renderCompactLabLine(parsed);
  assert.equal(line, '- LAB: HB: 12,8 / HT: 38,1 / LEUCO: 11.800 (NEUT: 78%) / PLAQ: 321.000');
  assert.doesNotMatch(line, /BAST|EOS|BASO|LINF|MONO|BUN|RFG|TGO|TGP|AMILASE|LIPASE/);
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
