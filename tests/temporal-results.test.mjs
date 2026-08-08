import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEncounter,
  addClinicalResult,
  getClinicalResults,
  addPendingItem,
  resolvePendingItem
} from '../src/workflow-engine.js';
import { createToolState, evaluateToolState, setToolApplied } from '../src/score-engine.js';
import { HEART_TOOL } from '../protocols/sca.js';

test('serial clinical results are append-only and preserve collection chronology', () => {
  const encounter = createEncounter({ workflowId: 'sca', now: '2026-08-08T10:00:00.000Z' });
  const first = addClinicalResult(encounter, {
    id: 'trop-0h', kind: 'troponin', value: 12, collectedAt: '2026-08-08T10:10:00.000Z', availableAt: '2026-08-08T10:40:00.000Z'
  });
  const second = addClinicalResult(first, {
    id: 'trop-2h', kind: 'troponin', value: 18, collectedAt: '2026-08-08T12:10:00.000Z', availableAt: '2026-08-08T12:40:00.000Z'
  });
  assert.equal(encounter.results.length, 0);
  assert.deepEqual(getClinicalResults(second, 'troponin').map((result) => result.id), ['trop-0h', 'trop-2h']);
  assert.equal(getClinicalResults(second, 'troponin')[0].value, 12);
});

test('resolving a pending result records a temporal result without overwriting the request', () => {
  const pending = addPendingItem(createEncounter({ workflowId: 'sca' }), {
    id: 'troponin_1', kind: 'troponin', label: 'Troponina', requestedAt: '2026-08-08T10:05:00.000Z'
  });
  const resolved = resolvePendingItem(pending, 'troponin_1', {
    value: 12, collectedAt: '2026-08-08T10:10:00.000Z', availableAt: '2026-08-08T10:40:00.000Z'
  });
  assert.equal(resolved.pendingItems[0].requestedAt, '2026-08-08T10:05:00.000Z');
  assert.equal(resolved.results.length, 1);
  assert.equal(resolved.results[0].kind, 'troponin');
  assert.equal(resolved.results[0].sourcePendingItemId, 'troponin_1');
});

test('re-resolving the same pending item updates its linked result instead of duplicating chronology', () => {
  const pending = addPendingItem(createEncounter({ workflowId: 'sca' }), { id: 'troponin_1', kind: 'troponin', label: 'Troponina' });
  const first = resolvePendingItem(pending, 'troponin_1', { value: 12, availableAt: '2026-08-08T10:40:00.000Z' });
  const second = resolvePendingItem(first, 'troponin_1', { value: 13, availableAt: '2026-08-08T10:41:00.000Z' });
  assert.equal(second.results.length, 1);
  assert.equal(second.results[0].value, 13);
});

test('calculable tool is not automatically applied to documentation', () => {
  const context = { suspectedAcs: true, heartHistory: 1, heartEcg: 0, age: 50, heartRiskFactors: 1, troponinRatio: 0.8 };
  const calculated = evaluateToolState(HEART_TOOL, createToolState(HEART_TOOL), context);
  assert.equal(calculated.calculability, 'calculable');
  assert.equal(calculated.applied, false);
  const applied = setToolApplied(calculated, true, '2026-08-08T12:00:00.000Z');
  assert.equal(applied.applied, true);
  assert.equal(applied.appliedAt, '2026-08-08T12:00:00.000Z');
  assert.equal(calculated.applied, false);
});
