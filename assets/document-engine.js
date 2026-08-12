import { CLINICAL_STATES, canRenderClinicalField } from './clinical-state.js';

const normalize = (value) => String(value ?? '').trim().toUpperCase();

function renderField(label, field) {
  if (!canRenderClinicalField(field)) return null;
  if (field.state === CLINICAL_STATES.DENIED) return `- ${label}: NEGA`;
  const value = normalize(field.value);
  if (!value) return null;
  return `- ${label}: ${value}`;
}

function parseLines(value) {
  return normalize(value)
    .split(/\n+/)
    .map((line) => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
}

function renderListSection(title, value) {
  const lines = parseLines(value);
  if (!lines.length) return [];
  return [title, ...lines.map((line) => `- ${line}`)];
}

function renderExamComplementSection(laboratoriais, imagem) {
  const items = [
    ...parseLines(laboratoriais),
    ...parseLines(imagem)
  ];
  return items.length ? ['# EXAMES COMPLEMENTARES:', ...items.map((item) => `- ${item}`)] : [];
}

function renderEvolution(raw = {}, clinicalState = {}) {
  const output = ['## EVOLUÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##'];
  const pushSection = (...lines) => {
    const clean = lines.filter(Boolean);
    if (!clean.length) return;
    output.push('', ...clean);
  };

  if (normalize(raw.qp)) pushSection(`# QP: ${normalize(raw.qp)}`);
  if (normalize(raw.hda)) pushSection(`# HDA: ${normalize(raw.hda)}`);

  const hpp = clinicalState.hpp || {};
  const hppLines = [
    renderField('COMORBIDADES', hpp.comorbidades),
    renderField('MUC', hpp.muc),
    renderField('ALERGIAS', hpp.alergias),
    renderField('HÁBITOS', hpp.habitos),
    renderField('CIRURGIAS PRÉVIAS', hpp.cirurgias)
  ].filter(Boolean);
  if (hppLines.length) pushSection('# HPP:', ...hppLines);

  const examFields = clinicalState.physicalExam?.fields || {};
  const examLines = [
    renderField('', examFields.estadoGeral)?.replace('- : ', '- '),
    renderField('ACV', examFields.acv),
    renderField('AR', examFields.ar),
    renderField('ABD', examFields.abd),
    renderField('EXT', examFields.ext),
    renderField('NEUROLÓGICO', examFields.neuro)
  ].filter(Boolean);
  if (examLines.length) pushSection('# EXAME FÍSICO:', ...examLines);

  pushSection(...renderExamComplementSection(raw.laboratoriais, raw.imagem));

  const hypotheses = renderListSection('# HIPÓTESES DIAGNÓSTICAS:', raw.hipoteses);
  if (hypotheses.length) pushSection(...hypotheses);

  const conduct = renderListSection('# CONDUTA:', raw.conduta);
  if (conduct.length) pushSection(...conduct);

  if (raw.includeEmTempo) {
    const emTempo = renderListSection('# EM TEMPO:', raw.emTempo);
    if (emTempo.length) pushSection(...emTempo);
  }

  return output.join('\n');
}

function renderReassessment(raw = {}) {
  const output = ['## REAVALIAÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##'];
  if (normalize(raw.evolucao)) output.push('', `# EVOLUÇÃO: ${normalize(raw.evolucao)}`);
  const exams = renderListSection('# EXAMES DISPONIBILIZADOS:', raw.exames);
  if (exams.length) output.push('', ...exams);
  const conduct = renderListSection('# CONDUTA:', raw.conduta);
  if (conduct.length) output.push('', ...conduct);
  return output.join('\n');
}

function renderAdmission(raw = {}) {
  const output = ['## SOLICITAÇÃO DE INTERNAÇÃO - HOSPITAL MERIDIONAL SERRA ##'];
  const diagnosis = renderListSection('# DIAGNÓSTICO / HIPÓTESE PRINCIPAL:', raw.diagnostico);
  if (diagnosis.length) output.push('', ...diagnosis);
  if (normalize(raw.justificativa)) output.push('', '# JUSTIFICATIVA CLÍNICA:', normalize(raw.justificativa));
  if (normalize(raw.destino)) output.push('', `# DESTINO SOLICITADO: ${normalize(raw.destino)}`);
  const care = renderListSection('# PRESCRIÇÃO / CUIDADOS INICIAIS:', raw.prescricao);
  if (care.length) output.push('', ...care);
  return output.join('\n');
}

function renderDischarge(raw = {}) {
  const output = ['## ALTA PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##'];
  const diagnosis = renderListSection('# DIAGNÓSTICO FINAL:', raw.diagnostico);
  if (diagnosis.length) output.push('', ...diagnosis);
  if (normalize(raw.resumo)) output.push('', `# SUMÁRIO DE ALTA: ${normalize(raw.resumo)}`);
  const meds = renderListSection('# MEDICAÇÕES DOMICILIARES:', raw.medicacoes);
  if (meds.length) output.push('', ...meds);
  const guidance = renderListSection('# ORIENTAÇÕES E SINAIS DE ALARME:', raw.orientacoes);
  if (guidance.length) output.push('', ...guidance);
  return output.join('\n');
}

export {
  renderEvolution,
  renderReassessment,
  renderAdmission,
  renderDischarge,
  renderField,
  renderListSection,
  renderExamComplementSection
};