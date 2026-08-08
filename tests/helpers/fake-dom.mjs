class FakeElement {
  constructor(tagName) {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.listeners = new Map();
    this.className = '';
    this.id = '';
    this.hidden = false;
    this.value = '';
    this.checked = false;
    this.textContent = '';
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  replaceChildren(...nodes) {
    this.children.forEach((child) => { child.parentNode = null; });
    this.children = [];
    nodes.forEach((node) => this.appendChild(node));
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }

  dispatchEvent(event) {
    (this.listeners.get(event.type) || []).forEach((handler) => handler(event));
    return true;
  }

  get classList() {
    return {
      add: (name) => { this.className = [...new Set([...this.className.split(' ').filter(Boolean), name])].join(' '); },
      contains: (name) => this.className.split(' ').includes(name)
    };
  }

  descendants() {
    return this.children.flatMap((child) => [child, ...child.descendants()]);
  }
}

function createDocument() {
  return { createElement: (tag) => new FakeElement(tag) };
}

function fireInput(node) {
  node.dispatchEvent({ type: 'input', target: node });
}

function fireClick(node) {
  node.dispatchEvent({ type: 'click', target: node });
}

export { FakeElement, createDocument, fireInput, fireClick };
