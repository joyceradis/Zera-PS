function createToolState(tool) {
  return {
    id: tool.id,
    label: tool.label,
    type: tool.type,
    availability: tool.availability || 'unavailable',
    applicability: 'unknown',
    calculability: 'not_calculable',
    applied: false,
    appliedAt: null,
    status: 'incomplete',
    score: null,
    interpretation: null,
    missingVariables: [...(tool.requiredVariables || [])],
    message: null
  };
}

function evaluateRule(rule, context = {}) {
  if (!rule) return true;
  return context[rule.field] === rule.equals;
}

function isMissingValue(value) {
  if (value === null || value === undefined || value === '') return true;
  return typeof value === 'number' && !Number.isFinite(value);
}

function evaluateToolState(tool, state, context = {}) {
  const availability = tool.availability || state.availability || 'unavailable';
  if (availability !== 'available') {
    return { ...state, availability, applicability: 'unknown', calculability: 'not_calculable', status: 'incomplete', score: null, interpretation: null };
  }

  const applicable = evaluateRule(tool.applicableWhen, context);
  if (!applicable) {
    return {
      ...state,
      availability,
      applicability: 'not_applicable',
      calculability: 'not_calculable',
      applied: false,
      appliedAt: null,
      status: 'incomplete',
      score: null,
      interpretation: null,
      missingVariables: [],
      message: null
    };
  }

  const missingVariables = (tool.requiredVariables || []).filter((key) => isMissingValue(context[key]));
  if (missingVariables.length) {
    const first = missingVariables[0];
    return {
      ...state,
      availability,
      applicability: 'applicable',
      calculability: 'not_calculable',
      applied: false,
      appliedAt: null,
      status: 'incomplete',
      score: null,
      interpretation: null,
      missingVariables,
      message: tool.missingMessages?.[first] || `${tool.label} não calculado: dado obrigatório ainda não informado.`
    };
  }

  const score = tool.calculate(context);
  if (!Number.isFinite(score)) {
    return {
      ...state,
      availability,
      applicability: 'applicable',
      calculability: 'not_calculable',
      applied: false,
      appliedAt: null,
      status: 'incomplete',
      score: null,
      interpretation: null,
      missingVariables: [...(tool.requiredVariables || [])],
      message: tool.messages?.incomplete || `${tool.label} não calculado: dado obrigatório ainda não informado.`
    };
  }
  return {
    ...state,
    availability,
    applicability: 'applicable',
    calculability: 'calculable',
    status: 'complete',
    score,
    interpretation: tool.interpret?.(score) || null,
    missingVariables: [],
    message: null
  };
}

function setToolApplied(state, applied = true, now = new Date().toISOString()) {
  if (applied && (state.applicability !== 'applicable' || state.calculability !== 'calculable')) {
    throw new RangeError('Tool can only be applied when applicable and calculable.');
  }
  return {
    ...state,
    applied: Boolean(applied),
    appliedAt: applied ? now : null
  };
}

export { createToolState, evaluateToolState, evaluateRule, setToolApplied };
