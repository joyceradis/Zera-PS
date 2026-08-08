export * from '../assets/storage.js';

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
      return safeParse(adapter?.getItem(TEMPORAL_STORAGE_KEYS.activeEncounter), null);
    },
    saveActiveEncounter(encounter) {
      adapter?.setItem(TEMPORAL_STORAGE_KEYS.activeEncounter, JSON.stringify(encounter));
    },
    clearActiveEncounter() {
      adapter?.removeItem(TEMPORAL_STORAGE_KEYS.activeEncounter);
    }
  };
}

export { TEMPORAL_STORAGE_KEYS, createEncounterStorage };
