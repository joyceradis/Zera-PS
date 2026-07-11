window.ZERA_SCORES = [
  {
    id: 'crb65',
    title: 'CRB-65',
    description: 'Estratificação clínica inicial de gravidade na pneumonia adquirida na comunidade.',
    items: [
      { label: 'Confusão mental nova', points: 1 },
      { label: 'Frequência respiratória ≥ 30 irpm', points: 1 },
      { label: 'PAS < 90 mmHg ou PAD ≤ 60 mmHg', points: 1 },
      { label: 'Idade ≥ 65 anos', points: 1 }
    ],
    interpret(score) {
      if (score === 0) return 'Baixo risco; correlacionar com quadro clínico e protocolo local.';
      if (score <= 2) return 'Risco intermediário; considerar avaliação hospitalar conforme contexto.';
      return 'Alto risco; avaliação hospitalar urgente e considerar cuidado intensivo.';
    }
  },
  {
    id: 'qsofa',
    title: 'qSOFA',
    description: 'Triagem prognóstica em paciente com suspeita de infecção fora da UTI.',
    items: [
      { label: 'Frequência respiratória ≥ 22 irpm', points: 1 },
      { label: 'Pressão arterial sistólica ≤ 100 mmHg', points: 1 },
      { label: 'Alteração do nível de consciência', points: 1 }
    ],
    interpret(score) {
      return score >= 2
        ? 'Maior risco de desfecho desfavorável; ampliar avaliação e monitorização.'
        : 'Pontuação baixa não exclui sepse; manter julgamento clínico.';
    }
  },
  {
    id: 'curb65',
    title: 'CURB-65',
    description: 'Estratificação de gravidade da PAC quando ureia está disponível.',
    items: [
      { label: 'Confusão mental nova', points: 1 },
      { label: 'Ureia > 7 mmol/L (≈ 19 mg/dL de ureia nitrogenada)', points: 1 },
      { label: 'Frequência respiratória ≥ 30 irpm', points: 1 },
      { label: 'PAS < 90 mmHg ou PAD ≤ 60 mmHg', points: 1 },
      { label: 'Idade ≥ 65 anos', points: 1 }
    ],
    interpret(score) {
      if (score <= 1) return 'Baixo risco em termos do escore; individualizar decisão.';
      if (score === 2) return 'Risco intermediário; considerar internação ou observação estruturada.';
      return 'Alto risco; internação e avaliação de suporte avançado conforme contexto.';
    }
  },
  {
    id: 'glasgow',
    title: 'Glasgow simplificado',
    description: 'Registro rápido dos componentes da Escala de Coma de Glasgow.',
    custom: 'glasgow'
  }
];
