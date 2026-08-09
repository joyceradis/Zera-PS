import test from 'node:test';
import assert from 'node:assert/strict';
import { createClinicalField, confirmDenied, confirmReported, confirmObserved, confirmTemplate } from '../assets/clinical-state.js';
import { renderEvolution } from '../assets/document-engine.js';

function baseClinicalState() {
  return {
    hpp: {
      comorbidades: createClinicalField(),
      muc: createClinicalField(),
      alergias: createClinicalField(),
      habitos: createClinicalField(),
      cirurgias: createClinicalField()
    },
    physicalExam: {
      template: null,
      fields: {
        estadoGeral: createClinicalField(),
        acv: createClinicalField(),
        ar: createClinicalField(),
        abd: createClinicalField(),
        ext: createClinicalField(),
        neuro: createClinicalField()
      }
    }
  };
}

test('empty HPP fields never become NEGA', () => {
  const text = renderEvolution({ qp: 'DOR', hda: 'DOR HÁ 1 DIA' }, baseClinicalState());
  assert.equal(text.includes('ALERGIAS: NEGA'), false);
  assert.equal(text.includes('COMORBIDADES: NEGA'), false);
});

test('explicitly denied allergy renders NEGA', () => {
  const state = baseClinicalState();
  state.hpp.alergias = confirmDenied(state.hpp.alergias, { confirmedAt: '2026-08-08T12:00:00.000Z' });
  const text = renderEvolution({ qp: 'DOR', hda: 'DOR HÁ 1 DIA' }, state);
  assert.equal(text.includes('ALERGIAS: NEGA'), true);
});

test('reported allergy preserves the informed value', () => {
  const state = baseClinicalState();
  state.hpp.alergias = confirmReported(state.hpp.alergias, 'DIPIRONA', { confirmedAt: '2026-08-08T12:00:00.000Z' });
  const text = renderEvolution({ qp: 'DOR', hda: 'DOR HÁ 1 DIA' }, state);
  assert.equal(text.includes('ALERGIAS: DIPIRONA'), true);
});

test('unconfirmed physical exam is omitted', () => {
  const text = renderEvolution({ qp: 'DOR', hda: 'DOR HÁ 1 DIA' }, baseClinicalState());
  assert.equal(text.includes('# EXAME FÍSICO:'), false);
});

test('confirmed normal template authorizes physical exam rendering', () => {
  const state = baseClinicalState();
  state.physicalExam.template = confirmTemplate('normal_exam_v1', { acv: 'RCR, 2T, BNF, SEM SOPROS' }, { confirmedAt: '2026-08-08T12:00:00.000Z' });
  state.physicalExam.fields.acv = confirmObserved(state.physicalExam.fields.acv, 'RCR, 2T, BNF, SEM SOPROS', { confirmedAt: '2026-08-08T12:00:00.000Z' });
  const text = renderEvolution({ qp: 'DOR', hda: 'DOR HÁ 1 DIA' }, state);
  assert.equal(text.includes('# EXAME FÍSICO:'), true);
  assert.equal(text.includes('ACV: RCR, 2T, BNF, SEM SOPROS'), true);
});

test('complementary exams are transcribed one item per line, not glued into a single bullet', () => {
  const text = renderEvolution({
    qp: 'DOR',
    hda: 'DOR HÁ 1 DIA',
    laboratoriais: 'HEMOGRAMA: NORMAL\nPCR: 12 MG/L',
    imagem: 'TC DE ABDOME: SEM ALTERAÇÕES AGUDAS'
  }, baseClinicalState());
  assert.match(text, /# EXAMES COMPLEMENTARES:\nLABORATORIAIS:\n- HEMOGRAMA: NORMAL\n- PCR: 12 MG\/L\nIMAGEM:\n- TC DE ABDOME: SEM ALTERAÇÕES AGUDAS/);
});

test('a category with no complementary exam content is omitted entirely, not fabricated as empty', () => {
  const text = renderEvolution({
    qp: 'DOR',
    hda: 'DOR HÁ 1 DIA',
    imagem: 'TC DE ABDOME: NORMAL'
  }, baseClinicalState());
  assert.doesNotMatch(text, /LABORATORIAIS:/);
  assert.match(text, /IMAGEM:\n- TC DE ABDOME: NORMAL/);
});

test('no complementary exam content omits the whole section, same as before', () => {
  const text = renderEvolution({ qp: 'DOR', hda: 'DOR HÁ 1 DIA' }, baseClinicalState());
  assert.doesNotMatch(text, /# EXAMES COMPLEMENTARES:/);
});
