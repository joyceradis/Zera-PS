import { WORKFLOW_STAGES } from './workflow-engine.js';

const FIELD_TYPES = Object.freeze({
  TEXT: 'text',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  SELECT: 'select',
  BOOLEAN: 'boolean'
});

const FIELD_SOURCES = Object.freeze({
  PROTOCOL: 'protocol',
  EVOLUTION_FORM: 'evolution_form'
});

const FIELD_WIDTHS = Object.freeze({ HALF: 'half', FULL: 'full' });
const SECTION_LAYOUTS = Object.freeze({ STACK: 'stack', TWO_COLUMNS: 'two-columns' });
const TOOL_AVAILABILITY = Object.freeze({ AVAILABLE: 'available', UNAVAILABLE: 'unavailable' });
const VALUE_COERCIONS = Object.freeze({ NUMBER: 'number' });

const PROTOCOL_ERRORS = Object.freeze({
  INVALID_PROTOCOL: 'INVALID_PROTOCOL',
  INVALID_ID: 'INVALID_ID',
  INVALID_VERSION: 'INVALID_VERSION',
  INVALID_LABEL: 'INVALID_LABEL',
  INVALID_STAGES: 'INVALID_STAGES',
  UNKNOWN_STAGE: 'UNKNOWN_STAGE',
  DUPLICATE_ID: 'DUPLICATE_ID',
  INVALID_FIELD: 'INVALID_FIELD',
  INVALID_FIELD_TYPE: 'INVALID_FIELD_TYPE',
  INVALID_OPTIONS: 'INVALID_OPTIONS',
  INVALID_COERCION: 'INVALID_COERCION',
  INVALID_DEFAULT: 'INVALID_DEFAULT',
  DUPLICATE_DOM_ID: 'DUPLICATE_DOM_ID',
  INVALID_SECTION: 'INVALID_SECTION',
  AMBIGUOUS_SECTION_STAGES: 'AMBIGUOUS_SECTION_STAGES',
  SECTION_UNKNOWN_STAGE: 'SECTION_UNKNOWN_STAGE',
  UNKNOWN_FIELD_REFERENCE: 'UNKNOWN_FIELD_REFERENCE',
  DUPLICATE_FIELD_PLACEMENT: 'DUPLICATE_FIELD_PLACEMENT',
  ORPHAN_FIELD: 'ORPHAN_FIELD',
  INVALID_RULE: 'INVALID_RULE',
  RULE_UNKNOWN_FIELD: 'RULE_UNKNOWN_FIELD',
  RULE_EXTERNAL_FIELD: 'RULE_EXTERNAL_FIELD',
  INVALID_TOOL: 'INVALID_TOOL',
  TOOL_UNDECLARED_VARIABLE: 'TOOL_UNDECLARED_VARIABLE',
  TOOL_VARIABLE_UNKNOWN_FIELD: 'TOOL_VARIABLE_UNKNOWN_FIELD',
  UNKNOWN_TOOL_REFERENCE: 'UNKNOWN_TOOL_REFERENCE',
  ORPHAN_TOOL: 'ORPHAN_TOOL',
  INVALID_TEMPORAL_RESULT: 'INVALID_TEMPORAL_RESULT',
  TEMPORAL_RESULT_UNKNOWN_FIELD: 'TEMPORAL_RESULT_UNKNOWN_FIELD'
});

const KNOWN_STAGES = new Set(Object.values(WORKFLOW_STAGES));
const KNOWN_FIELD_TYPES = new Set(Object.values(FIELD_TYPES));
const KNOWN_FIELD_SOURCES = new Set(Object.values(FIELD_SOURCES));
const KNOWN_WIDTHS = new Set(Object.values(FIELD_WIDTHS));
const KNOWN_LAYOUTS = new Set(Object.values(SECTION_LAYOUTS));
const KNOWN_AVAILABILITY = new Set(Object.values(TOOL_AVAILABILITY));
const KNOWN_COERCIONS = new Set(Object.values(VALUE_COERCIONS));

const PROTOCOL_ID_PATTERN = /^[a-z][a-z0-9_-]*$/;
const ELEMENT_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

const isFilledString = (value) => typeof value === 'string' && value.trim().length > 0;
const fieldSource = (field) => field?.source || FIELD_SOURCES.PROTOCOL;

const fieldDomId = (protocol, field) => field.domId || `${protocol?.id}-${field.id}`;
const toolStatusDomId = (protocol, toolId) => `${protocol?.id}-tool-status-${toolId}`;
const toolApplyDomId = (protocol, toolId) => `${protocol?.id}-tool-apply-${toolId}`;

class ProtocolValidationError extends Error {
  constructor(protocolId, errors = []) {
    super(`Protocolo inválido (${protocolId || 'sem id'}): ${errors.map((error) => `${error.code} @ ${error.path} — ${error.message}`).join(' | ')}`);
    this.name = 'ProtocolValidationError';
    this.protocolId = protocolId || null;
    this.errors = errors;
  }
}

function validateProtocol(protocol) {
  const errors = [];
  const add = (code, path, message) => errors.push({ code, path, message });

  if (!protocol || typeof protocol !== 'object' || Array.isArray(protocol)) {
    add(PROTOCOL_ERRORS.INVALID_PROTOCOL, '', 'Definição de protocolo deve ser um objeto.');
    return { valid: false, errors };
  }

  if (!isFilledString(protocol.id) || !PROTOCOL_ID_PATTERN.test(protocol.id)) {
    add(PROTOCOL_ERRORS.INVALID_ID, 'id', 'Protocolo exige id em minúsculas, iniciado por letra.');
  }
  if (!isFilledString(protocol.version) || !VERSION_PATTERN.test(protocol.version)) {
    add(PROTOCOL_ERRORS.INVALID_VERSION, 'version', 'Protocolo exige versão no formato MAJOR.MINOR.PATCH.');
  }
  if (!isFilledString(protocol.label)) {
    add(PROTOCOL_ERRORS.INVALID_LABEL, 'label', 'Protocolo exige label apresentável ao usuário.');
  }

  const declaredStages = validateStageList(protocol.stages, 'stages', add);
  const fieldIndex = validateFields(protocol.fields, add);
  const sectionIds = validateSections(protocol, fieldIndex, declaredStages, add);
  validateTools(protocol, fieldIndex, add);
  validateTemporalResults(protocol, fieldIndex, add);
  validatePlacement(protocol, fieldIndex, sectionIds, add);
  validateDomIdentity(protocol, fieldIndex, add);

  return { valid: errors.length === 0, errors };
}

function validateStageList(stages, path, add) {
  if (!Array.isArray(stages) || stages.length === 0) {
    add(PROTOCOL_ERRORS.INVALID_STAGES, path, 'Protocolo exige ao menos uma etapa declarada.');
    return new Set();
  }
  const declared = new Set();
  stages.forEach((stage, index) => {
    if (!KNOWN_STAGES.has(stage)) {
      add(PROTOCOL_ERRORS.UNKNOWN_STAGE, `${path}[${index}]`, `Etapa inexistente no workflow: ${String(stage)}.`);
      return;
    }
    if (declared.has(stage)) add(PROTOCOL_ERRORS.DUPLICATE_ID, `${path}[${index}]`, `Etapa duplicada: ${stage}.`);
    declared.add(stage);
  });
  return declared;
}

function validateFields(fields, add) {
  const index = new Map();
  if (!Array.isArray(fields) || fields.length === 0) {
    add(PROTOCOL_ERRORS.INVALID_FIELD, 'fields', 'Protocolo exige ao menos um campo declarado.');
    return index;
  }

  fields.forEach((field, position) => {
    const path = `fields[${position}]`;
    if (!field || typeof field !== 'object') {
      add(PROTOCOL_ERRORS.INVALID_FIELD, path, 'Campo deve ser um objeto.');
      return;
    }
    if (!isFilledString(field.id) || !ELEMENT_ID_PATTERN.test(field.id)) {
      add(PROTOCOL_ERRORS.INVALID_FIELD, `${path}.id`, 'Campo exige id alfanumérico iniciado por letra.');
      return;
    }
    if (index.has(field.id)) {
      add(PROTOCOL_ERRORS.DUPLICATE_ID, `${path}.id`, `Campo com id duplicado: ${field.id}.`);
      return;
    }
    index.set(field.id, field);

    if (!KNOWN_FIELD_TYPES.has(field.type)) {
      add(PROTOCOL_ERRORS.INVALID_FIELD_TYPE, `${path}.type`, `Tipo de campo não suportado: ${String(field.type)}.`);
    }
    if (!isFilledString(field.label)) {
      add(PROTOCOL_ERRORS.INVALID_FIELD, `${path}.label`, 'Campo exige label acessível.');
    }
    if (!KNOWN_FIELD_SOURCES.has(fieldSource(field))) {
      add(PROTOCOL_ERRORS.INVALID_FIELD, `${path}.source`, `Origem de campo não suportada: ${String(field.source)}.`);
    }
    if (fieldSource(field) === FIELD_SOURCES.EVOLUTION_FORM && !isFilledString(field.domId)) {
      add(PROTOCOL_ERRORS.INVALID_FIELD, `${path}.domId`, 'Campo externo exige domId do elemento já existente.');
    }
    if (field.width !== undefined && !KNOWN_WIDTHS.has(field.width)) {
      add(PROTOCOL_ERRORS.INVALID_FIELD, `${path}.width`, `Largura não suportada: ${String(field.width)}.`);
    }
    if (field.coerce !== undefined && !KNOWN_COERCIONS.has(field.coerce)) {
      add(PROTOCOL_ERRORS.INVALID_COERCION, `${path}.coerce`, `Coerção não suportada: ${String(field.coerce)}.`);
    }
    if (field.type === FIELD_TYPES.SELECT) validateOptions(field, path, add);
    validateCoercion(field, path, add);
    validateDefault(field, path, add);
  });

  fields.forEach((field, position) => {
    if (!field || typeof field !== 'object') return;
    validateRule(field.visibleWhen, `fields[${position}].visibleWhen`, index, add);
  });

  return index;
}

function validateOptions(field, path, add) {
  if (!Array.isArray(field.options) || field.options.length === 0) {
    add(PROTOCOL_ERRORS.INVALID_OPTIONS, `${path}.options`, 'Campo do tipo select exige lista de opções.');
    return;
  }
  const seen = new Set();
  field.options.forEach((option, index) => {
    const optionPath = `${path}.options[${index}]`;
    if (!option || typeof option !== 'object') {
      add(PROTOCOL_ERRORS.INVALID_OPTIONS, optionPath, 'Opção deve ser um objeto { value, label }.');
      return;
    }
    if (typeof option.value !== 'string') add(PROTOCOL_ERRORS.INVALID_OPTIONS, `${optionPath}.value`, 'Opção exige value textual.');
    if (!isFilledString(option.label)) add(PROTOCOL_ERRORS.INVALID_OPTIONS, `${optionPath}.label`, 'Opção exige label apresentável.');
    if (seen.has(option.value)) add(PROTOCOL_ERRORS.DUPLICATE_ID, `${optionPath}.value`, `Opção duplicada: ${String(option.value)}.`);
    seen.add(option.value);
  });
}

function validateCoercion(field, path, add) {
  if (field.coerce !== VALUE_COERCIONS.NUMBER) return;
  if (field.type !== FIELD_TYPES.SELECT) {
    add(PROTOCOL_ERRORS.INVALID_COERCION, `${path}.coerce`, `Coerção numérica só se aplica a select; tipo declarado: ${String(field.type)}.`);
    return;
  }
  (Array.isArray(field.options) ? field.options : []).forEach((option, index) => {
    if (!option || typeof option.value !== 'string' || option.value === '') return;
    if (!Number.isFinite(Number(option.value))) {
      add(PROTOCOL_ERRORS.INVALID_COERCION, `${path}.options[${index}].value`, `Opção não numérica em campo com coerção numérica: ${option.value}.`);
    }
  });
}

function validateDefault(field, path, add) {
  if (field.default === undefined) return;
  const value = field.default;
  const invalid = (message) => add(PROTOCOL_ERRORS.INVALID_DEFAULT, `${path}.default`, message);

  if (field.type === FIELD_TYPES.BOOLEAN) {
    if (typeof value !== 'boolean') invalid(`Valor inicial de campo booleano deve ser true ou false: ${JSON.stringify(value)}.`);
    return;
  }
  if (field.type === FIELD_TYPES.SELECT) {
    const options = Array.isArray(field.options) ? field.options : [];
    if (!options.some((option) => option?.value === value)) {
      invalid(`Valor inicial fora das opções declaradas: ${JSON.stringify(value)}.`);
    }
    return;
  }
  if (field.type === FIELD_TYPES.NUMBER) {
    if (value !== null && !Number.isFinite(value)) invalid(`Valor inicial numérico inválido: ${JSON.stringify(value)}.`);
    return;
  }
  if (typeof value !== 'string') invalid(`Valor inicial textual inválido: ${JSON.stringify(value)}.`);
}

function validateDomIdentity(protocol, fieldIndex, add) {
  const owners = new Map();
  const claim = (domId, path, owner) => {
    if (!isFilledString(domId)) return;
    if (owners.has(domId)) {
      add(PROTOCOL_ERRORS.DUPLICATE_DOM_ID, path, `Identificador de DOM duplicado: ${domId} já pertence a ${owners.get(domId)}.`);
      return;
    }
    owners.set(domId, owner);
  };

  (protocol.fields || []).forEach((field, position) => {
    if (!field?.id || fieldIndex.get(field.id) !== field) return;
    claim(fieldDomId(protocol, field), `fields[${position}].domId`, `campo ${field.id}`);
  });

  (Array.isArray(protocol.tools) ? protocol.tools : []).forEach((tool, position) => {
    if (!tool?.id) return;
    claim(toolStatusDomId(protocol, tool.id), `tools[${position}].id`, `estado da ferramenta ${tool.id}`);
    claim(toolApplyDomId(protocol, tool.id), `tools[${position}].id`, `aplicação da ferramenta ${tool.id}`);
  });
}

function validateRule(rule, path, fieldIndex, add) {
  if (rule === undefined || rule === null) return;
  if (typeof rule !== 'object' || Array.isArray(rule)) {
    add(PROTOCOL_ERRORS.INVALID_RULE, path, 'Regra deve ser um objeto { field, equals }.');
    return;
  }
  if (!isFilledString(rule.field)) {
    add(PROTOCOL_ERRORS.INVALID_RULE, `${path}.field`, 'Regra exige o campo observado.');
    return;
  }
  if (!('equals' in rule)) {
    add(PROTOCOL_ERRORS.INVALID_RULE, `${path}.equals`, 'Regra exige o valor comparado em equals.');
  }
  const field = fieldIndex.get(rule.field);
  if (!field) {
    add(PROTOCOL_ERRORS.RULE_UNKNOWN_FIELD, `${path}.field`, `Regra referencia campo inexistente: ${rule.field}.`);
    return;
  }
  if (fieldSource(field) !== FIELD_SOURCES.PROTOCOL) {
    add(PROTOCOL_ERRORS.RULE_EXTERNAL_FIELD, `${path}.field`, `Regra não pode observar campo externo ao protocolo: ${rule.field}.`);
  }
}

function validateSections(protocol, fieldIndex, declaredStages, add) {
  const sectionIds = new Set();
  const sections = protocol.sections;
  if (!Array.isArray(sections) || sections.length === 0) {
    add(PROTOCOL_ERRORS.INVALID_SECTION, 'sections', 'Protocolo exige ao menos uma seção declarada.');
    return sectionIds;
  }
  const toolIds = new Set((Array.isArray(protocol.tools) ? protocol.tools : []).map((tool) => tool?.id).filter(Boolean));

  sections.forEach((section, position) => {
    const path = `sections[${position}]`;
    if (!section || typeof section !== 'object') {
      add(PROTOCOL_ERRORS.INVALID_SECTION, path, 'Seção deve ser um objeto.');
      return;
    }
    if (!isFilledString(section.id) || !ELEMENT_ID_PATTERN.test(section.id)) {
      add(PROTOCOL_ERRORS.INVALID_SECTION, `${path}.id`, 'Seção exige id alfanumérico iniciado por letra.');
      return;
    }
    if (sectionIds.has(section.id)) {
      add(PROTOCOL_ERRORS.DUPLICATE_ID, `${path}.id`, `Seção com id duplicado: ${section.id}.`);
      return;
    }
    sectionIds.add(section.id);

    if (section.stage !== undefined && section.stages !== undefined) {
      add(PROTOCOL_ERRORS.AMBIGUOUS_SECTION_STAGES, `${path}.stage`, 'Seção deve declarar stage ou stages, nunca ambos.');
    }
    const stages = section.stage !== undefined ? [section.stage] : section.stages;
    if (stages !== undefined) {
      if (!Array.isArray(stages) && typeof stages !== 'string') {
        add(PROTOCOL_ERRORS.INVALID_SECTION, `${path}.stages`, 'Etapas da seção devem ser declaradas em lista.');
      } else {
        [].concat(stages).forEach((stage, index) => {
          if (!KNOWN_STAGES.has(stage)) {
            add(PROTOCOL_ERRORS.SECTION_UNKNOWN_STAGE, `${path}.stages[${index}]`, `Seção referencia etapa inexistente: ${String(stage)}.`);
            return;
          }
          if (declaredStages.size && !declaredStages.has(stage)) {
            add(PROTOCOL_ERRORS.SECTION_UNKNOWN_STAGE, `${path}.stages[${index}]`, `Seção referencia etapa não declarada pelo protocolo: ${stage}.`);
          }
        });
      }
    }

    if (section.layout !== undefined && !KNOWN_LAYOUTS.has(section.layout)) {
      add(PROTOCOL_ERRORS.INVALID_SECTION, `${path}.layout`, `Layout não suportado: ${String(section.layout)}.`);
    }
    if (!Array.isArray(section.fields)) {
      add(PROTOCOL_ERRORS.INVALID_SECTION, `${path}.fields`, 'Seção exige lista de campos, ainda que vazia.');
    } else {
      section.fields.forEach((fieldId, index) => {
        if (!fieldIndex.has(fieldId)) {
          add(PROTOCOL_ERRORS.UNKNOWN_FIELD_REFERENCE, `${path}.fields[${index}]`, `Seção referencia campo inexistente: ${String(fieldId)}.`);
        }
      });
    }
    if (section.tool !== undefined && !toolIds.has(section.tool)) {
      add(PROTOCOL_ERRORS.UNKNOWN_TOOL_REFERENCE, `${path}.tool`, `Seção referencia ferramenta inexistente: ${String(section.tool)}.`);
    }
    validateRule(section.visibleWhen, `${path}.visibleWhen`, fieldIndex, add);
  });

  return sectionIds;
}

function validateTools(protocol, fieldIndex, add) {
  const tools = protocol.tools;
  if (tools === undefined) return;
  if (!Array.isArray(tools)) {
    add(PROTOCOL_ERRORS.INVALID_TOOL, 'tools', 'Ferramentas devem ser declaradas em lista.');
    return;
  }
  const seen = new Set();
  tools.forEach((tool, position) => {
    const path = `tools[${position}]`;
    if (!tool || typeof tool !== 'object') {
      add(PROTOCOL_ERRORS.INVALID_TOOL, path, 'Ferramenta deve ser um objeto.');
      return;
    }
    if (!isFilledString(tool.id) || !ELEMENT_ID_PATTERN.test(tool.id)) {
      add(PROTOCOL_ERRORS.INVALID_TOOL, `${path}.id`, 'Ferramenta exige id alfanumérico iniciado por letra.');
      return;
    }
    if (seen.has(tool.id)) {
      add(PROTOCOL_ERRORS.DUPLICATE_ID, `${path}.id`, `Ferramenta com id duplicado: ${tool.id}.`);
      return;
    }
    seen.add(tool.id);

    if (!isFilledString(tool.label)) add(PROTOCOL_ERRORS.INVALID_TOOL, `${path}.label`, 'Ferramenta exige label apresentável.');
    if (!isFilledString(tool.type)) add(PROTOCOL_ERRORS.INVALID_TOOL, `${path}.type`, 'Ferramenta exige tipo declarado.');
    if (tool.availability !== undefined && !KNOWN_AVAILABILITY.has(tool.availability)) {
      add(PROTOCOL_ERRORS.INVALID_TOOL, `${path}.availability`, `Disponibilidade não suportada: ${String(tool.availability)}.`);
    }
    if (typeof tool.calculate !== 'function') {
      add(PROTOCOL_ERRORS.INVALID_TOOL, `${path}.calculate`, 'Ferramenta exige função de cálculo determinística.');
    }
    validateRule(tool.applicableWhen, `${path}.applicableWhen`, fieldIndex, add);

    const variables = tool.variables;
    if (variables !== undefined && (typeof variables !== 'object' || Array.isArray(variables))) {
      add(PROTOCOL_ERRORS.INVALID_TOOL, `${path}.variables`, 'Variáveis devem ser declaradas como mapa nome → origem.');
      return;
    }
    const declaredVariables = new Map(Object.entries(variables || {}));
    for (const [name, binding] of declaredVariables) {
      const bindingPath = `${path}.variables.${name}`;
      if (!binding || typeof binding !== 'object') {
        add(PROTOCOL_ERRORS.INVALID_TOOL, bindingPath, 'Origem de variável deve ser um objeto { field }.');
        continue;
      }
      if (!isFilledString(binding.field)) {
        add(PROTOCOL_ERRORS.INVALID_TOOL, `${bindingPath}.field`, 'Variável exige campo de origem.');
        continue;
      }
      const field = fieldIndex.get(binding.field);
      if (!field) {
        add(PROTOCOL_ERRORS.TOOL_VARIABLE_UNKNOWN_FIELD, `${bindingPath}.field`, `Variável referencia campo inexistente: ${binding.field}.`);
        continue;
      }
      if (fieldSource(field) !== FIELD_SOURCES.PROTOCOL) {
        add(PROTOCOL_ERRORS.TOOL_VARIABLE_UNKNOWN_FIELD, `${bindingPath}.field`, `Variável não pode depender de campo externo: ${binding.field}.`);
      }
      validateRule(binding.availableWhen, `${bindingPath}.availableWhen`, fieldIndex, add);
    }

    const required = tool.requiredVariables;
    if (required !== undefined && !Array.isArray(required)) {
      add(PROTOCOL_ERRORS.INVALID_TOOL, `${path}.requiredVariables`, 'Variáveis obrigatórias devem ser declaradas em lista.');
    } else {
      (required || []).forEach((name, index) => {
        if (!declaredVariables.has(name)) {
          add(PROTOCOL_ERRORS.TOOL_UNDECLARED_VARIABLE, `${path}.requiredVariables[${index}]`, `Variável obrigatória sem origem declarada: ${String(name)}.`);
        }
      });
    }

    Object.keys(tool.missingMessages || {}).forEach((name) => {
      if (!declaredVariables.has(name)) {
        add(PROTOCOL_ERRORS.TOOL_UNDECLARED_VARIABLE, `${path}.missingMessages.${name}`, `Mensagem referencia variável inexistente: ${name}.`);
      }
    });
  });
}

function validateTemporalResults(protocol, fieldIndex, add) {
  const results = protocol.temporalResults;
  if (results === undefined) return;
  if (!Array.isArray(results)) {
    add(PROTOCOL_ERRORS.INVALID_TEMPORAL_RESULT, 'temporalResults', 'Resultados temporais devem ser declarados em lista.');
    return;
  }
  const seen = new Set();
  results.forEach((declaration, position) => {
    const path = `temporalResults[${position}]`;
    if (!declaration || typeof declaration !== 'object') {
      add(PROTOCOL_ERRORS.INVALID_TEMPORAL_RESULT, path, 'Resultado temporal deve ser um objeto.');
      return;
    }
    if (!isFilledString(declaration.id)) {
      add(PROTOCOL_ERRORS.INVALID_TEMPORAL_RESULT, `${path}.id`, 'Resultado temporal exige id estável.');
      return;
    }
    if (seen.has(declaration.id)) {
      add(PROTOCOL_ERRORS.DUPLICATE_ID, `${path}.id`, `Resultado temporal com id duplicado: ${declaration.id}.`);
      return;
    }
    seen.add(declaration.id);

    if (!isFilledString(declaration.kind)) add(PROTOCOL_ERRORS.INVALID_TEMPORAL_RESULT, `${path}.kind`, 'Resultado temporal exige natureza clínica (kind).');
    if (!isFilledString(declaration.label)) add(PROTOCOL_ERRORS.INVALID_TEMPORAL_RESULT, `${path}.label`, 'Resultado temporal exige label apresentável.');
    if (!declaration.pendingWhen) add(PROTOCOL_ERRORS.INVALID_TEMPORAL_RESULT, `${path}.pendingWhen`, 'Resultado temporal exige regra de pendência.');
    if (!declaration.availableWhen) add(PROTOCOL_ERRORS.INVALID_TEMPORAL_RESULT, `${path}.availableWhen`, 'Resultado temporal exige regra de disponibilidade.');
    validateRule(declaration.pendingWhen, `${path}.pendingWhen`, fieldIndex, add);
    validateRule(declaration.availableWhen, `${path}.availableWhen`, fieldIndex, add);

    const payload = declaration.payload;
    if (payload !== undefined && (typeof payload !== 'object' || Array.isArray(payload))) {
      add(PROTOCOL_ERRORS.INVALID_TEMPORAL_RESULT, `${path}.payload`, 'Payload deve mapear chave do resultado → campo do protocolo.');
      return;
    }
    Object.entries(payload || {}).forEach(([key, fieldId]) => {
      const field = fieldIndex.get(fieldId);
      if (!field) {
        add(PROTOCOL_ERRORS.TEMPORAL_RESULT_UNKNOWN_FIELD, `${path}.payload.${key}`, `Payload referencia campo inexistente: ${String(fieldId)}.`);
        return;
      }
      if (fieldSource(field) !== FIELD_SOURCES.PROTOCOL) {
        add(PROTOCOL_ERRORS.TEMPORAL_RESULT_UNKNOWN_FIELD, `${path}.payload.${key}`, `Payload não pode depender de campo externo: ${String(fieldId)}.`);
      }
    });
  });
}

function validatePlacement(protocol, fieldIndex, sectionIds, add) {
  if (!sectionIds.size) return;
  const placements = new Map();
  const toolPlacements = new Map();

  (protocol.sections || []).forEach((section, position) => {
    if (!section || typeof section !== 'object') return;
    (Array.isArray(section.fields) ? section.fields : []).forEach((fieldId, index) => {
      if (!fieldIndex.has(fieldId)) return;
      if (placements.has(fieldId)) {
        add(PROTOCOL_ERRORS.DUPLICATE_FIELD_PLACEMENT, `sections[${position}].fields[${index}]`, `Campo declarado em mais de uma seção: ${fieldId}.`);
        return;
      }
      placements.set(fieldId, section.id);
    });
    if (section.tool) toolPlacements.set(section.tool, (toolPlacements.get(section.tool) || 0) + 1);
  });

  for (const fieldId of fieldIndex.keys()) {
    if (!placements.has(fieldId)) {
      add(PROTOCOL_ERRORS.ORPHAN_FIELD, `fields.${fieldId}`, `Campo declarado sem seção correspondente: ${fieldId}.`);
    }
  }

  (Array.isArray(protocol.tools) ? protocol.tools : []).forEach((tool, position) => {
    if (!tool?.id) return;
    if ((toolPlacements.get(tool.id) || 0) !== 1) {
      add(PROTOCOL_ERRORS.ORPHAN_TOOL, `tools[${position}].id`, `Ferramenta deve ser apresentada em exatamente uma seção: ${tool.id}.`);
    }
  });
}

function assertValidProtocol(protocol) {
  const { valid, errors } = validateProtocol(protocol);
  if (!valid) throw new ProtocolValidationError(protocol?.id, errors);
  return protocol;
}

export {
  FIELD_TYPES,
  FIELD_SOURCES,
  FIELD_WIDTHS,
  SECTION_LAYOUTS,
  TOOL_AVAILABILITY,
  VALUE_COERCIONS,
  PROTOCOL_ERRORS,
  ProtocolValidationError,
  fieldDomId,
  toolStatusDomId,
  toolApplyDomId,
  validateProtocol,
  assertValidProtocol
};
