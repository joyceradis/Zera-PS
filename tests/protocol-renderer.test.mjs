import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocument, fireInput, fireClick } from './helpers/fake-dom.mjs';
import { createProtocolRenderer } from '../src/protocol-renderer.js';
import { fieldDomId, toolStatusDomId, toolApplyDomId } from '../src/protocol-schema.js';
import { SCA_PROTOCOL } from '../protocols/sca.js';

function mountReference() {
  const doc = createDocument();
  const mount = doc.createElement('div');
  const changed = [];
  const applied = [];
  const renderer = createProtocolRenderer({
    protocol: SCA_PROTOCOL,
    mount,
    document: doc,
    onFieldChange: (id) => changed.push(id),
    onToolApply: (id) => applied.push(id)
  });
  return { doc, mount, renderer, changed, applied };
}

test('renderer builds accessible labelled controls from the protocol definition', () => {
  const { renderer } = mountReference();

  const suspicion = renderer.getFieldNode('suspectedAcs');
  assert.equal(suspicion.container.tagName, 'LABEL');
  assert.equal(suspicion.container.className, 'toggle-row');
  assert.equal(suspicion.control.type, 'checkbox');
  assert.equal(suspicion.container.children.at(-1).textContent, 'Suspeita clínica de SCA / equivalente anginoso');

  const ecgStatus = renderer.getFieldNode('ecgStatus');
  assert.equal(ecgStatus.container.tagName, 'LABEL');
  assert.equal(ecgStatus.container.children[0].textContent, 'ECG');
  assert.equal(ecgStatus.control.tagName, 'SELECT');
  assert.deepEqual(ecgStatus.control.children.map((option) => option.value), ['not_informed', 'pending', 'available', 'not_applicable']);
  assert.deepEqual(ecgStatus.control.children.map((option) => option.textContent), ['NÃO INFORMADO', 'SOLICITADO / PENDENTE', 'DISPONÍVEL', 'NÃO APLICÁVEL']);

  const ecgResult = renderer.getFieldNode('ecgResult');
  assert.equal(ecgResult.control.tagName, 'TEXTAREA');
  assert.equal(ecgResult.control.placeholder, 'DESCREVA O ECG EFETIVAMENTE DISPONÍVEL');
  assert.equal(ecgResult.control.rows, 3);
  assert.equal(ecgResult.container.className, 'field full-width');

  const ratio = renderer.getFieldNode('troponinRatio');
  assert.equal(ratio.control.type, 'number');
  assert.equal(ratio.control.placeholder, 'EX.: 0.8, 1.5, 4');

  assert.equal(ecgStatus.control.id, fieldDomId(SCA_PROTOCOL, ecgStatus.field));
  assert.equal(ecgStatus.control.dataset.protocolField, 'ecgStatus');
});

test('renderer keeps evolution form fields out of the workflow surface', () => {
  const { renderer } = mountReference();
  assert.equal(renderer.getFieldNode('qp'), null);
  assert.equal(renderer.getFieldNode('hda'), null);
  assert.equal(renderer.getSectionNode('presentation'), null);
});

test('renderer obeys stage and visibility rules declared by the protocol', () => {
  const { renderer } = mountReference();

  renderer.update({ stage: 'initial_assessment', context: { suspectedAcs: false } });
  assert.equal(renderer.getSectionNode('acs_context').hidden, false);
  assert.equal(renderer.getSectionNode('ecg').hidden, true);
  assert.equal(renderer.getSectionNode('cardiovascular_risk').hidden, true);

  renderer.update({ stage: 'initial_assessment', context: { suspectedAcs: true, ecgStatus: 'pending', troponinStatus: 'not_informed' } });
  assert.equal(renderer.getSectionNode('ecg').hidden, false);
  assert.equal(renderer.getFieldNode('ecgResult').container.hidden, true);
  assert.equal(renderer.getFieldNode('troponinValue').container.hidden, true);

  renderer.update({ stage: 'pending_results', context: { suspectedAcs: true, ecgStatus: 'available', troponinStatus: 'available' } });
  assert.equal(renderer.getFieldNode('ecgResult').container.hidden, false);
  assert.equal(renderer.getFieldNode('troponinValue').container.hidden, false);
  assert.equal(renderer.getFieldNode('troponinRatio').container.hidden, false);
});

test('renderer reads context with the value semantics declared by each field', () => {
  const { renderer } = mountReference();
  const initial = renderer.readContext();
  assert.equal(initial.suspectedAcs, false);
  assert.equal(initial.ecgStatus, 'not_informed');
  assert.equal(initial.heartHistory, null);
  assert.equal(initial.heartAge, null);
  assert.equal(initial.troponinValue, '');

  renderer.getFieldNode('suspectedAcs').control.checked = true;
  renderer.getFieldNode('heartHistory').control.value = '1';
  renderer.getFieldNode('heartAge').control.value = '52';
  renderer.getFieldNode('troponinValue').control.value = '12 ng/L';

  const context = renderer.readContext();
  assert.equal(context.suspectedAcs, true);
  assert.equal(context.heartHistory, 1);
  assert.equal(context.heartAge, 52);
  assert.equal(context.troponinValue, '12 ng/L');
});

test('non numeric content in a numeric control is read as missing, never as a number', () => {
  const { renderer } = mountReference();
  renderer.getFieldNode('heartAge').control.value = 'cinquenta';
  renderer.getFieldNode('troponinRatio').control.value = '--';
  renderer.getFieldNode('heartHistory').control.value = 'alto';

  const context = renderer.readContext();
  assert.equal(context.heartAge, null);
  assert.equal(context.troponinRatio, null);
  assert.equal(context.heartHistory, null);
});

test('renderer restores persisted context and falls back to declared defaults', () => {
  const { renderer } = mountReference();
  renderer.setContext({ suspectedAcs: true, ecgStatus: 'available', ecgResult: 'RITMO SINUSAL', heartHistory: 1 });

  assert.equal(renderer.getFieldNode('suspectedAcs').control.checked, true);
  assert.equal(renderer.getFieldNode('ecgStatus').control.value, 'available');
  assert.equal(renderer.getFieldNode('ecgResult').control.value, 'RITMO SINUSAL');
  assert.equal(renderer.getFieldNode('heartHistory').control.value, '1');
  assert.equal(renderer.getFieldNode('troponinStatus').control.value, 'not_informed');
  assert.equal(renderer.getFieldNode('heartAge').control.value, '');
});

test('renderer notifies context changes and tool application requests', () => {
  const { renderer, changed, applied } = mountReference();

  fireInput(renderer.getFieldNode('troponinStatus').control);
  assert.deepEqual(changed, ['troponinStatus']);

  const tool = renderer.getToolNodes('heart');
  assert.equal(tool.status.dataset.protocolTool, 'heart');
  assert.equal(tool.status.id, toolStatusDomId(SCA_PROTOCOL, 'heart'));
  assert.equal(tool.button.id, toolApplyDomId(SCA_PROTOCOL, 'heart'));
  assert.equal(tool.button.hidden, true);
  fireClick(tool.button);
  assert.deepEqual(applied, ['heart']);
});
