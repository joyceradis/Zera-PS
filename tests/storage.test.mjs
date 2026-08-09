import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS, createStorage, migrateLegacyAutosave, migrateLegacyDrafts } from '../assets/storage.js';

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

test('legacy drafts migrate to v2 snapshots without confirming old clinical values', () => {
  const drafts = migrateLegacyDrafts([{ id: '1', title: 'DOR', createdAt: '2026-08-01T00:00:00.000Z', state: { qp: 'DOR', alergias: 'NEGA' } }]);
  assert.equal(drafts[0].snapshot.schemaVersion, 2);
  assert.equal(drafts[0].snapshot.form.alergias, 'NEGA');
  assert.equal(drafts[0].snapshot.clinicalState.hpp.alergias.confirmed, false);
});

test('storage adapter saves and loads JSON state', () => {
  const memory = new MemoryStorage();
  const storage = createStorage(memory);
  storage.saveAutosave({ schemaVersion: 2, form: { qp: 'DOR' } });
  assert.deepEqual(storage.loadAutosave(), { schemaVersion: 2, form: { qp: 'DOR' } });
});

test('autosave preserves explicit template selection without deriving it from QP', () => {
  const memory = new MemoryStorage();
  const storage = createStorage(memory);
  const snapshot = {
    schemaVersion: 2,
    form: { qp: 'CONGESTÃO NASAL E DOR FACIAL' },
    templateSelection: { templateId: 'rinossinusite', protocolId: null, selectedAt: '2026-08-09T00:00:00.000Z' }
  };
  storage.saveAutosave(snapshot);
  assert.deepEqual(storage.loadAutosave().templateSelection, snapshot.templateSelection);

  storage.saveAutosave({ schemaVersion: 2, form: { qp: 'DOR TORÁCICA' } });
  assert.equal('templateSelection' in storage.loadAutosave(), false);
});

test('storage adapter lazily migrates legacy drafts', () => {
  const memory = new MemoryStorage({
    [STORAGE_KEYS.legacyDrafts]: JSON.stringify([{ id: '1', title: 'DOR', state: { qp: 'DOR', comorbidades: 'NEGA' } }])
  });
  const storage = createStorage(memory);
  const drafts = storage.loadDrafts();
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].snapshot.form.comorbidades, 'NEGA');
  assert.equal(drafts[0].snapshot.clinicalState.hpp.comorbidades.confirmed, false);
  assert.notEqual(memory.getItem(STORAGE_KEYS.drafts), null);
});
