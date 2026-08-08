export * from '../assets/document-engine.js';

const normalize = (value) => String(value ?? '').trim().toUpperCase();

function renderScores(scores = []) {
  const calculated = scores.filter((tool) => tool?.applicability === 'applicable' && tool?.calculability === 'calculable' && Number.isFinite(tool?.score));
  if (!calculated.length) return [];
  return [
    '# SCORES:',
    ...calculated.map((tool) => {
      const interpretation = normalize(tool.interpretation);
      return `- ${normalize(tool.label || tool.id)}: ${tool.score} ${tool.score === 1 ? 'PONTO' : 'PONTOS'}${interpretation ? ` — ${interpretation}` : ''}`;
    })
  ];
}

function normalizeCarryForward(lines = []) {
  return lines
    .map((line) => String(line ?? '').trimEnd())
    .filter((line, index, all) => line || (index > 0 && index < all.length - 1));
}

function renderTemporalReassessment({
  qp,
  scores = [],
  admissionHda,
  reassessmentNarrative,
  carryForwardSections = [],
  conduct = []
} = {}) {
  const output = ['## REAVALIAÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##'];
  const normalizedQp = normalize(qp);
  if (normalizedQp) output.push('', `# QP: "${normalizedQp}"`);

  const scoreLines = renderScores(scores);
  if (scoreLines.length) output.push('', ...scoreLines);

  const normalizedHda = normalize(admissionHda);
  if (normalizedHda) output.push('', `# HDA (ADMISSÃO): ${normalizedHda}`);

  const narrative = normalize(reassessmentNarrative);
  if (narrative) output.push('', `... EM TEMPO (REAVALIAÇÃO): ${narrative}`);

  const carry = normalizeCarryForward(carryForwardSections);
  if (carry.length) output.push('', ...carry);

  const conductLines = conduct
    .map((item) => normalize(item))
    .filter(Boolean);
  if (conductLines.length) output.push('', '# CONDUTA:', ...conductLines.map((line) => `- ${line.replace(/^[-•]\s*/, '')}`));

  return output.join('\n');
}

export { renderTemporalReassessment, renderScores };
