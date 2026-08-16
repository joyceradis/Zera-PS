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

function assertCanonicalProductSurface() {
  const visibleWorkflow = [...document.querySelectorAll('.workflow-card, #workflow-context, #workflow-scenario')]
    .find((node) => !node.hidden && node.getClientRects().length > 0);
  if (visibleWorkflow) {
    console.error('Zera PS: superfície legada de workflow permaneceu visível após convergência.', visibleWorkflow);
  }
}

function initProductCoherence() {
  retireLegacyWorkflowSurface();
  assertCanonicalProductSurface();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initProductCoherence);
}

export { retireLegacyWorkflowSurface, assertCanonicalProductSurface };
