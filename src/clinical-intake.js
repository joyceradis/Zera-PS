const TRIGGER_GROUPS = Object.freeze([
  { id: 'headache', label: 'Pontos de atenção — cefaleia', keywords: ['cefaleia', 'dor de cabeca', 'nuca', 'enxaqueca'], flags: ['Início súbito / pior dor', 'Febre / rigidez de nuca', 'Déficit focal'] },
  { id: 'respiratory', label: 'Pontos de atenção — respiratório', keywords: ['dispneia', 'falta de ar', 'tosse', 'cansaco'], flags: ['Uso de musculatura acessória', 'SatO2 < 92%', 'Hemoptise / dor pleurítica'] },
  { id: 'abdominal', label: 'Pontos de atenção — abdominal', keywords: ['dor abdominal', 'vomito', 'diarreia', 'colica'], flags: ['Descompressão dolorosa +', 'Parada de flatos / fezes', 'Vômitos incoercíveis'] },
  { id: 'febrile_urinary', label: 'Pontos de atenção — febril / urinário', keywords: ['febre', 'disuria', 'dor ao urinar', 'giordano'], flags: ['Giordano +', 'Rebaixamento de consciência', 'PAS < 90 mmHg'] },
  { id: 'trauma', label: 'Pontos de atenção — trauma', keywords: ['queda', 'trauma', 'pancada', 'fratura'], flags: ['Deformidade visível', 'Perda de consciência', 'Uso de anticoagulante'] }
]);

function foldText(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function matchTriggerGroups(text) {
  const normalized = foldText(text);
  if (!normalized.trim()) return [];
  return TRIGGER_GROUPS.filter((group) => group.keywords.some((keyword) => normalized.includes(foldText(keyword))));
}

function composeHdaFromQp(qp, selectedFlags = []) {
  const base = String(qp ?? '').trim();
  if (!base) return '';
  const flags = selectedFlags.map((item) => String(item ?? '').trim()).filter(Boolean);
  if (!flags.length) return base;
  return `${base}${/[.!?]$/.test(base) ? ' ' : '. '}SINAIS DE ALERTA PRESENTES: ${flags.join('; ')}.`;
}

export { TRIGGER_GROUPS, foldText, matchTriggerGroups, composeHdaFromQp };
