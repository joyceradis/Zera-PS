import { renderField, renderListSection, renderExamComplementSection } from '../assets/document-engine.js';

const normalize = (value) => String(value ?? '').trim().toUpperCase();

const JUSTIFICATION_PROFILES = Object.freeze([
  {
    id: 'tc-abdome-pelve',
    label: 'TC de abdome e pelve',
    section: 'exame',
    variants: [
      { id: 'sem-contraste', label: 'Sem contraste' },
      { id: 'contraste', label: 'Com contraste' }
    ],
    requestLine: (variantId) => `SOLICITO TOMOGRAFIA COMPUTADORIZADA DE ABDOME E PELVE${variantId === 'contraste' ? ' COM CONTRASTE' : ' SEM CONTRASTE'}.`
  },
  {
    id: 'usg-abdome-total',
    label: 'USG de abdome total / rins e vias urinárias',
    section: 'exame',
    variants: [
      { id: 'abdome-total', label: 'Abdome total' },
      { id: 'rins-vias-urinarias', label: 'Rins e vias urinárias' }
    ],
    requestLine: (variantId) => `SOLICITO ULTRASSONOGRAFIA DE ${variantId === 'rins-vias-urinarias' ? 'RINS E VIAS URINÁRIAS' : 'ABDOME TOTAL'}.`
  },
  {
    id: 'internacao',
    label: 'Internação hospitalar',
    section: 'internacao',
    variants: [],
    requestLine: () => 'SOLICITO INTERNAÇÃO HOSPITALAR PARA CONTINUIDADE DE INVESTIGAÇÃO E CONDUTA.'
  }
]);

function getJustificationProfile(id) {
  return JUSTIFICATION_PROFILES.find((profile) => profile.id === id) || null;
}

function renderClinicalPictureBlock(form = {}) {
  const parts = [normalize(form.qp), normalize(form.hda)].filter(Boolean);
  const body = parts.length
    ? parts.join('. ')
    : '[COMPLETAR: QUADRO CLÍNICO — QP/HDA NÃO PREENCHIDOS NA EVOLUÇÃO]';
  return ['# QUADRO CLÍNICO:', body];
}

function renderRelevantHistoryBlock(hpp = {}) {
  const lines = [
    renderField('COMORBIDADES', hpp.comorbidades),
    renderField('MUC', hpp.muc),
    renderField('ALERGIAS', hpp.alergias),
    renderField('HÁBITOS', hpp.habitos),
    renderField('CIRURGIAS PRÉVIAS', hpp.cirurgias)
  ].filter(Boolean);
  return lines.length ? ['# ANTECEDENTES RELEVANTES:', ...lines] : [];
}

function renderPhysicalExamBlock(physicalExam = {}) {
  const fields = physicalExam.fields || {};
  const lines = [
    renderField('', fields.estadoGeral)?.replace('- : ', '- '),
    renderField('ACV', fields.acv),
    renderField('AR', fields.ar),
    renderField('ABD', fields.abd),
    renderField('EXT', fields.ext),
    renderField('NEUROLÓGICO', fields.neuro)
  ].filter(Boolean);
  return lines.length ? ['# EXAME FÍSICO:', ...lines] : [];
}

function renderRiskBlock(hipoteses) {
  const rendered = renderListSection('# HIPÓTESE / RISCO QUE JUSTIFICA A SOLICITAÇÃO:', hipoteses);
  if (rendered.length) return rendered;
  return [
    '# HIPÓTESE / RISCO QUE JUSTIFICA A SOLICITAÇÃO:',
    '[COMPLETAR: HIPÓTESE OU RISCO CLÍNICO QUE JUSTIFICA ESTE PEDIDO — CAMPO "HIPÓTESES DIAGNÓSTICAS" NÃO PREENCHIDO NA EVOLUÇÃO]'
  ];
}

function renderRequestBlock(profile, variantId) {
  const title = profile.section === 'internacao' ? '# SOLICITAÇÃO DE INTERNAÇÃO:' : '# SOLICITAÇÃO:';
  const line = profile.requestLine ? profile.requestLine(variantId) : '';
  if (!line) return [title, '[COMPLETAR: DESCREVER O QUE ESTÁ SENDO SOLICITADO]'];
  return [title, `- ${line}`];
}

/**
 * Monta o corpo de uma justificativa a partir de dados já confirmados na Evolução.
 * Nunca fabrica achado, risco ou urgência: todo bloco vem de texto já digitado ou de
 * estado clínico já confirmado (mesma regra de renderEvolution). Um bloco que dependeria
 * de dado ausente vira um marcador [COMPLETAR: ...] visível — nunca some, nunca é inventado.
 * Retorna corpo sem cabeçalho de documento; quem chama decide se envolve com
 * "## JUSTIFICATIVA DE EXAME - HOSPITAL MERIDIONAL SERRA ##" (documento avulso) ou insere
 * como conteúdo de um campo já existente (ex.: Justificativa clínica da Internação).
 */
function assembleJustification(profile, variantId, { form = {}, clinicalState = {} } = {}) {
  if (!profile) return '';
  const blocks = [
    renderClinicalPictureBlock(form),
    renderRelevantHistoryBlock(clinicalState.hpp),
    renderPhysicalExamBlock(clinicalState.physicalExam),
    renderExamComplementSection(form.laboratoriais, form.imagem),
    renderRiskBlock(form.hipoteses),
    renderRequestBlock(profile, variantId)
  ].filter((block) => block.length > 0);
  return blocks.map((block) => block.join('\n')).join('\n\n');
}

export { JUSTIFICATION_PROFILES, getJustificationProfile, assembleJustification };
