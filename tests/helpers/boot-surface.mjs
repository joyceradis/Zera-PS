// Boot da superfície real: carrega o `app.html` verdadeiro, instala os globais mínimos e
// importa o entrypoint real (`app.js` → `src/app.js` → todas as camadas), na mesma ordem que
// o navegador. É o ponto onde o harness encosta no produto.
//
// Qualquer API fora do subconjunto suportado LANÇA (ver mini-dom.mjs). Se um boot falhar aqui,
// a resposta correta é estender o harness conscientemente — nunca afrouxá-lo.
//
// LIMITE DE INSTÂNCIA, e é importante: os módulos guardam estado no escopo do módulo, e o
// registro de módulos do Node é por processo. Um único boot por ARQUIVO de teste, portanto —
// `node --test` isola arquivos em processos distintos. Isso não é uma limitação incômoda: um
// plantão real também é um carregamento só, com vários pacientes em sequência sobre o mesmo
// estado. Os cenários devem ser escritos nessa ordem, deliberadamente.

import { readFileSync } from 'node:fs';
import { MiniDocument, MiniEvent, createMemoryStorage } from './mini-dom.mjs';

const APP_HTML = readFileSync(new URL('../../app.html', import.meta.url), 'utf8');
const flush = () => new Promise((resolve) => queueMicrotask(() => queueMicrotask(resolve)));

let booted = false;

/**
 * @param {object} [options]
 * @param {Record<string,unknown>} [options.seed] estado local pré-existente, para simular um
 *   recarregamento com dado já salvo. É a única forma de exercitar recuperação num harness que
 *   admite um boot por processo.
 */
async function bootApp({ seed } = {}) {
  if (booted) throw new Error('bootApp() já foi chamado neste processo; use um arquivo de teste por boot.');
  booted = true;

  const document = new MiniDocument(APP_HTML);
  const storage = createMemoryStorage();
  for (const [key, value] of Object.entries(seed || {})) {
    storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
  const timers = [];
  const windowListeners = new Map();

  const win = {
    document,
    localStorage: storage,
    confirmResponse: true,
    confirmCalls: [],
    confirm(message) { this.confirmCalls.push(message); return this.confirmResponse; },
    alert(message) { this.confirmCalls.push(`ALERT:${message}`); },
    setTimeout(fn) { timers.push(fn); return timers.length; },
    clearTimeout() {},
    addEventListener(type, handler) {
      if (!windowListeners.has(type)) windowListeners.set(type, []);
      windowListeners.get(type).push(handler);
    },
    removeEventListener() {},
    dispatchEvent(event) {
      for (const handler of [...(windowListeners.get(event.type) || [])]) handler(event);
      return true;
    }
  };

  globalThis.document = document;
  globalThis.localStorage = storage;
  globalThis.Event = MiniEvent;
  globalThis.CustomEvent = class extends MiniEvent {};
  globalThis.window = win;
  // O código chama `window.confirm(...)` em um ponto e `confirm(...)` global em outro. Os dois
  // funcionam no navegador; o harness precisa expor ambos, apontando para o mesmo registro.
  globalThis.confirm = (message) => win.confirm(message);
  globalThis.alert = (message) => win.alert(message);
  // `navigator` é somente-leitura no Node; exige defineProperty.
  Object.defineProperty(globalThis, 'navigator', {
    value: { clipboard: { writeText: async () => {} }, serviceWorker: { register: async () => ({}) } },
    configurable: true, writable: true
  });

  await import('../../app.js');                                   // entrypoint real
  document.dispatchEvent(new MiniEvent('DOMContentLoaded'));
  await flush();

  const byId = (id) => document.getElementById(id);
  const require = (id) => {
    const node = byId(id);
    if (!node) throw new Error(`interação impossível: #${id} não existe no documento`);
    return node;
  };

  return {
    document, storage, window: win, byId,

    /** Clique real, com bolha. */
    click: (id) => require(id).dispatchEvent(new MiniEvent('click', { bubbles: true })),

    /** Digitação real: escreve e propaga `input`, como o navegador. */
    type: (id, value) => {
      const node = require(id);
      node.value = value;
      node.dispatchEvent(new MiniEvent('input', { bubbles: true }));
    },

    /** Alcançável = nem o nó nem nenhum ancestral está oculto. */
    isReachable: (id) => {
      let node = byId(id);
      if (!node) return false;
      while (node && node.nodeType === 1) {
        if (node.hidden) return false;
        node = node.parentNode;
      }
      return true;
    },

    /** Quantos handlers de um tipo estão registrados num controle. */
    listenerCount: (id, type = 'click') => require(id).listenerCount(type),

    /** Resposta do próximo confirm(), e registro do que foi perguntado. */
    answerConfirm: (value) => { win.confirmResponse = value; },
    confirmCalls: () => win.confirmCalls,

    /**
     * Simula máquina de plantão sem área de transferência utilizável: `navigator.clipboard`
     * indisponível (contexto não seguro, que é o caso de servir por HTTP na rede do hospital)
     * e `execCommand('copy')` devolvendo false.
     */
    breakClipboard: () => {
      globalThis.navigator.clipboard = {
        writeText: async () => { throw new Error('NotAllowedError: contexto não seguro'); }
      };
      document.execCommandResult = false;
    },
    clipboardFallbackCalls: () => document.execCommandCalls || 0,

    /** Faz a próxima escrita local falhar, como cota estourada em máquina de plantão. */
    breakStorage: (broken = true) => { storage.failOnWrite = broken; },
    storageKeys: () => storage.keys(),

    runTimers: () => { for (const fn of timers.splice(0)) fn(); },
    flush
  };
}

export { bootApp, flush, APP_HTML };
