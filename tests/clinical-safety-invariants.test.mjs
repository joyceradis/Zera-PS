import test from 'node:test';
import assert from 'node:assert/strict';

import { TEMPLATES } from '../assets/templates.js';
import { composeHdaFromQp } from '../src/clinical-intake.js';

const AUTOMATIC_NEGATIVE_PATTERNS = [
  /\bNEGA\b/i,
  /\bSEM\s+(?:SINAIS?|EVID[ÊE]NCIA|D[ÉE]FICIT|EDEMA|FEBRE|DOR|DISPNEIA|HEMOPTISE|S[ÍI]NCOPE)\b/i,
  /\bAUS[ÊE]NCIA\s+DE\b/i
];

test('legacy syndrome templates never prewrite clinical negatives', () => {
  for (const template of TEMPLATES) {
    for (const pattern of AUTOMATIC_NEGATIVE_PATTERNS) {
      assert.doesNotMatch(
        template.hdaDraft || '',
        pattern,
        `${template.id} contains an unconfirmed clinical negative: ${pattern}`
      );
    }
  }
});

test('free-text HDA does not gain findings when no conditional flag was confirmed', () => {
  const qp = 'CEFALEIA HÁ 2 HORAS';
  assert.equal(composeHdaFromQp(qp, []), qp);
});

test('free-text HDA includes only explicitly selected conditional findings', () => {
  const qp = 'CEFALEIA HÁ 2 HORAS';
  const selected = ['Início súbito / pior dor'];
  const output = composeHdaFromQp(qp, selected);

  assert.match(output, /INÍCIO SÚBITO \/ PIOR DOR/i);
  assert.doesNotMatch(output, /FEBRE \/ RIGIDEZ DE NUCA/i);
  assert.doesNotMatch(output, /DÉFICIT FOCAL/i);
});
