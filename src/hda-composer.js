const HDA_FACT_STATE = Object.freeze({
  UNKNOWN: 'unknown',
  PRESENT: 'present',
  DENIED: 'denied'
});

const FINDING_LABELS = Object.freeze({
  abdominalPain: 'DOR ABDOMINAL',
  nausea: 'NÁUSEAS',
  vomiting: 'VÔMITOS',
  fever: 'FEBRE',
  blood: 'SANGUE',
  mucus: 'MUCO',
  pus: 'PUS',
  intensePain: 'DOR ABDOMINAL INTENSA',
  oralIntolerance: 'INTOLERÂNCIA À VIA ORAL',
  oliguria: 'REDUÇÃO DA DIURESE',
  syncopeHypotension: 'SÍNCOPE OU HIPOTENSÃO',
  immunosuppression: 'IMUNOSSUPRESSÃO'
});

const GENERAL_FINDINGS = Object.freeze(['abdominalPain', 'nausea', 'vomiting', 'fever']);
const STOOL_FINDINGS = Object.freeze(['blood', 'mucus', 'pus']);
const ALARM_FINDINGS = Object.freeze(['intensePain', 'oralIntolerance', 'oliguria', 'syncopeHypotension', 'immunosuppression']);

function normalize(value) {
  return String(value ?? '').trim().toUpperCase();
}

function emptyDiarrheaHdaState() {
  return {
    onsetValue: '',
    onsetUnit: 'dias',
    episodes: '',
    consistency: '',
    findings: Object.fromEntries(
      Object.keys(FINDING_LABELS).map((key) => [key, HDA_FACT_STATE.UNKNOWN])
    ),
    details: ''
  };
}

function defaultDiarrheaHdaState() {
  const state = emptyDiarrheaHdaState();
  state.draft = true;
  for (const key of ['fever', 'blood', 'mucus', 'pus', 'intensePain', 'oralIntolerance', 'oliguria', 'syncopeHypotension']) {
    state.findings[key] = HDA_FACT_STATE.DENIED;
  }
  return state;
}

function joinClinicalList(items = [], conjunction = 'E') {
  if (items.length < 2) return items[0] || '';
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} ${conjunction} ${items.at(-1)}`;
}

function onsetPhrase(value, unit) {
  const amount = Number(value);
  if (!String(value ?? '').trim() || !Number.isFinite(amount) || amount < 0) return '';
  const normalizedUnit = normalize(unit);
  if (normalizedUnit === 'HORAS') return amount === 1 ? 'HÁ 1 HORA' : `HÁ ${amount} HORAS`;
  if (normalizedUnit === 'SEMANAS') return amount === 1 ? 'HÁ 1 SEMANA' : `HÁ ${amount} SEMANAS`;
  if (amount === 0) return 'COM INÍCIO HOJE';
  return amount === 1 ? 'HÁ 1 DIA' : `HÁ ${amount} DIAS`;
}

function episodesPhrase(value) {
  return ({
    '1-3': 'COM 1 A 3 EPISÓDIOS NAS ÚLTIMAS 24 HORAS',
    '4-6': 'COM 4 A 6 EPISÓDIOS NAS ÚLTIMAS 24 HORAS',
    '>6': 'COM MAIS DE 6 EPISÓDIOS NAS ÚLTIMAS 24 HORAS',
    '0': 'SEM NOVOS EPISÓDIOS NAS ÚLTIMAS 24 HORAS'
  })[String(value ?? '')] || '';
}

function labelsByState(findings, keys, state) {
  return keys
    .filter((key) => findings?.[key] === state)
    .map((key) => FINDING_LABELS[key]);
}

function punctuate(value) {
  const text = normalize(value);
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function composeDiarrheaHda(rawState = {}) {
  const state = {
    ...emptyDiarrheaHdaState(),
    ...rawState,
    findings: {
      ...emptyDiarrheaHdaState().findings,
      ...(rawState.findings || {})
    }
  };
  let lead = 'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA';
  const qualifiers = [];
  const onset = onsetPhrase(state.onsetValue, state.onsetUnit) || (state.draft ? 'HÁ [TEMPO]' : '');
  const episodes = episodesPhrase(state.episodes) || (state.draft ? 'COM [NÚMERO] EPISÓDIOS NAS ÚLTIMAS 24 HORAS' : '');
  const consistency = normalize(state.consistency) || (state.draft ? '[CONSISTÊNCIA]' : '');
  if (onset) lead += ` ${onset}`;
  if (episodes) qualifiers.push(episodes);
  if (consistency) qualifiers.push(`CARACTERIZADOS POR FEZES ${consistency}`);

  const sentences = [`${lead}${qualifiers.length ? `, ${qualifiers.join(', ')}` : ''}.`];
  const presentGeneral = labelsByState(state.findings, GENERAL_FINDINGS, HDA_FACT_STATE.PRESENT);
  if (presentGeneral.length) sentences.push(`REFERE ${joinClinicalList(presentGeneral)}.`);

  const presentStool = labelsByState(state.findings, STOOL_FINDINGS, HDA_FACT_STATE.PRESENT);
  if (presentStool.length) sentences.push(`REFERE PRESENÇA DE ${joinClinicalList(presentStool)} NAS FEZES.`);

  const deniedStool = labelsByState(state.findings, STOOL_FINDINGS, HDA_FACT_STATE.DENIED);
  if (deniedStool.length) sentences.push(`NEGA PRESENÇA DE ${joinClinicalList(deniedStool, 'OU')} NAS FEZES.`);

  const deniedGeneral = labelsByState(
    state.findings,
    [...GENERAL_FINDINGS, ...ALARM_FINDINGS],
    HDA_FACT_STATE.DENIED
  );
  if (deniedGeneral.length) sentences.push(`NEGA ${joinClinicalList(deniedGeneral)}.`);

  const presentAlarms = labelsByState(state.findings, ALARM_FINDINGS, HDA_FACT_STATE.PRESENT);
  if (presentAlarms.length) sentences.push(`APRESENTA ${joinClinicalList(presentAlarms)}.`);

  const details = punctuate(state.details);
  if (details) sentences.push(details);
  return sentences.join(' ');
}

function synchronizeGeneratedHda({ currentText = '', previousGeneratedText = '', nextGeneratedText = '' } = {}) {
  const current = normalize(currentText);
  const previous = normalize(previousGeneratedText);
  const next = normalize(nextGeneratedText);
  if ((!current && !previous) || current === previous) return { text: next, requiresConfirmation: false };
  return { text: currentText, requiresConfirmation: current !== next };
}

export {
  HDA_FACT_STATE,
  FINDING_LABELS,
  emptyDiarrheaHdaState,
  defaultDiarrheaHdaState,
  composeDiarrheaHda,
  synchronizeGeneratedHda
};
