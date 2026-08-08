import test from 'node:test';
import assert from 'node:assert/strict';
import { SCORE_DEFINITIONS, createScoreState, answerScore, calculateScore, calculateGlasgow } from '../assets/scores.js';

test('score starts incomplete with null score and unanswered variables', () => {
  const state = createScoreState(SCORE_DEFINITIONS.crb65);
  assert.equal(state.status, 'incomplete');
  assert.equal(state.score, null);
  assert.equal(Object.values(state.answers).every((value) => value === null), true);
});

test('partially answered score remains incomplete and has no interpretation', () => {
  let state = createScoreState(SCORE_DEFINITIONS.qsofa);
  state = answerScore(state, 'respiratory_rate', true);
  const result = calculateScore(SCORE_DEFINITIONS.qsofa, state);
  assert.equal(result.status, 'incomplete');
  assert.equal(result.score, null);
  assert.equal(result.interpretation, null);
});

test('complete binary score calculates only after every variable is answered', () => {
  let state = createScoreState(SCORE_DEFINITIONS.qsofa);
  state = answerScore(state, 'respiratory_rate', true);
  state = answerScore(state, 'systolic_bp', false);
  state = answerScore(state, 'altered_consciousness', false);
  const result = calculateScore(SCORE_DEFINITIONS.qsofa, state);
  assert.equal(result.status, 'complete');
  assert.equal(result.score, 1);
  assert.match(result.interpretation, /Pontuação baixa/i);
});

test('Glasgow is incomplete until all three components are informed', () => {
  const result = calculateGlasgow({ eye: 4, verbal: null, motor: 6 });
  assert.deepEqual(result, { status: 'incomplete', score: null, interpretation: null });
});

test('Glasgow calculates after all components are informed', () => {
  const result = calculateGlasgow({ eye: 4, verbal: 5, motor: 6 });
  assert.equal(result.status, 'complete');
  assert.equal(result.score, 15);
});
