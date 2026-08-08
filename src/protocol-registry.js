import { assertValidProtocol } from './protocol-schema.js';
import { SCA_PROTOCOL } from '../protocols/sca.js';

function createProtocolRegistry(protocols = []) {
  const registry = new Map();

  function register(protocol) {
    assertValidProtocol(protocol);
    if (registry.has(protocol.id)) throw new RangeError(`Protocolo já registrado: ${protocol.id}`);
    registry.set(protocol.id, protocol);
    return protocol;
  }

  protocols.forEach(register);

  return {
    register,
    has: (id) => registry.has(id),
    get: (id) => registry.get(id) || null,
    list: () => [...registry.values()],
    options: () => [...registry.values()].map(({ id, label, version }) => ({ id, label, version }))
  };
}

const protocolRegistry = createProtocolRegistry([SCA_PROTOCOL]);

const getProtocol = (id) => protocolRegistry.get(id);
const hasProtocol = (id) => protocolRegistry.has(id);
const listProtocols = () => protocolRegistry.list();
const listProtocolOptions = () => protocolRegistry.options();

export {
  createProtocolRegistry,
  protocolRegistry,
  getProtocol,
  hasProtocol,
  listProtocols,
  listProtocolOptions
};
