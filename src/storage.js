export * from '../assets/storage.js';
import { readStorageItem, writeStorageItem, removeStorageItem } from '../assets/storage-io.js';

const TEMPORAL_STORAGE_KEYS = Object.freeze({
  activeEncounter: 'zera-ps:encounter:v3'
});

function safeParse(raw, fallback = null) {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function createEncounterStorage(adapter = globalThis.localStorage) {
  return {
    loadActiveEncounter() {
      return safeParse(readStorageItem(adapter, TEMPORAL_STORAGE_KEYS.activeEncounter), null);
    },
    saveActiveEncounter(encounter) {
      writeStorageItem(adapter, TEMPORAL_STORAGE_KEYS.activeEncounter, JSON.stringify(encounter));
    },
    clearActiveEncounter() {
      removeStorageItem(adapter, TEMPORAL_STORAGE_KEYS.activeEncounter);
    }
  };
}

export { TEMPORAL_STORAGE_KEYS, createEncounterStorage };
