function parseInstant(value) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function normalizeEncounterRecord(value) {
  if (!value || typeof value !== 'object') return null;
  const startedAtMs = parseInstant(value.startedAt);
  if (startedAtMs === null) return null;
  const finishedAtMs = parseInstant(value.finishedAt);
  return {
    id: String(value.id || ''),
    startedAt: new Date(startedAtMs).toISOString(),
    startedAtMs,
    finishedAt: finishedAtMs === null ? null : new Date(finishedAtMs).toISOString(),
    finishedAtMs
  };
}

function extractEncounterRecords(value) {
  const candidates = Array.isArray(value)
    ? value
    : Array.isArray(value?.encounters)
      ? value.encounters
      : [];
  return candidates.map(normalizeEncounterRecord).filter(Boolean);
}

function summarizeProductivity(records = [], options = {}) {
  const normalized = records.map(normalizeEncounterRecord).filter(Boolean);
  const rangeStartMs = parseInstant(options.rangeStart);
  const rangeEndMs = parseInstant(options.rangeEnd);
  const hasExplicitRange = rangeStartMs !== null && rangeEndMs !== null;

  const inRange = normalized.filter((record) => {
    if (!hasExplicitRange) return true;
    return record.startedAtMs >= rangeStartMs && record.startedAtMs <= rangeEndMs;
  });

  let durationMs = null;
  let rangeStart = null;
  let rangeEnd = null;

  if (hasExplicitRange && rangeEndMs > rangeStartMs) {
    durationMs = rangeEndMs - rangeStartMs;
    rangeStart = new Date(rangeStartMs).toISOString();
    rangeEnd = new Date(rangeEndMs).toISOString();
  } else if (inRange.length && inRange.every((record) => record.finishedAtMs !== null)) {
    const earliest = Math.min(...inRange.map((record) => record.startedAtMs));
    const latest = Math.max(...inRange.map((record) => record.finishedAtMs));
    if (latest > earliest) {
      durationMs = latest - earliest;
      rangeStart = new Date(earliest).toISOString();
      rangeEnd = new Date(latest).toISOString();
    }
  }

  const durationHours = durationMs && durationMs > 0 ? durationMs / 3_600_000 : null;
  const rate = durationHours ? inRange.length / durationHours : null;

  return {
    totalPatients: inRange.length,
    durationHours,
    rate: Number.isFinite(rate) ? rate : null,
    rangeStart,
    rangeEnd
  };
}

function formatPatientsPerHour(summary = {}) {
  if (!Number.isFinite(summary.rate)) return '--';
  return Number(summary.rate).toFixed(1).replace('.', ',');
}

export {
  extractEncounterRecords,
  normalizeEncounterRecord,
  summarizeProductivity,
  formatPatientsPerHour
};
