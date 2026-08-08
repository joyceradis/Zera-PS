const HEART_TOOL = Object.freeze({
  id: 'heart',
  label: 'HEART',
  type: 'score',
  availability: 'available',
  applicableWhen: { field: 'suspectedAcs', equals: true },
  requiredVariables: ['heartHistory', 'heartEcg', 'age', 'heartRiskFactors', 'troponinRatio'],
  missingMessages: {
    troponinRatio: 'HEART Score não calculado: troponina ainda não informada.'
  },
  calculate(context) {
    const agePoints = context.age >= 65 ? 2 : context.age >= 45 ? 1 : 0;
    const troponinPoints = context.troponinRatio > 3 ? 2 : context.troponinRatio > 1 ? 1 : 0;
    return Number(context.heartHistory) + Number(context.heartEcg) + agePoints + Number(context.heartRiskFactors) + troponinPoints;
  },
  interpret(score) {
    if (score <= 3) return 'BAIXO RISCO';
    if (score <= 6) return 'RISCO INTERMEDIÁRIO';
    return 'ALTO RISCO';
  }
});

const SCA_PROTOCOL = Object.freeze({
  id: 'sca',
  version: '1.0.0',
  label: 'Dor torácica / suspeita de SCA',
  stages: [
    'initial_assessment',
    'initial_conduct',
    'pending_results',
    'reassessment',
    'final_documentation'
  ],
  sections: [
    { id: 'presentation', stage: 'initial_assessment', fields: ['qp', 'hda'] },
    { id: 'acs_context', stage: 'initial_assessment', fields: ['suspectedAcs'] },
    { id: 'ecg', stages: ['initial_assessment', 'reassessment'], visibleWhen: { field: 'suspectedAcs', equals: true } },
    { id: 'troponin', stages: ['initial_assessment', 'pending_results', 'reassessment'], visibleWhen: { field: 'suspectedAcs', equals: true } },
    { id: 'cardiovascular_risk', stages: ['initial_assessment', 'reassessment'], visibleWhen: { field: 'suspectedAcs', equals: true } },
    { id: 'conduct', stages: ['initial_conduct', 'reassessment', 'final_documentation'] }
  ],
  tools: [HEART_TOOL]
});

export { HEART_TOOL, SCA_PROTOCOL };
