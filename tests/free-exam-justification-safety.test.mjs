import test from 'node:test';
import assert from 'node:assert/strict';
import { createClinicalField } from '../assets/clinical-state.js';
import { assembleFreeExamJustification } from '../src/justification-engine.js';

function emptyClinicalState() {
  return {
    hpp: {},
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

test('free exam justification never fabricates urgency, immediate conduct, or severe complications', () => {
  const text = assembleFreeExamJustification('', {
    form: {},
    clinicalState: emptyClinicalState()
  });

  assert.match(text, /\[COMPLETAR: NOME DO EXAME\]/);
  assert.match(text, /\[COMPLETAR: QUADRO CLÍNICO\]/);
  assert.match(text, /\[COMPLETAR: ACHADOS RELEVANTES DO EXAME FÍSICO\]/);
  assert.match(text, /\[COMPLETAR: HIPÓTESE DIAGNÓSTICA\]/);

  assert.doesNotMatch(text, /EM CARÁTER DE URGÊNCIA/);
  assert.doesNotMatch(text, /CONDUTA IMEDIATA/);
  assert.doesNotMatch(text, /COMPLICAÇÕES POTENCIALMENTE GRAVES/);
});

test('free exam justification remains conservative even when clinical fields are populated', () => {
  const text = assembleFreeExamJustification('TC DE ABDOME', {
    form: {
      qp: 'DOR ABDOMINAL',
      hda: 'DOR ABDOMINAL HÁ 6 HORAS',
      hipoteses: 'ABDOME AGUDO'
    },
    clinicalState: emptyClinicalState()
  });

  assert.match(text, /SOLICITO TC DE ABDOME/);
  assert.match(text, /ABDOME AGUDO/);
  assert.doesNotMatch(text, /EM CARÁTER DE URGÊNCIA/);
  assert.doesNotMatch(text, /CONDUTA IMEDIATA/);
  assert.doesNotMatch(text, /COMPLICAÇÕES POTENCIALMENTE GRAVES/);
});
