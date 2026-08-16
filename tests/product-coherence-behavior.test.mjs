import test from 'node:test';
import assert from 'node:assert/strict';

function makeDocument(nodes = {}, selectors = {}) {
  return {
    addEventListener() {},
    querySelectorAll(selector) { return selectors[selector] || []; },
    getElementById(id) { return nodes[id] || null; }
  };
}

test('empty Atendimento stays new even when unrelated auxiliary controls have defaults', async () => {
  const nodes = {
    'qp-free': { value: '' },
    qp: { value: '' },
    hda: { value: '' },
    'evolution-output': { value: '' },
    'include-em-tempo': { checked: false },
    'hda-diarrhea-onset-unit': { value: 'dias' },
    'justification-profile': { value: 'internacao' }
  };
  globalThis.document = makeDocument(nodes);
  const mod = await import(`../src/product-coherence.js?empty=${Date.now()}`);
  assert.equal(mod.hasCurrentDocumentation(), false);

  nodes['qp-free'].value = 'DOR TORÁCICA HÁ 2 HORAS';
  assert.equal(mod.hasCurrentDocumentation(), true);

  delete globalThis.document;
});

test('Atendimento state follows real content and returns to new when content is cleared', async () => {
  const nodes = {
    'qp-free': { value: '' },
    qp: { value: '' },
    hda: { value: '' },
    'evolution-output': { value: '' },
    'include-em-tempo': { checked: false },
    'atendimento-state': { textContent: '' }
  };
  globalThis.document = makeDocument(nodes);
  const mod = await import(`../src/product-coherence.js?state=${Date.now()}`);

  mod.updateAtendimentoState();
  assert.equal(nodes['atendimento-state'].textContent, 'NOVO ATENDIMENTO');

  nodes.hda.value = 'HISTÓRIA CLÍNICA DOCUMENTADA';
  mod.updateAtendimentoState();
  assert.equal(nodes['atendimento-state'].textContent, 'EM REGISTRO');

  nodes.hda.value = '';
  mod.updateAtendimentoState();
  assert.equal(nodes['atendimento-state'].textContent, 'NOVO ATENDIMENTO');

  delete globalThis.document;
});

test('reset clears reassessment, admission, discharge, panels and score state bridges', async () => {
  const nodes = Object.fromEntries([
    'reav-evolucao', 'reav-exames', 'reav-conduta', 'reassessment-output',
    'int-diagnostico', 'int-justificativa', 'int-prescricao', 'admission-output',
    'alta-diagnostico', 'alta-resumo', 'alta-medicacoes', 'alta-orientacoes', 'discharge-output'
  ].map((id) => [id, { value: `OLD:${id}` }]));
  nodes['int-destino'] = { selectedIndex: 2 };

  let scoreChanges = 0;
  const scoreSelect = { value: 'true', dispatchEvent() { scoreChanges += 1; } };
  const glasgowSelect = { value: '5', dispatchEvent() { scoreChanges += 1; } };
  const panel = { hidden: false };
  let removedActive = 0;
  let ariaPressed = 'true';
  const action = {
    classList: { remove(name) { if (name === 'active') removedActive += 1; } },
    setAttribute(name, value) { if (name === 'aria-pressed') ariaPressed = value; }
  };

  globalThis.document = makeDocument(nodes, {
    '[data-score-answer], [data-glasgow]': [scoreSelect, glasgowSelect],
    '[data-encounter-panel]': [panel],
    '[data-encounter-action]': [action]
  });
  const mod = await import(`../src/product-coherence.js?reset=${Date.now()}`);
  mod.resetContinuationState();

  for (const id of mod.CONTINUATION_TEXT_IDS) assert.equal(nodes[id].value, '', id);
  assert.equal(nodes['int-destino'].selectedIndex, 0);
  assert.equal(scoreSelect.value, '');
  assert.equal(glasgowSelect.value, '');
  assert.equal(scoreChanges, 2);
  assert.equal(panel.hidden, true);
  assert.equal(removedActive, 1);
  assert.equal(ariaPressed, 'false');

  delete globalThis.document;
});

test('reassessment action is delegated to the temporal owner and the generic click is stopped', async () => {
  let bridgeClicks = 0;
  const nodes = {
    'reassess-encounter': { click() { bridgeClicks += 1; } }
  };
  globalThis.document = makeDocument(nodes);
  const mod = await import(`../src/product-coherence.js?reassess=${Date.now()}`);

  let prevented = false;
  let stopped = false;
  const event = {
    target: { closest(selector) { return selector.includes('reavaliacao') ? {} : null; } },
    preventDefault() { prevented = true; },
    stopImmediatePropagation() { stopped = true; }
  };

  mod.gateReassessmentAction(event);
  assert.equal(prevented, true);
  assert.equal(stopped, true);
  assert.equal(bridgeClicks, 1);

  delete globalThis.document;
});
