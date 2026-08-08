import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WORKFLOW_STAGES,
  createEncounter,
  transitionEncounter,
  addPendingItem,
  resolvePendingItem,
  startReassessment,
  getVisibleSections
} from '../src/workflow-engine.js';
import { SCA_PROTOCOL } from '../protocols/sca.js';

test('new encounter starts at initial assessment without inventing pending items', () => {
  const encounter = createEncounter({ workflowId: 'sca', now: '2026-08-08T10:00:00.000Z' });
  assert.equal(encounter.workflowId, 'sca');
  assert.equal(encounter.currentStage, WORKFLOW_STAGES.INITIAL_ASSESSMENT);
  assert.deepEqual(encounter.pendingItems, []);
  assert.deepEqual(encounter.reassessments, []);
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

test('progressive disclosure uses both stage and clinical context', () => {
  const withoutSuspicion = getVisibleSections(SCA_PROTOCOL, WORKFLOW_STAGES.INITIAL_ASSESSMENT, { suspectedAcs: false });
  assert.deepEqual(withoutSuspicion.map((section) => section.id), ['presentation', 'acs_context']);

  const withSuspicion = getVisibleSections(SCA_PROTOCOL, WORKFLOW_STAGES.INITIAL_ASSESSMENT, { suspectedAcs: true });
  assert.deepEqual(withSuspicion.map((section) => section.id), ['presentation', 'acs_context', 'ecg', 'troponin', 'cardiovascular_risk']);

  const pendingStage = getVisibleSections(SCA_PROTOCOL, WORKFLOW_STAGES.PENDING_RESULTS, { suspectedAcs: true });
  assert.deepEqual(pendingStage.map((section) => section.id), ['troponin']);
});
