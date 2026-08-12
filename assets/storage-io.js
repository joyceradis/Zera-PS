class StoragePersistenceError extends Error {
  constructor(operation, key, cause) {
    super(`Falha de persistência local durante ${operation} em ${key}`, { cause });
    this.name = 'StoragePersistenceError';
    this.operation = operation;
    this.key = key;
    this.cause = cause;
  }
}

class StorageCorruptionError extends Error {
  constructor(key, raw, cause) {
    super(`Estado local inválido em ${key}`, { cause });
    this.name = 'StorageCorruptionError';
    this.key = key;
    this.raw = raw;
    this.cause = cause;
  }
}

function withStorageContext(operation, key, callback) {
  try {
    return callback();
  } catch (cause) {
    throw new StoragePersistenceError(operation, key, cause);
  }
}

function requireStorageAdapter(adapter) {
  if (!adapter) throw new TypeError('Storage adapter indisponível.');
  return adapter;
}

function readStorageItem(adapter, key) {
  return withStorageContext('read', key, () => requireStorageAdapter(adapter).getItem(key));
}

function writeStorageItem(adapter, key, value) {
  return withStorageContext('write', key, () => requireStorageAdapter(adapter).setItem(key, value));
}

function removeStorageItem(adapter, key) {
  return withStorageContext('remove', key, () => requireStorageAdapter(adapter).removeItem(key));
}

function parseStoredJson(raw, key, fallback = null) {
  if (raw == null || raw === '') return fallback;
  try {
    return JSON.parse(raw);
  } catch (cause) {
    throw new StorageCorruptionError(key, raw, cause);
  }
}

export {
  StoragePersistenceError,
  StorageCorruptionError,
  readStorageItem,
  writeStorageItem,
  removeStorageItem,
  parseStoredJson
};
