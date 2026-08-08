import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createClinicalField,
  confirmDenied,
  confirmReported,
  confirmObserved,
  confirmTemplate,
  canRenderClinicalField
} from '../assets/clinical-state.js';

test('new clinical field starts unconfirmed and does not authorize rendering', () => {
  const field = createClinicalField();
  assert.deepEqual(field, {
    value: null,
    state: 'not_informed',
    source: null,
    confirmed: false,
    confirmedAt: null
  });
  assert.equal(canRenderClinicalField(field), false);
});

test('explicit denial records physician intent without inventing a value', () => {
  const field = confirmDenied(createClinicalField(), { source: 'patient', confirmedAt: '2026-08-08T12:00:00.000Z' });
  assert.equal(field.value, null);
  assert.equal(field.state, 'denied');
  assert.equal(field.source, 'patient');
  assert.equal(field.confirmed, true);
  assert.equal(field.confirmedAt, '2026-08-08T12:00:00.000Z');
  assert.equal(canRenderClinicalField(field), true);
});

test('reported information preserves value and patient provenance', () => {
  const field = confirmReported(createClinicalField(), 'DIPIRONA', { confirmedAt: '2026-08-08T12:00:00.000Z' });
  assert.equal(field.value, 'DIPIRONA');
  assert.equal(field.state, 'present');
  assert.equal(field.source, 'patient');
  assert.equal(field.confirmed, true);
});

test('observed information is distinguished from patient report', () => {
  const field = confirmObserved(createClinicalField(), 'SIBILOS', { confirmedAt: '2026-08-08T12:00:00.000Z' });
  assert.equal(field.value, 'SIBILOS');
  assert.equal(field.state, 'present');
  assert.equal(field.source, 'physician_observation');
  assert.equal(field.confirmed, true);
});

test('confirmed template records explicit physician action and template identity', () => {
  const exam = confirmTemplate('normal_exam_v1', { acv: 'RCR, 2T, BNF, SEM SOPROS' }, { confirmedAt: '2026-08-08T12:00:00.000Z' });
  assert.equal(exam.templateId, 'normal_exam_v1');
  assert.equal(exam.state, 'template_confirmed');
  assert.equal(exam.source, 'physician_action');
  assert.equal(exam.confirmed, true);
  assert.equal(exam.confirmedAt, '2026-08-08T12:00:00.000Z');
});
