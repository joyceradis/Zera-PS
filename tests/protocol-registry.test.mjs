import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createProtocolRegistry,
  getProtocol,
  hasProtocol,
  listProtocols,
  listProtocolOptions
} from '../src/protocol-registry.js';
import { ProtocolValidationError } from '../src/protocol-schema.js';

test('registry resolves the reference protocol by id', () => {
  assert.equal(hasProtocol('sca'), true);
  assert.equal(getProtocol('sca').id, 'sca');
  assert.equal(getProtocol('inexistente'), null);
});

test('registry currently exposes only the SCA reference scenario', () => {
  assert.deepEqual(listProtocols().map((protocol) => protocol.id), ['sca']);
  assert.deepEqual(listProtocolOptions(), [{ id: 'sca', label: 'DOR TORÁCICA / SUSPEITA DE SCA', version: '2.0.0' }]);
});

test('registry refuses invalid protocol definitions at registration time', () => {
  assert.throws(
    () => createProtocolRegistry([{ id: 'quebrado' }]),
    (error) => error instanceof ProtocolValidationError
  );
});

test('registry refuses duplicated protocol ids', () => {
  const valid = {
    id: 'fixture',
    version: '1.0.0',
    label: 'FIXTURE',
    stages: ['initial_assessment'],
    fields: [{ id: 'flag', type: 'boolean', label: 'Marcador' }],
    sections: [{ id: 'main', stages: ['initial_assessment'], fields: ['flag'] }]
  };
  const registry = createProtocolRegistry([valid]);
  assert.throws(() => registry.register(valid), RangeError);
});
