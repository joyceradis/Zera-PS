// DOM mínimo para harness de interação — sem dependências.
//
// Motivo de existir: todos os defeitos que a Founder encontrou usando o produto — perda de
// dado ao atualizar, contaminação entre pacientes, controles inalcançáveis, dois handlers no
// mesmo botão — são de FIAÇÃO entre módulo e documento. A suíte cobre motores puros e não
// enxerga nada disso. Faltava um harness que carregasse o `app.html` real, rodasse as camadas
// que mutam o DOM e observasse a superfície resultante.
//
// PRINCÍPIO DE DESENHO, e o mais importante deste arquivo:
//
//     API não implementada LANÇA. Nunca vira no-op silencioso.
//
// Um shim que devolve `null` de um `closest()` não implementado faz o teste passar pelo motivo
// errado — que é exatamente a classe de falsa segurança que esta auditoria vem combatendo.
// Aqui, código que use algo fora do subconjunto suportado quebra alto, e o harness precisa ser
// estendido conscientemente.
//
// Escopo honesto: isto reproduz árvore, seletores, eventos e propriedades. NÃO reproduz
// layout, CSS, foco real, viewport, service worker nem PWA/offline. Um teste escrito aqui não
// autoriza nenhuma afirmação sobre aparência, acessibilidade visual ou comportamento offline.

const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr']);

const unsupported = (what) => {
  throw new Error(
    `mini-dom: "${what}" não é suportado. Implemente-o conscientemente em tests/helpers/mini-dom.mjs. ` +
    'Este harness lança em vez de devolver silêncio, para não produzir teste verde pelo motivo errado.'
  );
};

// ── Parser ───────────────────────────────────────────────────────────────────

function parseAttributes(raw) {
  const attributes = new Map();
  const pattern = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  for (const match of raw.matchAll(pattern)) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
}

function parseHtml(html, ownerDocument) {
  const root = new MiniElement('#fragment', ownerDocument);
  const stack = [root];
  const pattern = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<!\w+[^>]*>|<\/([\w-]+)\s*>|<([\w-]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let cursor = 0;

  const pushText = (text) => {
    if (!text) return;
    const node = new MiniText(text, ownerDocument);
    node.parentNode = stack.at(-1);
    stack.at(-1).childNodes.push(node);
  };

  for (const match of html.matchAll(pattern)) {
    pushText(html.slice(cursor, match.index));
    cursor = match.index + match[0].length;
    const [token, closing, opening, rawAttributes] = match;

    if (closing) {
      for (let depth = stack.length - 1; depth > 0; depth -= 1) {
        if (stack[depth].tagName === closing.toUpperCase()) { stack.length = depth; break; }
      }
      continue;
    }
    if (!opening) continue; // comentário, doctype, CDATA

    const element = new MiniElement(opening, ownerDocument);
    element.attributes = parseAttributes(rawAttributes || '');
    stack.at(-1).appendChild(element);
    const selfClosing = /\/\s*$/.test(rawAttributes || '') || VOID_ELEMENTS.has(opening.toLowerCase());
    if (!selfClosing) stack.push(element);
  }
  pushText(html.slice(cursor));
  return root;
}

// ── Seletores ────────────────────────────────────────────────────────────────

function parseCompound(token) {
  const parts = { tag: null, id: null, classes: [], attributes: [], checked: false, scope: false };
  const pattern = /(\[[^\]]+\])|(:[\w-]+)|(\.[\w-]+)|(#[\w-]+)|([\w-]+|\*)/g;
  for (const match of token.matchAll(pattern)) {
    const [, attribute, pseudo, klass, id, tag] = match;
    if (attribute) {
      const parsed = /^\[([\w-]+)(?:=["']?([^\]"']*)["']?)?\]$/.exec(attribute);
      if (!parsed) unsupported(`seletor de atributo "${attribute}"`);
      parts.attributes.push([parsed[1], parsed[2] ?? null]);
    } else if (pseudo) {
      if (pseudo === ':checked') parts.checked = true;
      else if (pseudo === ':scope') parts.scope = true;
      else unsupported(`pseudo-classe "${pseudo}"`);
    } else if (klass) parts.classes.push(klass.slice(1));
    else if (id) parts.id = id.slice(1);
    else if (tag && tag !== '*') parts.tag = tag.toUpperCase();
  }
  return parts;
}

function matchesCompound(element, parts) {
  if (parts.tag && element.tagName !== parts.tag) return false;
  if (parts.id && element.id !== parts.id) return false;
  for (const klass of parts.classes) if (!element.classList.contains(klass)) return false;
  for (const [name, value] of parts.attributes) {
    if (!element.hasAttribute(name)) return false;
    if (value !== null && element.getAttribute(name) !== value) return false;
  }
  if (parts.checked && element.checked !== true) return false;
  return true;
}

/** Um seletor: sequência de compostos separados por descendente (espaço) ou filho (>). */
function parseSelector(selector) {
  const steps = [];
  const tokens = selector.trim().split(/\s+/);
  let combinator = 'descendant';
  for (const token of tokens) {
    if (token === '>') { combinator = 'child'; continue; }
    steps.push({ combinator, parts: parseCompound(token) });
    combinator = 'descendant';
  }
  if (!steps.length) unsupported(`seletor vazio em "${selector}"`);
  return steps;
}

function collectMatches(scope, selector) {
  const results = [];
  for (const single of selector.split(',')) {
    const steps = parseSelector(single);
    const first = steps[0];
    const candidates = first.parts.scope ? [scope] : scope.descendants();
    let current = first.parts.scope ? candidates : candidates.filter((node) => matchesCompound(node, first.parts));
    for (const step of steps.slice(1)) {
      const next = [];
      for (const node of current) {
        const pool = step.combinator === 'child' ? node.children : node.descendants();
        for (const candidate of pool) {
          if (matchesCompound(candidate, step.parts) && !next.includes(candidate)) next.push(candidate);
        }
      }
      current = next;
    }
    for (const node of current) if (node !== scope && !results.includes(node)) results.push(node);
  }
  return results;
}

// ── Nós ──────────────────────────────────────────────────────────────────────

class MiniText {
  constructor(data, ownerDocument) {
    this.nodeType = 3;
    this.data = data;
    this.parentNode = null;
    this.ownerDocument = ownerDocument;
  }
  get textContent() { return this.data; }
  descendants() { return []; }
}

class MiniElement {
  constructor(tagName, ownerDocument) {
    this.nodeType = 1;
    this.tagName = String(tagName).toUpperCase();
    this.ownerDocument = ownerDocument;
    this.attributes = new Map();
    this.childNodes = [];
    this.parentNode = null;
    this.listeners = new Map();
    this.style = {};
    this._value = undefined;
    this._checked = undefined;
    this.selectedIndex = 0;
    this.open = false;
  }

  // — identidade e atributos —
  get id() { return this.getAttribute('id') || ''; }
  set id(value) { this.setAttribute('id', value); }
  get className() { return this.getAttribute('class') || ''; }
  set className(value) { this.setAttribute('class', value); }
  get hidden() { return this.hasAttribute('hidden'); }
  set hidden(value) { value ? this.setAttribute('hidden', '') : this.attributes.delete('hidden'); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }

  get classList() {
    const list = () => this.className.split(/\s+/).filter(Boolean);
    const write = (values) => { this.className = [...new Set(values)].join(' '); };
    return {
      add: (...names) => write([...list(), ...names]),
      remove: (...names) => write(list().filter((name) => !names.includes(name))),
      contains: (name) => list().includes(name),
      toggle: (name, force) => {
        const has = list().includes(name);
        const next = force === undefined ? !has : force;
        next ? write([...list(), name]) : write(list().filter((item) => item !== name));
        return next;
      }
    };
  }

  get dataset() {
    const element = this;
    return new Proxy({}, {
      get(_, key) {
        const attribute = `data-${String(key).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
        return element.hasAttribute(attribute) ? element.getAttribute(attribute) : undefined;
      },
      set(_, key, value) {
        const attribute = `data-${String(key).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
        element.setAttribute(attribute, value);
        return true;
      },
      has(_, key) {
        return element.hasAttribute(`data-${String(key).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`);
      }
    });
  }

  // — valor de controle —
  get value() {
    if (this._value !== undefined) return this._value;
    if (this.tagName === 'TEXTAREA') return this.textContent;
    return this.getAttribute('value') || '';
  }
  set value(next) { this._value = String(next ?? ''); }
  get defaultValue() {
    return this.tagName === 'TEXTAREA' ? this.textContent : (this.getAttribute('value') || '');
  }
  get checked() {
    return this._checked !== undefined ? this._checked : this.hasAttribute('checked');
  }
  set checked(next) { this._checked = Boolean(next); }

  // — árvore —
  get children() { return this.childNodes.filter((node) => node.nodeType === 1); }
  get firstChild() { return this.childNodes[0] || null; }
  descendants() { return this.children.flatMap((child) => [child, ...child.descendants()]); }

  appendChild(child) {
    child.parentNode?.removeChild(child);
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }
  insertBefore(node, reference) {
    const index = reference ? this.childNodes.indexOf(reference) : this.childNodes.length;
    if (index < 0) unsupported('insertBefore com referência que não é filha');
    node.parentNode?.removeChild(node);
    node.parentNode = this;
    this.childNodes.splice(index, 0, node);
    return node;
  }
  removeChild(child) {
    const index = this.childNodes.indexOf(child);
    if (index >= 0) { this.childNodes.splice(index, 1); child.parentNode = null; }
    return child;
  }
  remove() { this.parentNode?.removeChild(this); }
  replaceWith(node) {
    if (!this.parentNode) return;
    this.parentNode.insertBefore(node, this);
    this.remove();
  }
  replaceChildren(...nodes) {
    for (const child of [...this.childNodes]) this.removeChild(child);
    for (const node of nodes) this.appendChild(node);
  }
  append(...nodes) {
    for (const node of nodes) {
      this.appendChild(typeof node === 'string' ? new MiniText(node, this.ownerDocument) : node);
    }
  }
  prepend(...nodes) {
    for (const node of [...nodes].reverse()) {
      const child = typeof node === 'string' ? new MiniText(node, this.ownerDocument) : node;
      this.insertBefore(child, this.childNodes[0] || null);
    }
  }
  before(...nodes) {
    if (!this.parentNode) return;
    for (const node of nodes) {
      this.parentNode.insertBefore(typeof node === 'string' ? new MiniText(node, this.ownerDocument) : node, this);
    }
  }
  after(...nodes) {
    if (!this.parentNode) return;
    let reference = this.nextElementSibling();
    for (const node of nodes) {
      this.parentNode.insertBefore(typeof node === 'string' ? new MiniText(node, this.ownerDocument) : node, reference);
    }
  }
  insertAdjacentElement(position, node) {
    if (position === 'afterend') this.parentNode.insertBefore(node, this.nextElementSibling());
    else if (position === 'beforebegin') this.parentNode.insertBefore(node, this);
    else unsupported(`insertAdjacentElement("${position}")`);
    return node;
  }
  nextElementSibling() {
    const siblings = this.parentNode?.children || [];
    return siblings[siblings.indexOf(this) + 1] || null;
  }
  cloneNode(deep) {
    const copy = new MiniElement(this.tagName, this.ownerDocument);
    copy.attributes = new Map(this.attributes);
    copy._value = this._value;
    copy._checked = this._checked;
    if (deep) for (const child of this.childNodes) {
      copy.appendChild(child.nodeType === 1 ? child.cloneNode(true) : new MiniText(child.data, this.ownerDocument));
    }
    return copy; // listeners deliberadamente NÃO são copiados, como no DOM real
  }

  // — consulta —
  matches(selector) {
    return selector.split(',').some((single) => {
      const steps = parseSelector(single);
      if (steps.length > 1) unsupported(`matches() com combinador: "${single}"`);
      return matchesCompound(this, steps[0].parts);
    });
  }
  closest(selector) {
    let node = this;
    while (node && node.nodeType === 1) {
      if (node.matches(selector)) return node;
      node = node.parentNode;
    }
    return null;
  }
  querySelector(selector) { return collectMatches(this, selector)[0] || null; }
  querySelectorAll(selector) { return collectMatches(this, selector); }

  // — texto e html —
  get textContent() {
    return this.childNodes.map((node) => node.textContent).join('');
  }
  set textContent(value) {
    this.childNodes = [];
    if (value !== '' && value !== null && value !== undefined) {
      this.appendChild(new MiniText(String(value), this.ownerDocument));
    }
  }
  set innerHTML(html) {
    this.childNodes = [];
    const fragment = parseHtml(String(html), this.ownerDocument);
    for (const child of [...fragment.childNodes]) this.appendChild(child);
  }
  get innerHTML() { unsupported('leitura de innerHTML'); }

  // — eventos —
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }
  removeEventListener(type, handler) {
    const handlers = this.listeners.get(type) || [];
    const index = handlers.indexOf(handler);
    if (index >= 0) handlers.splice(index, 1);
  }
  listenerCount(type) { return (this.listeners.get(type) || []).length; }
  dispatchEvent(event) {
    if (!event.target) event.target = this;
    let node = this;
    while (node) {
      for (const handler of [...(node.listeners?.get(event.type) || [])]) {
        if (event.__stopped) break;
        handler.call(node, event);
      }
      if (!event.bubbles || event.__stopped) break;
      node = node.parentNode;
    }
    return !event.defaultPrevented;
  }

  // — comportamentos de controle —
  reset() {
    if (this.tagName !== 'FORM') unsupported('reset() fora de <form>');
    for (const node of this.descendants()) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName)) {
        node._value = undefined;
        node._checked = undefined;
        if (node.tagName === 'TEXTAREA') node._value = '';
      }
    }
    this.dispatchEvent(new MiniEvent('reset', { bubbles: true }));
  }
  showModal() { if (this.tagName !== 'DIALOG') unsupported('showModal fora de <dialog>'); this.open = true; }
  close() { this.open = false; }
  scrollIntoView() { /* sem layout: intencionalmente inerte, e declarado como tal */ }
  focus() { this.ownerDocument.activeElement = this; }
}

class MiniEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = Boolean(options.bubbles);
    this.detail = options.detail;
    this.target = null;
    this.defaultPrevented = false;
    this.__stopped = false;
  }
  preventDefault() { this.defaultPrevented = true; }
  stopPropagation() { this.__stopped = true; }
}

// ── Document ─────────────────────────────────────────────────────────────────

class MiniDocument {
  constructor(html) {
    const fragment = parseHtml(html, this);
    this.documentElement = fragment.querySelector('html') || fragment;
    this.head = fragment.querySelector('head') || new MiniElement('head', this);
    this.body = fragment.querySelector('body') || fragment;
    this.listeners = new Map();
    this.activeElement = null;
    this.__root = fragment;
  }
  createElement(tagName) { return new MiniElement(tagName, this); }
  createTextNode(data) { return new MiniText(data, this); }
  getElementById(id) { return this.__root.descendants().find((node) => node.id === id) || null; }
  querySelector(selector) { return collectMatches(this.__root, selector)[0] || null; }
  querySelectorAll(selector) { return collectMatches(this.__root, selector); }
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }
  dispatchEvent(event) {
    if (!event.target) event.target = this;
    for (const handler of [...(this.listeners.get(event.type) || [])]) handler.call(this, event);
    return !event.defaultPrevented;
  }
}

/** Armazenamento local em memória, com falha injetável. */
function createMemoryStorage() {
  const map = new Map();
  return {
    failOnWrite: false,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem(key, value) {
      if (this.failOnWrite) throw new Error('QuotaExceededError simulado');
      map.set(key, String(value));
    },
    removeItem: (key) => { map.delete(key); },
    clear: () => map.clear(),
    get size() { return map.size; }
  };
}

export { MiniDocument, MiniElement, MiniEvent, MiniText, createMemoryStorage, parseHtml };
