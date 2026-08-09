const CONTEXT_DECISIONS = Object.freeze({
  ALLOW: 'allow',
  CONFIRM: 'confirm',
  CANCEL: 'cancel'
});

const CONTEXT_EVENTS = Object.freeze({
  TEMPLATE_SELECTION_REQUEST: 'zera:template-selection-request',
  WORKFLOW_SELECTION_REQUEST: 'zera:workflow-selection-request'
});

function isTemplateWorkflowCompatible(templateSelection, workflowId) {
  if (!templateSelection?.templateId || !workflowId) return true;
  return Boolean(templateSelection.protocolId) && templateSelection.protocolId === workflowId;
}

function hasMeaningfulValue(value) {
  if (value === null || value === undefined || value === false || value === '') return false;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (typeof value === 'object') {
    return Object.entries(value).some(([key, nested]) => {
      if (['appliedAt', 'capturedAt', 'selectedAt'].includes(key)) return false;
      return hasMeaningfulValue(nested);
    });
  }
  return true;
}

function hasSignificantEncounter(encounter) {
  if (!encounter) return false;
  if (encounter.currentStage && encounter.currentStage !== 'initial_assessment') return true;
  if ((encounter.stageHistory || []).length > 1) return true;
  if (hasMeaningfulValue(encounter.context || {})) return true;
  if (hasMeaningfulValue(encounter.admissionSnapshot || {})) return true;
  return ['pendingItems', 'results', 'reassessments', 'documents']
    .some((key) => Array.isArray(encounter[key]) && encounter[key].length > 0);
}

function confirmationDecision(confirmed, clearKey) {
  if (confirmed === false) return { status: CONTEXT_DECISIONS.CANCEL, [clearKey]: false };
  if (confirmed === true) return { status: CONTEXT_DECISIONS.ALLOW, [clearKey]: true };
  return { status: CONTEXT_DECISIONS.CONFIRM, [clearKey]: false };
}

function decideTemplateSelection({ templateSelection, workflowId, encounter, confirmed } = {}) {
  if (isTemplateWorkflowCompatible(templateSelection, workflowId)) {
    return { status: CONTEXT_DECISIONS.ALLOW, clearWorkflow: false };
  }
  if (!hasSignificantEncounter(encounter)) {
    return { status: CONTEXT_DECISIONS.ALLOW, clearWorkflow: true };
  }
  return confirmationDecision(confirmed, 'clearWorkflow');
}

function decideWorkflowSelection({
  workflowId,
  templateSelection,
  hasDocumentContent = false,
  selectionKnown = true,
  restoring = false,
  confirmed
} = {}) {
  const legacyRelationUnknown = restoring && !selectionKnown && hasDocumentContent && Boolean(workflowId);
  const incompatible = !isTemplateWorkflowCompatible(templateSelection, workflowId);
  if (!legacyRelationUnknown && !incompatible) {
    return { status: CONTEXT_DECISIONS.ALLOW, clearTemplate: false };
  }
  if (!hasDocumentContent && !legacyRelationUnknown) {
    return { status: CONTEXT_DECISIONS.ALLOW, clearTemplate: true };
  }
  return confirmationDecision(confirmed, 'clearTemplate');
}

export {
  CONTEXT_DECISIONS,
  CONTEXT_EVENTS,
  isTemplateWorkflowCompatible,
  hasSignificantEncounter,
  decideTemplateSelection,
  decideWorkflowSelection
};
