import test from 'node:test';
import assert from 'node:assert/strict';
import {
  StoragePersistenceError,
  readStorageItem,
  writeStorageItem,
  removeStorageItem
} from '../assets/storage-io.js';

function throwingAdapter(method) {
  return {
    getItem() {
      if (method === 'read') throw Object.assign(new Error('blocked'), { name: 'SecurityError' });
      return null;
    },
    setItem() {
      if (method === 'write') throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' });
    },
    removeItem() {
      if (method === 'remove') throw Object.assign(new Error('blocked'), { name: 'SecurityError' });
    }
  };
}

test('storage reads preserve failures as explicit contextual errors', () => {
  assert.throws(
    () => readStorageItem(throwingAdapter('read'), 'zera-ps:test'),
    (error) => error instanceof StoragePersistenceError
      && error.operation === 'read'
      && error.key === 'zera-ps:test'
      && error.cause?.name === 'SecurityError'
  );
});

test('storage writes never fail silently', () => {
  assert.throws(
    () => writeStorageItem(throwingAdapter('write'), 'zera-ps:test', '{}'),
    (error) => error instanceof StoragePersistenceError
      && error.operation === 'write'
      && error.key === 'zera-ps:test'
      && error.cause?.name === 'QuotaExceededError'
  );
});

test('storage removals preserve failures as explicit contextual errors', () => {
  assert.throws(
    () => removeStorageItem(throwingAdapter('remove'), 'zera-ps:test'),
    (error) => error instanceof StoragePersistenceError
      && error.operation === 'remove'
      && error.key === 'zera-ps:test'
      && error.cause?.name === 'SecurityError'
  );
});

test('storage IO preserves the browser adapter contract on success', () => {
  const values = new Map();
  const adapter = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };

  writeStorageItem(adapter, 'zera-ps:test', '{"ok":true}');
  assert.equal(readStorageItem(adapter, 'zera-ps:test'), '{"ok":true}');
  removeStorageItem(adapter, 'zera-ps:test');
  assert.equal(readStorageItem(adapter, 'zera-ps:test'), null);
});
