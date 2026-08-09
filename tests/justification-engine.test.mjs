import test from 'node:test';
import assert from 'node:assert/strict';
import { createClinicalField, confirmDenied, confirmReported, confirmObserved } from '../assets/clinical-state.js';
import {
  JUSTIFICATION_PROFILES,
  getJustificationProfile,
  assembleJustification
} from '../src/justification-engine.js';

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

test('every declared profile resolves by id and PAC/TC/USG ids match the pilot scope', () => {
  const ids = JUSTIFICATION_PROFILES.map((profile) => profile.id);
  assert.deepEqual(ids, ['tc-abdome-pelve', 'usg-abdome-total', 'internacao']);
  for (const id of ids) assert.equal(getJustificationProfile(id)?.id, id);
  assert.equal(getJustificationProfile('inexistente'), null);
});

test('unconfirmed clinical state never appears in the assembled justification', () => {
  const profile = getJustificationProfile('tc-abdome-pelve');
  const text = assembleJustification(profile, 'contraste', {
    form: { qp: 'DOR ABDOMINAL', hda: 'DOR HÁ 2 DIAS.' },
    clinicalState: baseClinicalState()
  });
  assert.doesNotMatch(text, /# ANTECEDENTES RELEVANTES:/);
  assert.doesNotMatch(text, /# EXAME FÍSICO:/);
  assert.doesNotMatch(text, /# EXAMES COMPLEMENTARES:/);
});

test('a missing risk/hypothesis renders a visible placeholder, never a fabricated risk', () => {
  const profile = getJustificationProfile('tc-abdome-pelve');
  const text = assembleJustification(profile, 'sem-contraste', {
    form: { qp: 'DOR ABDOMINAL', hda: 'DOR HÁ 2 DIAS.' },
    clinicalState: baseClinicalState()
  });
  assert.match(text, /\[COMPLETAR: HIPÓTESE OU RISCO CLÍNICO QUE JUSTIFICA ESTE PEDIDO/);
});

test('missing QP/HDA renders a visible placeholder instead of an empty clinical picture', () => {
  const profile = getJustificationProfile('internacao');
  const text = assembleJustification(profile, '', { form: {}, clinicalState: baseClinicalState() });
  assert.match(text, /\[COMPLETAR: QUADRO CLÍNICO — QP\/HDA NÃO PREENCHIDOS NA EVOLUÇÃO\]/);
});

test('confirmed HPP negatives and reported values render exactly as the evolution would, nothing invented', () => {
  const state = baseClinicalState();
  state.hpp.alergias = confirmDenied(state.hpp.alergias, { confirmedAt: '2026-08-09T10:00:00.000Z' });
  state.hpp.comorbidades = confirmReported(state.hpp.comorbidades, 'HAS', { confirmedAt: '2026-08-09T10:00:00.000Z' });
  const profile = getJustificationProfile('usg-abdome-total');
  const text = assembleJustification(profile, 'abdome-total', {
    form: { qp: 'DOR LOMBAR', hda: 'DOR HÁ 3 DIAS.', hipoteses: 'LITÍASE RENAL' },
    clinicalState: state
  });
  assert.match(text, /# ANTECEDENTES RELEVANTES:\n- COMORBIDADES: HAS\n- ALERGIAS: NEGA/);
  assert.doesNotMatch(text, /MUC/);
});

test('confirmed physical exam findings render only the confirmed fields', () => {
  const state = baseClinicalState();
  state.physicalExam.fields.abd = confirmObserved(state.physicalExam.fields.abd, 'DOLOROSO EM FLANCO DIREITO', { confirmedAt: '2026-08-09T10:00:00.000Z' });
  const profile = getJustificationProfile('tc-abdome-pelve');
  const text = assembleJustification(profile, 'contraste', {
    form: { qp: 'DOR EM FLANCO', hda: 'DOR HÁ 6 HORAS.', hipoteses: 'CÓLICA NEFRÉTICA VS ABDOME AGUDO' },
    clinicalState: state
  });
  assert.match(text, /# EXAME FÍSICO:\n- ABD: DOLOROSO EM FLANCO DIREITO/);
  assert.doesNotMatch(text, /ACV:/);
});

test('complementary exams already typed in the Evolução are reused, not retyped', () => {
  const profile = getJustificationProfile('tc-abdome-pelve');
  const text = assembleJustification(profile, 'contraste', {
    form: {
      qp: 'DOR ABDOMINAL',
      hda: 'DOR HÁ 1 DIA.',
      laboratoriais: 'PCR: 40 MG/L',
      hipoteses: 'ABDOME AGUDO INFLAMATÓRIO'
    },
    clinicalState: baseClinicalState()
  });
  assert.match(text, /# EXAMES COMPLEMENTARES:\nLABORATORIAIS:\n- PCR: 40 MG\/L/);
});

test('the request line reflects the chosen variant and only the chosen variant', () => {
  const profile = getJustificationProfile('tc-abdome-pelve');
  const comContraste = assembleJustification(profile, 'contraste', { form: {}, clinicalState: baseClinicalState() });
  const semContraste = assembleJustification(profile, 'sem-contraste', { form: {}, clinicalState: baseClinicalState() });
  assert.match(comContraste, /SOLICITO TOMOGRAFIA COMPUTADORIZADA DE ABDOME E PELVE COM CONTRASTE\./);
  assert.doesNotMatch(comContraste, /SEM CONTRASTE/);
  assert.match(semContraste, /SOLICITO TOMOGRAFIA COMPUTADORIZADA DE ABDOME E PELVE SEM CONTRASTE\./);
});

test('the internação profile uses an admission-specific header and closing line', () => {
  const profile = getJustificationProfile('internacao');
  const text = assembleJustification(profile, '', {
    form: { qp: 'DISPNEIA', hda: 'DISPNEIA PROGRESSIVA HÁ 3 DIAS.', hipoteses: 'IC DESCOMPENSADA' },
    clinicalState: baseClinicalState()
  });
  assert.match(text, /# SOLICITAÇÃO DE INTERNAÇÃO:\n- SOLICITO INTERNAÇÃO HOSPITALAR PARA CONTINUIDADE DE INVESTIGAÇÃO E CONDUTA\./);
});

test('output is always a plain editable string, never markup or a structured object', () => {
  const profile = getJustificationProfile('tc-abdome-pelve');
  const text = assembleJustification(profile, 'contraste', {
    form: { qp: 'DOR', hda: 'DOR HÁ 1 DIA.' },
    clinicalState: baseClinicalState()
  });
  assert.equal(typeof text, 'string');
  assert.doesNotMatch(text, /<[a-z]/i);
});

test('an unknown profile produces no output rather than a partially fabricated document', () => {
  assert.equal(assembleJustification(null, '', { form: {}, clinicalState: baseClinicalState() }), '');
});
