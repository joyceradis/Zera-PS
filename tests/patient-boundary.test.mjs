// Fronteira entre pacientes — nenhum dado do Atendimento anterior sobrevive ao "Limpar".
//
// Origem: `652de53` corrigiu um vazamento real — reavaliação, internação, alta e scores do
// paciente anterior permaneciam na tela após limpar o Atendimento. A correção é boa.
//
// O protetor que a acompanha, porém, é AUTO-REFERENTE:
//
//     for (const id of mod.CONTINUATION_TEXT_IDS) assert.equal(nodes[id].value, '');
//
// Ele itera a própria lista do módulo. Se um campo for removido da lista, o teste continua
// verde sobre um universo menor; e um campo que NUNCA foi adicionado jamais é cobrido. Foi
// exatamente assim que `justification-output` escapou: existe em `app.html`, fica fora do
// `#evolution-form` (logo `form.reset()` não o alcança) e não constava da lista.
//
// Este arquivo quebra a circularidade derivando a exigência do PRÓPRIO `app.html`: todo
// elemento que carrega valor e vive fora do formulário precisa ser explicitamente
// contabilizado. Campo novo entra na exigência sozinho, sem ninguém lembrar de atualizar
// uma lista.
//
// Limite honesto: a derivação cobre campos DECLARADOS em app.html. Campos injetados em
// runtime são contabilizados à parte, abaixo, com a razão verificada no código-fonte.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

/** Corpo de uma função de nível superior, para asserções escopadas em vez de globais. */
function functionBody(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `A função "${name}" sumiu do módulo auditado.`);
  const end = source.indexOf('\n}', start);
  assert.ok(end > start, `A função "${name}" não fecha de forma reconhecível.`);
  return source.slice(start, end);
}

const APP_HTML = read('app.html');
const APP_JS = read('assets/app.js');
const COHERENCE = read('src/product-coherence.js');
const CONVERGENCE = read('src/product-convergence.js');

/**
 * Campos fora do formulário que NÃO são limpos por `resetContinuationState`, cada um com a
 * razão verificada contra o código-fonte. Acrescentar entrada aqui é uma decisão consciente
 * e visível na revisão — que é precisamente o que faltou quando `justification-output` ficou
 * de fora sem ninguém notar.
 */
const ACCOUNTED_ELSEWHERE = Object.freeze({
  'evolution-output': {
    reason: 'limpo explicitamente por clearForm em assets/app.js',
    // A asserção é ESCOPADA ao corpo de clearForm. Verificar a presença do trecho no arquivo
    // inteiro seria insuficiente: `resetDocumentationSurface` contém a mesma expressão como
    // subcadeia, então remover a limpeza de clearForm passaria despercebido. Mutação
    // verificada.
    verify: () => assert.match(
      functionBody(APP_JS, 'clearForm'),
      /\$\('evolution-output'\)\.value = '';/,
      'clearForm deixou de limpar o documento final; ele passa a atravessar a fronteira entre pacientes.'
    )
  },
  'workflow-scenario': {
    reason: 'o cartão de workflow inteiro é removido do DOM por retireLegacyWorkflowSurface',
    verify: () => assert.match(
      COHERENCE,
      /if \(workflowCard\) workflowCard\.remove\(\);/,
      'O cartão legado deixou de ser removido; o seletor de cenário volta a carregar estado entre pacientes.'
    )
  },
  'int-destino': {
    reason: 'select de destino, reposicionado por selectedIndex em resetContinuationState',
    verify: () => assert.match(
      COHERENCE,
      /destination\.selectedIndex = 0/,
      'O destino da internação deixou de ser reposicionado ao limpar o Atendimento.'
    )
  }
});

/** Piso ancorado: a fronteira não pode encolher em silêncio. */
const BOUNDARY_FLOOR = 17;

function formRange(html) {
  const start = html.indexOf('<form id="evolution-form"');
  assert.ok(start >= 0, 'O formulário de evolução sumiu de app.html; a derivação perdeu a referência.');
  const end = html.indexOf('</form>', start);
  assert.ok(end > start, 'O formulário de evolução não fecha em app.html.');
  return [start, end];
}

/** Todo elemento que carrega valor e está declarado FORA do formulário de evolução. */
function valueCarryingOutsideForm(html) {
  const [start, end] = formRange(html);
  const pattern = /<(?:textarea|input|select)\b[^>]*\bid="([\w-]+)"/g;
  const outside = [];
  for (const match of html.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index >= start && index < end) continue;
    outside.push(match[1]);
  }
  return [...new Set(outside)].sort();
}

const BOUNDARY_IDS = valueCarryingOutsideForm(APP_HTML);

function makeDocument(nodes = {}, selectors = {}) {
  return {
    addEventListener() {},
    querySelectorAll(selector) { return selectors[selector] || []; },
    getElementById(id) { return nodes[id] || null; }
  };
}

test('the patient boundary is derived from app.html and never shrinks silently', () => {
  assert.ok(
    BOUNDARY_IDS.length >= BOUNDARY_FLOOR,
    `A fronteira caiu de ${BOUNDARY_FLOOR} para ${BOUNDARY_IDS.length} campos fora do formulário. ` +
    'Ou campos foram removidos de app.html, ou a derivação deixou de enxergá-los. Nos dois casos ' +
    'esta guarda passou a exigir menos do que exigia — atualize BOUNDARY_FLOOR conscientemente.'
  );
  assert.ok(
    BOUNDARY_IDS.includes('justification-output'),
    'O documento de justificativa saiu da derivação; ele foi o campo que originou esta guarda.'
  );
});

test('every value-carrying field outside the evolution form is accounted for at the patient boundary', async () => {
  const { CONTINUATION_TEXT_IDS } = await import(`../src/product-coherence.js?boundary=${BOUNDARY_IDS.length}`);
  const covered = new Set(CONTINUATION_TEXT_IDS);

  const unaccounted = BOUNDARY_IDS.filter((id) => !covered.has(id) && !ACCOUNTED_ELSEWHERE[id]);
  assert.deepEqual(
    unaccounted,
    [],
    `Campo fora do formulário de evolução sem nenhuma contabilização na fronteira entre pacientes: ` +
    `${unaccounted.join(', ')}. form.reset() não alcança esses nós. Ou acrescente o id a ` +
    'CONTINUATION_TEXT_IDS, ou declare a razão em ACCOUNTED_ELSEWHERE com verificação no código.'
  );

  for (const [id, entry] of Object.entries(ACCOUNTED_ELSEWHERE)) {
    assert.ok(
      BOUNDARY_IDS.includes(id),
      `"${id}" está declarado como contabilizado fora da lista, mas não existe mais em app.html. ` +
      'Remova a entrada para que a exceção não sobreviva ao campo que a justificava.'
    );
    entry.verify();
  }
});

test('clearing the Atendimento leaves no field carrying the previous patient', async () => {
  // Vetor comportamental: todo campo derivado recebe conteúdo do paciente anterior e o reset
  // é executado de verdade. Não itera a lista do módulo — itera app.html.
  const clearedByReset = BOUNDARY_IDS.filter((id) => !ACCOUNTED_ELSEWHERE[id]);
  assert.ok(clearedByReset.length > 0, 'Nenhum campo restou para exercitar; o vetor perdeu o sentido.');

  const nodes = Object.fromEntries(clearedByReset.map((id) => [id, { value: `PACIENTE-ANTERIOR:${id}` }]));
  nodes['int-destino'] = { selectedIndex: 2 };

  globalThis.document = makeDocument(nodes, {});
  try {
    const mod = await import(`../src/product-coherence.js?reset=${clearedByReset.length}`);
    mod.resetContinuationState();

    const leaking = clearedByReset.filter((id) => nodes[id]?.value);
    assert.deepEqual(
      leaking,
      [],
      `Após limpar o Atendimento, ${leaking.length} campo(s) ainda carregam o paciente anterior: ` +
      `${leaking.join(', ')}. Isso é contaminação entre pacientes no documento clínico.`
    );
  } finally {
    delete globalThis.document;
  }
});

test('fields injected at runtime live inside the evolution form, where reset reaches them', () => {
  // `justification-exam-name` não existe em app.html: é injetado pela camada de convergência.
  // A derivação acima não o enxerga, então a garantia dele é estrutural — ele é inserido na
  // form-section do botão de justificativa, que vive dentro do formulário.
  assert.match(
    CONVERGENCE,
    /const section = legacyButton\?\.closest\('\.form-section'\)/,
    'O campo de nome do exame deixou de ser inserido na form-section do botão. Se ele passar a ' +
    'viver fora do formulário, form.reset() não o alcança e ele atravessa a fronteira entre pacientes.'
  );
  assert.match(
    CONVERGENCE,
    /input\.id = 'justification-exam-name';/,
    'O campo de nome do exame mudou de identidade; esta guarda deixou de descrevê-lo.'
  );
});
