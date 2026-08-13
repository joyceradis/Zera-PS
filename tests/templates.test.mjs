import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES, resolveTemplateId } from '../assets/templates.js';
import { SCORE_DEFINITIONS } from '../assets/scores.js';

const KNOWN_STANDALONE_TOOLS = new Set([...Object.keys(SCORE_DEFINITIONS), 'glasgow']);

test('every documentation route opens with an integral editable HDA draft', () => {
  for (const template of TEMPLATES) {
    assert.equal(typeof template.hdaDraft, 'string', `${template.id} has no HDA draft`);
    assert.ok(template.hdaDraft.length >= 120, `${template.id} HDA draft is not clinically substantial`);
    assert.match(template.hdaDraft, /^PACIENTE COMPARECE AO PS/);
    assert.equal(template.requiresClinicalReview, true, `${template.id} must remain explicitly reviewable`);
  }
});

function withoutEditablePlaceholders(text) {
  return text.replace(/\[[^\]]*\]/g, '');
}

test('syndrome templates never assert a clinical negative outside an editable placeholder', () => {
  for (const template of TEMPLATES) {
    const stripped = withoutEditablePlaceholders(template.hdaDraft).toUpperCase();
    assert.equal(
      stripped.includes('NEGA'),
      false,
      `${template.id} asserts "NEGA ..." as a completed fact instead of an editable [CONFIRMAR ...] placeholder — a roteiro must never pre-answer a red flag the physician has not actually investigated`
    );
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

test('the initial documentation routes expose one syndromic diarrhea entry instead of duplicate diagnoses', () => {
  const diarrheaRoutes = TEMPLATES.filter((template) =>
    ['gea', 'geca', 'sindrome-diarreica'].includes(template.id)
  );

  assert.deepEqual(diarrheaRoutes.map((template) => template.id), ['sindrome-diarreica']);
  assert.equal(diarrheaRoutes[0].label, 'Síndrome diarreica');
  assert.equal(diarrheaRoutes[0].composer, 'sindrome-diarreica');
});

test('legacy diarrhea route ids resolve without losing old drafts', () => {
  assert.equal(resolveTemplateId('gea'), 'sindrome-diarreica');
  assert.equal(resolveTemplateId('geca'), 'sindrome-diarreica');
  assert.equal(resolveTemplateId('cefaleia'), 'cefaleia');
  assert.equal(resolveTemplateId('unknown'), 'unknown');
});
