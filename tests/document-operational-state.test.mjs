import test from 'node:test';
import assert from 'node:assert/strict';
import {
  renderTemporalReassessment,
  renderScores,
  injectScoresIntoEvolution
} from '../src/document-engine.js';
import { renderEvolution } from '../assets/document-engine.js';
import { emptyClinicalState } from '../assets/storage.js';

/**
 * INV-DOC-001 — "Estado operacional não vaza para o prontuário".
 *
 * Fecha a lacuna declarada em AUD-2026-08-13-005/007. Até aqui o invariante era
 * protegido apenas na face "ferramenta calculável mas não aplicada não entra no
 * documento". A propriedade declarada no registry é mais ampla: pendências,
 * motivos de incompletude, avisos de workflow e demais estados internos do
 * Atendimento também não podem alcançar o texto clínico final.
 *
 * A estratégia aqui é adversarial: em vez de verificar que o caminho feliz
 * produz a saída certa, os testes injetam estado operacional real — o mesmo
 * formato que `src/score-engine.js` produz, com `message`, `missingVariables`,
 * `status` e `appliedAt` — e afirmam que nada disso emerge no documento.
 *
 * Isto verifica uma propriedade estrutural forte: os renderizadores operam por
 * ALLOW-LIST (leem apenas os campos que têm autorização para publicar), não por
 * deny-list (remover o que se lembrou de proibir). Uma allow-list continua segura
 * quando um campo operacional novo é acrescentado ao estado no futuro; uma
 * deny-list, não.
 *
 * Escopo: este arquivo apenas verifica. Se algum teste reprovar, a correção
 * pertence a Platform/Core Engineering (document engine / workflow), não a
 * Quality/Verification.
 */

const OPERATIONAL_LEAK_MARKERS = [
  'NÃO CALCULADO',
  'AINDA NÃO INFORMAD',
  'DADO OBRIGATÓRIO',
  'MISSINGVARIABLES',
  'TROPONINVALUE',
  'PENDINGITEMS',
  'PENDENTE',
  'AGUARDANDO RESULTADO',
  'INITIAL_ASSESSMENT',
  'PENDING_RESULTS',
  'STAGEHISTORY',
  'INCOMPLETE',
  'APPLIEDAT',
  'WORKFLOWID'
];

/**
 * Além da lista fixa de marcadores, deriva os termos proibidos do próprio estado
 * operacional injetado no caso de teste. Sem isso, um vazamento cujo texto não
 * casasse com nenhum marcador estático passaria despercebido — falha real deste
 * helper, encontrada por mutação do document engine antes deste arquivo ser
 * proposto para integração.
 */
function assertNoOperationalLeak(output, context, injectedOperational = []) {
  const upper = String(output).toUpperCase();
  const derived = injectedOperational
    .map((value) => String(value ?? '').trim().toUpperCase())
    .filter(Boolean);

  const leaked = [...new Set([...OPERATIONAL_LEAK_MARKERS, ...derived])]
    .filter((marker) => upper.includes(marker));

  assert.deepEqual(
    leaked,
    [],
    `estado operacional vazou para o documento (${context}): ${leaked.join(', ')}\n`
      + `--- saída produzida ---\n${output}\n-----------------------\n`
      + 'INV-DOC-001: pendência, motivo de incompletude e estado interno de workflow '
      + 'pertencem ao workspace, não ao prontuário.'
  );
}

/** Estado de ferramenta no formato real produzido por src/score-engine.js. */
function toolState(overrides = {}) {
  return {
    id: 'heart',
    label: 'HEART',
    type: 'score',
    availability: 'available',
    applicability: 'applicable',
    calculability: 'calculable',
    applied: true,
    appliedAt: '2026-08-13T01:00:00.000Z',
    status: 'complete',
    score: 4,
    interpretation: 'RISCO INTERMEDIÁRIO',
    missingVariables: [],
    message: null,
    ...overrides
  };
}

test('an applied score publishes only its score and interpretation, never the operational fields carried alongside', () => {
  const lines = renderScores([
    toolState({
      // Campos operacionais que acompanham o estado real e não têm autorização documental.
      missingVariables: ['troponinValue', 'heartEcg'],
      message: 'HEART não calculado: troponina ainda não informada.',
      status: 'incomplete',
      appliedAt: '2026-08-13T01:00:00.000Z'
    })
  ]);

  const output = lines.join('\n');
  assert.match(output, /- HEART: 4 PONTOS — RISCO INTERMEDIÁRIO/);
  assertNoOperationalLeak(output, 'renderScores com campos operacionais presentes');
});

test('an incomplete tool contributes nothing at all, not even its incompleteness reason', () => {
  const lines = renderScores([
    toolState({
      calculability: 'not_calculable',
      applied: false,
      score: null,
      interpretation: null,
      status: 'incomplete',
      missingVariables: ['troponinValue'],
      message: 'HEART não calculado: troponina ainda não informada.'
    })
  ]);

  assert.deepEqual(lines, [], 'ferramenta incompleta não deve produzir nenhuma linha documental');
});

test('injecting scores into an evolution never carries the workflow message into the record', () => {
  const evolution = [
    '## EVOLUÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##',
    '',
    '# QP: DOR TORÁCICA',
    '',
    '# HDA: DOR RETROESTERNAL HÁ 2 HORAS.'
  ].join('\n');

  const output = injectScoresIntoEvolution(evolution, [
    toolState({ message: 'HEART não calculado: troponina ainda não informada.', missingVariables: ['troponinValue'] })
  ]);

  assert.match(output, /# SCORES:\n- HEART: 4 PONTOS — RISCO INTERMEDIÁRIO/);
  assertNoOperationalLeak(output, 'injectScoresIntoEvolution');
});

test('the reassessment renderer ignores encounter fields it was never authorized to publish', () => {
  // Passa deliberadamente o Atendimento inteiro, como aconteceria se alguém
  // encaminhasse o encounter em vez dos campos autorizados. A saída deve
  // permanecer restrita ao conteúdo documental.
  const output = renderTemporalReassessment({
    qp: 'DOR TORÁCICA',
    admissionHda: 'DOR RETROESTERNAL HÁ 2 HORAS.',
    reassessmentNarrative: 'REAVALIO PACIENTE, QUE REFERE MELHORA.',
    conduct: ['MANTENHO MONITORIZAÇÃO.'],
    scores: [toolState()],

    // Estado operacional do Atendimento v3 — nenhum deles é conteúdo de prontuário.
    workflowId: 'sca',
    currentStage: 'pending_results',
    stageHistory: [{ stage: 'initial_assessment', enteredAt: '2026-08-13T00:00:00.000Z' }],
    pendingItems: [
      { id: 'troponin_1', kind: 'lab', label: 'TROPONINA', status: 'pending' },
      { id: 'ecg_initial', kind: 'exam', label: 'ECG', status: 'pending' }
    ],
    context: { suspectedAcs: true, troponinStatus: 'pending' },
    results: [{ id: 'troponin_1', status: 'pending' }]
  });

  assert.match(output, /# QP: "DOR TORÁCICA"/);
  assert.match(output, /EM TEMPO \(REAVALIAÇÃO\): REAVALIO PACIENTE, QUE REFERE MELHORA\./);
  assertNoOperationalLeak(output, 'renderTemporalReassessment recebendo o encounter inteiro', [
    'TROPONINA', 'ECG', 'troponin_1', 'ecg_initial', 'lab', 'exam', 'sca'
  ]);
});

test('the evolution renderer ignores encounter fields it was never authorized to publish', () => {
  const output = renderEvolution({
    qp: 'DOR TORÁCICA',
    hda: 'DOR RETROESTERNAL HÁ 2 HORAS.',
    conduta: 'AGUARDO TROPONINA.',

    // Mesmo vetor, na outra superfície documental.
    workflowId: 'sca',
    currentStage: 'pending_results',
    pendingItems: [{ id: 'troponin_1', label: 'TROPONINA', status: 'pending' }],
    context: { suspectedAcs: true }
  }, emptyClinicalState());

  assert.match(output, /# QP: DOR TORÁCICA/);
  assert.match(output, /# CONDUTA:\n- AGUARDO TROPONINA\./);
  // "TROPONINA" aparece legitimamente na conduta digitada pela médica, então não
  // pode entrar na lista derivada: o que se proíbe é o rótulo da pendência e os
  // identificadores internos, não a palavra em si.
  assertNoOperationalLeak(output, 'renderEvolution recebendo campos de workflow', [
    'troponin_1', 'suspectedAcs', 'workflowId', 'sca'
  ]);
});

test('a pending item whose label reads like clinical text still never reaches the document', () => {
  // Vetor mais desagradável: a pendência carrega texto que PARECE conteúdo
  // clínico legítimo. Se o renderizador operasse por deny-list, isto passaria.
  const output = renderTemporalReassessment({
    qp: 'DOR TORÁCICA',
    admissionHda: 'DOR RETROESTERNAL.',
    reassessmentNarrative: 'REAVALIO PACIENTE.',
    conduct: ['MANTENHO OBSERVAÇÃO.'],
    pendingItems: [
      { id: 'x', label: 'TROPONINA DE CONTROLE AINDA NÃO COLETADA', status: 'pending' }
    ]
  });

  assert.doesNotMatch(
    output,
    /TROPONINA DE CONTROLE AINDA NÃO COLETADA/,
    'rótulo de pendência com aparência clínica não pode entrar no documento — '
      + 'pendência é estado operacional independentemente de como está escrita'
  );
});
