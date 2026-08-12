import { listProtocolOptions } from './protocol-registry.js';
import { transformLaboratoryText } from './lab-parser.js';
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

  const heading = document.querySelector('#view-evolucao .form-panel > .section-heading');
  const kicker = heading?.querySelector('.section-kicker');
  const title = heading?.querySelector('h2');
  if (kicker) kicker.textContent = 'CONTEXTO CLÍNICO';
  if (title) title.textContent = 'Comece pelo contexto do atendimento';
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
  intro.className = 'notice-bar';
  intro.textContent = 'Resumo operacional local. Métricas não entram no prontuário e nenhum valor é estimado quando a série disponível é insuficiente.';
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

function createProtocolLauncher() {
  const grid = document.getElementById('template-grid');
  const scenario = document.getElementById('workflow-scenario');
  if (!grid || !scenario || grid.querySelector('[data-context-protocol]')) return;

  for (const option of listProtocolOptions()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'template-card context-protocol-card';
    button.dataset.contextProtocol = option.id;
    button.append(
      createTextNodeElement('strong', '', option.label),
      createTextNodeElement('span', '', 'Contexto com acompanhamento temporal')
    );
    button.addEventListener('click', () => {
      scenario.value = option.id;
      scenario.dispatchEvent(new Event('change', { bubbles: true }));
    });
    grid.appendChild(button);
  }
}

function convergeWorkflowSurface() {
  const workflowCard = document.querySelector('.workflow-card');
  const workflowContext = document.getElementById('workflow-context');
  const templateGrid = document.getElementById('template-grid');
  const legacyReassess = document.getElementById('reassess-encounter');
  if (!workflowCard || !workflowContext || !templateGrid) return;

  let workspace = document.getElementById('contextual-workspace');
  if (!workspace) {
    workspace = document.createElement('section');
    workspace.id = 'contextual-workspace';
    workspace.className = 'contextual-workspace';
    templateGrid.insertAdjacentElement('afterend', workspace);
  }

  workspace.appendChild(workflowContext);
  if (legacyReassess) legacyReassess.hidden = true;
  workflowCard.hidden = true;
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
  headingBody.append(
    createTextNodeElement('p', 'section-kicker', 'AÇÕES DO ATENDIMENTO'),
    createTextNodeElement('h2', '', 'Continuar o mesmo atendimento')
  );
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
  if (dialog?.parentNode === view) view.insertBefore(section, dialog);
  else view.appendChild(section);

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
  if (!summary?.rangeStart || !summary?.rangeEnd) return 'SÉRIE LOCAL INSUFICIENTE';
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
  const summary = summarizeProductivity(readProductivityRecords());
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
  const range = createTextNodeElement('time', 'zera-card-range', 'SÉRIE LOCAL INSUFICIENTE');
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
  const feedback = createTextNodeElement('p', 'microcopy productivity-feedback', 'O resumo usa apenas série local reconhecida; dados clínicos não são apagados.');
  feedback.id = 'shift-summary-feedback';
  endShift.addEventListener('click', () => {
    const summary = renderProductivitySummary();
    feedback.textContent = summary.totalPatients
      ? 'Resumo atualizado. O encerramento não altera prontuários ou rascunhos.'
      : 'Ainda não há série local suficiente para calcular produtividade.';
  });
  actions.appendChild(endShift);

  body.append(header, metrics, actions, feedback);
  panel.appendChild(body);
  queueMicrotask(renderProductivitySummary);
  return panel;
}

function flashButton(button, temporaryText, defaultText, delay) {
  button.textContent = temporaryText;
  window.setTimeout(() => {
    button.textContent = defaultText;
  }, delay);
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
    if (!current || raw !== current.organized) {
      labSnapshots.set(input, { raw, organized: transformed });
    }

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

function injectConvergenceStyles() {
  if (document.getElementById('zera-product-convergence-styles')) return;
  const style = document.createElement('style');
  style.id = 'zera-product-convergence-styles';
  style.textContent = `
    .context-protocol-card{appearance:none;text-align:left;cursor:pointer;font:inherit;color:inherit}
    .context-protocol-card strong,.context-protocol-card span{display:block}
    .context-protocol-card span{margin-top:4px;font-size:.75rem;color:#637083}
    .contextual-workspace:empty{display:none}
    .contextual-workspace #workflow-context{margin:18px 0 0}
    .encounter-continuation-workspace{margin-top:22px;padding:22px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:0 7px 22px rgba(11,31,51,.04);scroll-margin-top:104px}
    .encounter-action-row,.lab-organizer-row{display:flex;flex-wrap:wrap;gap:10px}
    .encounter-action-row .button.active{border-color:var(--accent);background:var(--accent-soft);color:#0a5e57}
    .encounter-panels{margin-top:18px}.encounter-panel{border-top:1px solid var(--line);padding-top:18px}.encounter-panel[hidden]{display:none}
    .encounter-panel .simple-layout{margin:0}.encounter-panel .form-panel,.encounter-panel .preview-panel{box-shadow:none}
    .lab-organizer-row{margin-top:8px}
    .mobile-surface-switch{display:none}
    .zera-card{max-width:420px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);color:var(--navy)}
    .zera-card-body{padding:18px;display:flex;flex-direction:column;gap:14px}
    .zera-card-header{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
    .zera-card-title{margin:0;font-size:.98rem;letter-spacing:-.01em}.zera-card-range{font-size:.7rem;color:var(--muted);font-weight:800;letter-spacing:.04em}
    .zera-metrics{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;min-height:82px}
    .zera-metric-primary{padding:14px;border-radius:13px;background:linear-gradient(180deg,rgba(13,148,136,.10),rgba(11,31,51,.03));display:flex;flex-direction:column;gap:6px}
    .zera-metric-label{font-size:.7rem;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.07em}.zera-metric-value{font-size:2.2rem;font-weight:850;color:var(--accent);line-height:1}
    .zera-metric-secondary{min-width:100px;text-align:right;display:flex;flex-direction:column;gap:4px;align-items:flex-end}.zera-metric-small-value{font-size:1.15rem;font-weight:850}.zera-actions{display:flex;justify-content:flex-end}.productivity-feedback{margin-top:-4px}
    @media(max-width:900px){
      .mobile-surface-switch{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;padding:4px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
      .mobile-surface-button{border:0;border-radius:9px;min-height:40px;background:transparent;color:var(--muted);font-weight:800}.mobile-surface-button.active{background:var(--navy);color:#fff}
      #view-evolucao[data-mobile-surface="form"] .content-grid>.preview-panel{display:none}
      #view-evolucao[data-mobile-surface="document"] .content-grid>.form-panel{display:none}
      #view-evolucao .content-grid{grid-template-columns:1fr}
      #view-evolucao .preview-sticky{position:static}
    }
    @media(max-width:760px){
      .encounter-action-row .button{flex:1 1 calc(50% - 10px)}
      .encounter-continuation-workspace{padding:16px}
      .zera-card{max-width:100%}.zera-metrics{grid-template-columns:1fr}.zera-metric-secondary{align-items:flex-start;text-align:left}.zera-actions{justify-content:stretch}.zera-actions .button{width:100%}
    }
  `;
  document.head.appendChild(style);
}

function initProductConvergence() {
  createPrimaryNavigation();
  createProtocolLauncher();
  convergeWorkflowSurface();
  createEncounterContinuationWorkspace();
  createMobileDocumentSwitcher();
  createLabOrganizer();
  injectConvergenceStyles();
  setPrimaryDestination(PRIMARY_VIEW);
}

if (typeof document !== 'undefined') initProductConvergence();

export {
  PRIMARY_DESTINATIONS,
  ENCOUNTER_ACTION_VIEWS,
  initProductConvergence,
  openEncounterPanel,
  createEncounterContinuationWorkspace,
  createProductivityPanel,
  createMobileDocumentSwitcher,
  createLabOrganizer,
  readProductivityRecords
};