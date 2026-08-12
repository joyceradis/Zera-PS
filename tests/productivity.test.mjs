import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeEncounterRecord,
  summarizeProductivity,
  formatPatientsPerHour
} from '../src/productivity.js';

test('invalid or missing encounter timestamps are ignored', () => {
  assert.equal(normalizeEncounterRecord(null), null);
  assert.equal(normalizeEncounterRecord({}), null);
  assert.equal(normalizeEncounterRecord({ startedAt: 'not-a-date' }), null);
});

test('one encounter without a measurable shift duration never fabricates a patients per hour value', () => {
  const summary = summarizeProductivity([
    { id: 'a', startedAt: '2026-08-11T18:00:00-03:00' }
  ]);
  assert.equal(summary.totalPatients, 1);
  assert.equal(summary.rate, null);
  assert.equal(formatPatientsPerHour(summary), '--');
});

test('completed encounters define a deterministic productivity window', () => {
  const summary = summarizeProductivity([
    { id: 'a', startedAt: '2026-08-11T18:00:00-03:00', finishedAt: '2026-08-11T18:30:00-03:00' },
    { id: 'b', startedAt: '2026-08-11T18:40:00-03:00', finishedAt: '2026-08-11T19:00:00-03:00' },
    { id: 'c', startedAt: '2026-08-11T19:10:00-03:00', finishedAt: '2026-08-11T19:30:00-03:00' }
  ]);
  assert.equal(summary.totalPatients, 3);
  assert.equal(summary.durationHours, 1.5);
  assert.equal(summary.rate, 2);
  assert.equal(formatPatientsPerHour(summary), '2,0');
});

test('explicit shift range filters encounters and calculates rate from the requested interval', () => {
  const summary = summarizeProductivity([
    { id: 'before', startedAt: '2026-08-11T16:00:00-03:00', finishedAt: '2026-08-11T16:10:00-03:00' },
    { id: 'a', startedAt: '2026-08-11T18:10:00-03:00', finishedAt: '2026-08-11T18:20:00-03:00' },
    { id: 'b', startedAt: '2026-08-11T19:30:00-03:00', finishedAt: '2026-08-11T19:45:00-03:00' }
  ], {
    rangeStart: '2026-08-11T18:00:00-03:00',
    rangeEnd: '2026-08-11T20:00:00-03:00'
  });
  assert.equal(summary.totalPatients, 2);
  assert.equal(summary.durationHours, 2);
  assert.equal(summary.rate, 1);
});

test('zero or negative duration returns no numeric productivity rate', () => {
  const summary = summarizeProductivity([
    { id: 'a', startedAt: '2026-08-11T18:00:00-03:00', finishedAt: '2026-08-11T18:00:00-03:00' }
  ], {
    rangeStart: '2026-08-11T18:00:00-03:00',
    rangeEnd: '2026-08-11T18:00:00-03:00'
  });
  assert.equal(summary.rate, null);
  assert.equal(formatPatientsPerHour(summary), '--');
});
