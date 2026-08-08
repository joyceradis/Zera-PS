import { evaluateVisibilityRule, getVisibleSections } from './workflow-engine.js';
import { setToolApplied } from './score-engine.js';
import { FIELD_SOURCES, FIELD_TYPES, VALUE_COERCIONS } from './protocol-schema.js';

const getField = (protocol, id) => (protocol?.fields || []).find((field) => field.id === id) || null;
const getTool = (protocol, id) => (protocol?.tools || []).find((tool) => tool.id === id) || null;

const isProtocolField = (field) => (field?.source || FIELD_SOURCES.PROTOCOL) === FIELD_SOURCES.PROTOCOL;
const isNumericField = (field) => field?.type === FIELD_TYPES.NUMBER || field?.coerce === VALUE_COERCIONS.NUMBER;
const matchesRule = (rule, context) => Boolean(rule) && evaluateVisibilityRule(rule, context);

function getRenderableFields(protocol, section) {
  return (section?.fields || [])
    .map((id) => getField(protocol, id))
    .filter((field) => field && isProtocolField(field));
}

function emptyValueFor(field) {
  if (field.type === FIELD_TYPES.BOOLEAN) return false;
  if (isNumericField(field)) return null;
  return '';
}

function defaultFieldValue(field) {
  return field?.default === undefined ? emptyValueFor(field) : field.default;
}

function defaultContext(protocol) {
  const context = {};
  for (const field of protocol?.fields || []) {
    if (!isProtocolField(field)) continue;
    context[field.id] = defaultFieldValue(field);
  }
  return context;
}

function buildRenderPlan(protocol, { stage, context = {} } = {}) {
  const visibleSectionIds = new Set(getVisibleSections(protocol, stage, context).map((section) => section.id));
  return (protocol?.sections || []).map((section) => {
    const fields = getRenderableFields(protocol, section);
    const visible = visibleSectionIds.has(section.id);
    return {
      id: section.id,
      visible,
      renderable: fields.length > 0 || Boolean(section.tool),
      tool: section.tool || null,
      fields: fields.map((field) => ({
        id: field.id,
        visible: visible && evaluateVisibilityRule(field.visibleWhen, context)
      }))
    };
  });
}

function resolveToolVariables(tool, context = {}) {
  const resolved = {};
  if (tool?.applicableWhen?.field) resolved[tool.applicableWhen.field] = context[tool.applicableWhen.field];
  for (const [name, binding] of Object.entries(tool?.variables || {})) {
    const gated = binding?.availableWhen && !evaluateVisibilityRule(binding.availableWhen, context);
    resolved[name] = gated ? null : context[binding.field];
  }
  return resolved;
}

function deriveTemporalOperations(protocol, context = {}) {
  const operations = [];
  for (const declaration of protocol?.temporalResults || []) {
    const base = { id: declaration.id, kind: declaration.kind, label: declaration.label };
    if (matchesRule(declaration.availableWhen, context)) {
      const payload = {};
      for (const [key, fieldId] of Object.entries(declaration.payload || {})) payload[key] = context[fieldId];
      operations.push({ ...base, action: 'available', payload });
      continue;
    }
    if (matchesRule(declaration.pendingWhen, context)) operations.push({ ...base, action: 'pending' });
  }
  return operations;
}

function readPersistedToolApplication(context, toolId) {
  const entry = context?.appliedTools?.[toolId];
  if (entry && typeof entry === 'object') {
    return { applied: Boolean(entry.applied), appliedAt: entry.appliedAt || null };
  }
  const legacyApplied = context?.[`${toolId}Applied`];
  if (legacyApplied === undefined) return null;
  return { applied: Boolean(legacyApplied), appliedAt: context?.[`${toolId}AppliedAt`] || null };
}

function applyPersistedToolIntent(state, intent, now = new Date().toISOString()) {
  if (!intent?.applied || state?.applied) return state;
  if (state?.applicability !== 'applicable' || state?.calculability !== 'calculable') return state;
  return setToolApplied(state, true, intent.appliedAt || now);
}

function serializeToolApplications(states = []) {
  const applied = {};
  for (const state of states) {
    if (!state?.id) continue;
    applied[state.id] = { applied: Boolean(state.applied), appliedAt: state.appliedAt || null };
  }
  return applied;
}

export {
  getField,
  getTool,
  getRenderableFields,
  isProtocolField,
  isNumericField,
  defaultFieldValue,
  defaultContext,
  buildRenderPlan,
  resolveToolVariables,
  deriveTemporalOperations,
  readPersistedToolApplication,
  applyPersistedToolIntent,
  serializeToolApplications
};
