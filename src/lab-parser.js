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

function parseLaboratoryText(raw = '') {
  const source = normalizeSource(raw);
  if (!source) return {};

  const parsed = {
    hb: pick(source, [/(?:HEMOGLOBINA|\bHB\b)\s*(?:RESULTADO\s*)?[:=-]?\s*([0-9][0-9.,]*)/i]),
    ht: pick(source, [/(?:HEMAT[ÓO]CRITO|\bHT\b)\s*(?:RESULTADO\s*)?[:=-]?\s*([0-9][0-9.,]*)/i]),
    leuco: pick(source, [/(?:LEUC[ÓO]CITOS|LEUCOCITOS|\bLEUCO\b)\s*(?:RESULTADO\s*)?[:=-]?\s*([0-9][0-9.,]*)/i]),
    neut: pick(source, [/(?:NEUTR[ÓO]FILOS|NEUTROFILOS|SEGMENTADOS|\bSEG\b)\s*(?:RESULTADO\s*)?[:=-]?\s*([0-9][0-9.,]*)/i]),
    plaq: pick(source, [/(?:CONTAGEM DE PLAQUETAS|PLAQUETAS|\bPLAQ\b)\s*(?:RESULTADO\s*)?[:=-]?\s*([0-9][0-9.,]*)/i]),
    pcr: pick(source, [/(?:PROTE[IÍ]NA\s+["']?C["']?\s+REATIVA|\bPCR\b)\s*(?:RESULTADO\s*)?[:=-]?\s*([0-9][0-9.,]*)/i]),
    ur: pick(source, [/(?:\bUREIA\b|\bUR\b)\s*(?:RESULTADO\s*)?[:=-]?\s*([0-9][0-9.,]*)/i]),
    cr: pick(source, [/(?:\bCREATININA\b|\bCR\b)\s*(?:RESULTADO\s*)?[:=-]?\s*([0-9][0-9.,]*)/i]),
    na: pick(source, [/(?:\bS[ÓO]DIO\b)\s*(?:RESULTADO\s*)?[:=-]?\s*([0-9][0-9.,]*)/i]),
    k: pick(source, [/(?:\bPOT[ÁA]SSIO\b)\s*(?:RESULTADO\s*)?[:=-]?\s*([0-9][0-9.,]*)/i])
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

function renderCompactLabLine(values = {}) {
  const parts = [];

  if (values.hb) parts.push(`HB: ${values.hb}`);
  if (values.ht) parts.push(`HT: ${values.ht}`);
  if (values.leuco) {
    const differential = values.neut ? ` (NEUT: ${values.neut}%)` : '';
    parts.push(`LEUCO: ${formatCellCount(values.leuco)}${differential}`);
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
