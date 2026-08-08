import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES } from '../assets/templates.js';

test('syndrome templates do not preconfirm clinical negatives', () => {
  for (const template of TEMPLATES) {
    const serialized = JSON.stringify(template).toUpperCase();
    assert.equal(serialized.includes('NEGA '), false, `${template.id} contains a preconfirmed negative`);
  }
});

test('templates do not inject diagnosis or conduct into the medical record', () => {
  for (const template of TEMPLATES) {
    assert.equal('hipoteses' in template, false, `${template.id} should not prefill hypotheses`);
    assert.equal('conduta' in template, false, `${template.id} should not prefill conduct`);
  }
});

test('headache template links SNNOOP10 as a structured clinical tool', () => {
  const headache = TEMPLATES.find((template) => template.id === 'cefaleia');
  assert.equal(headache.clinicalTools.includes('snnoop10'), true);
});
