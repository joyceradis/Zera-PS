import { createClinicalField } from './clinical-state.js';

const STORAGE_KEYS = Object.freeze({
  autosave: 'zera-ps:autosave:v2',
  drafts: 'zera-ps:drafts:v2',
  legacyAutosave: 'zera-ps:autosave:v1',
  legacyDrafts: 'zera-ps:drafts:v1'
});

const HPP_KEYS = ['comorbidades', 'muc', 'alergias', 'habitos', 'cirurgias'];
const EXAM_KEYS = ['estadoGeral', 'acv', 'ar', 'abd', 'ext', 'neuro'];

function emptyClinicalState() {
  return {
    hpp: Object.fromEntries(HPP_KEYS.map((key) => [key, createClinicalField()])),
    physicalExam: {
      template: null,
      fields: Object.fromEntries(EXAM_KEYS.map((key) => [key, createClinicalField()]))
    }
  };
}

function migrateLegacyAutosave(legacy = {}) {
  return {
    schemaVersion: 2,
    migratedFrom: 1,
    form: {
      qp: legacy.qp || '',
      hda: legacy.hda || '',
      comorbidades: legacy.comorbidades || '',
      muc: legacy.muc || '',
      alergias: legacy.alergias || '',
      habitos: legacy.habitos || '',
      cirurgias: legacy.cirurgias || '',
      estadoGeral: legacy['estado-geral'] || '',
      acv: legacy.acv || '',
      ar: legacy.ar || '',
      abd: legacy.abd || '',
      ext: legacy.ext || '',
      neuro: legacy.neuro || '',
      laboratoriais: legacy.laboratoriais || '',
      imagem: legacy.imagem || '',
      hipoteses: legacy.hipoteses || '',
      conduta: legacy.conduta || '',
      includeEmTempo: Boolean(legacy['include-em-tempo']),
      emTempo: legacy['em-tempo'] || ''
    },
    clinicalState: emptyClinicalState(),
    output: legacy.output || ''
  };
}

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function createStorage(adapter = globalThis.localStorage) {
  const api = {
    loadAutosave() {
      const current = safeParse(adapter?.getItem(STORAGE_KEYS.autosave), null);
      if (current) return current;
      const legacy = safeParse(adapter?.getItem(STORAGE_KEYS.legacyAutosave), null);
      if (!legacy) return null;
      const migrated = migrateLegacyAutosave(legacy);
      api.saveAutosave(migrated);
      return migrated;
    },
    saveAutosave(value) {
      adapter?.setItem(STORAGE_KEYS.autosave, JSON.stringify(value));
    },
    clearAutosave() {
      adapter?.removeItem(STORAGE_KEYS.autosave);
    },
    loadDrafts() {
      return safeParse(adapter?.getItem(STORAGE_KEYS.drafts), []);
    },
    saveDrafts(drafts) {
      adapter?.setItem(STORAGE_KEYS.drafts, JSON.stringify(drafts));
    }
  };
  return api;
}

export { STORAGE_KEYS, emptyClinicalState, migrateLegacyAutosave, createStorage };
