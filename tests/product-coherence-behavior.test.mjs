import test from 'node:test';
import assert from 'node:assert/strict';

function makeDocument(nodes = {}) {
  return {
    addEventListener() {},
    querySelectorAll() { return []; },
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
