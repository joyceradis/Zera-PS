import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SCA_PROTOCOL } from '../protocols/sca.js';
import { getField, getTool, resolveToolVariables } from '../src/protocol-engine.js';
import { createToolState, evaluateToolState, setToolApplied } from '../src/score-engine.js';
import { renderScores } from '../src/document-engine.js';

const HEART = getTool(SCA_PROTOCOL, 'heart');

function heartState(context) {
  return evaluateToolState(HEART, createToolState(HEART), resolveToolVariables(HEART, context));
}

const COMPLETE_CONTEXT = Object.freeze({
  suspectedAcs: true,
  heartHistory: 1,
  heartEcg: 0,
  heartAge: 50,
  heartRisk: 1,
  troponinStatus: 'available',
  troponinRatio: 0.8
});

test('SCA declares as configuration every field previously hard-coded in the interface', () => {
  const declared = SCA_PROTOCOL.fields.map((field) => field.id);
  for (const id of ['suspectedAcs', 'ecgStatus', 'ecgResult', 'troponinStatus', 'troponinValue', 'troponinRatio', 'heartHistory', 'heartEcg', 'heartAge', 'heartRisk']) {
    assert.ok(declared.includes(id), `campo ausente na configuração: ${id}`);
  }
  assert.equal(getField(SCA_PROTOCOL, 'ecgResult').visibleWhen.equals, 'available');
  assert.equal(getField(SCA_PROTOCOL, 'qp').source, 'evolution_form');
});

test('SCA configuration does not manipulate the DOM', async () => {
  const source = await readFile('protocols/sca.js', 'utf8');
  assert.doesNotMatch(source, /document\.|getElementById|querySelector|addEventListener/);
});

test('HEART remains available for the scenario but not applicable without clinical suspicion', () => {
  const state = heartState({ ...COMPLETE_CONTEXT, suspectedAcs: false });
  assert.equal(state.availability, 'available');
  assert.equal(state.applicability, 'not_applicable');
  assert.equal(state.score, null);
});

test('incomplete HEART produces no score and no document line', () => {
  const state = heartState({ ...COMPLETE_CONTEXT, troponinStatus: 'pending' });
  assert.equal(state.calculability, 'not_calculable');
  assert.equal(state.score, null);
  assert.deepEqual(state.missingVariables, ['troponinRatio']);
  assert.equal(state.message, 'HEART Score não calculado: troponina ainda não informada.');
  assert.deepEqual(renderScores([state]), []);
});

test('calculable HEART stays out of the document until explicitly applied', () => {
  const calculable = heartState(COMPLETE_CONTEXT);
  assert.equal(calculable.calculability, 'calculable');
  assert.equal(calculable.score, 3);
  assert.equal(calculable.interpretation, 'BAIXO RISCO');
  assert.deepEqual(renderScores([calculable]), []);

  const applied = setToolApplied(calculable, true, '2026-08-08T12:00:00.000Z');
  assert.deepEqual(renderScores([applied]), ['# SCORES:', '- HEART: 3 PONTOS — BAIXO RISCO']);
});

test('SCA declares ECG and troponin as temporal results with pending and available rules', () => {
  const declarations = Object.fromEntries(SCA_PROTOCOL.temporalResults.map((item) => [item.id, item]));
  assert.deepEqual(Object.keys(declarations), ['ecg_initial', 'troponin_1']);
  assert.equal(declarations.ecg_initial.kind, 'ecg');
  assert.equal(declarations.ecg_initial.pendingWhen.equals, 'pending');
  assert.equal(declarations.ecg_initial.availableWhen.equals, 'available');
  assert.equal(declarations.troponin_1.kind, 'troponin');
  assert.deepEqual(declarations.troponin_1.payload, { value: 'troponinValue', ratio: 'troponinRatio' });
});

test('SCA workup sections stay pertinent across the temporal stages of the same encounter', () => {
  const workup = SCA_PROTOCOL.sections.filter((section) => ['ecg', 'troponin', 'cardiovascular_risk'].includes(section.id));
  for (const section of workup) {
    assert.deepEqual(section.stages, SCA_PROTOCOL.stages, `seção ${section.id} deve permanecer visível ao longo do atendimento`);
    assert.deepEqual(section.visibleWhen, { field: 'suspectedAcs', equals: true });
  }
});
