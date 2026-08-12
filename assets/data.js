const NORMAL_EXAM_TEMPLATE = Object.freeze({
  id: 'normal_exam_v1',
  label: 'Modelo de exame normal',
  values: {
    estadoGeral: 'BEG, LOTE, CORADO, HIDRATADO, ANICTÉRICO, ACIANÓTICO, AFEBRIL',
    acv: 'RCR, 2T, BNF, SEM SOPROS',
    ar: 'MV PRESENTE BILATERALMENTE, SEM RUÍDOS ADVENTÍCIOS',
    abd: 'PLANO, FLÁCIDO, INDOLOR À PALPAÇÃO, SEM SINAIS DE IRRITAÇÃO PERITONEAL',
    ext: 'SEM EDEMAS, PULSOS PERIFÉRICOS PALPÁVEIS E SIMÉTRICOS',
    neuro: 'LOTE, GLASGOW 15, SEM DÉFICITS NEUROLÓGICOS FOCAIS'
  }
});

const QUICK_CHOICES = Object.freeze({
  comorbidades: {
    exclusive: 'NEGA',
    options: ['NEGA', 'HAS', 'DM2', 'DLP', 'ASMA', 'DPOC', 'IC', 'DAC', 'DRC', 'HIPOTIREOIDISMO', 'OBESIDADE']
  },
  muc: {
    exclusive: 'NEGA',
    options: ['NEGA', 'LOSARTANA', 'ANLODIPINO', 'HIDROCLOROTIAZIDA', 'METFORMINA', 'INSULINA', 'LEVOTIROXINA', 'AAS', 'ESTATINA']
  },
  alergias: {
    exclusive: 'NEGA',
    options: ['NEGA', 'DIPIRONA', 'AINE', 'PENICILINA', 'AMOXICILINA', 'SULFA']
  },
  habitos: {
    exclusive: 'NEGA',
    options: ['NEGA', 'TABAGISMO', 'EX-TABAGISMO', 'ETILISMO', 'NEGA TABAGISMO', 'NEGA ETILISMO']
  },
  cirurgias: {
    exclusive: 'NEGA',
    options: ['NEGA', 'APENDICECTOMIA', 'COLECISTECTOMIA', 'CESÁREA', 'HISTERECTOMIA', 'BARIÁTRICA']
  },
  estadoGeral: {
    groups: [
      ['BEG', 'REG', 'MEG'],
      ['LOTE', 'CONFUSO', 'REBAIXADO'],
      ['CORADO', 'HIPOCORADO'],
      ['HIDRATADO', 'DESIDRATADO +/4+', 'DESIDRATADO ++/4+', 'DESIDRATADO +++/4+', 'DESIDRATADO ++++/4+'],
      ['ANICTÉRICO', 'ICTÉRICO'],
      ['ACIANÓTICO', 'CIANÓTICO'],
      ['AFEBRIL', 'FEBRIL']
    ]
  },
  acv: { options: ['RCR', '2T', 'BNF', 'SEM SOPROS', 'TAQUICÁRDICO', 'BRADICÁRDICO', 'ARRÍTMICO', 'COM SOPRO'] },
  ar: { options: ['MV PRESENTE BILATERALMENTE', 'SEM RUÍDOS ADVENTÍCIOS', 'SEM DESCONFORTO RESPIRATÓRIO', 'SIBILOS', 'ESTERTORES', 'RONCOS', 'MV REDUZIDO', 'COM DESCONFORTO RESPIRATÓRIO'] },
  abd: { options: ['PLANO', 'FLÁCIDO', 'RHA PRESENTES', 'INDOLOR À PALPAÇÃO', 'DOLOROSO DIFUSAMENTE', 'DOR LOCALIZADA', 'SEM DEFESA', 'SEM SINAIS DE IRRITAÇÃO PERITONEAL', 'COM DEFESA', 'DB+'] },
  ext: { options: ['SEM EDEMAS', 'PULSOS PERIFÉRICOS PALPÁVEIS E SIMÉTRICOS', 'TEC < 2S', 'COM EDEMA', 'ASSIMETRIA', 'EMPASTAMENTO DE PANTURRILHA'] },
  neuro: { options: ['LOTE', 'GLASGOW 15', 'SEM DÉFICITS NEUROLÓGICOS FOCAIS', 'SEM SINAIS MENÍNGEOS', 'CONFUSO', 'COM DÉFICIT FOCAL', 'COM SINAIS MENÍNGEOS'] }
});

const FIELD_MAP = Object.freeze({
  estadoGeral: 'estado-geral',
  acv: 'acv',
  ar: 'ar',
  abd: 'abd',
  ext: 'ext',
  neuro: 'neuro'
});

export { NORMAL_EXAM_TEMPLATE, QUICK_CHOICES, FIELD_MAP };
