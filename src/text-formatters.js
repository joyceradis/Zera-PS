function formatImageReport(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().toUpperCase();
}

function formatLines(value) {
  return String(value ?? '').split(/\n+/).map((line) => line.trim()).filter(Boolean).map((line) => `- ${line.toUpperCase()}`).join('\n');
}

export { formatImageReport, formatLines };
