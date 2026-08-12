import { listProtocolOptions } from './protocol-registry.js';
import { transformLaboratoryText } from './lab-parser.js';

const PRIMARY_VIEW = 'evolucao';
const ENCOUNTER_ACTION_VIEWS = Object.freeze([
  { id: 'reavaliacao', label: 'Reavaliar atendimento' },
  { id: 'internacao', label: 'Internação' },
  { id: 'alta', label: 'Alta' },
  { id: 'scores', label: 'Scores / calculadoras' }
]);
const labSnapshots = new WeakMap();

function selectView(viewId) {
  const nav = document.querySelector(`.nav-button[data-view="${viewId}"]`);
  if (nav) nav.click();
}

function createTextNodeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function relabelPrimarySurface() {
  const nav = document.querySelector(`.nav-button[data-view="${PRIMARY_VIEW}"]`);
  if (nav) nav.textContent = 'Atendimento';

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

function createEncounterActions() {
  const form = document.getElementById('evolution-form');
  if (!form || document.getElementById('encounter-actions')) return;

  const section = document.createElement('section');
  section.id = 'encounter-actions';
  section.className = 'encounter-actions';

  const heading = createTextNodeElement('div', 'section-heading compact', '');
  const headingBody = document.createElement('div');
  headingBody.append(
    createTextNodeElement('p', 'section-kicker', 'AÇÕES DO ATENDIMENTO'),
    createTextNodeElement('h2', '', 'Continuar o mesmo atendimento')
  );
  heading.appendChild(headingBody);

  const row = document.createElement('div');
  row.className = 'encounter-action-row';

  for (const action of ENCOUNTER_ACTION_VIEWS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = action.id === 'reavaliacao' ? 'button button-secondary' : 'button button-ghost';
    button.textContent = action.label;
    button.dataset.targetView = action.id;
    button.addEventListener('click', () => selectView(action.id));
    row.appendChild(button);
  }

  section.append(heading, row);
  form.insertAdjacentElement('afterend', section);
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
    .encounter-actions{margin-top:20px;padding-top:18px;border-top:1px solid rgba(11,31,51,.12)}
    .encounter-action-row,.lab-organizer-row{display:flex;flex-wrap:wrap;gap:10px}
    .lab-organizer-row{margin-top:8px}
    @media(max-width:760px){.encounter-action-row .button{flex:1 1 calc(50% - 10px)}}
  `;
  document.head.appendChild(style);
}

function initProductConvergence() {
  relabelPrimarySurface();
  hideInternalNavigation();
  createProtocolLauncher();
  convergeWorkflowSurface();
  createEncounterActions();
  createLabOrganizer();
  injectConvergenceStyles();
}

if (typeof document !== 'undefined') initProductConvergence();

export {
  ENCOUNTER_ACTION_VIEWS,
  initProductConvergence,
  selectView,
  createLabOrganizer
};
