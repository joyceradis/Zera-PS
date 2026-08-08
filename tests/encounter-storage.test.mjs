import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPORAL_STORAGE_KEYS, createEncounterStorage } from '../src/storage.js';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

test('temporal encounter storage uses an independent v3 key', () => {
  assert.equal(TEMPORAL_STORAGE_KEYS.activeEncounter, 'zera-ps:encounter:v3');
});

test('active encounter round-trips without changing snapshots', () => {
  const memory = new MemoryStorage();
  const storage = createEncounterStorage(memory);
  const encounter = {
    schemaVersion: 3,
    encounterId: 'enc-1',
    workflowId: 'sca',
    admissionSnapshot: { qp: 'DOR TORÁCICA', hda: 'DOR HÁ 2 HORAS' },
    reassessments: []
  };
  storage.saveActiveEncounter(encounter);
  assert.deepEqual(storage.loadActiveEncounter(), encounter);
});

test('clear active encounter does not touch legacy evolution storage keys', () => {
  const memory = new MemoryStorage();
  memory.setItem('zera-ps:autosave:v2', JSON.stringify({ keep: true }));
  const storage = createEncounterStorage(memory);
  storage.saveActiveEncounter({ encounterId: 'enc-1' });
  storage.clearActiveEncounter();
  assert.equal(storage.loadActiveEncounter(), null);
  assert.equal(JSON.parse(memory.getItem('zera-ps:autosave:v2')).keep, true);
});
