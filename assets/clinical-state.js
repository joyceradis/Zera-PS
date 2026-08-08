const CLINICAL_STATES = Object.freeze({
  NOT_INFORMED: 'not_informed',
  NOT_INVESTIGATED: 'not_investigated',
  DENIED: 'denied',
  PRESENT: 'present',
  ABSENT: 'absent',
  NOT_APPLICABLE: 'not_applicable',
  TEMPLATE_CONFIRMED: 'template_confirmed'
});

const CLINICAL_SOURCES = Object.freeze({
  PATIENT: 'patient',
  PHYSICIAN_OBSERVATION: 'physician_observation',
  PHYSICIAN_ACTION: 'physician_action',
  MEDICAL_RECORD: 'medical_record',
  EXAM_RESULT: 'exam_result',
  OTHER: 'other'
});

function createClinicalField(overrides = {}) {
  return {
    value: null,
    state: CLINICAL_STATES.NOT_INFORMED,
    source: null,
    confirmed: false,
    confirmedAt: null,
    ...overrides
  };
}

function timestamp(options = {}) {
  return options.confirmedAt || new Date().toISOString();
}

function confirmDenied(field, options = {}) {
  return {
    ...field,
    value: null,
    state: CLINICAL_STATES.DENIED,
    source: options.source || CLINICAL_SOURCES.PATIENT,
    confirmed: true,
    confirmedAt: timestamp(options)
  };
}

function confirmReported(field, value, options = {}) {
  return {
    ...field,
    value,
    state: CLINICAL_STATES.PRESENT,
    source: CLINICAL_SOURCES.PATIENT,
    confirmed: true,
    confirmedAt: timestamp(options)
  };
}

function confirmObserved(field, value, options = {}) {
  return {
    ...field,
    value,
    state: CLINICAL_STATES.PRESENT,
    source: CLINICAL_SOURCES.PHYSICIAN_OBSERVATION,
    confirmed: true,
    confirmedAt: timestamp(options)
  };
}

function confirmTemplate(templateId, values, options = {}) {
  return {
    templateId,
    values: { ...values },
    state: CLINICAL_STATES.TEMPLATE_CONFIRMED,
    source: CLINICAL_SOURCES.PHYSICIAN_ACTION,
    confirmed: true,
    confirmedAt: timestamp(options)
  };
}

function canRenderClinicalField(field) {
  if (!field || field.confirmed !== true) return false;
  return ![
    CLINICAL_STATES.NOT_INFORMED,
    CLINICAL_STATES.NOT_INVESTIGATED
  ].includes(field.state);
}

export {
  CLINICAL_STATES,
  CLINICAL_SOURCES,
  createClinicalField,
  confirmDenied,
  confirmReported,
  confirmObserved,
  confirmTemplate,
  canRenderClinicalField
};
