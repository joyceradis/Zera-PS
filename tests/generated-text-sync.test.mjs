import test from 'node:test';
import assert from 'node:assert/strict';
import { synchronizeGeneratedText } from '../src/generated-text-sync.js';

test('generated text replaces an untouched previous generation without confirmation', () => {
  const result = synchronizeGeneratedText({
    currentText: 'VERSÃO GERADA 1',
    previousGeneratedText: 'VERSÃO GERADA 1',
    nextGeneratedText: 'VERSÃO GERADA 2'
  });
  assert.deepEqual(result, { text: 'VERSÃO GERADA 2', requiresConfirmation: false });
});

test('manual edits are preserved and require explicit replacement confirmation', () => {
  const result = synchronizeGeneratedText({
    currentText: 'VERSÃO GERADA 1\nOBSERVAÇÃO MANUAL DA MÉDICA',
    previousGeneratedText: 'VERSÃO GERADA 1',
    nextGeneratedText: 'VERSÃO GERADA 2'
  });
  assert.equal(result.text, 'VERSÃO GERADA 1\nOBSERVAÇÃO MANUAL DA MÉDICA');
  assert.equal(result.requiresConfirmation, true);
});

test('legacy text with unknown generation provenance is never overwritten silently', () => {
  const result = synchronizeGeneratedText({
    currentText: 'TEXTO RECUPERADO',
    previousGeneratedText: '',
    nextGeneratedText: 'NOVA GERAÇÃO'
  });
  assert.equal(result.text, 'TEXTO RECUPERADO');
  assert.equal(result.requiresConfirmation, true);
});

test('empty output accepts the first generation without confirmation', () => {
  const result = synchronizeGeneratedText({ currentText: '', previousGeneratedText: '', nextGeneratedText: 'GERADO' });
  assert.deepEqual(result, { text: 'GERADO', requiresConfirmation: false });
});
