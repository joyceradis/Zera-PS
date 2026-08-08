const SCORE_DEFINITIONS = Object.freeze({
  crb65: {
    id: 'crb65',
    title: 'CRB-65',
    description: 'Estratificação clínica inicial de gravidade na pneumonia adquirida na comunidade.',
    items: [
      { key: 'confusion', label: 'Confusão mental nova', points: 1 },
      { key: 'respiratory_rate', label: 'Frequência respiratória ≥ 30 irpm', points: 1 },
      { key: 'blood_pressure', label: 'PAS < 90 mmHg ou PAD ≤ 60 mmHg', points: 1 },
      { key: 'age', label: 'Idade ≥ 65 anos', points: 1 }
    ],
    interpret(score) {
      if (score === 0) return 'Baixo risco; correlacionar com quadro clínico e protocolo local.';
      if (score <= 2) return 'Risco intermediário; considerar avaliação hospitalar conforme contexto.';
      return 'Alto risco; avaliação hospitalar urgente e considerar cuidado intensivo.';
    }
  },
  qsofa: {
    id: 'qsofa',
    title: 'qSOFA',
    description: 'Triagem prognóstica em paciente com suspeita de infecção fora da UTI.',
    items: [
      { key: 'respiratory_rate', label: 'Frequência respiratória ≥ 22 irpm', points: 1 },
      { key: 'systolic_bp', label: 'Pressão arterial sistólica ≤ 100 mmHg', points: 1 },
      { key: 'altered_consciousness', label: 'Alteração do nível de consciência', points: 1 }
    ],
    interpret(score) {
      return score >= 2
        ? 'Maior risco de desfecho desfavorável; ampliar avaliação e monitorização.'
        : 'Pontuação baixa não exclui sepse; manter julgamento clínico.';
    }
  },
  curb65: {
    id: 'curb65',
    title: 'CURB-65',
    description: 'Estratificação de gravidade da PAC quando ureia está disponível.',
    items: [
      { key: 'confusion', label: 'Confusão mental nova', points: 1 },
      { key: 'urea', label: 'Ureia > 7 mmol/L (≈ 19 mg/dL de ureia nitrogenada)', points: 1 },
      { key: 'respiratory_rate', label: 'Frequência respiratória ≥ 30 irpm', points: 1 },
      { key: 'blood_pressure', label: 'PAS < 90 mmHg ou PAD ≤ 60 mmHg', points: 1 },
      { key: 'age', label: 'Idade ≥ 65 anos', points: 1 }
    ],
    interpret(score) {
      if (score <= 1) return 'Baixo risco em termos do escore; individualizar decisão.';
      if (score === 2) return 'Risco intermediário; considerar internação ou observação estruturada.';
      return 'Alto risco; internação e avaliação de suporte avançado conforme contexto.';
    }
  }
});

function createScoreState(definition) {
  return {
    status: 'incomplete',
    score: null,
    interpretation: null,
    answers: Object.fromEntries(definition.items.map((item) => [item.key, null]))
  };
}

function answerScore(state, key, value) {
  if (![true, false, null].includes(value)) throw new TypeError('Score answers must be true, false or null.');
  if (!(key in state.answers)) throw new RangeError(`Unknown score variable: ${key}`);
  return {
    ...state,
    answers: { ...state.answers, [key]: value }
  };
}

function calculateScore(definition, state) {
  const unanswered = definition.items.some((item) => state.answers[item.key] === null);
  if (unanswered) {
    return { ...state, status: 'incomplete', score: null, interpretation: null };
  }

  const score = definition.items.reduce(
    (sum, item) => sum + (state.answers[item.key] === true ? item.points : 0),
    0
  );

  return {
    ...state,
    status: 'complete',
    score,
    interpretation: definition.interpret(score)
  };
}

function calculateGlasgow(answers) {
  const values = [answers.eye, answers.verbal, answers.motor];
  if (values.some((value) => value === null || value === undefined || value === '')) {
    return { status: 'incomplete', score: null, interpretation: null };
  }
  const score = values.reduce((sum, value) => sum + Number(value), 0);
  return {
    status: 'complete',
    score,
    interpretation: score <= 8
      ? 'Pontuação associada a rebaixamento importante; avaliar proteção de via aérea e contexto.'
      : 'Interpretar em conjunto com sedação, intoxicação, trauma e exame neurológico.'
  };
}

const SCORE_LIST = Object.values(SCORE_DEFINITIONS);

export {
  SCORE_DEFINITIONS,
  SCORE_LIST,
  createScoreState,
  answerScore,
  calculateScore,
  calculateGlasgow
};
