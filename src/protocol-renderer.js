import {
  FIELD_TYPES,
  FIELD_WIDTHS,
  SECTION_LAYOUTS,
  fieldDomId,
  toolApplyDomId,
  toolStatusDomId
} from './protocol-schema.js';
import {
  buildRenderPlan,
  defaultContext,
  defaultFieldValue,
  getRenderableFields,
  isNumericField
} from './protocol-engine.js';

function createNode(doc, tag, className) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  return node;
}

function createControl(doc, protocol, field) {
  if (field.type === FIELD_TYPES.SELECT) {
    const select = doc.createElement('select');
    for (const option of field.options || []) {
      const node = doc.createElement('option');
      node.value = option.value;
      node.textContent = option.label;
      select.appendChild(node);
    }
    return select;
  }
  if (field.type === FIELD_TYPES.TEXTAREA) {
    const textarea = doc.createElement('textarea');
    if (field.rows) textarea.rows = field.rows;
    if (field.placeholder) textarea.placeholder = field.placeholder;
    return textarea;
  }
  const input = doc.createElement('input');
  if (field.type === FIELD_TYPES.BOOLEAN) {
    input.type = 'checkbox';
    return input;
  }
  if (field.type === FIELD_TYPES.NUMBER) {
    input.type = 'number';
    if (field.min !== undefined) input.min = String(field.min);
    if (field.max !== undefined) input.max = String(field.max);
    if (field.step !== undefined) input.step = String(field.step);
  }
  if (field.placeholder) input.placeholder = field.placeholder;
  return input;
}

function createFieldNode(doc, protocol, field) {
  const control = createControl(doc, protocol, field);
  control.id = fieldDomId(protocol, field);
  control.dataset.protocolField = field.id;

  if (field.type === FIELD_TYPES.BOOLEAN) {
    const container = createNode(doc, 'label', 'toggle-row');
    const caption = createNode(doc, 'span');
    caption.textContent = field.label;
    container.appendChild(control);
    container.appendChild(caption);
    return { container, control };
  }

  const container = createNode(doc, 'label', field.width === FIELD_WIDTHS.FULL ? 'field full-width' : 'field');
  const caption = createNode(doc, 'span');
  caption.textContent = field.label;
  container.appendChild(caption);
  container.appendChild(control);
  if (field.help) {
    const help = createNode(doc, 'small');
    help.textContent = field.help;
    container.appendChild(help);
  }
  return { container, control };
}

function createSectionHeading(doc, section) {
  const heading = createNode(doc, 'div', 'section-heading compact');
  const group = createNode(doc, 'div');
  if (section.kicker) {
    const kicker = createNode(doc, 'p', 'section-kicker');
    kicker.textContent = section.kicker;
    group.appendChild(kicker);
  }
  if (section.title) {
    const title = createNode(doc, 'h3');
    title.textContent = section.title;
    group.appendChild(title);
  }
  heading.appendChild(group);
  return heading;
}

function createProtocolRenderer({
  protocol,
  mount,
  document: doc = globalThis.document,
  onFieldChange = () => {},
  onToolApply = () => {}
} = {}) {
  const fieldNodes = new Map();
  const sectionNodes = new Map();
  const toolNodes = new Map();

  function renderTool(section, container) {
    const status = createNode(doc, 'div', 'tool-status');
    status.id = toolStatusDomId(protocol, section.tool);
    status.dataset.state = 'available';
    status.dataset.protocolTool = section.tool;
    container.appendChild(status);

    const button = doc.createElement('button');
    button.type = 'button';
    button.id = toolApplyDomId(protocol, section.tool);
    button.className = 'button button-secondary button-small';
    button.hidden = true;
    button.addEventListener('click', () => onToolApply(section.tool));
    container.appendChild(button);

    toolNodes.set(section.tool, { status, button });
  }

  function renderSection(section) {
    const fields = getRenderableFields(protocol, section);
    if (!fields.length && !section.tool) return null;

    const container = createNode(doc, 'div', section.title || section.kicker ? 'workflow-subsection' : null);
    container.dataset.protocolSection = section.id;
    if (section.title || section.kicker) container.appendChild(createSectionHeading(doc, section));
    if (section.tool) renderTool(section, container);

    const grid = section.layout === SECTION_LAYOUTS.TWO_COLUMNS
      ? createNode(doc, 'div', 'field-grid two-columns')
      : container;
    if (grid !== container) container.appendChild(grid);

    for (const field of fields) {
      const node = createFieldNode(doc, protocol, field);
      node.control.addEventListener('input', () => onFieldChange(field.id));
      fieldNodes.set(field.id, { field, container: node.container, control: node.control });
      grid.appendChild(node.container);
    }

    return container;
  }

  function render() {
    mount.replaceChildren();
    fieldNodes.clear();
    sectionNodes.clear();
    toolNodes.clear();
    for (const section of protocol.sections || []) {
      const node = renderSection(section);
      if (!node) continue;
      sectionNodes.set(section.id, node);
      mount.appendChild(node);
    }
    setContext(defaultContext(protocol));
  }

  function update({ stage, context = {} } = {}) {
    for (const section of buildRenderPlan(protocol, { stage, context })) {
      const node = sectionNodes.get(section.id);
      if (node) node.hidden = !section.visible;
      for (const field of section.fields) {
        const entry = fieldNodes.get(field.id);
        if (entry) entry.container.hidden = !field.visible;
      }
    }
  }

  function readContext() {
    const context = {};
    for (const [id, entry] of fieldNodes) {
      const { field, control } = entry;
      if (field.type === FIELD_TYPES.BOOLEAN) {
        context[id] = Boolean(control.checked);
        continue;
      }
      const value = control.value;
      if (isNumericField(field)) {
        if (value === '' || value === undefined || value === null) {
          context[id] = null;
          continue;
        }
        const numeric = Number(value);
        context[id] = Number.isFinite(numeric) ? numeric : null;
        continue;
      }
      context[id] = value ?? '';
    }
    return context;
  }

  function setContext(context = {}) {
    for (const [id, entry] of fieldNodes) {
      const { field, control } = entry;
      const stored = context[id];
      if (field.type === FIELD_TYPES.BOOLEAN) {
        control.checked = stored === undefined ? Boolean(defaultFieldValue(field)) : Boolean(stored);
        continue;
      }
      const fallback = defaultFieldValue(field);
      const value = stored === undefined || stored === null ? fallback : stored;
      control.value = value === null || value === undefined ? '' : String(value);
    }
  }

  render();

  return {
    protocol,
    render,
    update,
    readContext,
    setContext,
    getFieldNode: (id) => fieldNodes.get(id) || null,
    getSectionNode: (id) => sectionNodes.get(id) || null,
    getToolNodes: (id) => toolNodes.get(id) || null
  };
}

export { createProtocolRenderer };
