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

function injectScoresIntoEvolution(evolutionText = '', scores = []) {
  const scoreLines = renderScores(scores);
  if (!scoreLines.length) return String(evolutionText);
  const lines = String(evolutionText).split('\n');
  const qpIndex = lines.findIndex((line) => line.trim().startsWith('# QP:'));
  if (qpIndex < 0) return String(evolutionText);
  let insertAt = qpIndex + 1;
  while (insertAt < lines.length && !lines[insertAt].trim()) insertAt += 1;
  const before = lines.slice(0, qpIndex + 1);
  const after = lines.slice(insertAt);
  return [...before, '', ...scoreLines, '', ...after].join('\n');
}

function normalizeCarryForward(lines = []) {
  return lines
    .map((line) => String(line ?? '').trimEnd())
    .filter((line, index, all) => line || (index > 0 && index < all.length - 1));
}

function extractCarryForwardSections(evolutionText = '') {
  const allowed = new Set(['# HPP:', '# EXAME FÍSICO:', '# EXAMES COMPLEMENTARES:', '# HIPÓTESES DIAGNÓSTICAS:']);
  const stop = new Set(['# QP:', '# HDA:', '# CONDUTA:', '# EM TEMPO:', '# SCORES:']);
  const lines = String(evolutionText).split('\n');
  const output = [];
  let capturing = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (allowed.has(trimmed)) {
      if (output.length && output.at(-1) !== '') output.push('');
      output.push(trimmed);
      capturing = true;
      continue;
    }
    if (trimmed.startsWith('## ') || [...stop].some((prefix) => trimmed.startsWith(prefix))) {
      capturing = false;
      continue;
    }
    if (capturing) output.push(line);
  }

  while (output.at(-1) === '') output.pop();
  return output;
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

export { renderTemporalReassessment, renderScores, injectScoresIntoEvolution, extractCarryForwardSections };
