import {
  WORKFLOW_STAGES,
  createEncounter,
  ensureEncounterStarted,
  attachWorkflow,
  transitionEncounter,
  updateEncounterContext,
  updateAdmissionSnapshot,
  addPendingItem,
  resolvePendingItem,
  startReassessment
} from './workflow-engine.js';
import { createToolState, evaluateToolState, setToolApplied } from './score-engine.js';
import { getProtocol, listProtocolOptions } from './protocol-registry.js';
import {
  applyPersistedToolIntent,
  deriveTemporalOperations,
  readPersistedToolApplication,
  resolveToolVariables,
  serializeToolApplications
} from './protocol-engine.js';
import { createProtocolRenderer } from './protocol-renderer.js';
import { createEncounterStorage } from './storage.js';
import {
  CONTEXT_DECISIONS,
  CONTEXT_EVENTS,
  decideEncounterReplacement,
  decideTemplateSelection
} from './context-coordination.js';
import { deriveToolPresentation } from './tool-presentation.js';
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
const CLINICAL_ACTIVITY_FIELDS = Object.freeze([
  'qp', 'hda', 'comorbidades', 'muc', 'alergias', 'habitos', 'cirurgias',
  'estado-geral', 'acv', 'ar', 'abd', 'ext', 'neuro',
  'laboratoriais', 'imagem', 'hipoteses', 'conduta', 'em-tempo'
]);

let encounter = encounterStorage.loadActiveEncounter();
let protocol = null;
let renderer = null;
let toolStates = {};

function currentStage() {
  return encounter?.currentStage || WORKFLOW_STAGES.INITIAL_ASSESSMENT;
}

function protocolContext() {
  return renderer ? renderer.readContext() : {};
}

function toolStateList() {
  return Object.values(toolStates);
}

function readTemporalContext() {
  return { ...protocolContext(), appliedTools: serializeToolApplications(toolStateList()) };
}

function currentAdmissionSnapshot() {
  return {
    qp: $('qp')?.value || '',
    hda: $('hda')?.value || '',
    evolutionText: $('evolution-output')?.value || ''
  };
}

function hasClinicalActivity() {
  return CLINICAL_ACTIVITY_FIELDS.some((id) => String($(id)?.value || '').trim().length > 0)
    || String($('evolution-output')?.value || '').trim().length > 0;
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

function renderProtocolVisibility() {
  if ($('workflow-context')) $('workflow-context').hidden = !protocol;
  if (!renderer) return;
  renderer.update({ stage: currentStage(), context: protocolContext() });
}

function handleClinicalActivity() {
  if (!hasClinicalActivity()) return;
  encounter = ensureEncounterStarted(encounter, { admissionSnapshot: currentAdmissionSnapshot() });
  encounter = updateAdmissionSnapshot(encounter, currentAdmissionSnapshot());
  persistEncounter();
  renderStage();
}

function handleDocumentationReset() {
  clearActiveWorkflow();
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
  if (!encounter || !protocol || !renderer) return;
  const context = protocolContext();

  for (const operation of deriveTemporalOperations(protocol, context)) {
    if (operation.action === 'pending') {
      ensurePendingItem(operation.id, operation.kind, operation.label);
      continue;
    }
    markAvailable(operation.id, {
      kind: operation.kind,
      label: operation.label,
      ...operation.payload,
      availableAt: new Date().toISOString()
    });
  }

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

function renderToolState(tool, state) {
  const nodes = renderer?.getToolNodes(tool.id);
  if (!nodes?.status) return;
  const { status, button } = nodes;
  const presentation = deriveToolPresentation(tool, state);
  status.dataset.state = presentation.state;
  status.textContent = presentation.message;
  if (button) {
    button.hidden = presentation.buttonHidden;
    button.textContent = presentation.buttonText;
  }
}

function updateTools() {
  if (!protocol || !renderer) return;
  const context = protocolContext();
  for (const tool of protocol.tools || []) {
    const evaluated = evaluateToolState(tool, toolStates[tool.id] || createToolState(tool), resolveToolVariables(tool, context));
    const intent = readPersistedToolApplication(encounter?.context, tool.id);
    const state = applyPersistedToolIntent(evaluated, intent);
    toolStates[tool.id] = state;
    renderToolState(tool, state);
  }
}

function handleToolApply(toolId) {
  const state = toolStates[toolId];
  if (!state) return;
  if (!state.applied && state.calculability !== 'calculable') return;
  toolStates[toolId] = setToolApplied(state, !state.applied);
  persistTemporalContext();
  updateTools();
}

function mountProtocol(protocolId) {
  protocol = protocolId ? getProtocol(protocolId) : null;
  toolStates = {};
  renderer = null;
  const mount = $('workflow-protocol-fields');
  if (!mount) return;
  if (!protocol) {
    mount.replaceChildren();
    return;
  }
  renderer = createProtocolRenderer({
    protocol,
    mount,
    onFieldChange: handleContextChange,
    onToolApply: handleToolApply
  });
  for (const tool of protocol.tools || []) toolStates[tool.id] = createToolState(tool);
}

function clearActiveWorkflow() {
  encounter = null;
  encounterStorage.clearActiveEncounter();
  mountProtocol('');
  if ($('workflow-scenario')) $('workflow-scenario').value = '';
  renderProtocolVisibility();
  renderStage();
  renderPending();
}

function requestWorkflowSelection(workflowId, restoring = false) {
  const request = new CustomEvent(CONTEXT_EVENTS.WORKFLOW_SELECTION_REQUEST, {
    cancelable: true,
    detail: { workflowId, restoring }
  });
  return document.dispatchEvent(request);
}

function handleTemplateSelectionRequest(event) {
  const input = {
    templateSelection: event.detail?.templateSelection || null,
    workflowId: encounter?.workflowId || '',
    encounter,
    hasDocumentContent: Boolean(event.detail?.hasDocumentContent)
  };
  let decision = decideTemplateSelection(input);
  if (decision.status === CONTEXT_DECISIONS.CONFIRM) {
    const accepted = window.confirm(
      input.hasDocumentContent
        ? 'O roteiro não corresponde ao workflow atual. Continuar? A documentação será salva em Rascunhos, o estado temporal será desativado e o roteiro abrirá em um contexto limpo.'
        : 'O workflow atual contém estado clínico ou temporal. Desativar esse estado para aplicar o roteiro?'
    );
    decision = decideTemplateSelection({ ...input, confirmed: accepted });
  }
  if (decision.status === CONTEXT_DECISIONS.CANCEL) {
    event.preventDefault();
    return;
  }
  event.detail.resetDocument = Boolean(decision.resetDocument);
  if (decision.clearWorkflow) clearActiveWorkflow();
}

function populateScenarioOptions() {
  const select = $('workflow-scenario');
  if (!select) return;
  for (const item of listProtocolOptions()) {
    if (select.querySelector(`option[value="${item.id}"]`)) continue;
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.label;
    select.appendChild(option);
  }
}

function captureAdmissionSnapshot() {
  if (!encounter) return;
  encounter = updateAdmissionSnapshot(encounter, currentAdmissionSnapshot());
  persistEncounter();
}

function handleScenarioChange() {
  const scenario = $('workflow-scenario')?.value || '';
  const previousScenario = encounter?.workflowId || '';
  let replacement = decideEncounterReplacement({
    currentWorkflowId: previousScenario,
    nextWorkflowId: scenario,
    encounter
  });
  if (replacement.status === CONTEXT_DECISIONS.CONFIRM) {
    const accepted = window.confirm(
      'Este workflow contém estado clínico ou temporal. Desativar esse estado e trocar de workflow?'
    );
    replacement = decideEncounterReplacement({
      currentWorkflowId: previousScenario,
      nextWorkflowId: scenario,
      encounter,
      confirmed: accepted
    });
  }
  if (replacement.status === CONTEXT_DECISIONS.CANCEL) {
    if ($('workflow-scenario')) $('workflow-scenario').value = previousScenario;
    return;
  }
  if (!scenario) {
    clearActiveWorkflow();
    return;
  }

  if (!encounter || encounter.workflowId !== scenario) {
    if (!requestWorkflowSelection(scenario)) {
      if ($('workflow-scenario')) $('workflow-scenario').value = previousScenario;
      return;
    }
    encounter = encounter && !encounter.workflowId
      ? attachWorkflow(encounter, scenario)
      : createEncounter({ workflowId: scenario, admissionSnapshot: {}, context: {} });
  }
  mountProtocol(scenario);
  renderer?.setContext(encounter.context || {});
  persistTemporalContext();
  renderProtocolVisibility();
  renderStage();
  renderPending();
  updateTools();
}

function handleContextChange() {
  for (const [id, state] of Object.entries(toolStates)) {
    if (state.applied) toolStates[id] = setToolApplied(state, false);
  }
  persistTemporalContext();
  renderProtocolVisibility();
  syncTemporalResults();
  updateTools();
}

function handleEvolutionGenerated() {
  if (!encounter) handleClinicalActivity();
  if (!encounter) return;
  const output = $('evolution-output');
  if (!output) return;
  output.value = injectScoresIntoEvolution(output.value, toolStateList());
  captureAdmissionSnapshot();
}

function handleStartReassessment() {
  if (!encounter) handleClinicalActivity();
  if (!encounter) return;
  persistTemporalContext();
  captureAdmissionSnapshot();
  encounter = startReassessment(encounter);
  persistEncounter();
  renderStage();
  renderProtocolVisibility();
  document.dispatchEvent(new CustomEvent('zera:reassessment-started'));
}

function splitLines(value) {
  return String(value || '').split(/\n+/).map((line) => line.trim()).filter(Boolean);
}

function handleReassessmentGenerated() {
  if (!encounter) return;
  persistTemporalContext();
  updateTools();
  const scores = toolStateList();
  const admission = encounter.admissionSnapshot || {};
  const narrativeParts = [$('reav-evolucao')?.value || '', $('reav-exames')?.value || '']
    .map((item) => item.trim()).filter(Boolean);
  const carryForwardSections = extractCarryForwardSections(admission.evolutionText || $('evolution-output')?.value || '');
  const output = renderTemporalReassessment({
    qp: admission.qp || $('qp')?.value || '',
    scores,
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
      scores: scores.filter((state) => state.applied),
      conduct: splitLines($('reav-conduta')?.value),
      document: output
    };
  }
  encounter = { ...encounter, reassessments };
  persistEncounter();
}

function restoreTemporalUi() {
  const scenario = encounter?.workflowId || '';
  if (scenario && !requestWorkflowSelection(scenario, true)) {
    clearActiveWorkflow();
    return;
  }
  if ($('workflow-scenario')) $('workflow-scenario').value = scenario;
  mountProtocol(scenario);
  renderer?.setContext(encounter?.context || {});
  renderProtocolVisibility();
  renderStage();
  renderPending();
  updateTools();
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
    .tool-status[data-state="unavailable"]{background:#eef1f4;color:#526171}.tool-status[data-state="incomplete"]{background:#fff3cd;color:#705500}.tool-status[data-state="complete"]{background:#dff4e5;color:#1f6334}
    .workflow-pending{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.pending-chip{padding:7px 10px;border-radius:999px;font-size:.74rem;font-weight:800}.pending-chip.pending{background:#fff3cd;color:#705500}.pending-chip.available{background:#dff4e5;color:#1f6334}.workflow-empty{font-size:.78rem;color:#637083}
  `;
  document.head.appendChild(style);
}

function bindTemporalEvents() {
  document.addEventListener(CONTEXT_EVENTS.TEMPLATE_SELECTION_REQUEST, handleTemplateSelectionRequest);
  $('workflow-scenario')?.addEventListener('change', handleScenarioChange);
  $('evolution-form')?.addEventListener('input', handleClinicalActivity);
  $('evolution-form')?.addEventListener('reset', handleDocumentationReset);
  $('reassess-encounter')?.addEventListener('click', handleStartReassessment);
  $('generate-evolution')?.addEventListener('click', () => queueMicrotask(handleEvolutionGenerated));
  $('generate-reassessment')?.addEventListener('click', () => queueMicrotask(handleReassessmentGenerated));
}

function initTemporalWorkflow() {
  injectTemporalStyles();
  populateScenarioOptions();
  restoreTemporalUi();
  bindTemporalEvents();
  queueMicrotask(handleClinicalActivity);
}

document.addEventListener('DOMContentLoaded', initTemporalWorkflow);
