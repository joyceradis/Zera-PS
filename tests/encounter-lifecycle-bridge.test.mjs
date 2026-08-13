import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  createEncounter,
  ensureEncounterStarted,
  attachWorkflow
} from '../src/workflow-engine.js';

test('clinical activity can start a protocol-agnostic encounter without inventing a workflow', () => {
  const encounter = ensureEncounterStarted(null, {
    now: '2026-08-13T03:00:00.000Z',
    admissionSnapshot: { qp: 'CEFALEIA', hda: 'CEFALEIA HÁ 2 HORAS' }
  });

  assert.equal(encounter.workflowId, null);
  assert.equal(encounter.startedAt, '2026-08-13T03:00:00.000Z');
  assert.equal(encounter.admissionSnapshot.qp, 'CEFALEIA');
});

test('starting activity is idempotent for an encounter already in progress', () => {
  const current = createEncounter({ workflowId: null, now: '2026-08-13T03:00:00.000Z' });
  const next = ensureEncounterStarted(current, { now: '2026-08-13T03:05:00.000Z' });
  assert.equal(next, current);
});

test('a workflow can be attached later without replacing the encounter identity or admission history', () => {
  const current = createEncounter({
    workflowId: null,
    now: '2026-08-13T03:00:00.000Z',
    admissionSnapshot: { qp: 'DOR TORÁCICA' }
  });
  const next = attachWorkflow(current, 'sca');

  assert.equal(next.encounterId, current.encounterId);
  assert.equal(next.startedAt, current.startedAt);
  assert.deepEqual(next.admissionSnapshot, current.admissionSnapshot);
  assert.equal(next.workflowId, 'sca');
});

test('attaching a different workflow over an existing workflow is rejected', () => {
  const current = createEncounter({ workflowId: 'sca' });
  assert.throws(() => attachWorkflow(current, 'outro'), /already has workflow/i);
});

test('temporal owner starts encounters from clinical form activity and clears them on form reset', async () => {
  const temporalSource = await readFile(new URL('../src/temporal-ui.js', import.meta.url), 'utf8');

  assert.match(temporalSource, /ensureEncounterStarted/);
  assert.match(temporalSource, /function handleClinicalActivity/);
  assert.match(temporalSource, /\$\('evolution-form'\)\?\.addEventListener\('input', handleClinicalActivity\)/);
  assert.match(temporalSource, /\$\('evolution-form'\)\?\.addEventListener\('reset', handleDocumentationReset\)/);
});
