import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createToolState,
  evaluateToolState
} from '../src/score-engine.js';
import { HEART_TOOL } from '../protocols/sca.js';

test('tool can be available without being applicable', () => {
  const state = evaluateToolState(HEART_TOOL, createToolState(HEART_TOOL), {
    suspectedAcs: false
  });
  assert.equal(state.availability, 'available');
  assert.equal(state.applicability, 'not_applicable');
  assert.equal(state.calculability, 'not_calculable');
  assert.equal(state.score, null);
});

test('applicable HEART remains not calculable while troponin is missing', () => {
  const state = evaluateToolState(HEART_TOOL, createToolState(HEART_TOOL), {
    suspectedAcs: true,
    heartHistory: 1,
    heartEcg: 1,
    age: 52,
    heartRiskFactors: 1,
    troponinRatio: null
  });
  assert.equal(state.applicability, 'applicable');
  assert.equal(state.calculability, 'not_calculable');
  assert.deepEqual(state.missingVariables, ['troponinRatio']);
  assert.equal(state.message, 'HEART Score não calculado: troponina ainda não informada.');
});

test('HEART only calculates after all required variables are informed', () => {
  const state = evaluateToolState(HEART_TOOL, createToolState(HEART_TOOL), {
    suspectedAcs: true,
    heartHistory: 1,
    heartEcg: 1,
    age: 52,
    heartRiskFactors: 1,
    troponinRatio: 0
  });
  assert.equal(state.availability, 'available');
  assert.equal(state.applicability, 'applicable');
  assert.equal(state.calculability, 'calculable');
  assert.equal(state.status, 'complete');
  assert.equal(state.score, 4);
  assert.ok(state.interpretation);
});
