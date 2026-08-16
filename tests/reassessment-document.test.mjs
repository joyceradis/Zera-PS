import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTemporalReassessment, extractCarryForwardSections, injectScoresIntoEvolution } from '../src/document-engine.js';

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

test('reassessment does not repeat identical admission QP and HDA', () => {
  const text = renderTemporalReassessment({
    qp: 'DOR TORÁCICA HÁ 2 HORAS',
    admissionHda: 'DOR TORÁCICA HÁ 2 HORAS',
    reassessmentNarrative: 'REAVALIO PACIENTE, ESTÁVEL.'
  });
  assert.match(text, /# HDA \(ADMISSÃO\): DOR TORÁCICA HÁ 2 HORAS/);
  assert.doesNotMatch(text, /# QP:/);
  assert.equal((text.match(/DOR TORÁCICA HÁ 2 HORAS/g) || []).length, 1);
});

test('scores appear immediately below QP only when applied and calculated', () => {
  const text = renderTemporalReassessment({
    qp: 'DOR TORÁCICA',
    scores: [
      { id: 'heart', label: 'HEART', applicability: 'applicable', calculability: 'calculable', applied: true, score: 3, interpretation: 'BAIXO RISCO' },
      { id: 'other', label: 'OUTRO', applicability: 'applicable', calculability: 'not_calculable', applied: false, score: null }
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

test('scores section disappears when no score is applied and calculable', () => {
  const text = renderTemporalReassessment({
    qp: 'DOR TORÁCICA',
    scores: [{ id: 'heart', label: 'HEART', applicability: 'applicable', calculability: 'calculable', applied: false, score: 3 }],
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

test('carry-forward extraction preserves clinical sections but excludes old header, QP, HDA and conduct', () => {
  const evolution = [
    '## EVOLUÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##', '', '# QP: DOR TORÁCICA', '', '# HDA: DOR HÁ 2 HORAS', '', '# HPP:', '- ALERGIAS: NEGA', '', '# EXAME FÍSICO:', '- ACV: RCR 2T', '', '# EXAMES COMPLEMENTARES:', '- IMAGEM: ECG SEM SUPRA', '', '# HIPÓTESES DIAGNÓSTICAS:', '- SCA?', '', '# CONDUTA:', '- AGUARDO TROPONINA'
  ].join('\n');
  const carry = extractCarryForwardSections(evolution).join('\n');
  assert.match(carry, /# HPP:/);
  assert.match(carry, /# EXAME FÍSICO:/);
  assert.match(carry, /# EXAMES COMPLEMENTARES:/);
  assert.match(carry, /# HIPÓTESES DIAGNÓSTICAS:/);
  assert.doesNotMatch(carry, /# QP:/);
  assert.doesNotMatch(carry, /# HDA:/);
  assert.doesNotMatch(carry, /# CONDUTA:/);
});

test('evolution score block is injected below QP without changing the remaining text', () => {
  const evolution = ['## EVOLUÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##', '', '# QP: DOR TORÁCICA', '', '# HDA: DOR HÁ 2 HORAS', '', '# HPP:', '- ALERGIAS: NEGA'].join('\n');
  const output = injectScoresIntoEvolution(evolution, [
    { id: 'heart', label: 'HEART', applicability: 'applicable', calculability: 'calculable', applied: true, score: 4, interpretation: 'RISCO INTERMEDIÁRIO' }
  ]);
  assert.match(output, /# QP: DOR TORÁCICA\n\n# SCORES:\n- HEART: 4 PONTOS — RISCO INTERMEDIÁRIO\n\n# HDA:/);
  assert.match(output, /# HPP:\n- ALERGIAS: NEGA/);
});

test('scores remain injectable when duplicate QP was suppressed and HDA is the first clinical anchor', () => {
  const evolution = ['## EVOLUÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##', '', '# HDA: DOR TORÁCICA HÁ 2 HORAS', '', '# HPP:', '- ALERGIAS: NEGA'].join('\n');
  const output = injectScoresIntoEvolution(evolution, [
    { id: 'heart', label: 'HEART', applicability: 'applicable', calculability: 'calculable', applied: true, score: 3, interpretation: 'BAIXO RISCO' }
  ]);
  assert.match(output, /# HDA: DOR TORÁCICA HÁ 2 HORAS\n\n# SCORES:\n- HEART: 3 PONTOS — BAIXO RISCO/);
});
