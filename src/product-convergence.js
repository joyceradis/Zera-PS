import { listProtocolOptions } from './protocol-registry.js';
import { transformLaboratoryText } from './lab-parser.js';

const PRIMARY_VIEW = 'evolucao';
const ENCOUNTER_ACTION_VIEWS = Object.freeze([
  { id: 'reavaliacao', label: 'Reavaliar atendimento' },
  { id: 'internacao', label: 'Internação' },
  { id: 'alta', label: 'Alta' },
  { id: 'scores', label: 'Scores / calculadoras' }
]);

function selectView(viewId) {
  const nav = document.querySelector(`.nav-button[data-view="${viewId}"]`);
  if (nav) nav.click();
}

function relabelPrimarySurface() {
  const nav = document.querySelector(`.nav-button[data-view="${PRIMARY_VIEW}"]`);
  if (nav) nav.textContent = 'Atendimento';

  const view = document.getElementById('view-evolucao');
  if (view) view.dataset.title = 'Atendimento';

  const formPanel = document.querySelector('#view-evolucao .form-panel');
  const heading = formPanel?.querySelector(':scope > .section-heading');
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
    button.innerHTML = `<strong>${option.label}</strong><span>Contexto com acompanhamento temporal</span>`;
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
  if (!workflowCard || !workflowContext || !templateGrid) return;

  let workspace = document.getElementById('contextual-workspace');
  if (!workspace) {
    workspace = document.createElement('section');
    workspace.id = 'contextual-workspace';
    workspace.className = 'contextual-workspace';
    templateGrid.insertAdjacentElement('afterend', workspace);
  }

  workspace.appendChild(workflowContext);
  workflowCard.hidden = true;
}

function createEncounterActions() {
  const formPanel = document.querySelector('#view-evolucao .form-panel');
  const form = document.getElementById('evolution-form');
  if (!formPanel || !form || document.getElementById('encounter-actions')) return;

  const section = document.createElement('section');
  section.id = 'encounter-actions';
  section.className = 'encounter-actions';
  section.innerHTML = '<div class="section-heading compact"><div><p class="section-kicker">AÇÕES DO ATENDIMENTO</p><h2>Continuar o mesmo atendimento</h2></div></div>';

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

  section.appendChild(row);
  form.insertAdjacentElement('afterend', section);
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
      organize.textContent = 'Nenhum analito reconhecido';
      window.setTimeout(() => { organize.textContent = 'Organizar laboratório'; }, 1600);
      return;
    }

    if (!input.dataset.rawLaboratory) input.dataset.rawLaboratory = raw;
    input.value = transformed;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    restore.hidden = false;
    organize.textContent = 'Laboratório organizado';
    window.setTimeout(() => { organize.textContent = 'Organizar laboratório'; }, 1200);
  });

  restore.addEventListener('click', () => {
    if (!input.dataset.rawLaboratory) return;
    input.value = input.dataset.rawLaboratory;
    delete input.dataset.rawLaboratory;
    input.dispatchEvent(new Event('input', { bubbles: true }));
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

initProductConvergence();

export {
  ENCOUNTER_ACTION_VIEWS,
  initProductConvergence,
  selectView,
  createLabOrganizer
};