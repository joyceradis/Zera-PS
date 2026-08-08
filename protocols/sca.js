const STAGES = Object.freeze([
  'initial_assessment',
  'initial_conduct',
  'pending_results',
  'reassessment',
  'final_documentation'
]);

const SUSPECTED_ACS = Object.freeze({ field: 'suspectedAcs', equals: true });
const TROPONIN_AVAILABLE = Object.freeze({ field: 'troponinStatus', equals: 'available' });

const POINT_OPTIONS = Object.freeze([
  { value: '', label: 'NÃO INFORMADO' },
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' }
]);

const HEART_TOOL = Object.freeze({
  id: 'heart',
  label: 'HEART',
  type: 'score',
  availability: 'available',
  applicableWhen: SUSPECTED_ACS,
  variables: Object.freeze({
    heartHistory: { field: 'heartHistory' },
    heartEcg: { field: 'heartEcg' },
    age: { field: 'heartAge' },
    heartRiskFactors: { field: 'heartRisk' },
    troponinRatio: { field: 'troponinRatio', availableWhen: TROPONIN_AVAILABLE }
  }),
  requiredVariables: ['heartHistory', 'heartEcg', 'age', 'heartRiskFactors', 'troponinRatio'],
  missingMessages: {
    troponinRatio: 'HEART Score não calculado: troponina ainda não informada.'
  },
  messages: {
    notApplicable: 'HEART DISPONÍVEL PARA O CENÁRIO — AINDA NÃO PERTINENTE SEM SUSPEITA CLÍNICA DE SCA / EQUIVALENTE ANGINOSO.',
    incomplete: 'HEART SCORE NÃO CALCULADO — COMPLETE AS VARIÁVEIS OBRIGATÓRIAS.'
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
  version: '2.0.0',
  label: 'DOR TORÁCICA / SUSPEITA DE SCA',
  stages: STAGES,
  fields: Object.freeze([
    { id: 'qp', type: 'text', label: 'QP', source: 'evolution_form', domId: 'qp' },
    { id: 'hda', type: 'textarea', label: 'HDA', source: 'evolution_form', domId: 'hda' },
    { id: 'conduta', type: 'textarea', label: 'Conduta', source: 'evolution_form', domId: 'conduta' },
    {
      id: 'suspectedAcs',
      type: 'boolean',
      label: 'Suspeita clínica de SCA / equivalente anginoso',
      domId: 'sca-suspected',
      default: false
    },
    {
      id: 'ecgStatus',
      type: 'select',
      label: 'ECG',
      domId: 'sca-ecg-status',
      width: 'half',
      default: 'not_informed',
      options: [
        { value: 'not_informed', label: 'NÃO INFORMADO' },
        { value: 'pending', label: 'SOLICITADO / PENDENTE' },
        { value: 'available', label: 'DISPONÍVEL' },
        { value: 'not_applicable', label: 'NÃO APLICÁVEL' }
      ]
    },
    {
      id: 'ecgResult',
      type: 'textarea',
      label: 'Resultado / descrição do ECG',
      domId: 'sca-ecg-result',
      width: 'full',
      rows: 3,
      placeholder: 'DESCREVA O ECG EFETIVAMENTE DISPONÍVEL',
      visibleWhen: { field: 'ecgStatus', equals: 'available' }
    },
    {
      id: 'troponinStatus',
      type: 'select',
      label: 'Troponina',
      domId: 'sca-troponin-status',
      width: 'half',
      default: 'not_informed',
      options: [
        { value: 'not_informed', label: 'NÃO INFORMADA' },
        { value: 'pending', label: 'SOLICITADA / PENDENTE' },
        { value: 'available', label: 'DISPONÍVEL' },
        { value: 'not_applicable', label: 'NÃO APLICÁVEL' }
      ]
    },
    {
      id: 'troponinValue',
      type: 'text',
      label: 'Troponina — valor',
      domId: 'sca-troponin-value',
      width: 'half',
      placeholder: 'VALOR + UNIDADE',
      visibleWhen: TROPONIN_AVAILABLE
    },
    {
      id: 'troponinRatio',
      type: 'number',
      label: 'Troponina — relação com limite superior da referência',
      domId: 'sca-troponin-ratio',
      width: 'half',
      min: 0,
      step: 0.01,
      placeholder: 'EX.: 0.8, 1.5, 4',
      visibleWhen: TROPONIN_AVAILABLE
    },
    {
      id: 'heartHistory',
      type: 'select',
      coerce: 'number',
      label: 'History — pontos',
      domId: 'heart-history',
      width: 'half',
      default: '',
      options: POINT_OPTIONS
    },
    {
      id: 'heartEcg',
      type: 'select',
      coerce: 'number',
      label: 'ECG — pontos',
      domId: 'heart-ecg',
      width: 'half',
      default: '',
      options: POINT_OPTIONS
    },
    {
      id: 'heartAge',
      type: 'number',
      label: 'Idade',
      domId: 'heart-age',
      width: 'half',
      min: 0,
      max: 130,
      placeholder: 'ANOS'
    },
    {
      id: 'heartRisk',
      type: 'select',
      coerce: 'number',
      label: 'Fatores de risco — pontos',
      domId: 'heart-risk',
      width: 'half',
      default: '',
      options: POINT_OPTIONS
    }
  ]),
  sections: Object.freeze([
    { id: 'presentation', stage: 'initial_assessment', fields: ['qp', 'hda'] },
    { id: 'acs_context', stages: STAGES, fields: ['suspectedAcs'] },
    {
      id: 'ecg',
      stages: STAGES,
      visibleWhen: SUSPECTED_ACS,
      layout: 'two-columns',
      fields: ['ecgStatus', 'ecgResult']
    },
    {
      id: 'troponin',
      stages: STAGES,
      visibleWhen: SUSPECTED_ACS,
      layout: 'two-columns',
      fields: ['troponinStatus', 'troponinValue', 'troponinRatio']
    },
    {
      id: 'cardiovascular_risk',
      stages: STAGES,
      visibleWhen: SUSPECTED_ACS,
      layout: 'two-columns',
      kicker: 'HEART SCORE',
      title: 'Disponível ≠ aplicável ≠ calculável',
      tool: 'heart',
      fields: ['heartHistory', 'heartEcg', 'heartAge', 'heartRisk']
    },
    { id: 'conduct', stages: ['initial_conduct', 'reassessment', 'final_documentation'], fields: ['conduta'] }
  ]),
  tools: Object.freeze([HEART_TOOL]),
  temporalResults: Object.freeze([
    {
      id: 'ecg_initial',
      kind: 'ecg',
      label: 'ECG',
      pendingWhen: { field: 'ecgStatus', equals: 'pending' },
      availableWhen: { field: 'ecgStatus', equals: 'available' },
      payload: { value: 'ecgResult' }
    },
    {
      id: 'troponin_1',
      kind: 'troponin',
      label: 'Troponina',
      pendingWhen: { field: 'troponinStatus', equals: 'pending' },
      availableWhen: TROPONIN_AVAILABLE,
      payload: { value: 'troponinValue', ratio: 'troponinRatio' }
    }
  ])
});

export { HEART_TOOL, SCA_PROTOCOL };
