import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile('app.html', 'utf8');

test('evolution screen exposes scenario and temporal workflow anchors', () => {
  for (const id of ['workflow-scenario', 'workflow-stage', 'workflow-context', 'workflow-pending', 'reassess-encounter']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test('SCA contextual block contains explicit suspicion, ECG and troponin fields', () => {
  for (const id of ['sca-suspected', 'sca-ecg-status', 'sca-ecg-result', 'sca-troponin-status', 'sca-troponin-value']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test('HEART status has a dedicated interface region instead of implicit score output', () => {
  assert.match(html, /id="heart-tool-status"/);
});
