import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRenderPlan,
  defaultContext,
  deriveTemporalOperations,
  resolveToolVariables,
  readPersistedToolApplication,
  applyPersistedToolIntent,
  serializeToolApplications,
  getTool
} from '../src/protocol-engine.js';
import { createToolState, evaluateToolState, setToolApplied } from '../src/score-engine.js';
import { SCA_PROTOCOL } from '../protocols/sca.js';

const HEART = getTool(SCA_PROTOCOL, 'heart');
const visibleSections = (plan) => plan.filter((section) => section.visible && section.renderable).map((section) => section.id);
const visibleFields = (plan, sectionId) => plan.find((section) => section.id === sectionId)?.fields.filter((field) => field.visible).map((field) => field.id);

test('render plan honours stage and clinical context together', () => {
  const withoutSuspicion = buildRenderPlan(SCA_PROTOCOL, {
    stage: 'initial_assessment',
    context: { suspectedAcs: false }
  });
  assert.deepEqual(visibleSections(withoutSuspicion), ['acs_context']);

  const withSuspicion = buildRenderPlan(SCA_PROTOCOL, {
    stage: 'initial_assessment',
    context: { suspectedAcs: true }
  });
  assert.deepEqual(visibleSections(withSuspicion), ['acs_context', 'ecg', 'troponin', 'cardiovascular_risk']);
});

test('context change recalculates field level disclosure without touching stored data', () => {
  const pendingEcg = buildRenderPlan(SCA_PROTOCOL, {
    stage: 'initial_assessment',
    context: { suspectedAcs: true, ecgStatus: 'pending' }
  });
  assert.deepEqual(visibleFields(pendingEcg, 'ecg'), ['ecgStatus']);

  const availableEcg = buildRenderPlan(SCA_PROTOCOL, {
    stage: 'initial_assessment',
    context: { suspectedAcs: true, ecgStatus: 'available' }
  });
  assert.deepEqual(visibleFields(availableEcg, 'ecg'), ['ecgStatus', 'ecgResult']);

  const availableTroponin = buildRenderPlan(SCA_PROTOCOL, {
    stage: 'pending_results',
    context: { suspectedAcs: true, troponinStatus: 'available' }
  });
  assert.deepEqual(visibleFields(availableTroponin, 'troponin'), ['troponinStatus', 'troponinValue', 'troponinRatio']);
});

test('sections owned by the evolution form are not rendered by the protocol layer', () => {
  const plan = buildRenderPlan(SCA_PROTOCOL, { stage: 'initial_assessment', context: { suspectedAcs: true } });
  assert.equal(plan.find((section) => section.id === 'presentation').renderable, false);
});

test('default context exposes only protocol owned fields and never invents values', () => {
  const context = defaultContext(SCA_PROTOCOL);
  assert.equal(context.qp, undefined);
  assert.equal(context.suspectedAcs, false);
  assert.equal(context.ecgStatus, 'not_informed');
  assert.equal(context.heartAge, null);
  assert.equal(context.heartHistory, '');
});

test('tool variables resolve through declared bindings and availability gates', () => {
  const withoutResult = resolveToolVariables(HEART, {
    suspectedAcs: true,
    heartHistory: 1,
    heartEcg: 1,
    heartAge: 52,
    heartRisk: 1,
    troponinStatus: 'pending',
    troponinRatio: 2
  });
  assert.equal(withoutResult.age, 52);
  assert.equal(withoutResult.heartRiskFactors, 1);
  assert.equal(withoutResult.troponinRatio, null);

  const withResult = resolveToolVariables(HEART, {
    suspectedAcs: true,
    troponinStatus: 'available',
    troponinRatio: 2
  });
  assert.equal(withResult.troponinRatio, 2);
});

test('temporal operations are derived from the protocol declaration', () => {
  assert.deepEqual(deriveTemporalOperations(SCA_PROTOCOL, { ecgStatus: 'pending', troponinStatus: 'not_informed' }), [
    { id: 'ecg_initial', kind: 'ecg', label: 'ECG', action: 'pending' }
  ]);

  assert.deepEqual(deriveTemporalOperations(SCA_PROTOCOL, {
    ecgStatus: 'not_informed',
    troponinStatus: 'available',
    troponinValue: '12 ng/L',
    troponinRatio: 0.8
  }), [
    { id: 'troponin_1', kind: 'troponin', label: 'Troponina', action: 'available', payload: { value: '12 ng/L', ratio: 0.8 } }
  ]);

  assert.deepEqual(deriveTemporalOperations(SCA_PROTOCOL, { ecgStatus: 'not_informed', troponinStatus: 'not_informed' }), []);
});

test('persisted application intent is read from current and legacy context shapes', () => {
  assert.deepEqual(readPersistedToolApplication({ appliedTools: { heart: { applied: true, appliedAt: '2026-08-08T12:00:00.000Z' } } }, 'heart'), {
    applied: true,
    appliedAt: '2026-08-08T12:00:00.000Z'
  });
  assert.deepEqual(readPersistedToolApplication({ heartApplied: true }, 'heart'), { applied: true, appliedAt: null });
  assert.equal(readPersistedToolApplication({}, 'heart'), null);
});

test('reload never fabricates a clinical score from persisted intent alone', () => {
  const incomplete = evaluateToolState(HEART, createToolState(HEART), resolveToolVariables(HEART, {
    suspectedAcs: true,
    heartHistory: 1,
    heartEcg: 1,
    heartAge: 52,
    heartRisk: 1,
    troponinStatus: 'pending'
  }));
  const restored = applyPersistedToolIntent(incomplete, { applied: true, appliedAt: '2026-08-08T12:00:00.000Z' });
  assert.equal(restored.applied, false);
  assert.equal(restored.score, null);
  assert.equal(restored.calculability, 'not_calculable');
});

test('persisted application is restored only for calculable tools', () => {
  const calculable = evaluateToolState(HEART, createToolState(HEART), resolveToolVariables(HEART, {
    suspectedAcs: true,
    heartHistory: 1,
    heartEcg: 0,
    heartAge: 50,
    heartRisk: 1,
    troponinStatus: 'available',
    troponinRatio: 0.8
  }));
  assert.equal(calculable.applied, false);
  const restored = applyPersistedToolIntent(calculable, { applied: true, appliedAt: '2026-08-08T12:00:00.000Z' });
  assert.equal(restored.applied, true);
  assert.equal(restored.appliedAt, '2026-08-08T12:00:00.000Z');
  assert.equal(applyPersistedToolIntent(calculable, { applied: false }).applied, false);
});

test('tool application state is serialized per tool id for persistence', () => {
  const state = setToolApplied(evaluateToolState(HEART, createToolState(HEART), resolveToolVariables(HEART, {
    suspectedAcs: true,
    heartHistory: 1,
    heartEcg: 0,
    heartAge: 50,
    heartRisk: 1,
    troponinStatus: 'available',
    troponinRatio: 0.8
  })), true, '2026-08-08T12:00:00.000Z');
  assert.deepEqual(serializeToolApplications([state]), {
    heart: { applied: true, appliedAt: '2026-08-08T12:00:00.000Z' }
  });
});
