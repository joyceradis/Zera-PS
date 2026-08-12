import { transformLaboratoryText } from './lab-parser.js';
import { matchTriggerGroups, composeHdaFromQp } from './clinical-intake.js';
import { formatImageReport } from './text-formatters.js';
import { assembleFreeExamJustification } from './justification-engine.js';
import {
  extractEncounterRecords,
  summarizeProductivity,
  formatPatientsPerHour
} from './productivity.js';

const PRIMARY_VIEW = 'evolucao';
const PRIMARY_DESTINATIONS = Object.freeze([
  { id: 'evolucao', label: 'Atendimento' },
  { id: 'rascunhos', label: 'Rascunhos' },
  { id: 'plantao', label: 'Resumo do Plantão' }
]);
const ENCOUNTER_ACTION_VIEWS = Object.freeze([
  { id: 'reavaliacao', label: 'Reavaliar atendimento' },
  { id: 'internacao', label: 'Internação' },
  { id: 'alta', label: 'Alta' },
  { id: 'scores', label: 'Ferramentas' }
]);
const labSnapshots = new WeakMap();

function createTextNodeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function setPrimaryDestination(viewId) {
  const target = document.getElementById(`view-${viewId}`);
  if (!target) return;

  for (const view of document.querySelectorAll('.view')) {
    view.classList.toggle('active', view === target);
  }

  for (const nav of document.querySelectorAll('.nav-button')) {
    const navView = nav.dataset.primaryDestination || nav.dataset.view;
    nav.classList.toggle('active', navView === viewId);
  }

  const destination = PRIMARY_DESTINATIONS.find((item) => item.id === viewId);
  const title = document.getElementById('view-title');
  if (title && destination) title.textContent = destination.label;
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');
  if (viewId === 'plantao') renderProductivitySummary();
}

function relabelPrimarySurface() {
  const nav = document.querySelector(`.nav-button[data-view="${PRIMARY_VIEW}"]`);
  if (nav) {
    nav.textContent = 'Atendimento';
    nav.dataset.primaryDestination = PRIMARY_VIEW;
  }

  const drafts = document.querySelector('.nav-button[data-view="rascunhos"]');
  if (drafts) drafts.dataset.primaryDestination = 'rascunhos';

  const view = document.getElementById('view-evolucao');
  if (view) view.dataset.title = 'Atendimento';
}

function hideInternalNavigation() {
  for (const { id } of ENCOUNTER_ACTION_VIEWS) {
    const nav = document.querySelector(`.nav-button[data-view="${id}"]`);
    if (nav) nav.hidden = true;
  }
}

function createProductivityView() {
  if (document.getElementById('view-plantao')) return;
  const workspace = document.querySelector('.workspace');
  if (!workspace) return;

  const view = document.createElement('section');
  view.id = 'view-plantao';
  view.className = 'view';
  view.dataset.title = 'Resumo do Plantão';

  const intro = document.createElement('div');
  intro.className = 'notice-bar notice-bar-compact';
  intro.textContent = 'Resumo operacional local. As métricas não entram no prontuário.';
  view.append(intro, createProductivityPanel());
  workspace.appendChild(view);
}

function createPrimaryNavigation() {
  const nav = document.querySelector('.app-nav');
  if (!nav) return;

  relabelPrimarySurface();
  hideInternalNavigation();
  createProductivityView();

  let shiftButton = nav.querySelector('[data-primary-destination="plantao"]');
  if (!shiftButton) {
    shiftButton = createTextNodeElement('button', 'nav-button', 'Resumo do Plantão');
    shiftButton.type = 'button';
    shiftButton.dataset.primaryDestination = 'plantao';
    shiftButton.dataset.view = 'plantao';
    nav.appendChild(shiftButton);
  }

  for (const destination of PRIMARY_DESTINATIONS) {
    const button = nav.querySelector(`[data-primary-destination="${destination.id}"]`)
      || nav.querySelector(`.nav-button[data-view="${destination.id}"]`);
    if (!button || button.dataset.definitiveNavBound === 'true') continue;
    button.dataset.definitiveNavBound = 'true';
    button.addEventListener('click', () => setPrimaryDestination(destination.id));
  }
}

function hideLegacyContextSelectors() {
  const workflowCard = document.querySelector('.workflow-card');
  const workflowContext = document.getElementById('workflow-context');
  const templateGrid = document.getElementById('template-grid');
  const clearTemplate = document.getElementById('clear-template');
  const topHeading = document.querySelector('#view-evolucao .form-panel > .section-heading');
  if (workflowCard) workflowCard.hidden = true;
  if (workflowContext) workflowContext.hidden = true;
  if (templateGrid) templateGrid.hidden = true;
  if (clearTemplate) clearTemplate.hidden = true;
  if (topHeading) topHeading.hidden = true;
}

function createZeroFrictionIntake() {
  const qpInput = document.getElementById('qp');
  const hdaInput = document.getElementById('hda');
  if (!qpInput || !hdaInput || document.getElementById('qp-free')) return;

  hideLegacyContextSelectors();
  const qpField = qpInput.closest('.field');
  const hdaField = hdaInput.closest('.field');
  const historySection = qpField?.closest('.form-section');
  if (!qpField || !hdaField || !historySection) return;
  qpField.hidden = true;
  hdaField.hidden = true;
  const diarrheaGuide = document.getElementById('hda-diarrhea-guide');
  if (diarrheaGuide) diarrheaGuide.hidden = true;

  const field = document.createElement('label');
  field.className = 'field zero-friction-intake';
  field.appendChild(createTextNodeElement('span', '', 'Queixa e contexto clínico (QP)'));
  const free = document.createElement('textarea');
  free.id = 'qp-free';
  free.rows = 5;
  free.placeholder = 'ESCREVA COMO VOCÊ PENSA: EX. CEFALEIA HÁ 2H, INÍCIO SÚBITO, NÁUSEAS...';
  free.value = hdaInput.value || qpInput.value || '';
  field.appendChild(free);
  field.appendChild(createTextNodeElement('small', '', 'Texto livre primeiro. O Zera só revela pontos de atenção quando o contexto digitado os torna pertinentes.'));

  const triggerHost = document.createElement('section');
  triggerHost.id = 'conditional-clinical-triggers';
  triggerHost.className = 'conditional-clinical-triggers';
  triggerHost.hidden = true;
  triggerHost.setAttribute('aria-live', 'polite');

  const selected = new Set();
  const previousHda = hdaInput.value.toLowerCase();

  const syncDocumentState = () => {
    const selectedLabels = [...triggerHost.querySelectorAll('input[type="checkbox"]:checked')].map((node) => node.value);
    qpInput.value = free.value;
    hdaInput.value = composeHdaFromQp(free.value, selectedLabels);
    qpInput.dispatchEvent(new Event('input', { bubbles: true }));
    hdaInput.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const renderTriggers = () => {
    const groups = matchTriggerGroups(free.value);
    const allowed = new Set(groups.flatMap((group) => group.flags));
    for (const flag of [...selected]) if (!allowed.has(flag)) selected.delete(flag);
    triggerHost.replaceChildren();
    triggerHost.hidden = groups.length === 0;

    for (const group of groups) {
      const groupNode = document.createElement('fieldset');
      groupNode.className = 'clinical-trigger-group';
      groupNode.appendChild(createTextNodeElement('legend', '', group.label));
      const grid = document.createElement('div');
      grid.className = 'clinical-trigger-grid';
      for (const flag of group.flags) {
        const label = document.createElement('label');
        label.className = 'clinical-trigger-chip';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = flag;
        checkbox.checked = selected.has(flag) || previousHda.includes(flag.toLowerCase());
        if (checkbox.checked) selected.add(flag);
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) selected.add(flag); else selected.delete(flag);
          syncDocumentState();
        });
        label.append(checkbox, createTextNodeElement('span', '', flag));
        grid.appendChild(label);
      }
      groupNode.appendChild(grid);
      triggerHost.appendChild(groupNode);
    }
    syncDocumentState();
  };

  free.addEventListener('input', renderTriggers);
  historySection.insertBefore(field, qpField);
  field.insertAdjacentElement('afterend', triggerHost);
  renderTriggers();
}

function openEncounterPanel(panelId) {
  setPrimaryDestination(PRIMARY_VIEW);
  const workspace = document.getElementById('encounter-continuation-workspace');
  if (!workspace) return;

  let activePanel = null;
  for (const panel of workspace.querySelectorAll('[data-encounter-panel]')) {
    const active = panel.dataset.encounterPanel === panelId;
    panel.hidden = !active;
    if (active) activePanel = panel;
  }

  for (const button of workspace.querySelectorAll('[data-encounter-action]')) {
    const active = button.dataset.encounterAction === panelId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }

  activePanel?.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function createEncounterContinuationWorkspace() {
  const view = document.getElementById('view-evolucao');
  if (!view || document.getElementById('encounter-continuation-workspace')) return;

  const section = document.createElement('section');
  section.id = 'encounter-continuation-workspace';
  section.className = 'encounter-continuation-workspace';

  const heading = document.createElement('div');
  heading.className = 'section-heading compact encounter-continuation-heading';
  const headingBody = document.createElement('div');
  headingBody.append(createTextNodeElement('p', 'section-kicker', 'AÇÕES DO ATENDIMENTO'), createTextNodeElement('h2', '', 'Continuar o mesmo atendimento'));
  heading.appendChild(headingBody);

  const row = document.createElement('div');
  row.className = 'encounter-action-row';
  const panels = document.createElement('div');
  panels.className = 'encounter-panels';

  for (const action of ENCOUNTER_ACTION_VIEWS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = action.id === 'reavaliacao' ? 'button button-secondary' : 'button button-ghost';
    button.textContent = action.label;
    button.dataset.encounterAction = action.id;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      if (action.id === 'reavaliacao') document.getElementById('reassess-encounter')?.click();
      openEncounterPanel(action.id);
    });
    row.appendChild(button);

    const legacyView = document.getElementById(`view-${action.id}`);
    const panel = document.createElement('section');
    panel.className = 'encounter-panel';
    panel.dataset.encounterPanel = action.id;
    panel.hidden = true;
    panel.setAttribute('aria-label', action.label);
    if (legacyView) {
      while (legacyView.firstChild) panel.appendChild(legacyView.firstChild);
      legacyView.hidden = true;
      legacyView.dataset.legacyContainer = 'true';
    }
    panels.appendChild(panel);
  }

  section.append(heading, row, panels);
  const dialog = document.getElementById('justification-dialog');
  if (dialog?.parentNode === view) view.insertBefore(section, dialog); else view.appendChild(section);
  document.addEventListener('zera:reassessment-started', () => openEncounterPanel('reavaliacao'));
}

function createMobileDocumentSwitcher() {
  const view = document.getElementById('view-evolucao');
  const grid = view?.querySelector('.content-grid');
  if (!view || !grid || document.getElementById('mobile-document-switcher')) return;

  view.dataset.mobileSurface = 'form';
  const switcher = document.createElement('div');
  switcher.id = 'mobile-document-switcher';
  switcher.className = 'mobile-surface-switch';
  switcher.setAttribute('aria-label', 'Alternar entre formulário e texto final');
  const setSurface = (surface) => {
    view.dataset.mobileSurface = surface;
    for (const button of switcher.querySelectorAll('button')) {
      const active = button.dataset.mobileSurfaceTarget === surface;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('active', active);
    }
  };
  for (const [surface, label] of [['form', 'Formulário'], ['document', 'Texto final']]) {
    const button = createTextNodeElement('button', 'mobile-surface-button', label);
    button.type = 'button';
    button.dataset.mobileSurfaceTarget = surface;
    button.setAttribute('aria-pressed', surface === 'form' ? 'true' : 'false');
    button.addEventListener('click', () => setSurface(surface));
    switcher.appendChild(button);
  }
  grid.insertAdjacentElement('beforebegin', switcher);
}

function formatProductivityRange(summary) {
  if (!summary?.rangeStart || !summary?.rangeEnd) return summary?.totalPatients ? 'PLANTÃO EM ANDAMENTO' : 'SEM ATENDIMENTOS';
  const formatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${formatter.format(new Date(summary.rangeStart))}–${formatter.format(new Date(summary.rangeEnd))}`;
}

function readProductivityRecords(adapter = globalThis.localStorage) {
  if (!adapter) return [];
  try {
    const raw = adapter.getItem('zera-ps:encounter:v3');
    if (!raw) return [];
    return extractEncounterRecords(JSON.parse(raw));
  } catch {
    return [];
  }
}

function renderProductivitySummary() {
  const summary = summarizeProductivity(readProductivityRecords(), { now: new Date().toISOString() });
  const rate = document.getElementById('patients-per-hour');
  const total = document.getElementById('total-patients');
  const range = document.getElementById('zera-productivity-range');
  if (rate) rate.textContent = formatPatientsPerHour(summary);
  if (total) total.textContent = String(summary.totalPatients);
  if (range) range.textContent = formatProductivityRange(summary);
  return summary;
}

function createProductivityPanel() {
  const panel = document.createElement('section');
  panel.className = 'zera-card zera-productivity';
  panel.setAttribute('aria-labelledby', 'zera-productivity-title');
  panel.setAttribute('role', 'region');
  const body = document.createElement('div');
  body.className = 'zera-card-body';
  const header = document.createElement('div');
  header.className = 'zera-card-header';
  const title = createTextNodeElement('h3', 'zera-card-title', 'Produtividade — Plantão');
  title.id = 'zera-productivity-title';
  const range = createTextNodeElement('time', 'zera-card-range', 'SEM ATENDIMENTOS');
  range.id = 'zera-productivity-range';
  range.setAttribute('aria-hidden', 'true');
  header.append(title, range);
  const metrics = document.createElement('div');
  metrics.className = 'zera-metrics';
  const primary = document.createElement('div');
  primary.className = 'zera-metric-primary';
  primary.setAttribute('aria-live', 'polite');
  const primaryLabel = createTextNodeElement('div', 'zera-metric-label', 'Pacientes / Hora');
  const primaryValue = createTextNodeElement('div', 'zera-metric-value', '--');
  primaryValue.id = 'patients-per-hour';
  primary.append(primaryLabel, primaryValue);
  const secondary = document.createElement('div');
  secondary.className = 'zera-metric-secondary';
  secondary.setAttribute('aria-live', 'polite');
  const secondaryLabel = createTextNodeElement('div', 'zera-metric-label small', 'Atendidos (total)');
  const secondaryValue = createTextNodeElement('div', 'zera-metric-small-value', '0');
  secondaryValue.id = 'total-patients';
  secondary.append(secondaryLabel, secondaryValue);
  metrics.append(primary, secondary);
  const actions = document.createElement('div');
  actions.className = 'zera-actions';
  const endShift = createTextNodeElement('button', 'button button-ghost', 'Encerrar Plantão');
  endShift.id = 'end-shift-button';
  endShift.type = 'button';
  endShift.setAttribute('aria-label', 'Encerrar plantão');
  const feedback = createTextNodeElement('p', 'microcopy productivity-feedback', 'O resumo usa os atendimentos reconhecidos nesta sessão local.');
  feedback.id = 'shift-summary-feedback';
  endShift.addEventListener('click', () => {
    const summary = renderProductivitySummary();
    feedback.textContent = summary.totalPatients ? 'Resumo atualizado. Os dados clínicos permanecem intactos.' : 'Ainda não há atendimentos reconhecidos nesta sessão.';
  });
  actions.appendChild(endShift);
  body.append(header, metrics, actions, feedback);
  panel.appendChild(body);
  queueMicrotask(renderProductivitySummary);
  return panel;
}

function flashButton(button, temporaryText, defaultText, delay) {
  button.textContent = temporaryText;
  window.setTimeout(() => { button.textContent = defaultText; }, delay);
}

function createLabOrganizer() {
  const input = document.getElementById('laboratoriais');
  const field = input?.closest('.field');
  if (!input || !field || document.getElementById('organize-laboratory')) return;
  const row = document.createElement('div');
  row.className = 'lab-organizer-row';
  const organize = document.createElement('button');
  organize.type = 'button';
  organize.id = 'organize-laboratory';
  organize.className = 'text-button';
  organize.textContent = 'Organizar laboratório';
  const restore = document.createElement('button');
  restore.type = 'button';
  restore.id = 'restore-raw-laboratory';
  restore.className = 'text-button';
  restore.textContent = 'Restaurar texto colado';
  restore.hidden = true;
  organize.addEventListener('click', () => {
    const raw = input.value;
    const transformed = transformLaboratoryText(raw);
    if (!transformed) {
      flashButton(organize, 'Nenhum analito reconhecido', 'Organizar laboratório', 1600);
      return;
    }
    const current = labSnapshots.get(input);
    if (!current || raw !== current.organized) labSnapshots.set(input, { raw, organized: transformed });
    input.value = transformed;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    restore.hidden = false;
    flashButton(organize, 'Laboratório organizado', 'Organizar laboratório', 1200);
  });
  restore.addEventListener('click', () => {
    const snapshot = labSnapshots.get(input);
    if (!snapshot) return;
    labSnapshots.delete(input);
    input.value = snapshot.raw;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    restore.hidden = true;
  });
  input.addEventListener('input', () => {
    const snapshot = labSnapshots.get(input);
    if (!snapshot || input.value === snapshot.organized) return;
    labSnapshots.delete(input);
    restore.hidden = true;
  });
  row.append(organize, restore);
  input.insertAdjacentElement('afterend', row);
}

function createImageFormatter() {
  const input = document.getElementById('imagem');
  if (!input || document.getElementById('format-image')) return;
  const button = createTextNodeElement('button', 'text-button', 'Formatar Imagem');
  button.id = 'format-image';
  button.type = 'button';
  button.addEventListener('click', () => {
    const formatted = formatImageReport(input.value);
    if (!formatted) {
      flashButton(button, 'Nada para formatar', 'Formatar Imagem', 1200);
      return;
    }
    input.value = formatted;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    flashButton(button, 'Imagem formatada', 'Formatar Imagem', 1200);
  });
  input.insertAdjacentElement('afterend', button);
}

function observedFieldFromInput(id) {
  const value = document.getElementById(id)?.value?.trim();
  return value ? { value, state: 'present', source: 'physician_observation', confirmed: true, confirmedAt: new Date().toISOString() } : null;
}

function refactorHighCostJustification() {
  const legacyButton = document.getElementById('generate-justification');
  const section = legacyButton?.closest('.form-section');
  if (!legacyButton || !section || document.getElementById('justification-exam-name')) return;
  const legacyGrid = section.querySelector('.field-grid');
  if (legacyGrid) legacyGrid.hidden = true;
  const oldCopy = section.querySelector('.microcopy');
  if (oldCopy) oldCopy.hidden = true;

  const field = document.createElement('label');
  field.className = 'field';
  field.appendChild(createTextNodeElement('span', '', 'Nome do Exame'));
  const input = document.createElement('input');
  input.id = 'justification-exam-name';
  input.placeholder = 'EX.: TOMOGRAFIA COMPUTADORIZADA DE ABDOME E PELVE COM CONTRASTE';
  field.appendChild(input);
  field.appendChild(createTextNodeElement('small', '', 'A justificativa reutiliza apenas dados já registrados no atendimento e permanece totalmente editável.'));

  const replacement = legacyButton.cloneNode(true);
  replacement.textContent = 'Gerar Justificativa';
  replacement.addEventListener('click', () => {
    const form = {
      qp: document.getElementById('qp')?.value || '',
      hda: document.getElementById('hda')?.value || '',
      hipoteses: document.getElementById('hipoteses')?.value || ''
    };
    const clinicalState = { physicalExam: { fields: {
      estadoGeral: observedFieldFromInput('estado-geral'),
      acv: observedFieldFromInput('acv'),
      ar: observedFieldFromInput('ar'),
      abd: observedFieldFromInput('abd'),
      ext: observedFieldFromInput('ext'),
      neuro: observedFieldFromInput('neuro')
    } } };
    const text = assembleFreeExamJustification(input.value, { form, clinicalState });
    const output = document.getElementById('justification-output');
    if (output) output.value = text;
    const feedback = document.getElementById('justification-feedback');
    if (feedback) feedback.textContent = 'Revise o texto e confirme que urgência, hipótese e achados correspondem ao atendimento antes de copiar.';
    document.getElementById('justification-dialog')?.showModal();
  });
  legacyButton.replaceWith(replacement);
  section.insertBefore(field, section.querySelector('.action-row'));
}

function compactLegalNotice() {
  const view = document.getElementById('view-evolucao');
  const notice = view?.querySelector(':scope > .notice-bar');
  const grid = view?.querySelector('.content-grid');
  if (!notice || !grid) return;
  notice.classList.add('notice-bar-compact');
  notice.textContent = 'Revise e valide clinicamente o texto antes de registrar no prontuário.';
  grid.insertAdjacentElement('afterend', notice);
}

function injectConvergenceStyles() {
  if (document.getElementById('zera-product-convergence-styles')) return;
  const style = document.createElement('style');
  style.id = 'zera-product-convergence-styles';
  style.textContent = `
    .zero-friction-intake textarea{min-height:118px;font-size:1rem;line-height:1.5}
    .conditional-clinical-triggers{margin:-2px 0 18px;display:grid;gap:10px}.conditional-clinical-triggers[hidden]{display:none}
    .clinical-trigger-group{border:1px solid var(--line);border-radius:12px;padding:12px}.clinical-trigger-group legend{padding:0 6px;font-weight:800;font-size:.76rem;letter-spacing:.04em;color:var(--muted);text-transform:uppercase}
    .clinical-trigger-grid{display:flex;flex-wrap:wrap;gap:8px}.clinical-trigger-chip{display:inline-flex;align-items:center;gap:7px;padding:8px 10px;border:1px solid var(--line);border-radius:999px;background:var(--surface);font-size:.82rem;font-weight:700;cursor:pointer}.clinical-trigger-chip:has(input:checked){border-color:var(--accent);background:var(--accent-soft);color:#0a5e57}
    .notice-bar-compact{padding:7px 10px!important;margin:12px 0 0!important;font-size:.72rem!important;opacity:.78}
    .encounter-continuation-workspace{margin-top:22px;padding:22px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:0 7px 22px rgba(11,31,51,.04);scroll-margin-top:104px}
    .encounter-action-row,.lab-organizer-row{display:flex;flex-wrap:wrap;gap:10px}.encounter-action-row .button.active{border-color:var(--accent);background:var(--accent-soft);color:#0a5e57}
    .encounter-panels{margin-top:18px}.encounter-panel{border-top:1px solid var(--line);padding-top:18px}.encounter-panel[hidden]{display:none}.encounter-panel .simple-layout{margin:0}.encounter-panel .form-panel,.encounter-panel .preview-panel{box-shadow:none}
    .lab-organizer-row{margin-top:8px}.mobile-surface-switch{display:none}
    .zera-card{max-width:420px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);color:var(--navy)}.zera-card-body{padding:18px;display:flex;flex-direction:column;gap:14px}.zera-card-header{display:flex;justify-content:space-between;align-items:baseline;gap:10px}.zera-card-title{margin:0;font-size:.98rem;letter-spacing:-.01em}.zera-card-range{font-size:.7rem;color:var(--muted);font-weight:800;letter-spacing:.04em}
    .zera-metrics{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;min-height:82px}.zera-metric-primary{padding:14px;border-radius:13px;background:linear-gradient(180deg,rgba(13,148,136,.10),rgba(11,31,51,.03));display:flex;flex-direction:column;gap:6px}.zera-metric-label{font-size:.7rem;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.07em}.zera-metric-value{font-size:2.2rem;font-weight:850;color:var(--accent);line-height:1}.zera-metric-secondary{min-width:100px;text-align:right;display:flex;flex-direction:column;gap:4px;align-items:flex-end}.zera-metric-small-value{font-size:1.15rem;font-weight:850}.zera-actions{display:flex;justify-content:flex-end}.productivity-feedback{margin-top:-4px}
    @media(max-width:900px){.mobile-surface-switch{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;padding:4px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}.mobile-surface-button{border:0;border-radius:9px;min-height:40px;background:transparent;color:var(--muted);font-weight:800}.mobile-surface-button.active{background:var(--navy);color:#fff}#view-evolucao[data-mobile-surface="form"] .content-grid>.preview-panel{display:none}#view-evolucao[data-mobile-surface="document"] .content-grid>.form-panel{display:none}#view-evolucao .content-grid{grid-template-columns:1fr}#view-evolucao .preview-sticky{position:static}}
    @media(max-width:760px){.encounter-action-row .button{flex:1 1 calc(50% - 10px)}.encounter-continuation-workspace{padding:16px}.zera-card{max-width:100%}.zera-metrics{grid-template-columns:1fr}.zera-metric-secondary{align-items:flex-start;text-align:left}.zera-actions{justify-content:stretch}.zera-actions .button{width:100%}.clinical-trigger-grid{display:grid;grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function initProductConvergence() {
  createPrimaryNavigation();
  createZeroFrictionIntake();
  createEncounterContinuationWorkspace();
  createMobileDocumentSwitcher();
  createLabOrganizer();
  createImageFormatter();
  refactorHighCostJustification();
  compactLegalNotice();
  injectConvergenceStyles();
  setPrimaryDestination(PRIMARY_VIEW);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initProductConvergence, { once: true });
}

export {
  PRIMARY_DESTINATIONS,
  ENCOUNTER_ACTION_VIEWS,
  initProductConvergence,
  openEncounterPanel,
  createEncounterContinuationWorkspace,
  createProductivityPanel,
  createMobileDocumentSwitcher,
  createLabOrganizer,
  createImageFormatter,
  createZeroFrictionIntake,
  readProductivityRecords
};
