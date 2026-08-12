import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractEncounterRecords,
  normalizeEncounterRecord,
  summarizeProductivity,
  formatPatientsPerHour
} from '../src/productivity.js';

test('invalid or missing encounter timestamps are ignored', () => {
  assert.equal(normalizeEncounterRecord(null), null);
  assert.equal(normalizeEncounterRecord({}), null);
  assert.equal(normalizeEncounterRecord({ startedAt: 'not-a-date' }), null);
});

test('encounter adapter recognizes explicit collections and the current v3 active snapshot', () => {
  assert.deepEqual(extractEncounterRecords(null), []);
  assert.deepEqual(extractEncounterRecords({ id: 'active', startedAt: '2026-08-11T18:00:00-03:00' }).map((item) => item.id), ['active']);
  assert.deepEqual(extractEncounterRecords([
    { id: 'a', startedAt: '2026-08-11T18:00:00-03:00' },
    { id: 'bad' }
  ]).map((item) => item.id), ['a']);
  assert.deepEqual(extractEncounterRecords({ encounters: [
    { id: 'b', startedAt: '2026-08-11T19:00:00-03:00' }
  ] }).map((item) => item.id), ['b']);
  assert.deepEqual(extractEncounterRecords({ activeEncounter: {
    encounterId: 'c', startedAt: '2026-08-11T20:00:00-03:00'
  }}).map((item) => item.id), ['c']);
});

test('one encounter without an explicit live clock does not fabricate a patients per hour value', () => {
  const summary = summarizeProductivity([
    { id: 'a', startedAt: '2026-08-11T18:00:00-03:00' }
  ]);
  assert.equal(summary.totalPatients, 1);
  assert.equal(summary.rate, null);
  assert.equal(formatPatientsPerHour(summary), '--');
});

test('active encounter contributes to live productivity only when caller supplies now', () => {
  const summary = summarizeProductivity([
    { id: 'a', startedAt: '2026-08-11T18:00:00-03:00' }
  ], { now: '2026-08-11T18:30:00-03:00' });
  assert.equal(summary.totalPatients, 1);
  assert.equal(summary.durationHours, 0.5);
  assert.equal(summary.rate, 2);
  assert.equal(formatPatientsPerHour(summary), '2,0');
});

test('mixed completed and unfinished encounters require an explicit live clock for an implicit shift end', () => {
  const records = [
    { id: 'a', startedAt: '2026-08-11T18:00:00-03:00', finishedAt: '2026-08-11T18:30:00-03:00' },
    { id: 'b', startedAt: '2026-08-11T19:00:00-03:00' }
  ];
  const passive = summarizeProductivity(records);
  assert.equal(passive.totalPatients, 2);
  assert.equal(passive.durationHours, null);
  assert.equal(passive.rate, null);
  const live = summarizeProductivity(records, { now: '2026-08-11T20:00:00-03:00' });
  assert.equal(live.durationHours, 2);
  assert.equal(live.rate, 1);
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
