import test from 'node:test';
import assert from 'node:assert/strict';
import { renderScores } from '../src/document-engine.js';

test('calculable but unapplied tool stays out of the clinical document', () => {
  const lines = renderScores([{ id: 'heart', label: 'HEART', applicability: 'applicable', calculability: 'calculable', applied: false, score: 3, interpretation: 'BAIXO RISCO' }]);
  assert.deepEqual(lines, []);
});

test('explicitly applied calculable tool renders under scores', () => {
  const lines = renderScores([{ id: 'heart', label: 'HEART', applicability: 'applicable', calculability: 'calculable', applied: true, score: 3, interpretation: 'BAIXO RISCO' }]);
  assert.deepEqual(lines, ['# SCORES:', '- HEART: 3 PONTOS — BAIXO RISCO']);
});
