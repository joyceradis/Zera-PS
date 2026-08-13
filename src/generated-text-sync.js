function normalizeGeneratedText(value) {
  return String(value ?? '').trim();
}

function synchronizeGeneratedText({ currentText = '', previousGeneratedText = '', nextGeneratedText = '' } = {}) {
  const current = normalizeGeneratedText(currentText);
  const previous = normalizeGeneratedText(previousGeneratedText);
  const next = normalizeGeneratedText(nextGeneratedText);

  if (!current || current === previous || current === next) {
    return { text: nextGeneratedText, requiresConfirmation: false };
  }

  return { text: currentText, requiresConfirmation: true };
}

export { synchronizeGeneratedText };
