const WORKFLOW_STAGES = Object.freeze({
  INITIAL_ASSESSMENT: 'initial_assessment',
  INITIAL_CONDUCT: 'initial_conduct',
  PENDING_RESULTS: 'pending_results',
  REASSESSMENT: 'reassessment',
  FINAL_DOCUMENTATION: 'final_documentation'
});

const VALID_STAGES = new Set(Object.values(WORKFLOW_STAGES));

function createEncounter({ workflowId = null, now = new Date().toISOString(), admissionSnapshot = {}, context = {} } = {}) {
  return {
    schemaVersion: 3,
    encounterId: globalThis.crypto?.randomUUID?.() || `encounter-${Date.now()}`,
    workflowId,
    currentStage: WORKFLOW_STAGES.INITIAL_ASSESSMENT,
    startedAt: now,
    context: structuredCloneSafe(context),
    admissionSnapshot: structuredCloneSafe(admissionSnapshot),
    stageHistory: [{ stage: WORKFLOW_STAGES.INITIAL_ASSESSMENT, enteredAt: now }],
    pendingItems: [],
    results: [],
    reassessments: [],
    documents: []
  };
}

function transitionEncounter(encounter, stage, now = new Date().toISOString()) {
  if (!VALID_STAGES.has(stage)) throw new RangeError(`Unknown workflow stage: ${stage}`);
  if (encounter.currentStage === stage) return encounter;
  return {
    ...encounter,
    currentStage: stage,
    stageHistory: [...(encounter.stageHistory || []), { stage, enteredAt: now }]
  };
}

function updateEncounterContext(encounter, patch = {}) {
  return {
    ...encounter,
    context: {
      ...(encounter.context || {}),
      ...structuredCloneSafe(patch)
    }
  };
}

function updateAdmissionSnapshot(encounter, snapshot = {}, now = new Date().toISOString()) {
  if ((encounter.reassessments || []).length > 0) return encounter;
  return {
    ...encounter,
    admissionSnapshot: {
      ...structuredCloneSafe(snapshot),
      capturedAt: now
    }
  };
}

function addClinicalResult(encounter, result) {
  if (!result?.id) throw new TypeError('Clinical result requires an id.');
  if (!result?.kind) throw new TypeError('Clinical result requires a kind.');
  if ((encounter.results || []).some((entry) => entry.id === result.id)) {
    throw new RangeError(`Clinical result already exists: ${result.id}`);
  }
  return {
    ...encounter,
    results: [...(encounter.results || []), structuredCloneSafe(result)]
  };
}

function upsertLinkedClinicalResult(encounter, result) {
  const results = [...(encounter.results || [])];
  const index = results.findIndex((entry) => entry.id === result.id);
  if (index < 0) return addClinicalResult(encounter, result);
  results[index] = structuredCloneSafe(result);
  return { ...encounter, results };
}

function getClinicalResults(encounter, kind = null) {
  const results = [...(encounter.results || [])];
  const filtered = kind ? results.filter((result) => result.kind === kind) : results;
  return filtered.sort((a, b) => String(a.collectedAt || a.availableAt || '').localeCompare(String(b.collectedAt || b.availableAt || '')));
}

function addPendingItem(encounter, item) {
  if (!item?.id) throw new TypeError('Pending item requires an id.');
  if ((encounter.pendingItems || []).some((entry) => entry.id === item.id)) {
    throw new RangeError(`Pending item already exists: ${item.id}`);
  }
  return {
    ...encounter,
    pendingItems: [...(encounter.pendingItems || []), { ...structuredCloneSafe(item), status: 'pending', result: null }]
  };
}

function resolvePendingItem(encounter, id, result = {}) {
  let found = null;
  const pendingItems = (encounter.pendingItems || []).map((item) => {
    if (item.id !== id) return item;
    found = item;
    return { ...item, status: 'available', result: structuredCloneSafe(result) };
  });
  if (!found) throw new RangeError(`Unknown pending item: ${id}`);

  const resolved = { ...encounter, pendingItems };
  if (!found.kind || result.value === undefined) return resolved;

  return upsertLinkedClinicalResult(resolved, {
    id: result.id || `${id}:result`,
    kind: found.kind,
    label: found.label || null,
    sourcePendingItemId: id,
    requestedAt: found.requestedAt || null,
    ...structuredCloneSafe(result)
  });
}

function startReassessment(encounter, now = new Date().toISOString()) {
  const reassessment = {
    id: globalThis.crypto?.randomUUID?.() || `reassessment-${Date.now()}`,
    startedAt: now,
    previousStage: encounter.currentStage,
    changes: {},
    newResults: {},
    scores: [],
    conduct: []
  };
  const transitioned = transitionEncounter(encounter, WORKFLOW_STAGES.REASSESSMENT, now);
  return {
    ...transitioned,
    admissionSnapshot: structuredCloneSafe(encounter.admissionSnapshot || {}),
    reassessments: [...(encounter.reassessments || []), reassessment]
  };
}

function evaluateVisibilityRule(rule, context = {}) {
  if (!rule) return true;
  return context[rule.field] === rule.equals;
}

function isSectionInStage(section, stage) {
  if (section.stage) return section.stage === stage;
  if (Array.isArray(section.stages)) return section.stages.includes(stage);
  return true;
}

function getVisibleSections(protocol, stage, context = {}) {
  return (protocol?.sections || []).filter((section) => (
    isSectionInStage(section, stage) && evaluateVisibilityRule(section.visibleWhen, context)
  ));
}

function structuredCloneSafe(value) {
  if (value === undefined) return undefined;
  if (typeof globalThis.structuredClone === 'function') return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export {
  WORKFLOW_STAGES,
  createEncounter,
  transitionEncounter,
  updateEncounterContext,
  updateAdmissionSnapshot,
  addClinicalResult,
  getClinicalResults,
  addPendingItem,
  resolvePendingItem,
  startReassessment,
  evaluateVisibilityRule,
  getVisibleSections
};
