import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTemporalReassessment } from '../src/document-engine.js';

test('reassessment preserves exact QP inline quoted format and admission HDA label', () => {
  const text = renderTemporalReassessment({
    qp: 'DOR TORÁCICA',
    admissionHda: 'DOR RETROESTERNAL HÁ 2 HORAS',
    reassessmentNarrative: 'REAVALIO PACIENTE, QUE REFERE MELHORA.',
    conduct: ['MANTENHO MONITORIZAÇÃO.']
  });
  assert.match(text, /# QP: "DOR TORÁCICA"/);
  assert.match(text, /# HDA \(ADMISSÃO\): DOR RETROESTERNAL HÁ 2 HORAS/);
  assert.match(text, /EM TEMPO \(REAVALIAÇÃO\): REAVALIO PACIENTE, QUE REFERE MELHORA\./);
});

test('scores appear immediately below QP only when applied and calculated', () => {
  const text = renderTemporalReassessment({
    qp: 'DOR TORÁCICA',
    scores: [
      { id: 'heart', label: 'HEART', applicability: 'applicable', calculability: 'calculable', score: 3, interpretation: 'BAIXO RISCO' },
      { id: 'other', label: 'OUTRO', applicability: 'applicable', calculability: 'not_calculable', score: null }
    ],
    admissionHda: 'DOR RETROESTERNAL.',
    reassessmentNarrative: 'REAVALIO PACIENTE.',
    carryForwardSections: ['# HPP:', '- ALERGIAS: NEGA'],
    conduct: ['AGUARDO SEGUNDA TROPONINA.']
  });
  const qpIndex = text.indexOf('# QP: "DOR TORÁCICA"');
  const scoresIndex = text.indexOf('# SCORES:');
  const hdaIndex = text.indexOf('# HDA (ADMISSÃO):');
  assert.ok(qpIndex < scoresIndex && scoresIndex < hdaIndex);
  assert.match(text, /- HEART: 3 PONTOS — BAIXO RISCO/);
  assert.doesNotMatch(text, /OUTRO/);
});

test('scores section disappears when no score is applicable and calculable', () => {
  const text = renderTemporalReassessment({
    qp: 'DOR TORÁCICA',
    scores: [{ id: 'heart', label: 'HEART', applicability: 'applicable', calculability: 'not_calculable', score: null }],
    admissionHda: 'DOR.',
    reassessmentNarrative: 'REAVALIO PACIENTE.',
    conduct: ['MANTENHO OBSERVAÇÃO.']
  });
  assert.doesNotMatch(text, /# SCORES:/);
});

test('carry-forward content stays between reassessment narrative and final conduct', () => {
  const text = renderTemporalReassessment({
    qp: 'DOR TORÁCICA',
    admissionHda: 'DOR.',
    reassessmentNarrative: 'REAVALIO PACIENTE.',
    carryForwardSections: ['# HPP:', '- ALERGIAS: NEGA', '', '# EXAME FÍSICO:', '- ACV: RCR 2T'],
    conduct: ['SOLICITO NOVA TROPONINA.']
  });
  assert.ok(text.indexOf('EM TEMPO (REAVALIAÇÃO)') < text.indexOf('# HPP:'));
  assert.ok(text.indexOf('# HPP:') < text.indexOf('# CONDUTA:'));
});
