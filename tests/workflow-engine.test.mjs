import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WORKFLOW_STAGES,
  createEncounter,
  transitionEncounter,
  addPendingItem,
  resolvePendingItem,
  startReassessment,
  getVisibleSections,
  updateEncounterContext,
  updateAdmissionSnapshot
} from '../src/workflow-engine.js';
const DISCLOSURE_FIXTURE = Object.freeze({
  id: 'fixture',
  version: '1.0.0',
  label: 'FIXTURE',
  stages: ['initial_assessment', 'pending_results', 'reassessment'],
  fields: [
    { id: 'flag', type: 'boolean', label: 'Marcador' },
    { id: 'note', type: 'textarea', label: 'Nota' },
    { id: 'result', type: 'text', label: 'Resultado' }
  ],
  sections: [
    { id: 'presentation', stage: 'initial_assessment', fields: ['note'] },
    { id: 'conditional', stages: ['initial_assessment', 'reassessment'], visibleWhen: { field: 'flag', equals: true }, fields: ['flag'] },
    { id: 'awaited', stages: ['pending_results'], visibleWhen: { field: 'flag', equals: true }, fields: ['result'] }
  ]
});

test('new encounter starts at initial assessment without inventing pending items', () => {
  const encounter = createEncounter({ workflowId: 'sca', now: '2026-08-08T10:00:00.000Z' });
  assert.equal(encounter.workflowId, 'sca');
  assert.equal(encounter.currentStage, WORKFLOW_STAGES.INITIAL_ASSESSMENT);
  assert.deepEqual(encounter.pendingItems, []);
  assert.deepEqual(encounter.reassessments, []);
  assert.deepEqual(encounter.context, {});
});

test('workflow stages progress explicitly and preserve previous stage timestamps', () => {
  const initial = createEncounter({ workflowId: 'sca', now: '2026-08-08T10:00:00.000Z' });
  const conducted = transitionEncounter(initial, WORKFLOW_STAGES.INITIAL_CONDUCT, '2026-08-08T10:05:00.000Z');
  const pending = transitionEncounter(conducted, WORKFLOW_STAGES.PENDING_RESULTS, '2026-08-08T10:10:00.000Z');
  assert.equal(pending.currentStage, WORKFLOW_STAGES.PENDING_RESULTS);
  assert.equal(pending.stageHistory[0].stage, WORKFLOW_STAGES.INITIAL_ASSESSMENT);
  assert.equal(pending.stageHistory[1].stage, WORKFLOW_STAGES.INITIAL_CONDUCT);
});

test('pending result becomes available without changing admission history', () => {
  const encounter = addPendingItem(
    createEncounter({ workflowId: 'sca', now: '2026-08-08T10:00:00.000Z' }),
    { id: 'troponin_1', kind: 'lab', label: 'Troponina', requestedAt: '2026-08-08T10:05:00.000Z' }
  );
  const resolved = resolvePendingItem(encounter, 'troponin_1', {
    value: '12 ng/L',
    availableAt: '2026-08-08T11:00:00.000Z'
  });
  assert.equal(resolved.pendingItems[0].status, 'available');
  assert.equal(resolved.pendingItems[0].result.value, '12 ng/L');
  assert.equal(encounter.pendingItems[0].status, 'pending');
});

test('reassessing creates a temporal child event without overwriting admission snapshot', () => {
  const encounter = createEncounter({
    workflowId: 'sca',
    now: '2026-08-08T10:00:00.000Z',
    admissionSnapshot: { qp: 'DOR TORÁCICA', hda: 'DOR HÁ 2 HORAS' }
  });
  const reassessed = startReassessment(encounter, '2026-08-08T11:30:00.000Z');
  assert.equal(reassessed.currentStage, WORKFLOW_STAGES.REASSESSMENT);
  assert.equal(reassessed.admissionSnapshot.hda, 'DOR HÁ 2 HORAS');
  assert.equal(reassessed.reassessments.length, 1);
  assert.equal(reassessed.reassessments[0].startedAt, '2026-08-08T11:30:00.000Z');
});

test('progressive disclosure uses both stage and declarative context, without clinical knowledge in the engine', () => {
  const withoutContext = getVisibleSections(DISCLOSURE_FIXTURE, WORKFLOW_STAGES.INITIAL_ASSESSMENT, { flag: false });
  assert.deepEqual(withoutContext.map((section) => section.id), ['presentation']);

  const withContext = getVisibleSections(DISCLOSURE_FIXTURE, WORKFLOW_STAGES.INITIAL_ASSESSMENT, { flag: true });
  assert.deepEqual(withContext.map((section) => section.id), ['presentation', 'conditional']);

  const pendingStage = getVisibleSections(DISCLOSURE_FIXTURE, WORKFLOW_STAGES.PENDING_RESULTS, { flag: true });
  assert.deepEqual(pendingStage.map((section) => section.id), ['awaited']);

  const reassessment = getVisibleSections(DISCLOSURE_FIXTURE, WORKFLOW_STAGES.REASSESSMENT, { flag: true });
  assert.deepEqual(reassessment.map((section) => section.id), ['conditional']);
});

test('workflow context is persisted as explicit state without mutating the previous encounter', () => {
  const initial = createEncounter({ workflowId: 'sca' });
  const updated = updateEncounterContext(initial, { suspectedAcs: true, troponinStatus: 'pending' });
  assert.deepEqual(initial.context, {});
  assert.deepEqual(updated.context, { suspectedAcs: true, troponinStatus: 'pending' });
});

test('admission snapshot can be refreshed before reassessment and becomes immutable afterwards', () => {
  const initial = createEncounter({ workflowId: 'sca', admissionSnapshot: { qp: 'DOR', hda: 'HDA 1' } });
  const refreshed = updateAdmissionSnapshot(initial, { qp: 'DOR TORÁCICA', hda: 'HDA FINAL DA ADMISSÃO' }, '2026-08-08T10:30:00.000Z');
  assert.equal(refreshed.admissionSnapshot.hda, 'HDA FINAL DA ADMISSÃO');
  const reassessed = startReassessment(refreshed, '2026-08-08T11:00:00.000Z');
  const attemptedRewrite = updateAdmissionSnapshot(reassessed, { qp: 'OUTRA', hda: 'NÃO DEVE SUBSTITUIR' }, '2026-08-08T11:05:00.000Z');
  assert.equal(attemptedRewrite.admissionSnapshot.hda, 'HDA FINAL DA ADMISSÃO');
});
