import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveToolPresentation } from '../src/tool-presentation.js';

test('unavailable tool is never presented as available and never exposes application button', () => {
  const presentation = deriveToolPresentation(
    { id: 'demo', label: 'DEMO', messages: { unavailable: 'DEMO INDISPONÍVEL NESTA VERSÃO.' } },
    { availability: 'unavailable', applicability: 'unknown', calculability: 'not_calculable', applied: false }
  );
  assert.deepEqual(presentation, {
    state: 'unavailable',
    message: 'DEMO INDISPONÍVEL NESTA VERSÃO.',
    buttonHidden: true,
    buttonText: ''
  });
});

test('available but not applicable tool keeps the existing distinct presentation', () => {
  const presentation = deriveToolPresentation(
    { id: 'demo', label: 'DEMO' },
    { availability: 'available', applicability: 'not_applicable', calculability: 'not_calculable', applied: false }
  );
  assert.equal(presentation.state, 'available');
  assert.match(presentation.message, /DISPONÍVEL PARA O CENÁRIO/);
  assert.equal(presentation.buttonHidden, true);
});
