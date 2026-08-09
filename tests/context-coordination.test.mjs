import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTEXT_DECISIONS,
  isTemplateWorkflowCompatible,
  hasSignificantEncounter,
  decideTemplateSelection,
  decideWorkflowSelection
} from '../src/context-coordination.js';

const emptyScaEncounter = () => ({
  workflowId: 'sca',
  currentStage: 'initial_assessment',
  context: { suspectedAcs: false, appliedTools: { heart: { applied: false, appliedAt: null } } },
  admissionSnapshot: {},
  stageHistory: [{ stage: 'initial_assessment', enteredAt: '2026-08-09T00:00:00.000Z' }],
  pendingItems: [],
  results: [],
  reassessments: [],
  documents: []
});

test('template compatibility depends only on explicit protocol metadata, never on QP text', () => {
  assert.equal(isTemplateWorkflowCompatible({ templateId: 'rinossinusite', protocolId: null }, 'sca'), false);
  assert.equal(isTemplateWorkflowCompatible({ templateId: 'sca-route', protocolId: 'sca' }, 'sca'), true);
  assert.equal(isTemplateWorkflowCompatible({ templateId: 'rinossinusite', protocolId: null, qp: 'DOR TORÁCICA' }, 'sca'), false);
  assert.equal(isTemplateWorkflowCompatible(null, 'sca'), true);
});

test('fresh workflow defaults are not mistaken for significant clinical state', () => {
  assert.equal(hasSignificantEncounter(emptyScaEncounter()), false);
  assert.equal(hasSignificantEncounter({ ...emptyScaEncounter(), context: { suspectedAcs: true } }), true);
  assert.equal(hasSignificantEncounter({ ...emptyScaEncounter(), pendingItems: [{ id: 'troponin' }] }), true);
  assert.equal(hasSignificantEncounter({ ...emptyScaEncounter(), admissionSnapshot: { qp: 'DOR' } }), true);
});

test('incompatible template clears an empty workflow without confirmation', () => {
  const decision = decideTemplateSelection({
    templateSelection: { templateId: 'rinossinusite', protocolId: null },
    workflowId: 'sca',
    encounter: emptyScaEncounter()
  });
  assert.deepEqual(decision, { status: CONTEXT_DECISIONS.ALLOW, clearWorkflow: true });
});

test('incompatible template requires confirmation before clearing significant workflow state', () => {
  const input = {
    templateSelection: { templateId: 'rinossinusite', protocolId: null },
    workflowId: 'sca',
    encounter: { ...emptyScaEncounter(), context: { suspectedAcs: true } }
  };
  assert.deepEqual(decideTemplateSelection(input), {
    status: CONTEXT_DECISIONS.CONFIRM,
    clearWorkflow: false
  });
  assert.deepEqual(decideTemplateSelection({ ...input, confirmed: false }), {
    status: CONTEXT_DECISIONS.CANCEL,
    clearWorkflow: false
  });
  assert.deepEqual(decideTemplateSelection({ ...input, confirmed: true }), {
    status: CONTEXT_DECISIONS.ALLOW,
    clearWorkflow: true
  });
});

test('workflow selection clears an incompatible template only after document-safe confirmation', () => {
  const input = {
    workflowId: 'sca',
    templateSelection: { templateId: 'rinossinusite', protocolId: null },
    hasDocumentContent: true,
    selectionKnown: true
  };
  assert.equal(decideWorkflowSelection(input).status, CONTEXT_DECISIONS.CONFIRM);
  assert.deepEqual(decideWorkflowSelection({ ...input, confirmed: false }), {
    status: CONTEXT_DECISIONS.CANCEL,
    clearTemplate: false
  });
  assert.deepEqual(decideWorkflowSelection({ ...input, confirmed: true }), {
    status: CONTEXT_DECISIONS.ALLOW,
    clearTemplate: true
  });
});

test('legacy reload with document content and unknown template relation requires reconciliation', () => {
  const decision = decideWorkflowSelection({
    workflowId: 'sca',
    templateSelection: null,
    hasDocumentContent: true,
    selectionKnown: false,
    restoring: true
  });
  assert.deepEqual(decision, { status: CONTEXT_DECISIONS.CONFIRM, clearTemplate: false });
});
