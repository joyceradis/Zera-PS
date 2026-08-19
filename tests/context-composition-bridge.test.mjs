// INV-CLIN-003 — ponte de composição real.
//
// Este arquivo existe para fechar uma lacuna que foi apontada contra o meu próprio trabalho
// e que estava correta. `context-never-diagnoses.test.mjs` enumera exaustivamente o espaço
// declarativo etapa × contexto, mas calculava `plan`/`visible` e em seguida chamava
// `renderEvolution(emptyForm(), {})`. O estado produzido pelo contexto nunca era transportado
// até o document engine, então a asserção provada era próxima de trivial: renderizar um
// formulário vazio não produz hipótese nem conduta.
//
// A regra de composição hoje canônica em docs/architecture/AGENT_COORDINATION.md exige:
//
//     contexto/progressive disclosure
//     → coordenador real
//     → estado/formulário entregue ao document engine
//     → documento final
//
// Aqui o formulário entregue ao document engine é PRODUZIDO pelos escritores reais —
// os mesmos módulos que a interface usa para escrever QP/HDA e estado clínico — e existe
// uma âncora anti-trivialidade que reprova se esse formulário voltar a chegar vazio.
//
// Escopo honesto: isto cobre a composição entre módulos. Não cobre DOM real, evento real
// de interface, nem PWA/offline. Esses gates continuam abertos e não são reivindicados aqui.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { matchTriggerGroups, composeHdaFromQp, TRIGGER_GROUPS } from '../src/clinical-intake.js';
import {
  HDA_FACT_STATE,
  emptyDiarrheaHdaState,
  defaultDiarrheaHdaState,
  composeDiarrheaHda,
  synchronizeGeneratedHda
} from '../src/hda-composer.js';
import {
  createClinicalField,
  confirmObserved,
  confirmDenied,
  confirmTemplate,
  canRenderClinicalField
} from '../assets/clinical-state.js';
import {
  WORKFLOW_STAGES,
  createEncounter,
  transitionEncounter,
  updateEncounterContext
} from '../src/workflow-engine.js';
import { buildRenderPlan, defaultContext } from '../src/protocol-engine.js';
import { decideTemplateReplacement, CONTEXT_DECISIONS } from '../src/context-coordination.js';
import { emptyClinicalState } from '../assets/storage.js';
import { TEMPLATES } from '../assets/templates.js';
import { NORMAL_EXAM_TEMPLATE } from '../assets/data.js';
import { renderEvolution } from '../assets/document-engine.js';
import { SCA_PROTOCOL } from '../protocols/sca.js';

const STAGES = Object.freeze(Object.values(WORKFLOW_STAGES));
const DIAGNOSTIC_HEADERS = Object.freeze(['# HIPÓTESES DIAGNÓSTICAS:', '# CONDUTA:']);
const DIAGNOSTIC_FORM_FIELDS = Object.freeze(['hipoteses', 'conduta']);
const HPP_KEYS = Object.freeze(['comorbidades', 'muc', 'alergias', 'habitos', 'cirurgias']);

const FIXED_NOW = '2026-08-13T00:00:00.000Z';

function emptyForm() {
  return {
    qp: '', hda: '', laboratoriais: '', imagem: '',
    hipoteses: '', conduta: '', includeEmTempo: false, emTempo: ''
  };
}

/**
 * Reproduz a sequência de escrita que o Atendimento executa, usando SOMENTE os escritores
 * reais exportados pelos módulos. Nada aqui reimplementa regra clínica: template semeia
 * QP/rascunho de HDA, o intake livre recompõe a HDA pelos composers, e o estado clínico é
 * escrito pelas funções de confirmação de proveniência.
 *
 * O retorno é o par (form, clinicalState) que `generateEvolution()` entrega ao document
 * engine — é esse par, e não um formulário vazio, que os vetores abaixo renderizam.
 */
function composeThroughRealBoundary({
  template = null,
  freeText = '',
  selectedFlags = [],
  diarrheaState = null,
  confirmNormalExam = false,
  denyHpp = false,
  labText = '',
  imageText = '',
  protocol = SCA_PROTOCOL,
  stages = STAGES,
  context = null
} = {}) {
  const form = emptyForm();
  const clinicalState = emptyClinicalState();

  // 1. Seleção de contexto sindrômico (template) — coordenador real decide, depois semeia.
  if (template) {
    const decision = decideTemplateReplacement({
      previousSelection: null,
      previousTemplate: null,
      nextSelection: { templateId: template.id },
      form
    });
    assert.equal(
      decision.status,
      CONTEXT_DECISIONS.ALLOW,
      `template=${template.id}: o coordenador recusou a primeira seleção; o vetor não exercitaria a ponte.`
    );
    form.qp = template.qp || '';
    form.hda = template.hdaDraft || '';
  }

  // 2. Intake de texto livre + progressive disclosure: os flags revelados são escritos na HDA
  //    pelo composer real, não por concatenação local.
  if (freeText) {
    const groups = matchTriggerGroups(freeText);
    const allowed = new Set(groups.flatMap((group) => group.flags));
    const applied = selectedFlags.filter((flag) => allowed.has(flag));
    form.qp = freeText;
    form.hda = composeHdaFromQp(freeText, applied);
  }

  // 3. Composer estruturado de HDA, sincronizado como a interface sincroniza.
  if (diarrheaState) {
    const next = composeDiarrheaHda(diarrheaState);
    form.hda = synchronizeGeneratedHda({
      currentText: form.hda,
      previousGeneratedText: form.hda,
      nextGeneratedText: next
    }).text;
  }

  // 4. Estado clínico com proveniência — as únicas portas de escrita que existem.
  if (confirmNormalExam) {
    clinicalState.physicalExam.template = confirmTemplate(
      NORMAL_EXAM_TEMPLATE.id,
      NORMAL_EXAM_TEMPLATE.values,
      { confirmedAt: FIXED_NOW }
    );
    for (const [key, value] of Object.entries(NORMAL_EXAM_TEMPLATE.values)) {
      clinicalState.physicalExam.fields[key] = confirmObserved(
        clinicalState.physicalExam.fields[key] || createClinicalField(),
        value,
        { confirmedAt: FIXED_NOW }
      );
    }
  }
  if (denyHpp) {
    for (const key of HPP_KEYS) {
      clinicalState.hpp[key] = confirmDenied(
        clinicalState.hpp[key] || createClinicalField(),
        { source: 'patient', confirmedAt: FIXED_NOW }
      );
    }
  }

  form.laboratoriais = labText;
  form.imagem = imageText;

  // 5. Travessia temporal real, acumulando contexto de disclosure a cada etapa.
  let encounter = createEncounter({ workflowId: protocol.id, now: FIXED_NOW });
  const appliedContext = context || defaultContext(protocol);
  for (const stage of stages) {
    encounter = transitionEncounter(encounter, stage, FIXED_NOW);
    encounter = updateEncounterContext(encounter, appliedContext);
    buildRenderPlan(protocol, { stage, context: encounter.context });
  }

  return { form, clinicalState, encounter };
}

function assertNoDiagnosticOutput(text, label) {
  for (const header of DIAGNOSTIC_HEADERS) {
    assert.equal(
      text.includes(header),
      false,
      `${label}: o documento passou a conter "${header}" sem que hipótese/conduta fossem ` +
      'digitadas. Contexto ou disclosure virou diagnóstico — INV-CLIN-003 violado.'
    );
  }
}

// ---------------------------------------------------------------------------
// 1. Âncora anti-trivialidade — o motivo pelo qual a versão anterior não valia.
// ---------------------------------------------------------------------------

test('the composed form handed to the document engine is populated, never empty', () => {
  // Sem esta âncora, todo vetor deste arquivo poderia voltar a passar pelo motivo errado:
  // renderizar um formulário vazio nunca produz hipótese nem conduta. Ela reprova se a
  // composição parar de escrever, que foi exatamente a fragilidade da rodada anterior.
  const { form, clinicalState } = composeThroughRealBoundary({
    template: TEMPLATES[0],
    freeText: 'CEFALEIA HÁ 2 HORAS, INÍCIO SÚBITO',
    selectedFlags: ['Início súbito / pior dor'],
    confirmNormalExam: true,
    denyHpp: true,
    labText: 'HB: 13.2\nLEUCO: 9.800',
    imageText: 'TC DE CRÂNIO SEM ALTERAÇÕES AGUDAS'
  });

  assert.ok(form.qp.trim().length > 0, 'A composição não escreveu QP; a ponte está inerte.');
  assert.ok(form.hda.trim().length > 0, 'A composição não escreveu HDA; a ponte está inerte.');
  assert.ok(
    Object.values(clinicalState.physicalExam.fields).some(canRenderClinicalField),
    'Nenhum campo de exame físico ficou renderizável; o estado clínico não atravessou a ponte.'
  );
  assert.ok(
    HPP_KEYS.some((key) => canRenderClinicalField(clinicalState.hpp[key])),
    'Nenhum campo de HPP ficou renderizável; o estado clínico não atravessou a ponte.'
  );

  const text = renderEvolution(form, clinicalState);
  for (const section of ['# QP:', '# HDA:', '# HPP:', '# EXAME FÍSICO:', '# EXAMES COMPLEMENTARES:']) {
    assert.ok(
      text.includes(section),
      `O documento composto não contém "${section}". Se o documento chega pobre, os vetores ` +
      'de ausência de diagnóstico passam trivialmente e não provam a ponte.'
    );
  }
  assertNoDiagnosticOutput(text, 'documento composto de referência');
});

// ---------------------------------------------------------------------------
// 2. A propriedade, agora sobre o formulário realmente produzido pela composição.
// ---------------------------------------------------------------------------

test('every template, composed through the real boundary, yields no diagnosis or conduct', () => {
  assert.ok(TEMPLATES.length >= 5, 'Catálogo de templates encolheu; cobertura reduzida sem revisão.');
  for (const template of TEMPLATES) {
    const { form, clinicalState } = composeThroughRealBoundary({
      template,
      confirmNormalExam: true,
      denyHpp: true
    });

    for (const owned of DIAGNOSTIC_FORM_FIELDS) {
      assert.equal(
        form[owned],
        '',
        `template=${template.id}: a composição escreveu em "${owned}". Selecionar contexto ` +
        'sindrômico passou a produzir diagnóstico/conduta.'
      );
    }

    const text = renderEvolution(form, clinicalState);
    assert.ok(text.includes('# QP:'), `template=${template.id}: o formulário composto chegou vazio.`);
    assertNoDiagnosticOutput(text, `template=${template.id} pela ponte de composição`);
  }
});

test('every progressive-disclosure flag subset, composed into the HDA, yields no diagnosis', () => {
  // Espaço exaustivo por grupo de gatilho: cada grupo tem N flags, e todo subconjunto do
  // conjunto de potência é exercido. Um grupo novo ou uma flag nova entram sozinhos.
  let subsets = 0;
  for (const group of TRIGGER_GROUPS) {
    const freeText = group.keywords[0];
    const total = 2 ** group.flags.length;
    for (let mask = 0; mask < total; mask += 1) {
      const selectedFlags = group.flags.filter((_, index) => (mask >> index) & 1);
      const { form, clinicalState } = composeThroughRealBoundary({ freeText, selectedFlags });

      const label = `grupo=${group.id} flags=${JSON.stringify(selectedFlags)}`;
      for (const owned of DIAGNOSTIC_FORM_FIELDS) {
        assert.equal(form[owned], '', `${label}: revelar ponto de atenção escreveu em "${owned}".`);
      }
      // A flag selecionada tem de aparecer na HDA — senão o vetor não exercita disclosure.
      for (const flag of selectedFlags) {
        assert.ok(
          form.hda.includes(flag),
          `${label}: a flag "${flag}" não foi escrita na HDA; o disclosure não atravessou a ponte.`
        );
      }
      assertNoDiagnosticOutput(renderEvolution(form, clinicalState), label);
      subsets += 1;
    }
  }
  const expected = TRIGGER_GROUPS.reduce((total, group) => total + 2 ** group.flags.length, 0);
  assert.equal(subsets, expected, 'Nem todos os subconjuntos de disclosure foram exercidos.');
  assert.ok(subsets >= 40, `Espaço de disclosure exercido pequeno demais (${subsets} subconjuntos).`);
});

test('a full encounter traversal, with composed form and state, yields no diagnosis or conduct', () => {
  // Travessia real das etapas com contexto acumulado E formulário composto — a combinação
  // que faltava. Cada etapa projeta o documento a partir do estado realmente acumulado.
  for (const template of TEMPLATES) {
    for (const stage of STAGES) {
      const { form, clinicalState, encounter } = composeThroughRealBoundary({
        template,
        confirmNormalExam: true,
        denyHpp: true,
        stages: STAGES.slice(0, STAGES.indexOf(stage) + 1)
      });

      assert.equal(encounter.currentStage, stage);
      for (const owned of DIAGNOSTIC_FORM_FIELDS) {
        assert.equal(
          Object.hasOwn(encounter.context, owned),
          false,
          `template=${template.id} etapa=${stage}: a travessia escreveu "${owned}" no contexto.`
        );
        assert.equal(
          form[owned],
          '',
          `template=${template.id} etapa=${stage}: a travessia escreveu "${owned}" no formulário.`
        );
      }
      assertNoDiagnosticOutput(
        renderEvolution(form, clinicalState),
        `template=${template.id} travessia composta até etapa=${stage}`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 3. O composer estruturado não inventa achado — nem em rascunho.
// ---------------------------------------------------------------------------

test('the structured HDA composer never asserts a finding that was not explicitly marked', () => {
  const untouched = composeDiarrheaHda(emptyDiarrheaHdaState());
  for (const verb of ['REFERE', 'NEGA', 'APRESENTA']) {
    assert.equal(
      untouched.includes(verb),
      false,
      `Com todos os achados em UNKNOWN, o composer emitiu "${verb}". Ausência de informação ` +
      'virou afirmação clínica.'
    );
  }

  // Rascunho: emite placeholders, jamais afirmação clínica ou conduta.
  const draft = composeDiarrheaHda(defaultDiarrheaHdaState());
  for (const verb of ['REFERE', 'NEGA', 'APRESENTA']) {
    assert.equal(draft.includes(verb), false, `O rascunho do composer emitiu "${verb}".`);
  }

  // Contraprova: marcado explicitamente, o achado precisa aparecer.
  const marked = composeDiarrheaHda({
    ...emptyDiarrheaHdaState(),
    findings: { ...emptyDiarrheaHdaState().findings, fever: HDA_FACT_STATE.PRESENT }
  });
  assert.ok(marked.includes('REFERE FEBRE'), 'O composer deixou de registrar achado marcado como presente.');

  // E o texto composto, entregue ao documento, não vira hipótese/conduta.
  const { form, clinicalState } = composeThroughRealBoundary({
    template: TEMPLATES.find((item) => item.composer === 'sindrome-diarreica') || TEMPLATES[0],
    diarrheaState: {
      ...emptyDiarrheaHdaState(),
      onsetValue: '3',
      findings: { ...emptyDiarrheaHdaState().findings, fever: HDA_FACT_STATE.PRESENT }
    }
  });
  assert.ok(form.hda.includes('REFERE FEBRE'), 'O composer não escreveu na HDA pela ponte.');
  assertNoDiagnosticOutput(renderEvolution(form, clinicalState), 'HDA composta estruturalmente');
});

// ---------------------------------------------------------------------------
// 4. Guarda estrutural: na aplicação real não existe caminho de escrita de contexto
//    para os campos de diagnóstico/conduta.
// ---------------------------------------------------------------------------

test('the application source has no write path from context into diagnosis or conduct fields', async () => {
  // A ponte comportamental acima prova que a composição atual não escreve nesses campos.
  // Esta guarda prova algo mais forte e mais durável: no código real da aplicação, os nós
  // `hipoteses` e `conduta` só são LIDOS. O único escritor é a restauração de rascunho, que
  // devolve o que a própria médica digitou antes.
  const sources = Object.fromEntries(await Promise.all(
    ['assets/app.js', 'src/product-convergence.js', 'src/temporal-ui.js'].map(async (path) => [
      path,
      await readFile(new URL(`../${path}`, import.meta.url), 'utf8')
    ])
  ));

  for (const [path, source] of Object.entries(sources)) {
    for (const field of ['hipoteses', 'conduta', 'reav-conduta', 'int-justificativa']) {
      // Escrita direta: $('campo').value = ... ou getElementById('campo').value = ...
      const directWrite = new RegExp(
        `(?:\\$\\(|getElementById\\()\\s*['"]${field}['"]\\s*\\)[^\\n;]*\\.value\\s*=[^=]`,
        'g'
      );
      const matches = source.match(directWrite) || [];
      // `int-justificativa` tem escritor legítimo e declarado: o botão de puxar dados da
      // Evolução, acionado explicitamente pela médica. Os campos do prontuário, não.
      const allowed = field === 'int-justificativa' ? matches.length : 0;
      assert.equal(
        matches.length,
        allowed,
        `${path}: apareceu escrita direta em "${field}" (${matches.length} ocorrência(s), ` +
        `esperado ${allowed}). Um caminho novo de escrita nesses campos precisa de segunda ` +
        'leitura: é por ali que contexto viraria diagnóstico.'
      );
    }
  }

  // A restauração genérica existe e é o único escritor por mapa de campos.
  assert.match(
    sources['assets/app.js'],
    /function restoreForm\([\s\S]*?node\.value = form\[key\] \|\| ''/,
    'A restauração de rascunho mudou de forma. Ela é o único escritor autorizado dos campos ' +
    'do prontuário e precisa continuar restaurando apenas o que foi salvo.'
  );
});

// ---------------------------------------------------------------------------
// 5. Contraprova da ponte inteira.
// ---------------------------------------------------------------------------

test('the same composed pipeline still renders diagnosis and conduct when the physician types them', () => {
  // Sem este vetor, todos os anteriores passariam caso o document engine parasse de emitir
  // hipótese/conduta em qualquer circunstância — ou caso a ponte parasse de entregar o form.
  const { form, clinicalState } = composeThroughRealBoundary({
    template: TEMPLATES[0],
    confirmNormalExam: true,
    denyHpp: true
  });
  form.hipoteses = 'SÍNDROME CORONARIANA AGUDA';
  form.conduta = 'SOLICITO ECG\nAAS 300MG VO';

  const text = renderEvolution(form, clinicalState);
  for (const header of DIAGNOSTIC_HEADERS) {
    assert.ok(text.includes(header), `O renderizador deixou de emitir "${header}" mesmo com input explícito.`);
  }
  assert.ok(text.includes('- SÍNDROME CORONARIANA AGUDA'));
  assert.ok(text.includes('- SOLICITO ECG'));
  assert.ok(text.includes('- AAS 300MG VO'), 'A conduta multilinha perdeu itens na transcrição.');
});
