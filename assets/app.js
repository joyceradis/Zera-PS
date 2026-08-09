import { NORMAL_EXAM_TEMPLATE, QUICK_CHOICES, FIELD_MAP } from './data.js';
import { TEMPLATES } from './templates.js';
import {
  createClinicalField,
  confirmDenied,
  confirmReported,
  confirmObserved,
  confirmTemplate
} from './clinical-state.js';
import {
  SCORE_LIST,
  SCORE_DEFINITIONS,
  createScoreState,
  answerScore,
  calculateScore,
  calculateGlasgow
} from './scores.js';
import {
  renderEvolution,
  renderReassessment,
  renderAdmission,
  renderDischarge
} from './document-engine.js';
import { createStorage, emptyClinicalState } from './storage.js';
import {
  $,
  $$,
  escapeHtml,
  showFeedback,
  injectUiStyles,
  renderTemplates,
  setActiveTemplate,
  buildQuickChoices,
  syncAllQuickChoices,
  renderScores,
  updateScoreCard,
  activateView,
  setupPwa,
  updateConnection
} from './ui.js';
import {
  CONTEXT_DECISIONS,
  CONTEXT_EVENTS,
  decideWorkflowSelection
} from '../src/context-coordination.js';

const storage = createStorage();
const HPP_KEYS = ['comorbidades', 'muc', 'alergias', 'habitos', 'cirurgias'];
const EXAM_KEYS = ['estadoGeral', 'acv', 'ar', 'abd', 'ext', 'neuro'];
const FORM_IDS = {
  qp: 'qp', hda: 'hda', comorbidades: 'comorbidades', muc: 'muc', alergias: 'alergias', habitos: 'habitos', cirurgias: 'cirurgias',
  estadoGeral: 'estado-geral', acv: 'acv', ar: 'ar', abd: 'abd', ext: 'ext', neuro: 'neuro',
  laboratoriais: 'laboratoriais', imagem: 'imagem', hipoteses: 'hipoteses', conduta: 'conduta', emTempo: 'em-tempo'
};
const DEFAULT_HDA_PLACEHOLDER = 'HISTÓRIA CRONOLÓGICA DO QUADRO E DADOS EFETIVAMENTE INVESTIGADOS';

let clinicalState = emptyClinicalState();
let scoreStates = Object.fromEntries(SCORE_LIST.map((definition) => [definition.id, createScoreState(definition)]));
let glasgowAnswers = { eye: null, verbal: null, motor: null };
let activeTemplateSelection = null;
let templateSelectionKnown = true;

const normalize = (value) => String(value ?? '').trim().toUpperCase();

function readForm() {
  return {
    qp: $('qp')?.value || '',
    hda: $('hda')?.value || '',
    comorbidades: $('comorbidades')?.value || '',
    muc: $('muc')?.value || '',
    alergias: $('alergias')?.value || '',
    habitos: $('habitos')?.value || '',
    cirurgias: $('cirurgias')?.value || '',
    estadoGeral: $('estado-geral')?.value || '',
    acv: $('acv')?.value || '',
    ar: $('ar')?.value || '',
    abd: $('abd')?.value || '',
    ext: $('ext')?.value || '',
    neuro: $('neuro')?.value || '',
    laboratoriais: $('laboratoriais')?.value || '',
    imagem: $('imagem')?.value || '',
    hipoteses: $('hipoteses')?.value || '',
    conduta: $('conduta')?.value || '',
    includeEmTempo: Boolean($('include-em-tempo')?.checked),
    emTempo: $('em-tempo')?.value || ''
  };
}

function restoreForm(form = {}) {
  Object.entries(FORM_IDS).forEach(([key, id]) => {
    const node = $(id);
    if (node) node.value = form[key] || '';
  });
  if ($('include-em-tempo')) $('include-em-tempo').checked = Boolean(form.includeEmTempo);
  toggleEmTempo();
}

function currentSnapshot() {
  return {
    schemaVersion: 2,
    form: readForm(),
    clinicalState,
    templateSelection: activeTemplateSelection,
    output: $('evolution-output')?.value || ''
  };
}

function autosave() {
  try {
    templateSelectionKnown = true;
    storage.saveAutosave(currentSnapshot());
    if ($('save-status')) $('save-status').textContent = 'AUTOSSALVO';
  } catch {
    if ($('save-status')) $('save-status').textContent = 'NÃO SALVO';
  }
}

function syncHppState(key, rawValue) {
  const value = normalize(rawValue);
  const current = clinicalState.hpp[key] || createClinicalField();
  if (!value) clinicalState.hpp[key] = createClinicalField();
  else if (value === 'NEGA') clinicalState.hpp[key] = confirmDenied(current, { source: 'patient' });
  else clinicalState.hpp[key] = confirmReported(current, value);
  autosave();
}

function syncExamState(key, rawValue) {
  const value = normalize(rawValue);
  const current = clinicalState.physicalExam.fields[key] || createClinicalField();
  clinicalState.physicalExam.fields[key] = value ? confirmObserved(current, value) : createClinicalField();

  if (clinicalState.physicalExam.template) {
    const original = normalize(clinicalState.physicalExam.template.values?.[key]);
    const wasModified = Boolean(clinicalState.physicalExam.template.modified);
    const nowModified = value !== original;
    clinicalState.physicalExam.template = {
      ...clinicalState.physicalExam.template,
      modified: wasModified || nowModified,
      modifiedAt: (wasModified || nowModified) ? new Date().toISOString() : null
    };
  }
  autosave();
}

function onQuickInput(key, value) {
  if (HPP_KEYS.includes(key)) syncHppState(key, value);
  else if (EXAM_KEYS.includes(key)) syncExamState(key, value);
}

function confirmAllHppNegatives() {
  HPP_KEYS.forEach((key) => {
    const node = $(FORM_IDS[key]);
    if (node) node.value = 'NEGA';
    clinicalState.hpp[key] = confirmDenied(clinicalState.hpp[key] || createClinicalField(), { source: 'patient' });
  });
  syncAllQuickChoices(QUICK_CHOICES, FIELD_MAP);
  autosave();
  showFeedback('Negativas de HPP registradas por ação explícita. Revise antes de copiar.');
}

function useNormalExamTemplate() {
  clinicalState.physicalExam.template = {
    ...confirmTemplate(NORMAL_EXAM_TEMPLATE.id, NORMAL_EXAM_TEMPLATE.values),
    modified: false,
    modifiedAt: null
  };
  Object.entries(NORMAL_EXAM_TEMPLATE.values).forEach(([key, value]) => {
    const node = $(FORM_IDS[key]);
    if (node) node.value = value;
    clinicalState.physicalExam.fields[key] = confirmObserved(
      clinicalState.physicalExam.fields[key] || createClinicalField(),
      value
    );
  });
  syncAllQuickChoices(QUICK_CHOICES, FIELD_MAP);
  autosave();
  showFeedback('Modelo de exame normal confirmado por ação médica. Edite qualquer achado divergente.');
}

function documentHasContent() {
  const form = readForm();
  return Object.entries(form).some(([key, value]) => (
    key === 'includeEmTempo' ? value === true : normalize(value).length > 0
  )) || normalize($('evolution-output')?.value).length > 0;
}

function archiveDocumentationForContextSwitch() {
  if (!documentHasContent()) return false;
  const snapshot = currentSnapshot();
  const drafts = getDrafts();
  drafts.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: `${normalize(snapshot.form.qp) || 'RASCUNHO SEM QP'} — TROCA DE CONTEXTO`,
    createdAt: new Date().toISOString(),
    reason: 'context_switch',
    snapshot
  });
  storage.saveDrafts(drafts.slice(0, 30));
  renderDrafts();
  return true;
}

function resetDocumentationSurface() {
  restoreForm({});
  clinicalState = emptyClinicalState();
  scoreStates = Object.fromEntries(SCORE_LIST.map((definition) => [definition.id, createScoreState(definition)]));
  glasgowAnswers = { eye: null, verbal: null, motor: null };
  renderScores(SCORE_LIST, handleScoreAnswer, handleGlasgowChange);
  if ($('evolution-output')) $('evolution-output').value = '';
  deactivateTemplate({ persist: false });
  syncAllQuickChoices(QUICK_CHOICES, FIELD_MAP);
  storage.saveAutosave(currentSnapshot());
  if ($('save-status')) $('save-status').textContent = 'NOVO CONTEXTO';
}

function prepareFreshDocumentation() {
  const archived = archiveDocumentationForContextSwitch();
  resetDocumentationSurface();
  if (archived) showFeedback('Documentação anterior preservada em Rascunhos. Novo contexto iniciado sem mistura.');
}

function restoreTemplateSelection(snapshot = {}) {
  templateSelectionKnown = Object.hasOwn(snapshot, 'templateSelection');
  activeTemplateSelection = snapshot.templateSelection || null;
  const template = TEMPLATES.find((item) => item.id === activeTemplateSelection?.templateId);
  if (!template) activeTemplateSelection = null;
  setActiveTemplate(activeTemplateSelection?.templateId || null);
  if ($('hda')) $('hda').placeholder = template?.hdaPrompt || DEFAULT_HDA_PLACEHOLDER;
}

function deactivateTemplate({ persist = true } = {}) {
  activeTemplateSelection = null;
  templateSelectionKnown = true;
  setActiveTemplate(null);
  if ($('hda')) $('hda').placeholder = DEFAULT_HDA_PLACEHOLDER;
  if (persist) autosave();
}

function handleWorkflowSelectionRequest(event) {
  const input = {
    workflowId: event.detail?.workflowId || '',
    templateSelection: activeTemplateSelection,
    hasDocumentContent: documentHasContent(),
    selectionKnown: templateSelectionKnown,
    restoring: Boolean(event.detail?.restoring)
  };
  let decision = decideWorkflowSelection(input);
  if (decision.status === CONTEXT_DECISIONS.CONFIRM) {
    const accepted = window.confirm(
      input.restoring && !input.selectionKnown
        ? 'Há documentação recuperada e um workflow sem vínculo verificável. Manter o workflow? A documentação atual será salva em Rascunhos e o workflow abrirá em um contexto limpo.'
        : 'Este roteiro não corresponde ao workflow selecionado. Continuar? A documentação atual será salva em Rascunhos e o workflow abrirá em um contexto limpo.'
    );
    decision = decideWorkflowSelection({ ...input, confirmed: accepted });
  }
  if (decision.status === CONTEXT_DECISIONS.CANCEL) {
    event.preventDefault();
    return;
  }
  if (decision.resetDocument) {
    prepareFreshDocumentation();
  } else if (decision.clearTemplate || (input.restoring && !input.selectionKnown)) {
    deactivateTemplate();
  }
}

function requestTemplateActivation(selection) {
  const detail = {
    templateSelection: selection,
    hasDocumentContent: documentHasContent(),
    resetDocument: false
  };
  const request = new CustomEvent(CONTEXT_EVENTS.TEMPLATE_SELECTION_REQUEST, {
    cancelable: true,
    detail
  });
  return { allowed: document.dispatchEvent(request), resetDocument: detail.resetDocument };
}

function applyTemplate(id) {
  const template = TEMPLATES.find((item) => item.id === id);
  if (!template) return;
  const selection = {
    templateId: template.id,
    protocolId: template.protocolId || null,
    selectedAt: new Date().toISOString()
  };
  const activation = requestTemplateActivation(selection);
  if (!activation.allowed) return;
  if (activation.resetDocument) prepareFreshDocumentation();
  if ($('qp') && !normalize($('qp').value)) $('qp').value = template.qp || '';
  if ($('hda')) $('hda').placeholder = template.hdaPrompt || DEFAULT_HDA_PLACEHOLDER;
  activeTemplateSelection = selection;
  templateSelectionKnown = true;
  setActiveTemplate(id);
  autosave();
  const toolNote = template.clinicalTools?.length ? ` Ferramenta clínica vinculada: ${template.clinicalTools.join(', ').toUpperCase()}.` : '';
  const archiveNote = activation.resetDocument ? ' A documentação anterior foi preservada em Rascunhos.' : '';
  showFeedback(`Roteiro ${template.label} aplicado sem misturar contextos.${archiveNote}${toolNote}`);
}

function clearTemplate() {
  deactivateTemplate();
  showFeedback('Roteiro removido. Os dados já digitados foram preservados.');
}

function countUnconfirmedHpp() {
  return HPP_KEYS.filter((key) => clinicalState.hpp[key]?.confirmed !== true).length;
}

function generateEvolution() {
  const raw = readForm();
  const text = renderEvolution(raw, clinicalState);
  $('evolution-output').value = text;
  $('save-status').textContent = 'GERADO';
  autosave();
  const pending = countUnconfirmedHpp();
  showFeedback(pending
    ? `Evolução gerada. ${pending} campo(s) de HPP sem confirmação foram omitidos.`
    : 'Evolução gerada a partir dos dados confirmados. Revise antes de copiar.');
}

async function copyTextFrom(targetId) {
  const target = $(targetId);
  if (!target || !target.value.trim()) {
    showFeedback('Não há texto para copiar.');
    return;
  }
  try {
    await navigator.clipboard.writeText(target.value);
  } catch {
    target.select();
    document.execCommand('copy');
  }
  showFeedback('Texto copiado.');
}

function getDrafts() {
  try { return storage.loadDrafts(); } catch { return []; }
}

function saveDraft() {
  const snapshot = currentSnapshot();
  if (!snapshot.form.qp && !snapshot.form.hda && !snapshot.output) {
    showFeedback('Preencha ao menos a QP ou a HDA antes de salvar.');
    return;
  }
  const drafts = getDrafts();
  drafts.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: normalize(snapshot.form.qp) || 'RASCUNHO SEM QP',
    createdAt: new Date().toISOString(),
    snapshot
  });
  storage.saveDrafts(drafts.slice(0, 30));
  renderDrafts();
  $('save-status').textContent = 'SALVO';
  showFeedback('Rascunho v2 salvo neste dispositivo.');
}

function renderDrafts() {
  const container = $('draft-list');
  if (!container) return;
  const drafts = getDrafts();
  if (!drafts.length) {
    container.innerHTML = '<div class="empty-state">Nenhum rascunho salvo neste dispositivo.</div>';
    return;
  }
  container.innerHTML = drafts.map((draft) => `<article class="draft-card"><div><h3>${escapeHtml(draft.title)}</h3><p>${new Date(draft.createdAt).toLocaleString('pt-BR')}</p></div><div class="draft-actions"><button class="button button-secondary button-small" data-load-draft="${draft.id}">Abrir</button><button class="button button-danger button-small" data-delete-draft="${draft.id}">Excluir</button></div></article>`).join('');
  $$('[data-load-draft]', container).forEach((button) => button.addEventListener('click', () => loadDraft(button.dataset.loadDraft)));
  $$('[data-delete-draft]', container).forEach((button) => button.addEventListener('click', () => deleteDraft(button.dataset.deleteDraft)));
}

function loadDraft(id) {
  const draft = getDrafts().find((item) => item.id === id);
  if (!draft) return;
  const snapshot = draft.snapshot || draft.state;
  if (snapshot?.form) {
    const coordinationSelection = snapshot.templateSelection?.templateId
      ? snapshot.templateSelection
      : { templateId: `draft:${id}`, protocolId: null };
    const activation = requestTemplateActivation(coordinationSelection);
    if (!activation.allowed) return;
    if (activation.resetDocument) prepareFreshDocumentation();
    restoreForm(snapshot.form);
    clinicalState = snapshot.clinicalState || emptyClinicalState();
    restoreTemplateSelection(snapshot);
    $('evolution-output').value = snapshot.output || '';
  }
  syncAllQuickChoices(QUICK_CHOICES, FIELD_MAP);
  activateView('evolucao');
  $('save-status').textContent = 'RASCUNHO ABERTO';
  showFeedback('Rascunho carregado. Revise dados migrados antes de copiar.');
}

function deleteDraft(id) {
  storage.saveDrafts(getDrafts().filter((item) => item.id !== id));
  renderDrafts();
}

function clearAllDrafts() {
  if (!confirm('Apagar todos os rascunhos salvos neste dispositivo?')) return;
  storage.saveDrafts([]);
  renderDrafts();
}

function clearForm() {
  if (!confirm('Limpar todos os campos da evolução atual?')) return;
  $('evolution-form').reset();
  $('evolution-output').value = '';
  clinicalState = emptyClinicalState();
  storage.clearAutosave();
  deactivateTemplate({ persist: false });
  toggleEmTempo();
  syncAllQuickChoices(QUICK_CHOICES, FIELD_MAP);
  $('save-status').textContent = 'NÃO SALVO';
  showFeedback('Campos e estado clínico da evolução atual foram limpos.');
}

function toggleEmTempo() {
  if ($('em-tempo-field')) $('em-tempo-field').hidden = !$('include-em-tempo')?.checked;
}

function generateReassessment() {
  $('reassessment-output').value = renderReassessment({
    evolucao: $('reav-evolucao').value,
    exames: $('reav-exames').value,
    conduta: $('reav-conduta').value
  });
}

function generateAdmission() {
  $('admission-output').value = renderAdmission({
    diagnostico: $('int-diagnostico').value,
    justificativa: $('int-justificativa').value,
    destino: $('int-destino').value,
    prescricao: $('int-prescricao').value
  });
}

function generateDischarge() {
  $('discharge-output').value = renderDischarge({
    diagnostico: $('alta-diagnostico').value,
    resumo: $('alta-resumo').value,
    medicacoes: $('alta-medicacoes').value,
    orientacoes: $('alta-orientacoes').value
  });
}

function handleScoreAnswer(scoreId, key, rawValue) {
  const definition = SCORE_DEFINITIONS[scoreId];
  if (!definition) return;
  const value = rawValue === '' ? null : rawValue === 'true';
  scoreStates[scoreId] = answerScore(scoreStates[scoreId], key, value);
  scoreStates[scoreId] = calculateScore(definition, scoreStates[scoreId]);
  updateScoreCard(scoreId, scoreStates[scoreId]);
}

function handleGlasgowChange() {
  $$('[data-glasgow]').forEach((select) => {
    glasgowAnswers[select.dataset.glasgow] = select.value === '' ? null : Number(select.value);
  });
  updateScoreCard('glasgow', calculateGlasgow(glasgowAnswers));
}

function loadAutosave() {
  try {
    const snapshot = storage.loadAutosave();
    if (!snapshot) return;
    restoreForm(snapshot.form || {});
    clinicalState = snapshot.clinicalState || emptyClinicalState();
    restoreTemplateSelection(snapshot);
    $('evolution-output').value = snapshot.output || '';
    $('save-status').textContent = snapshot.migratedFrom ? 'MIGRADO — REVISE' : 'RECUPERADO';
  } catch {
    $('save-status').textContent = 'NÃO SALVO';
  }
}

function bindEvents() {
  document.addEventListener(CONTEXT_EVENTS.WORKFLOW_SELECTION_REQUEST, handleWorkflowSelectionRequest);
  $('generate-evolution').addEventListener('click', generateEvolution);
  $('copy-evolution').addEventListener('click', () => copyTextFrom('evolution-output'));
  $('save-draft').addEventListener('click', saveDraft);
  $('clear-form').addEventListener('click', clearForm);
  $('fill-negatives').addEventListener('click', confirmAllHppNegatives);
  $('fill-normal-exam').addEventListener('click', useNormalExamTemplate);
  $('clear-template').addEventListener('click', clearTemplate);
  $('include-em-tempo').addEventListener('change', () => { toggleEmTempo(); autosave(); });
  ['qp','hda','laboratoriais','imagem','hipoteses','conduta','em-tempo'].forEach((id) => $(id)?.addEventListener('input', autosave));
  $('evolution-output').addEventListener('input', autosave);

  $('generate-reassessment').addEventListener('click', generateReassessment);
  $('generate-admission').addEventListener('click', generateAdmission);
  $('generate-discharge').addEventListener('click', generateDischarge);
  $$('[data-copy-target]').forEach((button) => button.addEventListener('click', () => copyTextFrom(button.dataset.copyTarget)));

  $$('.nav-button').forEach((button) => button.addEventListener('click', () => { activateView(button.dataset.view); if (button.dataset.view === 'rascunhos') renderDrafts(); }));
  $('menu-button').addEventListener('click', () => { $('sidebar').classList.add('open'); $('sidebar-overlay').classList.add('open'); });
  $('sidebar-overlay').addEventListener('click', () => { $('sidebar').classList.remove('open'); $('sidebar-overlay').classList.remove('open'); });
  $('clear-all-drafts').addEventListener('click', clearAllDrafts);
  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);
}

function init() {
  injectUiStyles();
  renderTemplates(TEMPLATES, applyTemplate);
  renderScores(SCORE_LIST, handleScoreAnswer, handleGlasgowChange);
  buildQuickChoices(QUICK_CHOICES, FIELD_MAP, onQuickInput);
  loadAutosave();
  syncAllQuickChoices(QUICK_CHOICES, FIELD_MAP);
  renderDrafts();
  bindEvents();
  toggleEmTempo();
  updateConnection();
  setupPwa();
}

document.addEventListener('DOMContentLoaded', init);
