import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

/**
 * Gate executável de INV-GOV-001 — "teste verde ≠ invariant garantido".
 *
 * O registry declara os invariantes críticos em prosa. Até este gate existir,
 * nenhum teste referenciava um invariante por id: a ligação "invariante → teste
 * que o protege" existia apenas na cabeça de quem escreveu. Foi exatamente assim
 * que a proteção de INV-CLIN-001 foi apagada junto com a regressão que ela
 * impedia, sem que a suíte acusasse nada (AUD-2026-08-13-001).
 *
 * ── Cobertura declarada, nunca presumida ──────────────────────────────────────
 * A segunda leitura de Lead Engineering apontou que a versão anterior deste gate
 * afirmava cobertura integral de invariantes cujos protetores só cobriam parte da
 * propriedade. Um gate que superestima cobertura é pior do que nenhum gate: ele
 * converte lacuna conhecida em falsa segurança.
 *
 * Por isso cada invariante declara explicitamente `full` ou `partial`. Cobertura
 * parcial é legítima — o que não é legítimo é parcial disfarçada de integral. As
 * lacunas ficam visíveis na saída da suíte e devem estar registradas no
 * SHARED_AUDIT_LOG.md.
 *
 * ── Anti-circularidade ───────────────────────────────────────────────────────
 * INV-GOV-001 não pode ser protegido apenas por este arquivo: se ele for apagado,
 * não sobra ninguém para denunciar a própria ausência. A âncora externa vive em
 * tests/integration-static.test.mjs, que por sua vez é mapeada aqui — apagar
 * qualquer um dos dois quebra a suíte pelo outro.
 *
 * Limite residual honesto: apagar os DOIS arquivos derrota o mecanismo. Nenhum
 * gate interno à suíte protege contra a remoção da própria suíte; isso é
 * responsabilidade de revisão/branch protection, não de teste.
 *
 * O registry é lido como fonte de verdade e NÃO é modificado por este gate:
 * pertence ao owner "documentação canônica" (Lead Engineering).
 */

const REGISTRY_URL = new URL('../docs/clinical/INVARIANT_REGISTRY.md', import.meta.url);
const TESTS_DIR = new URL('./', import.meta.url);

const COVERAGE = Object.freeze({
  FULL: 'full',
  PARTIAL: 'partial'
});

/**
 * Mapeamento declarado: invariante → testes que efetivamente o protegem.
 *
 * Critério de inclusão de um protetor: o teste falha se a propriedade do
 * invariante for violada. Um teste que apenas exercita o módulo relacionado, sem
 * asserção sobre a propriedade, não conta como protetor.
 *
 * `coverage: PARTIAL` exige `gap` descrevendo, em texto verificável por leitura,
 * o que os protetores NÃO provam.
 */
const PROTECTED_BY = Object.freeze({
  'INV-CLIN-001': {
    coverage: COVERAGE.FULL,
    protectors: [
      ['clinical-safety-invariants.test.mjs', 'legacy syndrome templates never prewrite clinical negatives'],
      ['clinical-safety-invariants.test.mjs', 'free-text HDA does not gain findings when no conditional flag was confirmed'],
      ['hda-composer.test.mjs', 'diarrhea selection opens an integral HDA without fabricated negatives'],
      ['hda-composer.test.mjs', 'default diarrhea findings all start unknown'],
      ['hda-composer.test.mjs', 'unknown findings stay absent instead of being converted to negatives'],
      ['document-engine.test.mjs', 'empty HPP fields never become NEGA'],
      ['clinical-state.test.mjs', 'new clinical field starts unconfirmed and does not authorize rendering']
    ]
  },

  'INV-CLIN-002': {
    coverage: COVERAGE.FULL,
    protectors: [
      ['document-engine.test.mjs', 'unconfirmed physical exam is omitted'],
      ['document-engine.test.mjs', 'confirmed normal template authorizes physical exam rendering'],
      ['clinical-state.test.mjs', 'confirmed template records explicit physician action and template identity']
    ]
  },

  'INV-CLIN-003': {
    coverage: COVERAGE.FULL,
    protectors: [
      ['templates.test.mjs', 'templates do not inject diagnosis or conduct into the medical record'],
      ['context-coordination.test.mjs', 'template compatibility depends only on explicit protocol metadata, never on QP text'],
      ['protocol-engine.test.mjs', 'sections owned by the evolution form are not rendered by the protocol layer'],
      ['protocol-engine.test.mjs', 'default context exposes only protocol owned fields and never invents values'],
      ['context-never-diagnoses.test.mjs', 'no stage/context combination produces diagnosis or conduct in the final document'],
      ['context-never-diagnoses.test.mjs', 'context values never leak into the document as clinical text'],
      ['context-never-diagnoses.test.mjs', 'progressive disclosure changes only visibility, never field values'],
      ['context-never-diagnoses.test.mjs', 'the render plan never exposes fields owned by the evolution form, in any stage'],
      ['context-never-diagnoses.test.mjs', 'default context never carries diagnosis or conduct, in any stage'],
      ['context-never-diagnoses.test.mjs', 'selecting any template, in any stage, never fills diagnosis or conduct'],
      ['context-never-diagnoses.test.mjs', 'a full encounter traversal accumulating context never yields diagnosis or conduct'],
      ['context-never-diagnoses.test.mjs', 'the enumerated stage space covers every declared workflow stage'],
      ['context-never-diagnoses.test.mjs', 'every declared protocol is loaded into the enumerated space'],
      ['context-never-diagnoses.test.mjs', 'the enumerated disclosure space never shrinks below its anchored floor'],
      ['context-never-diagnoses.test.mjs', 'diagnosis and conduct still render when the physician actually types them'],

      // Ponte de composição — o que a revisão bloqueante de `7a947f4` exigia e que os
      // protetores acima, sozinhos, não entregavam. Os vetores de enumeração calculavam
      // plan/visible/context e depois renderizavam `emptyForm()`, sem transportar o estado
      // produzido pelo contexto até o document engine.
      //
      // `context-composition-bridge.test.mjs` entrega ao document engine o par
      // (form, clinicalState) PRODUZIDO pelos escritores reais — template, intake livre,
      // composers de HDA e funções de confirmação de proveniência — e traz âncora
      // anti-trivialidade que reprova se esse formulário voltar a chegar vazio.
      ['context-composition-bridge.test.mjs', 'the composed form handed to the document engine is populated, never empty'],
      ['context-composition-bridge.test.mjs', 'every template, composed through the real boundary, yields no diagnosis or conduct'],
      ['context-composition-bridge.test.mjs', 'every progressive-disclosure flag subset, composed into the HDA, yields no diagnosis'],
      ['context-composition-bridge.test.mjs', 'a full encounter traversal, with composed form and state, yields no diagnosis or conduct'],
      ['context-composition-bridge.test.mjs', 'the structured HDA composer never asserts a finding that was not explicitly marked'],
      ['context-composition-bridge.test.mjs', 'the application source has no write path from context into diagnosis or conduct fields'],
      ['context-composition-bridge.test.mjs', 'the same composed pipeline still renders diagnosis and conduct when the physician types them']
    ]
  },

  'INV-SCORE-001': {
    coverage: COVERAGE.FULL,
    protectors: [
      ['scores.test.mjs', 'score starts incomplete with null score and unanswered variables'],
      ['scores.test.mjs', 'partially answered score remains incomplete and has no interpretation'],
      ['scores.test.mjs', 'Glasgow is incomplete until all three components are informed']
    ]
  },

  'INV-SCORE-002': {
    coverage: COVERAGE.FULL,
    protectors: [
      ['tool-state.test.mjs', 'tool can be available without being applicable'],
      ['tool-state.test.mjs', 'applicable HEART remains not calculable while troponin is missing'],
      ['document-tool-application.test.mjs', 'calculable but unapplied tool stays out of the clinical document']
    ]
  },

  'INV-DOC-001': {
    coverage: COVERAGE.FULL,
    protectors: [
      ['document-tool-application.test.mjs', 'calculable but unapplied tool stays out of the clinical document'],
      ['reassessment-document.test.mjs', 'scores section disappears when no score is applied and calculable'],
      ['document-operational-state.test.mjs', 'an applied score publishes only its score and interpretation, never the operational fields carried alongside'],
      ['document-operational-state.test.mjs', 'the reassessment renderer ignores encounter fields it was never authorized to publish'],
      ['document-operational-state.test.mjs', 'the evolution renderer ignores encounter fields it was never authorized to publish'],
      ['document-operational-state.test.mjs', 'a pending item whose label reads like clinical text still never reaches the document']
    ]
  },

  'INV-TEMP-001': {
    coverage: COVERAGE.FULL,
    protectors: [
      ['workflow-engine.test.mjs', 'reassessing creates a temporal child event without overwriting admission snapshot'],
      ['workflow-engine.test.mjs', 'admission snapshot can be refreshed before reassessment and becomes immutable afterwards'],
      ['reassessment-document.test.mjs', 'reassessment preserves exact QP inline quoted format and admission HDA label']
    ]
  },

  'INV-STOR-001': {
    coverage: COVERAGE.FULL,
    protectors: [
      ['storage-io.test.mjs', 'missing storage adapter is an explicit persistence failure, never missing data'],
      ['storage-io.test.mjs', 'corrupted stored JSON never masquerades as absent data'],
      ['storage-io.test.mjs', 'storage writes never fail silently']
    ]
  },

  'INV-METRIC-001': {
    coverage: COVERAGE.FULL,
    protectors: [
      ['productivity.test.mjs', 'invalid or missing encounter timestamps are ignored'],
      ['productivity.test.mjs', 'one encounter without an explicit live clock does not fabricate a patients per hour value'],
      ['productivity.test.mjs', 'zero or negative duration returns no numeric productivity rate'],
      ['product-convergence.test.mjs', 'productivity reader does not report corrupted encounter state as zero patients']
    ]
  },

  'INV-GOV-001': {
    coverage: COVERAGE.FULL,
    protectors: [
      ['integration-static.test.mjs', 'the invariant coverage gate exists and is wired to the clinical registry'],
      ['workflow-security.test.mjs', 'the CI guard for critical safety sentinels cannot be removed silently'],
      ['invariant-coverage.test.mjs', 'every invariant declared in the registry has a declared coverage decision'],
      ['invariant-coverage.test.mjs', 'every mapped protecting test still exists with the exact declared name']
    ]
  }
});

function readRegistry() {
  return readFileSync(REGISTRY_URL, 'utf8');
}

function registryInvariantIds(registry) {
  return [...registry.matchAll(/^###\s+(INV-[A-Z]+-\d+)\b/gm)].map((match) => match[1]);
}

function readTestFile(fileName) {
  const url = new URL(fileName, TESTS_DIR);
  return existsSync(url) ? readFileSync(url, 'utf8') : null;
}

function declaresTest(source, testName) {
  const escaped = testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`test\\(\\s*(['"\`])${escaped}\\1`).test(source);
}

test('every invariant declared in the registry has a declared coverage decision', () => {
  const ids = registryInvariantIds(readRegistry());

  assert.ok(
    ids.length > 0,
    'nenhum invariante encontrado em INVARIANT_REGISTRY.md — o formato dos títulos mudou e este gate deixou de enxergar o registry'
  );

  const undeclared = ids.filter((id) => !(PROTECTED_BY[id]?.protectors?.length > 0));

  assert.deepEqual(
    undeclared,
    [],
    `invariante(s) sem proteção declarada: ${undeclared.join(', ')}. `
      + 'Um invariante crítico sem teste rastreável é uma promessa em prosa. Mapeie o protetor '
      + 'em PROTECTED_BY, ou registre explicitamente no SHARED_AUDIT_LOG.md que ele permanece descoberto.'
  );
});

test('partial coverage is always declared with an explicit gap, never disguised as full', () => {
  const malformed = [];

  for (const [invariant, entry] of Object.entries(PROTECTED_BY)) {
    if (![COVERAGE.FULL, COVERAGE.PARTIAL].includes(entry.coverage)) {
      malformed.push(`${invariant}: coverage inválido (${entry.coverage})`);
      continue;
    }
    if (entry.coverage === COVERAGE.PARTIAL && !(entry.gap?.trim().length > 0)) {
      malformed.push(`${invariant}: declarado PARTIAL sem descrever a lacuna`);
    }
    if (entry.coverage === COVERAGE.FULL && entry.gap) {
      malformed.push(`${invariant}: declarado FULL mas descreve lacuna — use PARTIAL`);
    }
  }

  assert.deepEqual(
    malformed,
    [],
    `declaração de cobertura malformada:\n  ${malformed.join('\n  ')}\n`
      + 'Cobertura parcial é legítima; parcial disfarçada de integral não é. '
      + 'Um gate que superestima cobertura converte lacuna conhecida em falsa segurança.'
  );
});

test('every mapped protecting test still exists with the exact declared name', () => {
  const missing = [];

  for (const [invariant, entry] of Object.entries(PROTECTED_BY)) {
    for (const [fileName, testName] of entry.protectors) {
      const source = readTestFile(fileName);
      if (source === null) {
        missing.push(`${invariant}: arquivo ausente → tests/${fileName}`);
        continue;
      }
      if (!declaresTest(source, testName)) {
        missing.push(`${invariant}: teste ausente ou renomeado → tests/${fileName} :: '${testName}'`);
      }
    }
  }

  assert.deepEqual(
    missing,
    [],
    `proteção de invariante removida ou renomeada sem atualizar o mapeamento:\n  ${missing.join('\n  ')}\n`
      + 'Isto é o INV-GOV-001 em ação. Se a remoção for intencional, aponte o novo protetor '
      + 'equivalente em PROTECTED_BY e registre a segunda leitura — não apague a linha para a '
      + 'suíte voltar ao verde.'
  );
});

test('the mapping never claims to protect an invariant the registry no longer declares', () => {
  const ids = new Set(registryInvariantIds(readRegistry()));
  const orphans = Object.keys(PROTECTED_BY).filter((id) => !ids.has(id));

  assert.deepEqual(
    orphans,
    [],
    `mapeamento aponta para invariante inexistente no registry: ${orphans.join(', ')}. `
      + 'O invariante foi renomeado ou removido; reconcilie o mapeamento com o registry.'
  );
});

test('INV-GOV-001 is anchored outside this file so its own deletion is detectable', () => {
  const anchors = PROTECTED_BY['INV-GOV-001'].protectors
    .filter(([fileName]) => fileName !== 'invariant-coverage.test.mjs');

  assert.ok(
    anchors.length > 0,
    'INV-GOV-001 ficaria circularmente protegido apenas por este arquivo: apagá-lo removeria '
      + 'junto a capacidade de denunciar a própria ausência. Mantenha ao menos uma âncora externa.'
  );

  for (const [fileName, testName] of anchors) {
    const source = readTestFile(fileName);
    assert.ok(source !== null, `âncora externa ausente → tests/${fileName}`);
    assert.ok(
      declaresTest(source, testName),
      `âncora externa presente mas sem o teste declarado → tests/${fileName} :: '${testName}'`
    );
  }
});

test('declared coverage gaps are surfaced, never silent', () => {
  const partial = Object.entries(PROTECTED_BY)
    .filter(([, entry]) => entry.coverage === COVERAGE.PARTIAL)
    .map(([invariant, entry]) => `${invariant}: ${entry.gap}`);

  for (const line of partial) {
    console.log(`[COBERTURA PARCIAL DECLARADA] ${line}`);
  }

  const full = Object.values(PROTECTED_BY).filter((entry) => entry.coverage === COVERAGE.FULL).length;
  console.log(`[COBERTURA] ${full} integral / ${partial.length} parcial de ${Object.keys(PROTECTED_BY).length} invariantes`);

  assert.ok(Object.keys(PROTECTED_BY).length > 0);
});
