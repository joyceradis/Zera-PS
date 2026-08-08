function createToolState(tool) {
  return {
    id: tool.id,
    label: tool.label,
    type: tool.type,
    availability: tool.availability || 'unavailable',
    applicability: 'unknown',
    calculability: 'not_calculable',
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
      status: 'incomplete',
      score: null,
      interpretation: null,
      missingVariables: [],
      message: null
    };
  }

  const missingVariables = (tool.requiredVariables || []).filter((key) => context[key] === null || context[key] === undefined || context[key] === '');
  if (missingVariables.length) {
    const first = missingVariables[0];
    return {
      ...state,
      availability,
      applicability: 'applicable',
      calculability: 'not_calculable',
      status: 'incomplete',
      score: null,
      interpretation: null,
      missingVariables,
      message: tool.missingMessages?.[first] || `${tool.label} não calculado: dado obrigatório ainda não informado.`
    };
  }

  const score = tool.calculate(context);
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

export { createToolState, evaluateToolState, evaluateRule };
