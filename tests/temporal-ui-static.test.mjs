import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SCA_PROTOCOL } from '../protocols/sca.js';

const html = await readFile('app.html', 'utf8');

test('evolution screen exposes only generic workflow anchors', () => {
  for (const id of ['workflow-scenario', 'workflow-stage', 'workflow-context', 'workflow-protocol-fields', 'workflow-pending', 'reassess-encounter']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test('application shell no longer hard-codes scenario specific fields or tools', () => {
  const protocolOwnedIds = SCA_PROTOCOL.fields
    .filter((field) => (field.source || 'protocol') === 'protocol')
    .map((field) => field.domId);
  for (const domId of protocolOwnedIds) {
    assert.doesNotMatch(html, new RegExp(`id="${domId}"`), `app.html não deve declarar o campo de cenário ${domId}`);
  }
  assert.doesNotMatch(html, /heart-tool-status|sca-details|sca-troponin-result-fields/);
});

test('scenario options are resolved from the registry instead of static markup', () => {
  assert.match(html, /<option value="">SEM WORKFLOW ESPECÍFICO<\/option>/);
  assert.doesNotMatch(html, /<option value="sca"/);
});

test('fields owned by the evolution form remain in the application shell', () => {
  for (const field of SCA_PROTOCOL.fields.filter((item) => item.source === 'evolution_form')) {
    assert.match(html, new RegExp(`id="${field.domId}"`), `campo documental ${field.domId} deve permanecer no formulário`);
  }
});

test('template cards are identified as documentation scripts rather than protocol scenarios', () => {
  assert.match(html, /ROTEIROS DE DOCUMENTAÇÃO/);
  assert.match(html, /Comece por um roteiro/);
  assert.doesNotMatch(html, /<h2>Comece por um cenário<\/h2>/);
});
