import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTEXT_DECISIONS,
  isTemplateWorkflowCompatible,
  hasSignificantEncounter,
  isTemplateBoilerplateQp,
  hasFormContentBeyondTemplate,
  decideEncounterReplacement,
  decideTemplateSelection,
  decideTemplateReplacement,
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

test('significant workflow cannot be replaced or cleared without explicit confirmation', () => {
  const input = {
    currentWorkflowId: 'sca',
    nextWorkflowId: '',
    encounter: { ...emptyScaEncounter(), pendingItems: [{ id: 'troponin' }] }
  };
  assert.deepEqual(decideEncounterReplacement(input), {
    status: CONTEXT_DECISIONS.CONFIRM,
    replaceEncounter: false
  });
  assert.deepEqual(decideEncounterReplacement({ ...input, confirmed: false }), {
    status: CONTEXT_DECISIONS.CANCEL,
    replaceEncounter: false
  });
  assert.deepEqual(decideEncounterReplacement({ ...input, confirmed: true }), {
    status: CONTEXT_DECISIONS.ALLOW,
    replaceEncounter: true
  });
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
    encounter: emptyScaEncounter(),
    hasDocumentContent: false
  });
  assert.deepEqual(decision, {
    status: CONTEXT_DECISIONS.ALLOW,
    clearWorkflow: true,
    resetDocument: false
  });
});

test('incompatible template requires confirmation before clearing significant workflow state', () => {
  const input = {
    templateSelection: { templateId: 'rinossinusite', protocolId: null },
    workflowId: 'sca',
    encounter: { ...emptyScaEncounter(), context: { suspectedAcs: true } },
    hasDocumentContent: true
  };
  assert.deepEqual(decideTemplateSelection(input), {
    status: CONTEXT_DECISIONS.CONFIRM,
    clearWorkflow: false,
    resetDocument: false
  });
  assert.deepEqual(decideTemplateSelection({ ...input, confirmed: false }), {
    status: CONTEXT_DECISIONS.CANCEL,
    clearWorkflow: false,
    resetDocument: false
  });
  assert.deepEqual(decideTemplateSelection({ ...input, confirmed: true }), {
    status: CONTEXT_DECISIONS.ALLOW,
    clearWorkflow: true,
    resetDocument: true
  });
});

test('template switch with documentation starts from a clean surface only after confirmation', () => {
  const input = {
    templateSelection: { templateId: 'rinossinusite', protocolId: null },
    workflowId: 'sca',
    encounter: emptyScaEncounter(),
    hasDocumentContent: true
  };
  assert.deepEqual(decideTemplateSelection(input), {
    status: CONTEXT_DECISIONS.CONFIRM,
    clearWorkflow: false,
    resetDocument: false
  });
  assert.deepEqual(decideTemplateSelection({ ...input, confirmed: true }), {
    status: CONTEXT_DECISIONS.ALLOW,
    clearWorkflow: true,
    resetDocument: true
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
    clearTemplate: false,
    resetDocument: false
  });
  assert.deepEqual(decideWorkflowSelection({ ...input, confirmed: true }), {
    status: CONTEXT_DECISIONS.ALLOW,
    clearTemplate: true,
    resetDocument: true
  });
});

const RINOSSINUSITE = { id: 'rinossinusite', qp: 'CONGESTÃO NASAL E DOR FACIAL' };
const GECA = { id: 'geca', qp: 'DIARREIA E DOR ABDOMINAL' };

test('a QP left over from the previous roteiro is recognized as boilerplate, not doctor content', () => {
  assert.equal(isTemplateBoilerplateQp('', GECA), true);
  assert.equal(isTemplateBoilerplateQp('DIARREIA E DOR ABDOMINAL', GECA), true);
  assert.equal(isTemplateBoilerplateQp('diarreia e dor abdominal', GECA), true);
  assert.equal(isTemplateBoilerplateQp('DIARREIA HÁ 3 DIAS COM MUCO', GECA), false);
  assert.equal(isTemplateBoilerplateQp('QUALQUER TEXTO', null), false);
});

test('form content beyond the active template counts only what the roteiro did not itself suggest', () => {
  assert.equal(hasFormContentBeyondTemplate({ qp: 'DIARREIA E DOR ABDOMINAL', hda: '' }, GECA), false);
  assert.equal(hasFormContentBeyondTemplate({ qp: 'DIARREIA E DOR ABDOMINAL', hda: 'INÍCIO HÁ 2 DIAS' }, GECA), true);
  assert.equal(hasFormContentBeyondTemplate({ qp: 'DIARREIA E DOR ABDOMINAL', comorbidades: 'HAS' }, GECA), true);
  assert.equal(hasFormContentBeyondTemplate({ qp: '', includeEmTempo: true }, GECA), true);
});

test('switching between two document roteiros replaces an untouched QP without confirmation', () => {
  const decision = decideTemplateReplacement({
    previousSelection: { templateId: 'geca', protocolId: null },
    previousTemplate: GECA,
    nextSelection: { templateId: 'rinossinusite', protocolId: null },
    form: { qp: 'DIARREIA E DOR ABDOMINAL', hda: '' }
  });
  assert.deepEqual(decision, { status: CONTEXT_DECISIONS.ALLOW, resetDocument: false });
});

test('re-selecting the same roteiro is a no-op regardless of edited content', () => {
  const decision = decideTemplateReplacement({
    previousSelection: { templateId: 'geca', protocolId: null },
    previousTemplate: GECA,
    nextSelection: { templateId: 'geca', protocolId: null },
    form: { qp: 'DIARREIA HÁ 3 DIAS, SEM FEBRE' }
  });
  assert.deepEqual(decision, { status: CONTEXT_DECISIONS.ALLOW, resetDocument: false });
});

test('a first roteiro pick over a manually typed QP never overwrites or asks for confirmation', () => {
  const decision = decideTemplateReplacement({
    previousSelection: null,
    previousTemplate: null,
    nextSelection: { templateId: 'rinossinusite', protocolId: null },
    form: { qp: 'QUEIXA DIGITADA PELA MÉDICA ANTES DE QUALQUER ROTEIRO' }
  });
  assert.deepEqual(decision, { status: CONTEXT_DECISIONS.ALLOW, resetDocument: false });
});

test('switching roteiro with real typed content requires confirmation and resets only when accepted', () => {
  const input = {
    previousSelection: { templateId: 'geca', protocolId: null },
    previousTemplate: GECA,
    nextSelection: { templateId: 'rinossinusite', protocolId: null },
    form: { qp: 'DIARREIA E DOR ABDOMINAL', hda: 'HÁ 3 DIAS, SEM MUCO OU SANGUE.' }
  };
  assert.deepEqual(decideTemplateReplacement(input), { status: CONTEXT_DECISIONS.CONFIRM, resetDocument: false });
  assert.deepEqual(decideTemplateReplacement({ ...input, confirmed: false }), { status: CONTEXT_DECISIONS.CANCEL, resetDocument: false });
  assert.deepEqual(decideTemplateReplacement({ ...input, confirmed: true }), { status: CONTEXT_DECISIONS.ALLOW, resetDocument: true });
});

test('a generated evolution output is protected even if the form itself only holds boilerplate', () => {
  const input = {
    previousSelection: { templateId: 'geca', protocolId: null },
    previousTemplate: GECA,
    nextSelection: { templateId: 'rinossinusite', protocolId: null },
    form: { qp: 'DIARREIA E DOR ABDOMINAL' },
    hasGeneratedOutput: true
  };
  assert.deepEqual(decideTemplateReplacement(input), { status: CONTEXT_DECISIONS.CONFIRM, resetDocument: false });
});

test('legacy reload with document content and unknown template relation requires reconciliation', () => {
  const decision = decideWorkflowSelection({
    workflowId: 'sca',
    templateSelection: null,
    hasDocumentContent: true,
    selectionKnown: false,
    restoring: true
  });
  assert.deepEqual(decision, {
    status: CONTEXT_DECISIONS.CONFIRM,
    clearTemplate: false,
    resetDocument: false
  });
  assert.deepEqual(decideWorkflowSelection({
    workflowId: 'sca',
    templateSelection: null,
    hasDocumentContent: true,
    selectionKnown: false,
    restoring: true,
    confirmed: true
  }), {
    status: CONTEXT_DECISIONS.ALLOW,
    clearTemplate: true,
    resetDocument: true
  });
});
