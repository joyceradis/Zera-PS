import test from 'node:test';
import assert from 'node:assert/strict';

import { TEMPLATES } from '../assets/templates.js';

const AUTOMATIC_NEGATIVE_PATTERNS = [
  /\bNEGA\b/i,
  /\bSEM\s+(?:SINAIS?|EVID[ÊE]NCIA|D[ÉE]FICIT|EDEMA|FEBRE|DOR|DISPNEIA|HEMOPTISE|S[ÍI]NCOPE)\b/i,
  /\bAUS[ÊE]NCIA\s+DE\b/i
];

test('syndrome templates do not preconfirm clinical negatives', () => {
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
