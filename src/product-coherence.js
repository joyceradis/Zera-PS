const ATENDIMENTO_CONTENT_IDS = Object.freeze([
  'qp-free', 'qp', 'hda',
  'comorbidades', 'muc', 'alergias', 'habitos', 'cirurgias',
  'estado-geral', 'acv', 'ar', 'abd', 'ext', 'neuro',
  'laboratoriais', 'imagem', 'hipoteses', 'conduta', 'em-tempo',
  'evolution-output'
]);

const CONTINUATION_TEXT_IDS = Object.freeze([
  'reav-evolucao', 'reav-exames', 'reav-conduta', 'reassessment-output',
  'int-diagnostico', 'int-justificativa', 'int-prescricao', 'admission-output',
  'alta-diagnostico', 'alta-resumo', 'alta-medicacoes', 'alta-orientacoes', 'discharge-output'
]);

function retireLegacyWorkflowSurface() {
  const workflowCard = document.querySelector('.workflow-card');
  const stageBadge = document.getElementById('workflow-stage');
  const reassessmentBridge = document.getElementById('reassess-encounter');

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

  if (stageBadge) {
    stageBadge.hidden = true;
    stageBadge.setAttribute('aria-hidden', 'true');
  }
}

function hasCurrentDocumentation() {
  return ATENDIMENTO_CONTENT_IDS.some((id) => String(document.getElementById(id)?.value || '').trim().length > 0)
    || Boolean(document.getElementById('include-em-tempo')?.checked);
}

function updateAtendimentoState() {
  const state = document.getElementById('atendimento-state');
  if (!state) return;
  state.textContent = hasCurrentDocumentation() ? 'EM REGISTRO' : 'NOVO ATENDIMENTO';
}

function resetContinuationState() {
  for (const id of CONTINUATION_TEXT_IDS) {
    const node = document.getElementById(id);
    if (node) node.value = '';
  }

  const destination = document.getElementById('int-destino');
  if (destination) destination.selectedIndex = 0;

  // Static scores live outside evolution-form. Reset every control and dispatch
  // its existing change handler so the internal score state cannot leak into the
  // next patient even when the DOM and application state would otherwise diverge.
  for (const select of document.querySelectorAll('[data-score-answer], [data-glasgow]')) {
    select.value = '';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  for (const panel of document.querySelectorAll('[data-encounter-panel]')) panel.hidden = true;
  for (const action of document.querySelectorAll('[data-encounter-action]')) {
    action.classList.remove('active');
    action.setAttribute('aria-pressed', 'false');
  }
}

function queueAtendimentoReset() {
  queueMicrotask(() => {
    resetContinuationState();
    updateAtendimentoState();
  });
}

function createAtendimentoOrientation() {
  const panel = document.querySelector('#view-evolucao .form-panel');
  if (!panel || document.getElementById('atendimento-orientation')) return;

  const orientation = document.createElement('section');
  orientation.id = 'atendimento-orientation';
  orientation.className = 'notice-bar atendimento-orientation';
  orientation.setAttribute('aria-labelledby', 'atendimento-orientation-title');

  const heading = document.createElement('div');
  heading.className = 'section-heading compact';

  const title = document.createElement('strong');
  title.id = 'atendimento-orientation-title';
  title.textContent = 'Atendimento atual';

  const state = document.createElement('span');
  state.id = 'atendimento-state';
  state.className = 'save-status';
  state.textContent = 'NOVO ATENDIMENTO';
  heading.append(title, state);

  const start = document.createElement('p');
  start.className = 'microcopy';
  start.textContent = 'Comece pela queixa e pelo contexto clínico. O restante do formulário organiza o mesmo registro.';

  const continuation = document.createElement('p');
  continuation.className = 'microcopy';
  continuation.textContent = 'Reavaliação, internação, alta e ferramentas são ações do mesmo atendimento — não etapas obrigatórias.';

  orientation.append(heading, start, continuation);
  panel.prepend(orientation);

  const free = document.getElementById('qp-free');
  const form = document.getElementById('evolution-form');
  free?.addEventListener('input', updateAtendimentoState);
  form?.addEventListener('input', updateAtendimentoState);
  form?.addEventListener('change', updateAtendimentoState);
  form?.addEventListener('reset', queueAtendimentoReset);
  document.addEventListener('zera:documentation-restored', updateAtendimentoState);
  updateAtendimentoState();
}

function explainSaveStatus() {
  const status = document.getElementById('save-status');
  const heading = status?.closest('.section-heading');
  if (!status || !heading || document.getElementById('atendimento-save-help')) return;

  const help = document.createElement('p');
  help.id = 'atendimento-save-help';
  help.className = 'microcopy';
  help.textContent = 'Autossalvo mantém o estado atual neste dispositivo. Salvar rascunho cria uma cópia separada para retomar depois.';
  heading.insertAdjacentElement('afterend', help);
}

function gateReassessmentAction(event) {
  const action = event.target?.closest?.('[data-encounter-action="reavaliacao"]');
  if (!action) return;

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
  ATENDIMENTO_CONTENT_IDS,
  CONTINUATION_TEXT_IDS,
  retireLegacyWorkflowSurface,
  hasCurrentDocumentation,
  createAtendimentoOrientation,
  updateAtendimentoState,
  resetContinuationState,
  queueAtendimentoReset,
  explainSaveStatus,
  gateReassessmentAction,
  assertCanonicalProductSurface
};
