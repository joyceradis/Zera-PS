import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES } from '../assets/templates.js';
import { SCORE_DEFINITIONS } from '../assets/scores.js';

const KNOWN_STANDALONE_TOOLS = new Set([...Object.keys(SCORE_DEFINITIONS), 'glasgow']);

test('syndrome templates do not preconfirm clinical negatives', () => {
  for (const template of TEMPLATES) {
    const serialized = JSON.stringify(template).toUpperCase();
    assert.equal(serialized.includes('NEGA '), false, `${template.id} contains a preconfirmed negative`);
  }
});

test('templates do not inject diagnosis or conduct into the medical record', () => {
  for (const template of TEMPLATES) {
    assert.equal('hipoteses' in template, false, `${template.id} should not prefill hypotheses`);
    assert.equal('conduta' in template, false, `${template.id} should not prefill conduct`);
  }
});

test('a roteiro never advertises a clinical tool that does not exist in the app', () => {
  for (const template of TEMPLATES) {
    for (const toolId of template.clinicalTools || []) {
      assert.equal(
        KNOWN_STANDALONE_TOOLS.has(toolId),
        true,
        `${template.id} links "${toolId}", which has no card in the Scores tab — regression of the dangling-tool bug (SNNOOP10 was removed from Cefaleia for exactly this reason; it must not be advertised again until it is actually implemented)`
      );
    }
  }
});

test('PAC links only clinical tools that are actually implemented in the Scores tab', () => {
  const pac = TEMPLATES.find((template) => template.id === 'pac');
  assert.deepEqual(pac.clinicalTools, ['crb65', 'curb65']);
});
