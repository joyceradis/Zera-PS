import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROTOCOL_ERRORS,
  ProtocolValidationError,
  validateProtocol,
  assertValidProtocol
} from '../src/protocol-schema.js';
import { SCA_PROTOCOL } from '../protocols/sca.js';

function fixture(overrides = {}) {
  return {
    id: 'fixture',
    version: '1.0.0',
    label: 'PROTOCOLO DE TESTE',
    stages: ['initial_assessment', 'reassessment'],
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador' },
      { id: 'note', type: 'textarea', label: 'Nota', visibleWhen: { field: 'flag', equals: true } }
    ],
    sections: [
      { id: 'main', stages: ['initial_assessment'], fields: ['flag', 'note'] }
    ],
    ...overrides
  };
}

function toolFixture(overrides = {}) {
  return fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador' },
      { id: 'points', type: 'number', label: 'Pontos' }
    ],
    sections: [
      { id: 'main', stages: ['initial_assessment'], fields: ['flag', 'points'], tool: 'demo' }
    ],
    tools: [
      {
        id: 'demo',
        label: 'DEMO',
        type: 'score',
        availability: 'available',
        applicableWhen: { field: 'flag', equals: true },
        variables: { points: { field: 'points' } },
        requiredVariables: ['points'],
        calculate: (context) => Number(context.points)
      }
    ],
    ...overrides
  });
}

const codesOf = (protocol) => validateProtocol(protocol).errors.map((error) => error.code);

test('reference protocol satisfies the declared contract', () => {
  const result = validateProtocol(SCA_PROTOCOL);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test('minimal declarative fixture is accepted', () => {
  assert.equal(validateProtocol(fixture()).valid, true);
  assert.equal(validateProtocol(toolFixture()).valid, true);
});

test('protocol without a usable id is rejected', () => {
  assert.ok(codesOf(fixture({ id: '' })).includes(PROTOCOL_ERRORS.INVALID_ID));
  assert.ok(codesOf(fixture({ id: 'SCA Protocol' })).includes(PROTOCOL_ERRORS.INVALID_ID));
  assert.equal(validateProtocol(null).valid, false);
});

test('duplicated element ids are rejected', () => {
  const duplicatedField = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador' },
      { id: 'flag', type: 'text', label: 'Marcador repetido' }
    ],
    sections: [{ id: 'main', stages: ['initial_assessment'], fields: ['flag'] }]
  });
  assert.ok(codesOf(duplicatedField).includes(PROTOCOL_ERRORS.DUPLICATE_ID));

  const duplicatedSection = fixture({
    sections: [
      { id: 'main', stages: ['initial_assessment'], fields: ['flag', 'note'] },
      { id: 'main', stages: ['reassessment'], fields: [] }
    ]
  });
  assert.ok(codesOf(duplicatedSection).includes(PROTOCOL_ERRORS.DUPLICATE_ID));
});

test('unknown or undeclared stages are rejected', () => {
  assert.ok(codesOf(fixture({ stages: ['triagem'] })).includes(PROTOCOL_ERRORS.UNKNOWN_STAGE));

  const unknownSectionStage = fixture({
    sections: [{ id: 'main', stages: ['triagem'], fields: ['flag', 'note'] }]
  });
  assert.ok(codesOf(unknownSectionStage).includes(PROTOCOL_ERRORS.SECTION_UNKNOWN_STAGE));

  const undeclaredSectionStage = fixture({
    sections: [{ id: 'main', stages: ['final_documentation'], fields: ['flag', 'note'] }]
  });
  assert.ok(codesOf(undeclaredSectionStage).includes(PROTOCOL_ERRORS.SECTION_UNKNOWN_STAGE));
});

test('section referencing a field that does not exist is rejected', () => {
  const broken = fixture({
    sections: [{ id: 'main', stages: ['initial_assessment'], fields: ['flag', 'note', 'ghost'] }]
  });
  assert.ok(codesOf(broken).includes(PROTOCOL_ERRORS.UNKNOWN_FIELD_REFERENCE));
});

test('visibility rules must observe existing protocol fields', () => {
  const brokenFieldRule = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador' },
      { id: 'note', type: 'textarea', label: 'Nota', visibleWhen: { field: 'ghost', equals: true } }
    ]
  });
  assert.ok(codesOf(brokenFieldRule).includes(PROTOCOL_ERRORS.RULE_UNKNOWN_FIELD));

  const brokenSectionRule = fixture({
    sections: [{ id: 'main', stages: ['initial_assessment'], fields: ['flag', 'note'], visibleWhen: { field: 'ghost', equals: true } }]
  });
  assert.ok(codesOf(brokenSectionRule).includes(PROTOCOL_ERRORS.RULE_UNKNOWN_FIELD));

  const incompleteRule = fixture({
    sections: [{ id: 'main', stages: ['initial_assessment'], fields: ['flag', 'note'], visibleWhen: { field: 'flag' } }]
  });
  assert.ok(codesOf(incompleteRule).includes(PROTOCOL_ERRORS.INVALID_RULE));
});

test('rules cannot observe fields owned by the evolution form', () => {
  const externalRule = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador' },
      { id: 'qp', type: 'text', label: 'QP', source: 'evolution_form', domId: 'qp' },
      { id: 'note', type: 'textarea', label: 'Nota', visibleWhen: { field: 'qp', equals: 'DOR' } }
    ],
    sections: [{ id: 'main', stages: ['initial_assessment'], fields: ['flag', 'qp', 'note'] }]
  });
  assert.ok(codesOf(externalRule).includes(PROTOCOL_ERRORS.RULE_EXTERNAL_FIELD));
});

test('fields must be placed in exactly one section', () => {
  const orphan = fixture({
    sections: [{ id: 'main', stages: ['initial_assessment'], fields: ['flag'] }]
  });
  assert.ok(codesOf(orphan).includes(PROTOCOL_ERRORS.ORPHAN_FIELD));

  const duplicated = fixture({
    sections: [
      { id: 'main', stages: ['initial_assessment'], fields: ['flag', 'note'] },
      { id: 'extra', stages: ['reassessment'], fields: ['note'] }
    ]
  });
  assert.ok(codesOf(duplicated).includes(PROTOCOL_ERRORS.DUPLICATE_FIELD_PLACEMENT));
});

test('tool variables must resolve to declared protocol fields', () => {
  const undeclaredVariable = toolFixture({
    tools: [{
      id: 'demo',
      label: 'DEMO',
      type: 'score',
      applicableWhen: { field: 'flag', equals: true },
      variables: { points: { field: 'points' } },
      requiredVariables: ['points', 'ghostVariable'],
      calculate: () => 0
    }]
  });
  assert.ok(codesOf(undeclaredVariable).includes(PROTOCOL_ERRORS.TOOL_UNDECLARED_VARIABLE));

  const unknownField = toolFixture({
    tools: [{
      id: 'demo',
      label: 'DEMO',
      type: 'score',
      applicableWhen: { field: 'flag', equals: true },
      variables: { points: { field: 'ghostField' } },
      requiredVariables: ['points'],
      calculate: () => 0
    }]
  });
  assert.ok(codesOf(unknownField).includes(PROTOCOL_ERRORS.TOOL_VARIABLE_UNKNOWN_FIELD));

  const brokenGate = toolFixture({
    tools: [{
      id: 'demo',
      label: 'DEMO',
      type: 'score',
      applicableWhen: { field: 'flag', equals: true },
      variables: { points: { field: 'points', availableWhen: { field: 'ghostField', equals: 'available' } } },
      requiredVariables: ['points'],
      calculate: () => 0
    }]
  });
  assert.ok(codesOf(brokenGate).includes(PROTOCOL_ERRORS.RULE_UNKNOWN_FIELD));
});

test('tools must exist and be presented in exactly one section', () => {
  const unknownTool = toolFixture({
    sections: [{ id: 'main', stages: ['initial_assessment'], fields: ['flag', 'points'], tool: 'ghost' }]
  });
  assert.ok(codesOf(unknownTool).includes(PROTOCOL_ERRORS.UNKNOWN_TOOL_REFERENCE));

  const hiddenTool = toolFixture({
    sections: [{ id: 'main', stages: ['initial_assessment'], fields: ['flag', 'points'] }]
  });
  assert.ok(codesOf(hiddenTool).includes(PROTOCOL_ERRORS.ORPHAN_TOOL));
});

test('temporal results must reference declared protocol fields and rules', () => {
  const broken = fixture({
    temporalResults: [{
      id: 'demo_result',
      kind: 'lab',
      label: 'Exame',
      pendingWhen: { field: 'flag', equals: true },
      availableWhen: { field: 'flag', equals: false },
      payload: { value: 'ghostField' }
    }]
  });
  assert.ok(codesOf(broken).includes(PROTOCOL_ERRORS.TEMPORAL_RESULT_UNKNOWN_FIELD));

  const missingRule = fixture({
    temporalResults: [{ id: 'demo_result', kind: 'lab', label: 'Exame', payload: { value: 'note' } }]
  });
  assert.ok(codesOf(missingRule).includes(PROTOCOL_ERRORS.INVALID_TEMPORAL_RESULT));
});

test('colliding DOM ids are rejected before reaching the interface', () => {
  const explicitCollision = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador', domId: 'shared-node' },
      { id: 'note', type: 'textarea', label: 'Nota', domId: 'shared-node' }
    ]
  });
  assert.ok(codesOf(explicitCollision).includes(PROTOCOL_ERRORS.DUPLICATE_DOM_ID));

  const derivedCollision = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador', domId: 'fixture-note' },
      { id: 'note', type: 'textarea', label: 'Nota' }
    ]
  });
  assert.ok(codesOf(derivedCollision).includes(PROTOCOL_ERRORS.DUPLICATE_DOM_ID));

  const toolCollision = toolFixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador', domId: 'fixture-tool-status-demo' },
      { id: 'points', type: 'number', label: 'Pontos' }
    ]
  });
  assert.ok(codesOf(toolCollision).includes(PROTOCOL_ERRORS.DUPLICATE_DOM_ID));

  assert.equal(validateProtocol(fixture()).valid, true);
});

test('numeric coercion is rejected when it cannot produce a number', () => {
  const nonNumericOption = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador' },
      {
        id: 'note',
        type: 'select',
        coerce: 'number',
        label: 'Pontos',
        options: [{ value: '', label: 'NÃO INFORMADO' }, { value: 'alto', label: 'ALTO' }]
      }
    ]
  });
  assert.ok(codesOf(nonNumericOption).includes(PROTOCOL_ERRORS.INVALID_COERCION));

  const wrongType = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador' },
      { id: 'note', type: 'text', coerce: 'number', label: 'Pontos' }
    ]
  });
  assert.ok(codesOf(wrongType).includes(PROTOCOL_ERRORS.INVALID_COERCION));

  const numericOptions = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador' },
      {
        id: 'note',
        type: 'select',
        coerce: 'number',
        label: 'Pontos',
        options: [{ value: '', label: 'NÃO INFORMADO' }, { value: '2', label: '2' }]
      }
    ]
  });
  assert.equal(validateProtocol(numericOptions).valid, true);
});

test('declared defaults must respect the field type and its options', () => {
  const booleanDefault = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador', default: 'sim' },
      { id: 'note', type: 'textarea', label: 'Nota' }
    ]
  });
  assert.ok(codesOf(booleanDefault).includes(PROTOCOL_ERRORS.INVALID_DEFAULT));

  const selectDefault = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador' },
      { id: 'note', type: 'select', label: 'Estado', default: 'inexistente', options: [{ value: 'a', label: 'A' }] }
    ]
  });
  assert.ok(codesOf(selectDefault).includes(PROTOCOL_ERRORS.INVALID_DEFAULT));

  const numberDefault = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador' },
      { id: 'note', type: 'number', label: 'Idade', default: 'setenta' }
    ]
  });
  assert.ok(codesOf(numberDefault).includes(PROTOCOL_ERRORS.INVALID_DEFAULT));

  const textDefault = fixture({
    fields: [
      { id: 'flag', type: 'boolean', label: 'Marcador' },
      { id: 'note', type: 'textarea', label: 'Nota', default: 42 }
    ]
  });
  assert.ok(codesOf(textDefault).includes(PROTOCOL_ERRORS.INVALID_DEFAULT));
});

test('section must declare stage or stages, never both', () => {
  const ambiguous = fixture({
    sections: [{ id: 'main', stage: 'initial_assessment', stages: ['reassessment'], fields: ['flag', 'note'] }]
  });
  assert.ok(codesOf(ambiguous).includes(PROTOCOL_ERRORS.AMBIGUOUS_SECTION_STAGES));

  const singleStage = fixture({
    sections: [{ id: 'main', stage: 'initial_assessment', fields: ['flag', 'note'] }]
  });
  assert.equal(validateProtocol(singleStage).valid, true);
});

test('configuration errors fail loudly instead of producing partial interfaces', () => {
  assert.throws(
    () => assertValidProtocol(fixture({ sections: [{ id: 'main', stages: ['initial_assessment'], fields: ['ghost'] }] })),
    (error) => error instanceof ProtocolValidationError && error.errors.length > 0
  );
  assert.equal(assertValidProtocol(fixture()).id, 'fixture');
});
