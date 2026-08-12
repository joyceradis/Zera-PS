class StoragePersistenceError extends Error {
  constructor(operation, key, cause) {
    super(`Falha de persistência local durante ${operation} em ${key}`, { cause });
    this.name = 'StoragePersistenceError';
    this.operation = operation;
    this.key = key;
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

function readStorageItem(adapter, key) {
  if (!adapter) return null;
  return withStorageContext('read', key, () => adapter.getItem(key));
}

function writeStorageItem(adapter, key, value) {
  if (!adapter) return;
  return withStorageContext('write', key, () => adapter.setItem(key, value));
}

function removeStorageItem(adapter, key) {
  if (!adapter) return;
  return withStorageContext('remove', key, () => adapter.removeItem(key));
}

export {
  StoragePersistenceError,
  readStorageItem,
  writeStorageItem,
  removeStorageItem
};
