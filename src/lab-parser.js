function normalizeSource(raw = '') {
  return String(raw)
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/Chave de acesso:\s*\S+/gi, ' ')
    .replace(/Resultado completo acesse:[^\n]*/gi, ' ')
    .replace(/Assinado eletronicamente por[^\n]*/gi, ' ')
    .replace(/Responsável técnico:[^\n]*/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

function pick(source, patterns) {
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

function numericResult(label) {
  return new RegExp(`${label}\\s*(?:RESULTADO\\s*)?[:=-]?\\s*([0-9][0-9.,]*)`, 'i');
}

function parseLaboratoryText(raw = '') {
  const source = normalizeSource(raw);
  if (!source) return {};

  const parsed = {
    hb: pick(source, [numericResult('(?:HEMOGLOBINA|\\bHB\\b)')]),
    ht: pick(source, [numericResult('(?:HEMAT[ÓO]CRITO|\\bHT\\b)')]),
    leuco: pick(source, [numericResult('(?:LEUC[ÓO]CITOS|LEUCOCITOS|\\bLEUCO\\b)')]),
    neut: pick(source, [numericResult('(?:NEUTR[ÓO]FILOS|NEUTROFILOS|SEGMENTADOS|\\bSEG\\b)')]),
    bast: pick(source, [numericResult('(?:BASTONETES|\\bBAST\\b)')]),
    eos: pick(source, [numericResult('(?:EOSIN[ÓO]FILOS|EOSINOFILOS|\\bEOS\\b)')]),
    baso: pick(source, [numericResult('(?:BAS[ÓO]FILOS|BASOFILOS|\\bBASO\\b|\\bBAS\\b)')]),
    linf: pick(source, [numericResult('(?:LINF[ÓO]CITOS(?:\\s+T[IÍ]PICOS)?|LINFOCITOS(?:\\s+TIPICOS)?|\\bLINF\\b)')]),
    mono: pick(source, [numericResult('(?:MON[ÓO]CITOS|MONOCITOS|\\bMONO\\b)')]),
    plaq: pick(source, [numericResult('(?:CONTAGEM DE PLAQUETAS|PLAQUETAS|\\bPLAQ\\b)')]),
    pcr: pick(source, [numericResult('(?:PROTE[IÍ]NA\\s+["\']?C["\']?\\s+REATIVA|\\bPCR\\b)')]),
    ur: pick(source, [numericResult('(?:\\bUREIA\\b|\\bUR\\b)')]),
    bun: pick(source, [numericResult('(?:NITROG[EÊ]NIO UREICO|NITROGENIO UREICO|\\bBUN\\b|\\bNU\\b)')]),
    cr: pick(source, [numericResult('(?:\\bCREATININA\\b|\\bCR\\b)')]),
    rfg: pick(source, [/(?:TAXA (?:DE )?FILTRA[ÇC][ÃA]O GLOMERULAR|\bRFG\b)\s*(?:RESULTADO\s*)?[:=-]?\s*(SUPERIOR A\s+[0-9][0-9.,]*|[0-9][0-9.,]*)/i]),
    na: pick(source, [numericResult('(?:\\bS[ÓO]DIO\\b|\\bNA\\b)')]),
    k: pick(source, [numericResult('(?:\\bPOT[ÁA]SSIO\\b|\\bK\\b)')]),
    tgo: pick(source, [numericResult('(?:TRANSAMINASE GLUT[AÂ]MICO OXALAC[EÉ]TICA|ASPARTATO AMINOTRANSFERASE|\\bTGO\\b|\\bAST\\b)')]),
    tgp: pick(source, [numericResult('(?:TRANSAMINASE GLUT[AÂ]MICO PIR[ÚU]VICA|ALANINA AMINOTRANSFERASE|\\bTGP\\b|\\bALT\\b)')]),
    amilase: pick(source, [numericResult('(?:AMILASE S[ÉE]RICA|\\bAMILASE\\b)')]),
    lipase: pick(source, [numericResult('(?:\\bLIPASE\\b)')])
  };

  return Object.fromEntries(Object.entries(parsed).filter(([, value]) => value));
}

function formatCellCount(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^\d{1,3}(?:\.\d{3})+$/.test(text)) return text;
  if (/^\d+$/.test(text)) return Number(text).toLocaleString('pt-BR');
  return text;
}

function parsePercent(value) {
  const normalized = String(value || '').trim().replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

const DIFFERENTIAL_OUTPUT_RULES = Object.freeze([
  { key: 'neut', label: 'S', upperReference: 70 },
  { key: 'bast', label: 'B', upperReference: 5 },
  { key: 'linf', label: 'L', upperReference: 45 },
  { key: 'mono', label: 'M', upperReference: 10 },
  { key: 'eos', label: 'E', upperReference: 5 },
  { key: 'baso', label: 'Bas', upperReference: 1 }
]);

function renderElevatedDifferential(values = {}) {
  return DIFFERENTIAL_OUTPUT_RULES.flatMap(({ key, label, upperReference }) => {
    const percent = parsePercent(values[key]);
    if (percent === null || percent <= upperReference) return [];
    return [`${label} ${values[key]}%`];
  });
}

function renderCompactLabLine(values = {}) {
  const parts = [];

  if (values.hb) parts.push(`HB: ${values.hb}`);
  if (values.ht) parts.push(`HT: ${values.ht}`);
  if (values.leuco) {
    const differential = renderElevatedDifferential(values);
    const suffix = differential.length ? ` (${differential.join(' ')})` : '';
    parts.push(`LEUCO: ${formatCellCount(values.leuco)}${suffix}`);
  }
  if (values.plaq) parts.push(`PLAQ: ${formatCellCount(values.plaq)}`);
  if (values.pcr) parts.push(`PCR: ${values.pcr}`);
  if (values.ur) parts.push(`UR: ${values.ur}`);
  if (values.cr) parts.push(`CR: ${values.cr}`);
  if (values.na) parts.push(`NA: ${values.na}`);
  if (values.k) parts.push(`K: ${values.k}`);

  return parts.length ? `- LAB: ${parts.join(' / ')}` : '';
}

function transformLaboratoryText(raw = '') {
  return renderCompactLabLine(parseLaboratoryText(raw));
}

export {
  normalizeSource,
  parseLaboratoryText,
  renderCompactLabLine,
  transformLaboratoryText
};
