import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS, createStorage, migrateLegacyAutosave } from '../assets/storage.js';

class MemoryStorage {
  constructor(seed = {}) { this.map = new Map(Object.entries(seed)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

test('storage uses versioned v2 keys', () => {
  assert.equal(STORAGE_KEYS.autosave, 'zera-ps:autosave:v2');
  assert.equal(STORAGE_KEYS.drafts, 'zera-ps:drafts:v2');
});

test('legacy v1 autosave migrates without fabricating clinical state', () => {
  const legacy = { qp: 'DOR', alergias: '', output: 'texto antigo' };
  const migrated = migrateLegacyAutosave(legacy);
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.form.qp, 'DOR');
  assert.equal(migrated.clinicalState.hpp.alergias.state, 'not_informed');
  assert.equal(migrated.clinicalState.hpp.alergias.confirmed, false);
});

test('storage adapter saves and loads JSON state', () => {
  const memory = new MemoryStorage();
  const storage = createStorage(memory);
  storage.saveAutosave({ schemaVersion: 2, form: { qp: 'DOR' } });
  assert.deepEqual(storage.loadAutosave(), { schemaVersion: 2, form: { qp: 'DOR' } });
});
