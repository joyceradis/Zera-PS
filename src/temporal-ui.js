import {
  WORKFLOW_STAGES,
  createEncounter,
  transitionEncounter,
  updateEncounterContext,
  updateAdmissionSnapshot,
  addPendingItem,
  resolvePendingItem,
  startReassessment
} from './workflow-engine.js';
import { createToolState, evaluateToolState } from './score-engine.js';
import { HEART_TOOL } from '../protocols/sca.js';
import { createEncounterStorage } from './storage.js';
import {
  renderTemporalReassessment,
  extractCarryForwardSections,
  injectScoresIntoEvolution
} from './document-engine.js';

const $ = (id) => document.getElementById(id);
const encounterStorage = createEncounterStorage();
const STAGE_LABELS = Object.freeze({
  [WORKFLOW_STAGES.INITIAL_ASSESSMENT]: 'AVALIAÇÃO INICIAL',
  [WORKFLOW_STAGES.INITIAL_CONDUCT]: 'CONDUTA INICIAL',
  [WORKFLOW_STAGES.PENDING_RESULTS]: 'AGUARDANDO RESULTADOS',
  [WORKFLOW_STAGES.REASSESSMENT]: 'REAVALIAÇÃO',
  [WORKFLOW_STAGES.FINAL_DOCUMENTATION]: 'DOCUMENTAÇÃO FINAL'
});

let encounter = encounterStorage.loadActiveEncounter();
let heartState = createToolState(HEART_TOOL);

function nullableNumber(id) {
  const value = $(id)?.value;
  return value === '' || value === undefined ? null : Number(value);
}

function readTemporalContext() {
  return {
    suspectedAcs: Boolean($('sca-suspected')?.checked),
    ecgStatus: $('sca-ecg-status')?.value || 'not_informed',
    ecgResult: $('sca-ecg-result')?.value || '',
    troponinStatus: $('sca-troponin-status')?.value || 'not_informed',
    troponinValue: $('sca-troponin-value')?.value || '',
    troponinRatio: nullableNumber('sca-troponin-ratio'),
    heartHistory: nullableNumber('heart-history'),
    heartEcg: nullableNumber('heart-ecg'),
    heartAge: nullableNumber('heart-age'),
    heartRisk: nullableNumber('heart-risk')
  };
}

function currentScenarioContext() {
  const context = readTemporalContext();
  return {
    suspectedAcs: context.suspectedAcs,
    heartHistory: context.heartHistory,
    heartEcg: context.heartEcg,
    age: context.heartAge,
    heartRiskFactors: context.heartRisk,
    troponinRatio: context.troponinStatus === 'available' ? context.troponinRatio : null
  };
}

function restoreInput(id, value) {
  const node = $(id);
  if (!node || value === null || value === undefined) return;
  node.value = String(value);
}

function restoreTemporalContext(context = {}) {
  if ($('sca-suspected')) $('sca-suspected').checked = Boolean(context.suspectedAcs);
  restoreInput('sca-ecg-status', context.ecgStatus || 'not_informed');
  restoreInput('sca-ecg-result', context.ecgResult || '');
  restoreInput('sca-troponin-status', context.troponinStatus || 'not_informed');
  restoreInput('sca-troponin-value', context.troponinValue || '');
  restoreInput('sca-troponin-ratio', context.troponinRatio);
  restoreInput('heart-history', context.heartHistory);
  restoreInput('heart-ecg', context.heartEcg);
  restoreInput('heart-age', context.heartAge);
  restoreInput('heart-risk', context.heartRisk);
}

function persistEncounter() {
  if (encounter) encounterStorage.saveActiveEncounter(encounter);
}

function persistTemporalContext() {
  if (!encounter) return;
  encounter = updateEncounterContext(encounter, readTemporalContext());
  persistEncounter();
}

function renderStage() {
  const badge = $('workflow-stage');
  if (!badge) return;
  badge.textContent = encounter ? (STAGE_LABELS[encounter.currentStage] || encounter.currentStage) : 'SEM CENÁRIO';
  badge.dataset.stage = encounter?.currentStage || 'none';
}

function renderScenarioVisibility() {
  const isSca = $('workflow-scenario')?.value === 'sca';
  if ($('workflow-context')) $('workflow-context').hidden = !isSca;
  const suspected = Boolean($('sca-suspected')?.checked);
  if ($('sca-details')) $('sca-details').hidden = !(isSca && suspected);
  if ($('sca-ecg-result-field')) $('sca-ecg-result-field').hidden = $('sca-ecg-status')?.value !== 'available';
  if ($('sca-troponin-result-fields')) $('sca-troponin-result-fields').hidden = $('sca-troponin-status')?.value !== 'available';
}

function ensurePendingItem(id, kind, label) {
  if (!encounter) return;
  if ((encounter.pendingItems || []).some((item) => item.id === id)) return;
  encounter = addPendingItem(encounter, { id, kind, label, requestedAt: new Date().toISOString() });
}

function markAvailable(id, result) {
  if (!encounter) return;
  if (!(encounter.pendingItems || []).some((item) => item.id === id)) {
    ensurePendingItem(id, result.kind || 'result', result.label || id);
  }
  encounter = resolvePendingItem(encounter, id, result);
}

function syncTemporalResults() {
  if (!encounter || $('workflow-scenario')?.value !== 'sca') return;
  const context = readTemporalContext();

  if (context.ecgStatus === 'pending') ensurePendingItem('ecg_initial', 'ecg', 'ECG');
  if (context.ecgStatus === 'available') markAvailable('ecg_initial', {
    kind: 'ecg', label: 'ECG', value: context.ecgResult, availableAt: new Date().toISOString()
  });

  if (context.troponinStatus === 'pending') ensurePendingItem('troponin_1', 'lab', 'Troponina');
  if (context.troponinStatus === 'available') markAvailable('troponin_1', {
    kind: 'lab', label: 'Troponina', value: context.troponinValue,
    ratio: context.troponinRatio, availableAt: new Date().toISOString()
  });

  const hasPending = (encounter.pendingItems || []).some((item) => item.status === 'pending');
  if (hasPending && ![WORKFLOW_STAGES.PENDING_RESULTS, WORKFLOW_STAGES.REASSESSMENT].includes(encounter.currentStage)) {
    if (encounter.currentStage === WORKFLOW_STAGES.INITIAL_ASSESSMENT) {
      encounter = transitionEncounter(encounter, WORKFLOW_STAGES.INITIAL_CONDUCT);
    }
    encounter = transitionEncounter(encounter, WORKFLOW_STAGES.PENDING_RESULTS);
  }

  persistEncounter();
  renderStage();
  renderPending();
}

function renderPending() {
  const node = $('workflow-pending');
  if (!node) return;
  const pending = (encounter?.pendingItems || []).filter((item) => item.status === 'pending');
  const available = (encounter?.pendingItems || []).filter((item) => item.status === 'available');
  if (!pending.length && !available.length) {
    node.innerHTML = '<span class="workflow-empty">SEM PENDÊNCIAS REGISTRADAS NESTE WORKFLOW.</span>';
    return;
  }
  node.innerHTML = [
    ...pending.map((item) => `<span class="pending-chip pending">PENDENTE · ${item.label}</span>`),
    ...available.map((item) => `<span class="pending-chip available">DISPONÍVEL · ${item.label}</span>`)
  ].join('');
}

function updateHeart() {
  heartState = evaluateToolState(HEART_TOOL, heartState, currentScenarioContext());
  const node = $('heart-tool-status');
  if (!node) return;

  if (heartState.applicability !== 'applicable') {
    node.dataset.state = 'available';
    node.textContent = 'HEART DISPONÍVEL PARA O CENÁRIO — AINDA NÃO PERTINENTE SEM SUSPEITA CLÍNICA DE SCA / EQUIVALENTE ANGINOSO.';
    return;
  }
  if (heartState.calculability !== 'calculable') {
    node.dataset.state = 'incomplete';
    node.textContent = heartState.message || 'HEART SCORE NÃO CALCULADO — COMPLETE AS VARIÁVEIS OBRIGATÓRIAS.';
    return;
  }
  node.dataset.state = 'complete';
  node.textContent = `HEART: ${heartState.score} ${heartState.score === 1 ? 'PONTO' : 'PONTOS'} — ${heartState.interpretation}`;
}

function captureAdmissionSnapshot() {
  if (!encounter) return;
  encounter = updateAdmissionSnapshot(encounter, {
    qp: $('qp')?.value || '',
    hda: $('hda')?.value || '',
    evolutionText: $('evolution-output')?.value || ''
  });
  persistEncounter();
}

function handleScenarioChange() {
  const scenario = $('workflow-scenario')?.value || '';
  if (!scenario) {
    encounter = null;
    encounterStorage.clearActiveEncounter();
    heartState = createToolState(HEART_TOOL);
    renderScenarioVisibility();
    renderStage();
    renderPending();
    return;
  }

  if (!encounter || encounter.workflowId !== scenario) {
    encounter = createEncounter({ workflowId: scenario, admissionSnapshot: {}, context: {} });
  }
  persistTemporalContext();
  renderScenarioVisibility();
  renderStage();
  renderPending();
  updateHeart();
}

function handleContextChange() {
  persistTemporalContext();
  renderScenarioVisibility();
  syncTemporalResults();
  updateHeart();
}

function handleEvolutionGenerated() {
  if (!encounter) return;
  const output = $('evolution-output');
  if (!output) return;
  output.value = injectScoresIntoEvolution(output.value, [heartState]);
  captureAdmissionSnapshot();
}

function handleStartReassessment() {
  if (!encounter) return;
  persistTemporalContext();
  captureAdmissionSnapshot();
  encounter = startReassessment(encounter);
  persistEncounter();
  renderStage();
  document.querySelector('.nav-button[data-view="reavaliacao"]')?.click();
}

function splitLines(value) {
  return String(value || '').split(/\n+/).map((line) => line.trim()).filter(Boolean);
}

function handleReassessmentGenerated() {
  if (!encounter) return;
  persistTemporalContext();
  updateHeart();
  const admission = encounter.admissionSnapshot || {};
  const narrativeParts = [$('reav-evolucao')?.value || '', $('reav-exames')?.value || '']
    .map((item) => item.trim()).filter(Boolean);
  const carryForwardSections = extractCarryForwardSections(admission.evolutionText || $('evolution-output')?.value || '');
  const output = renderTemporalReassessment({
    qp: admission.qp || $('qp')?.value || '',
    scores: [heartState],
    admissionHda: admission.hda || $('hda')?.value || '',
    reassessmentNarrative: narrativeParts.join(' '),
    carryForwardSections,
    conduct: splitLines($('reav-conduta')?.value)
  });
  if ($('reassessment-output')) $('reassessment-output').value = output;

  const reassessments = [...(encounter.reassessments || [])];
  if (reassessments.length) {
    reassessments[reassessments.length - 1] = {
      ...reassessments[reassessments.length - 1],
      generatedAt: new Date().toISOString(),
      narrative: narrativeParts.join(' '),
      scores: heartState.calculability === 'calculable' ? [heartState] : [],
      conduct: splitLines($('reav-conduta')?.value),
      document: output
    };
  }
  encounter = { ...encounter, reassessments };
  persistEncounter();
}

function restoreTemporalUi() {
  if (!encounter) return;
  if ($('workflow-scenario')) $('workflow-scenario').value = encounter.workflowId || '';
  restoreTemporalContext(encounter.context || {});
  renderScenarioVisibility();
  renderStage();
  renderPending();
  updateHeart();
}

function injectTemporalStyles() {
  if ($('zera-temporal-styles')) return;
  const style = document.createElement('style');
  style.id = 'zera-temporal-styles';
  style.textContent = `
    .workflow-card{margin:20px 0;padding:18px;border:1px solid rgba(11,31,51,.14);border-radius:18px;background:rgba(255,255,255,.72)}
    .workflow-subsection{margin-top:16px;padding:14px;border-radius:14px;background:rgba(11,31,51,.035)}
    .workflow-stage-badge{display:inline-flex;align-items:center;padding:7px 10px;border-radius:999px;font-size:.72rem;font-weight:800;letter-spacing:.04em;background:#e8edf2;color:#314052}
    .workflow-stage-badge[data-stage="pending_results"]{background:#fff3cd;color:#705500}.workflow-stage-badge[data-stage="reassessment"]{background:#d9ecff;color:#114f86}
    .tool-status{padding:12px 14px;border-radius:12px;margin:8px 0 14px;font-weight:700;font-size:.86rem;background:#d9ecff;color:#114f86}
    .tool-status[data-state="incomplete"]{background:#fff3cd;color:#705500}.tool-status[data-state="complete"]{background:#dff4e5;color:#1f6334}
    .workflow-pending{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.pending-chip{padding:7px 10px;border-radius:999px;font-size:.74rem;font-weight:800}.pending-chip.pending{background:#fff3cd;color:#705500}.pending-chip.available{background:#dff4e5;color:#1f6334}.workflow-empty{font-size:.78rem;color:#637083}
  `;
  document.head.appendChild(style);
}

function bindTemporalEvents() {
  $('workflow-scenario')?.addEventListener('change', handleScenarioChange);
  ['sca-suspected','sca-ecg-status','sca-ecg-result','sca-troponin-status','sca-troponin-value','sca-troponin-ratio','heart-history','heart-ecg','heart-age','heart-risk']
    .forEach((id) => $(id)?.addEventListener('input', handleContextChange));
  $('reassess-encounter')?.addEventListener('click', handleStartReassessment);
  $('generate-evolution')?.addEventListener('click', () => queueMicrotask(handleEvolutionGenerated));
  $('generate-reassessment')?.addEventListener('click', () => queueMicrotask(handleReassessmentGenerated));
}

function initTemporalWorkflow() {
  injectTemporalStyles();
  restoreTemporalUi();
  bindTemporalEvents();
  renderStage();
  renderPending();
  updateHeart();
}

document.addEventListener('DOMContentLoaded', initTemporalWorkflow);
