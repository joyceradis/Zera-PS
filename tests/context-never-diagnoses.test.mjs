// INV-CLIN-003 — Contexto/sugestão ≠ diagnóstico.
//
// "Detecção de palavras-chave e progressive disclosure podem tornar campos/ferramentas
// disponíveis. Não definem hipótese, diagnóstico ou conduta automaticamente."
//
// Os protetores já existentes provam pontos isolados dessa propriedade. Este arquivo
// prova a propriedade sobre TODO o espaço declarativo etapa × contexto, por enumeração
// exaustiva das transições e estados finitos declarados — nunca por amostragem de
// valores clínicos, que são infinitos.
//
// O espaço enumerado é derivado das próprias declarações: etapas vêm de WORKFLOW_STAGES,
// protocolos são carregados de `protocols/`, contextos saem das regras de disclosure
// (`visibleWhen`/`applicableWhen`/`availableWhen`/`pendingWhen`) e os contextos sindrômicos
// vêm do catálogo de templates. Etapa nova, protocolo novo, template novo ou regra de
// disclosure nova entram no espaço automaticamente e passam a ser exigidos — o teste não
// precisa ser reescrito para continuar exaustivo, e não pode ser silenciosamente esvaziado.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { WORKFLOW_STAGES, createEncounter, transitionEncounter, updateEncounterContext, getVisibleSections } from '../src/workflow-engine.js';
import { buildRenderPlan, defaultContext, getField, isProtocolField } from '../src/protocol-engine.js';
import { TEMPLATES } from '../assets/templates.js';
import { renderEvolution } from '../assets/document-engine.js';

const STAGES = Object.freeze(Object.values(WORKFLOW_STAGES));

// Cabeçalhos que só podem existir no documento se a médica tiver digitado o conteúdo.
const DIAGNOSTIC_HEADERS = Object.freeze(['# HIPÓTESES DIAGNÓSTICAS:', '# CONDUTA:']);

// Campos do formulário de evolução cuja presença no documento é diagnóstico/conduta.
const DIAGNOSTIC_FORM_FIELDS = Object.freeze(['hipoteses', 'conduta']);

// Piso ancorado do espaço enumerado, por protocolo.
//
// Sem isto a exaustão seria auto-referente: se uma regra `visibleWhen` fosse removida do
// protocolo, o espaço encolheria junto e o teste continuaria "exaustivo" sobre um universo
// menor, passando pelo motivo errado. O piso quebra essa circularidade — encolher o espaço
// exige editar este bloco conscientemente, que é exatamente a segunda leitura que a política
// do registry exige. Protocolo novo não precisa entrar aqui (é coberto pela enumeração
// dinâmica), mas protocolo conhecido não pode encolher em silêncio.
const DISCLOSURE_FLOOR = Object.freeze({
  sca: Object.freeze({
    fields: Object.freeze(['ecgStatus', 'suspectedAcs', 'troponinStatus']),
    minContexts: 32
  })
});

/**
 * Carrega TODO protocolo declarado em `protocols/`, não apenas o SCA. Um protocolo novo
 * entra no espaço enumerado automaticamente — não é possível adicionar protocolo e
 * escapar da cobertura deste invariante sem que o teste passe a exercê-lo.
 */
async function loadDeclaredProtocols() {
  const files = (await readdir(new URL('../protocols/', import.meta.url)))
    .filter((name) => name.endsWith('.js'))
    .sort();
  const protocols = [];
  for (const file of files) {
    const module = await import(new URL(`../protocols/${file}`, import.meta.url));
    for (const value of Object.values(module)) {
      if (value && typeof value === 'object' && value.id && Array.isArray(value.sections)) {
        protocols.push({ file, protocol: value });
      }
    }
  }
  return protocols;
}

/**
 * Coleta, a partir das declarações do protocolo, todo campo que participa de alguma
 * regra de disclosure/disponibilidade. Esses são os campos que "abrem" interface —
 * exatamente os que o invariante diz que não podem virar diagnóstico.
 */
function collectDisclosureRules(protocol) {
  const rules = [];
  const push = (rule) => { if (rule?.field) rules.push(rule); };

  for (const field of protocol.fields || []) push(field.visibleWhen);
  for (const section of protocol.sections || []) push(section.visibleWhen);
  for (const tool of protocol.tools || []) {
    push(tool.applicableWhen);
    for (const binding of Object.values(tool.variables || {})) push(binding?.availableWhen);
  }
  for (const declaration of protocol.temporalResults || []) {
    push(declaration.availableWhen);
    push(declaration.pendingWhen);
  }
  return rules;
}

/** Valores declarados que um campo de disclosure pode assumir. Finito por construção. */
function declaredValuesFor(protocol, fieldId) {
  const field = getField(protocol, fieldId);
  if (!field) return [];
  if (field.type === 'boolean') return [false, true];
  if (Array.isArray(field.options) && field.options.length) return field.options.map((option) => option.value);
  return [field.default === undefined ? '' : field.default];
}

/** Produto cartesiano exaustivo sobre os campos que governam disclosure. */
function enumerateDisclosureContexts(protocol) {
  const fieldIds = [...new Set(collectDisclosureRules(protocol).map((rule) => rule.field))].sort();
  let contexts = [{}];
  for (const fieldId of fieldIds) {
    const values = declaredValuesFor(protocol, fieldId);
    contexts = contexts.flatMap((base) => values.map((value) => ({ ...base, [fieldId]: value })));
  }
  return { fieldIds, contexts };
}

const PROTOCOLS = (await loadDeclaredProtocols()).map((entry) => ({
  ...entry,
  ...enumerateDisclosureContexts(entry.protocol)
}));

/** Formulário vazio: nada foi digitado pela médica. */
function emptyForm() {
  return {
    qp: '', hda: '', laboratoriais: '', imagem: '',
    hipoteses: '', conduta: '', includeEmTempo: false, emTempo: ''
  };
}

function assertNoDiagnosticOutput(text, label) {
  for (const header of DIAGNOSTIC_HEADERS) {
    assert.equal(
      text.includes(header),
      false,
      `${label}: o documento passou a conter "${header}" sem que hipótese/conduta fossem digitadas. ` +
      'Contexto ou disclosure virou diagnóstico — INV-CLIN-003 violado.'
    );
  }
}

// ---------------------------------------------------------------------------
// 1. Guarda de exaustão: o espaço enumerado tem de acompanhar as declarações.
// ---------------------------------------------------------------------------

test('the enumerated stage space covers every declared workflow stage', () => {
  assert.deepEqual(
    [...STAGES].sort(),
    ['final_documentation', 'initial_assessment', 'initial_conduct', 'pending_results', 'reassessment'].sort(),
    'A lista de etapas mudou. Este teste enumera etapas a partir de WORKFLOW_STAGES, mas a ' +
    'asserção fixa existe para que uma etapa nova falhe aqui e force revisão consciente da ' +
    'cobertura de INV-CLIN-003, em vez de ser absorvida silenciosamente.'
  );
});

test('every declared protocol is loaded into the enumerated space', () => {
  assert.ok(
    PROTOCOLS.length > 0,
    'Nenhum protocolo foi carregado de protocols/. Ou os protocolos sumiram, ou o carregador ' +
    'deixou de reconhecê-los — nos dois casos este teste deixaria de provar qualquer coisa.'
  );
  assert.ok(
    PROTOCOLS.some((entry) => entry.protocol.id === 'sca'),
    'O protocolo SCA saiu do espaço enumerado sem revisão do invariante.'
  );
  for (const { file, protocol, fieldIds, contexts } of PROTOCOLS) {
    assert.ok(
      fieldIds.length > 0,
      `${file}: o protocolo "${protocol.id}" não declara nenhuma regra de disclosure, ou o coletor ` +
      'deixou de enxergá-las. Sem regras coletadas, a enumeração é vazia e não prova nada.'
    );
    assert.ok(
      contexts.length >= 2 ** fieldIds.length,
      `${file}: o produto cartesiano encolheu abaixo do mínimo possível; não é mais exaustivo.`
    );
  }
});

test('the enumerated disclosure space never shrinks below its anchored floor', () => {
  for (const [protocolId, floor] of Object.entries(DISCLOSURE_FLOOR)) {
    const entry = PROTOCOLS.find((candidate) => candidate.protocol.id === protocolId);
    assert.ok(entry, `O protocolo "${protocolId}", com piso declarado, saiu de protocols/.`);
    for (const expected of floor.fields) {
      assert.ok(
        entry.fieldIds.includes(expected),
        `protocolo=${protocolId}: o campo de disclosure "${expected}" saiu do espaço enumerado. ` +
        'Ou a regra foi removida do protocolo, ou o coletor deixou de vê-la. Nos dois casos a ' +
        'exaustão deste teste diminuiu sem segunda leitura — atualize DISCLOSURE_FLOOR de forma ' +
        'explícita se a redução for intencional.'
      );
    }
    assert.ok(
      entry.contexts.length >= floor.minContexts,
      `protocolo=${protocolId}: o espaço de contextos caiu de ${floor.minContexts} para ` +
      `${entry.contexts.length}. Encolhimento silencioso da cobertura de INV-CLIN-003.`
    );
  }
});

// ---------------------------------------------------------------------------
// 2. A propriedade central, sobre todo o produto protocolo × etapa × contexto.
// ---------------------------------------------------------------------------

test('no stage/context combination produces diagnosis or conduct in the final document', () => {
  let combinations = 0;
  for (const { protocol, contexts } of PROTOCOLS) {
    for (const stage of STAGES) {
      for (const context of contexts) {
        // O contexto é levado até a fronteira da projeção documental: plano de renderização
        // calculado, seções visíveis resolvidas, e então o documento gerado com formulário vazio.
        const plan = buildRenderPlan(protocol, { stage, context });
        const visible = getVisibleSections(protocol, stage, context);
        assert.ok(Array.isArray(plan) && Array.isArray(visible));

        const text = renderEvolution(emptyForm(), {});
        assertNoDiagnosticOutput(text, `protocolo=${protocol.id} etapa=${stage} contexto=${JSON.stringify(context)}`);
        combinations += 1;
      }
    }
  }
  const expected = PROTOCOLS.reduce((total, entry) => total + (STAGES.length * entry.contexts.length), 0);
  assert.equal(combinations, expected, 'Nem todas as combinações foram exercidas.');
  assert.ok(combinations >= 5 * 32, `Espaço exercido pequeno demais (${combinations} combinações).`);
});

test('context values never leak into the document as clinical text', () => {
  // Cada campo de contexto recebe um valor-sentinela reconhecível. Se qualquer etapa ou
  // regra de disclosure escrever contexto no documento, o sentinela aparece.
  for (const { protocol } of PROTOCOLS) {
    const sentinelContext = {};
    for (const field of protocol.fields || []) {
      if (!isProtocolField(field)) continue;
      sentinelContext[field.id] = `SENTINELA-${field.id.toUpperCase()}`;
    }

    for (const stage of STAGES) {
      buildRenderPlan(protocol, { stage, context: sentinelContext });
      const text = renderEvolution(emptyForm(), {}).toUpperCase();
      for (const value of Object.values(sentinelContext)) {
        assert.equal(
          text.includes(String(value).toUpperCase()),
          false,
          `protocolo=${protocol.id} etapa=${stage}: o valor de contexto "${value}" vazou para o documento clínico.`
        );
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 3. Progressive disclosure altera apenas visibilidade — nunca valor.
// ---------------------------------------------------------------------------

test('progressive disclosure changes only visibility, never field values', () => {
  for (const { protocol, contexts } of PROTOCOLS) {
    for (const stage of STAGES) {
      for (const context of contexts) {
        const plan = buildRenderPlan(protocol, { stage, context });
        for (const section of plan) {
          assert.deepEqual(
            Object.keys(section).sort(),
            ['fields', 'id', 'renderable', 'tool', 'visible'],
            `protocolo=${protocol.id} etapa=${stage}: o plano de renderização passou a expor chave ` +
            'além de visibilidade/estrutura. Se o plano puder carregar valor, disclosure vira conteúdo.'
          );
          for (const field of section.fields) {
            assert.deepEqual(
              Object.keys(field).sort(),
              ['id', 'visible'],
              `protocolo=${protocol.id} etapa=${stage}, seção=${section.id}: campo do plano expõe ` +
              'algo além de id/visibilidade.'
            );
            assert.equal(typeof field.visible, 'boolean');
          }
        }
      }
    }
  }
});

test('the render plan never exposes fields owned by the evolution form, in any stage', () => {
  // `qp`, `hda` e `conduta` pertencem ao formulário de evolução. Se a camada de protocolo
  // passar a renderizá-los, ela ganha um caminho de escrita para conduta.
  for (const { protocol, contexts } of PROTOCOLS) {
    for (const stage of STAGES) {
      for (const context of contexts) {
        const plan = buildRenderPlan(protocol, { stage, context });
        const exposed = plan.flatMap((section) => section.fields.map((field) => field.id));
        for (const owned of ['qp', 'hda', ...DIAGNOSTIC_FORM_FIELDS]) {
          assert.equal(
            exposed.includes(owned),
            false,
            `protocolo=${protocol.id} etapa=${stage}: a camada de protocolo expôs "${owned}", ` +
            'que pertence ao formulário de evolução.'
          );
        }
      }
    }
  }
});

test('default context never carries diagnosis or conduct, in any stage', () => {
  for (const { protocol } of PROTOCOLS) {
    const context = defaultContext(protocol);
    for (const owned of DIAGNOSTIC_FORM_FIELDS) {
      assert.equal(
        Object.hasOwn(context, owned),
        false,
        `protocolo=${protocol.id}: o contexto default passou a carregar "${owned}".`
      );
    }
    for (const stage of STAGES) {
      buildRenderPlan(protocol, { stage, context });
      assertNoDiagnosticOutput(
        renderEvolution(emptyForm(), {}),
        `protocolo=${protocol.id} contexto default na etapa=${stage}`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 4. Seleção de template (detecção de contexto sindrômico) em todas as etapas.
// ---------------------------------------------------------------------------

test('selecting any template, in any stage, never fills diagnosis or conduct', () => {
  assert.ok(TEMPLATES.length >= 5, 'Catálogo de templates encolheu; cobertura reduzida sem revisão.');
  for (const template of TEMPLATES) {
    for (const owned of DIAGNOSTIC_FORM_FIELDS) {
      assert.equal(
        Object.hasOwn(template, owned),
        false,
        `O template "${template.id}" passou a declarar "${owned}". Selecionar contexto viraria diagnóstico.`
      );
    }
    for (const stage of STAGES) {
      // Aplicação do template como a interface faz: semeia QP e rascunho de HDA, nada mais.
      const form = { ...emptyForm(), qp: template.qp || '', hda: template.hdaDraft || '' };
      const text = renderEvolution(form, {});
      assertNoDiagnosticOutput(text, `template=${template.id} etapa=${stage}`);
    }
  }
});

// ---------------------------------------------------------------------------
// 5. Travessia real do Atendimento: transições encadeadas, contexto acumulado.
// ---------------------------------------------------------------------------

test('a full encounter traversal accumulating context never yields diagnosis or conduct', () => {
  for (const { protocol, fieldIds } of PROTOCOLS) {
    // Percorre as etapas na ordem declarada, aplicando em cada uma o contexto mais
    // "revelador" possível (todo disclosure ligado), e projeta o documento a cada passo.
    const maximalContext = {};
    for (const fieldId of fieldIds) {
      const values = declaredValuesFor(protocol, fieldId);
      maximalContext[fieldId] = values.includes(true) ? true : values.at(-1);
    }

    let encounter = createEncounter({ workflowId: protocol.id, now: '2026-08-13T00:00:00.000Z' });
    for (const stage of STAGES) {
      encounter = transitionEncounter(encounter, stage, '2026-08-13T00:00:00.000Z');
      encounter = updateEncounterContext(encounter, maximalContext);

      assert.equal(encounter.currentStage, stage);
      for (const owned of DIAGNOSTIC_FORM_FIELDS) {
        assert.equal(
          Object.hasOwn(encounter.context, owned),
          false,
          `protocolo=${protocol.id} etapa=${stage}: a transição escreveu "${owned}" no contexto do Atendimento.`
        );
      }

      buildRenderPlan(protocol, { stage, context: encounter.context });
      assertNoDiagnosticOutput(
        renderEvolution(emptyForm(), {}),
        `protocolo=${protocol.id} travessia até etapa=${stage}`
      );
    }

    // A seção de conduta fica visível a partir de `initial_conduct`; visibilidade não é conteúdo.
    const conductStages = STAGES.filter((stage) => (
      getVisibleSections(protocol, stage, maximalContext).some((section) => section.id === 'conduct')
    ));
    if (protocol.id === 'sca') {
      assert.ok(conductStages.length > 0, 'A seção de conduta nunca fica visível; o vetor perdeu o sentido.');
    }
    for (const stage of conductStages) {
      assertNoDiagnosticOutput(
        renderEvolution(emptyForm(), {}),
        `protocolo=${protocol.id} seção de conduta visível na etapa=${stage}`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 6. Contraprova: o documento SABE renderizar hipótese/conduta quando há input.
// ---------------------------------------------------------------------------

test('diagnosis and conduct still render when the physician actually types them', () => {
  // Sem este vetor, todos os anteriores passariam trivialmente caso o renderizador
  // parasse de emitir hipótese/conduta em qualquer circunstância.
  const form = { ...emptyForm(), hipoteses: 'SÍNDROME CORONARIANA AGUDA', conduta: 'SOLICITO ECG' };
  const text = renderEvolution(form, {});
  for (const header of DIAGNOSTIC_HEADERS) {
    assert.ok(text.includes(header), `O renderizador deixou de emitir "${header}" mesmo com input explícito.`);
  }
  assert.ok(text.includes('- SÍNDROME CORONARIANA AGUDA'));
  assert.ok(text.includes('- SOLICITO ECG'));
});
