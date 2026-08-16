import test from 'node:test';
import assert from 'node:assert/strict';
import { createClinicalField, confirmDenied, confirmReported, confirmObserved, confirmTemplate } from '../assets/clinical-state.js';
import { renderEvolution, renderAdmission } from '../assets/document-engine.js';

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

test('identical QP and HDA are rendered once as HDA instead of duplicating the same paragraph', () => {
  const text = renderEvolution({ qp: 'DOR ABDOMINAL HÁ 6 HORAS', hda: 'DOR ABDOMINAL HÁ 6 HORAS' }, baseClinicalState());
  assert.doesNotMatch(text, /# QP:/);
  assert.match(text, /# HDA: DOR ABDOMINAL HÁ 6 HORAS/);
  assert.equal((text.match(/DOR ABDOMINAL HÁ 6 HORAS/g) || []).length, 1);
});

test('distinct short QP and narrative HDA remain separate sections', () => {
  const text = renderEvolution({ qp: 'DOR ABDOMINAL', hda: 'DOR ABDOMINAL EM FLANCO DIREITO HÁ 6 HORAS, ASSOCIADA A NÁUSEAS.' }, baseClinicalState());
  assert.match(text, /# QP: DOR ABDOMINAL/);
  assert.match(text, /# HDA: DOR ABDOMINAL EM FLANCO DIREITO HÁ 6 HORAS, ASSOCIADA A NÁUSEAS\./);
});

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

test('complementary exams are transcribed as concise clinical lines without technical category wrappers', () => {
  const text = renderEvolution({
    qp: 'DOR',
    hda: 'DOR HÁ 1 DIA',
    laboratoriais: 'HEMOGRAMA: NORMAL\nPCR: 12 MG/L',
    imagem: 'TC DE ABDOME: SEM ALTERAÇÕES AGUDAS'
  }, baseClinicalState());
  assert.match(text, /# EXAMES COMPLEMENTARES:\n- HEMOGRAMA: NORMAL\n- PCR: 12 MG\/L\n- TC DE ABDOME: SEM ALTERAÇÕES AGUDAS/);
  assert.doesNotMatch(text, /LABORATORIAIS:|IMAGEM:/);
});

test('a missing complementary exam category is omitted without creating an empty wrapper', () => {
  const text = renderEvolution({
    qp: 'DOR',
    hda: 'DOR HÁ 1 DIA',
    imagem: 'TC DE ABDOME: NORMAL'
  }, baseClinicalState());
  assert.match(text, /# EXAMES COMPLEMENTARES:\n- TC DE ABDOME: NORMAL/);
  assert.doesNotMatch(text, /LABORATORIAIS:|IMAGEM:/);
});

test('no complementary exam content omits the whole section, same as before', () => {
  const text = renderEvolution({ qp: 'DOR', hda: 'DOR HÁ 1 DIA' }, baseClinicalState());
  assert.doesNotMatch(text, /# EXAMES COMPLEMENTARES:/);
});

test('admission justification renders as its own block, not glued after the header on one line', () => {
  const text = renderAdmission({
    diagnostico: 'ABDOME AGUDO INFLAMATÓRIO',
    justificativa: '# QUADRO CLÍNICO:\nDOR ABDOMINAL HÁ 2 DIAS.\n\n# SOLICITAÇÃO DE INTERNAÇÃO:\n- SOLICITO INTERNAÇÃO HOSPITALAR PARA CONTINUIDADE DE INVESTIGAÇÃO E CONDUTA.',
    destino: 'ENFERMARIA'
  });
  assert.match(text, /# JUSTIFICATIVA CLÍNICA:\n# QUADRO CLÍNICO:\nDOR ABDOMINAL HÁ 2 DIAS\./);
  assert.doesNotMatch(text, /# JUSTIFICATIVA CLÍNICA: #/);
});

test('a short, manually typed admission justification still renders correctly', () => {
  const text = renderAdmission({ diagnostico: 'PNEUMONIA', justificativa: 'NECESSITA ANTIBIOTICOTERAPIA ENDOVENOSA.' });
  assert.match(text, /# JUSTIFICATIVA CLÍNICA:\nNECESSITA ANTIBIOTICOTERAPIA ENDOVENOSA\./);
});
