function retireLegacyWorkflowSurface() {
  const workflowCard = document.querySelector('.workflow-card');
  const stageBadge = document.getElementById('workflow-stage');
  const reassessmentBridge = document.getElementById('reassess-encounter');

  // Reassessment is part of the encounter lifecycle, not a protocol selector.
  // Preserve the existing temporal handler behind a neutral, non-product bridge
  // before removing the obsolete single-protocol workflow surface.
  if (reassessmentBridge) {
    let bridgeHost = document.getElementById('temporal-action-bridge');
    if (!bridgeHost) {
      bridgeHost = document.createElement('div');
      bridgeHost.id = 'temporal-action-bridge';
      bridgeHost.hidden = true;
      bridgeHost.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bridgeHost);
    }
    bridgeHost.appendChild(reassessmentBridge);
  }

  if (workflowCard) workflowCard.remove();

  // The old badge reported protocol/workflow state (including "SEM CENÁRIO")
  // although the canonical product is a protocol-agnostic Atendimento.
  if (stageBadge) {
    stageBadge.hidden = true;
    stageBadge.setAttribute('aria-hidden', 'true');
  }
}

function hasCurrentDocumentation() {
  const free = document.getElementById('qp-free');
  if (String(free?.value || '').trim()) return true;
  const form = document.getElementById('evolution-form');
  if (!form) return false;
  return [...form.querySelectorAll('input, textarea, select')].some((control) => {
    if (control.type === 'checkbox' || control.type === 'radio') return control.checked;
    return String(control.value || '').trim().length > 0;
  });
}

function updateAtendimentoState() {
  const state = document.getElementById('atendimento-state');
  if (!state) return;
  state.textContent = hasCurrentDocumentation() ? 'EM REGISTRO' : 'NOVO ATENDIMENTO';
}

function createAtendimentoOrientation() {
  const panel = document.querySelector('#view-evolucao .form-panel');
  if (!panel || document.getElementById('atendimento-orientation')) return;

  const orientation = document.createElement('section');
  orientation.id = 'atendimento-orientation';
  orientation.className = 'notice-bar atendimento-orientation';
  orientation.setAttribute('aria-labelledby', 'atendimento-orientation-title');

  const title = document.createElement('strong');
  title.id = 'atendimento-orientation-title';
  title.textContent = 'Atendimento atual';

  const state = document.createElement('span');
  state.id = 'atendimento-state';
  state.className = 'save-status';
  state.textContent = 'NOVO ATENDIMENTO';

  const start = document.createElement('span');
  start.textContent = 'Comece pela queixa e pelo contexto clínico. O restante do formulário organiza o mesmo registro.';

  const continuation = document.createElement('span');
  continuation.textContent = 'Reavaliação, internação, alta e ferramentas são ações do mesmo atendimento — não etapas obrigatórias.';

  orientation.append(title, state, start, continuation);
  panel.prepend(orientation);

  const free = document.getElementById('qp-free');
  const form = document.getElementById('evolution-form');
  free?.addEventListener('input', updateAtendimentoState);
  form?.addEventListener('input', updateAtendimentoState);
  form?.addEventListener('change', updateAtendimentoState);
  document.addEventListener('zera:documentation-restored', updateAtendimentoState);
  updateAtendimentoState();
}

function explainSaveStatus() {
  const status = document.getElementById('save-status');
  const heading = status?.closest('.section-heading');
  if (!status || !heading || document.getElementById('atendimento-save-help')) return;

  const help = document.createElement('small');
  help.id = 'atendimento-save-help';
  help.className = 'microcopy';
  help.textContent = 'Autossalvo mantém o estado atual neste dispositivo. Salvar rascunho cria uma cópia separada para retomar depois.';
  heading.insertAdjacentElement('afterend', help);
}

function gateReassessmentAction(event) {
  const action = event.target?.closest?.('[data-encounter-action="reavaliacao"]');
  if (!action) return;

  // product-convergence used to open the panel even when temporal-ui rejected
  // reassessment because no encounter existed. Own this click first: the hidden
  // temporal owner decides whether reassessment can start and emits
  // zera:reassessment-started only on success. The existing convergence listener
  // opens the panel from that event, so a failed start leaves the current surface
  // untouched instead of showing a false reassessment state.
  event.preventDefault();
  event.stopImmediatePropagation();
  document.getElementById('reassess-encounter')?.click();
}

function assertCanonicalProductSurface() {
  const visibleWorkflow = [...document.querySelectorAll('.workflow-card, #workflow-context, #workflow-scenario')]
    .find((node) => !node.hidden && node.getClientRects().length > 0);
  if (visibleWorkflow) {
    console.error('Zera PS: superfície legada de workflow permaneceu visível após convergência.', visibleWorkflow);
  }
}

function initProductCoherence() {
  retireLegacyWorkflowSurface();
  createAtendimentoOrientation();
  explainSaveStatus();
  document.addEventListener('click', gateReassessmentAction, true);
  assertCanonicalProductSurface();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initProductCoherence);
}

export {
  retireLegacyWorkflowSurface,
  createAtendimentoOrientation,
  updateAtendimentoState,
  explainSaveStatus,
  gateReassessmentAction,
  assertCanonicalProductSurface
};
