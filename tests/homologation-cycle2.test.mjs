import test from 'node:test';
import assert from 'node:assert/strict';
import { matchTriggerGroups, composeHdaFromQp } from '../src/clinical-intake.js';
import { formatImageReport, formatLines } from '../src/text-formatters.js';
import { extractEncounterRecords, summarizeProductivity } from '../src/productivity.js';

test('keyword matching returns the configured group', () => {
  assert.deepEqual(matchTriggerGroups('cefaleia').map((item) => item.id), ['headache']);
  assert.deepEqual(matchTriggerGroups('tosse').map((item) => item.id), ['respiratory']);
});

test('free text stays primary and selected flags are appended explicitly', () => {
  assert.equal(composeHdaFromQp('texto livre', []), 'texto livre');
  assert.equal(composeHdaFromQp('texto livre', ['Alerta']), 'texto livre. SINAIS DE ALERTA PRESENTES: Alerta.');
});

test('formatters normalize output deterministically', () => {
  assert.equal(formatImageReport('linha um\nlinha dois'), 'LINHA UM LINHA DOIS');
  assert.equal(formatLines('linha um\nlinha dois'), '- LINHA UM\n- LINHA DOIS');
});

test('single active snapshot is recognized and contributes to live rate', () => {
  const records = extractEncounterRecords({ encounterId: 'enc-1', startedAt: '2026-08-12T00:00:00.000Z' });
  assert.equal(records.length, 1);
  assert.equal(records[0].id, 'enc-1');
  const summary = summarizeProductivity(records, { now: '2026-08-12T00:30:00.000Z' });
  assert.equal(summary.totalPatients, 1);
  assert.equal(summary.durationHours, 0.5);
  assert.equal(summary.rate, 2);
});
