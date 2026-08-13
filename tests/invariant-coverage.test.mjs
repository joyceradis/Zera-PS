import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

/**
 * Gate executável de INV-GOV-001 — "teste verde ≠ invariant garantido".
 *
 * O registry declara os invariantes críticos em prosa. Até aqui, nenhum teste
 * referenciava um invariante por id: a ligação "invariante → teste que o protege"
 * existia apenas na cabeça de quem escreveu. Foi exatamente assim que a proteção
 * de INV-CLIN-001 foi apagada junto com a regressão que ela impedia, sem que a
 * suíte acusasse nada (AUD-2026-08-13-001).
 *
 * Este arquivo torna essa ligação mecânica. Ele falha quando:
 *   - o registry declara um invariante sem protetor mapeado;
 *   - um arquivo de teste mapeado desaparece;
 *   - um teste nomeado como protetor é removido ou renomeado;
 *   - o mapeamento aponta para um invariante que não existe mais no registry.
 *
 * O registry NÃO é modificado por este gate: ele é lido como fonte de verdade.
 * O arquivo pertence ao owner "documentação canônica" (Lead Engineering).
 *
 * Ao alterar/remover um teste listado aqui, a segunda leitura exigida pelo
 * INV-GOV-001 deixa de ser opcional: a suíte quebra e obriga a decisão explícita.
 */

const REGISTRY_URL = new URL('../docs/clinical/INVARIANT_REGISTRY.md', import.meta.url);
const TESTS_DIR = new URL('./', import.meta.url);

/**
 * Mapeamento declarado: invariante → testes que efetivamente o protegem.
 *
 * Critério de inclusão: o teste falha se a propriedade do invariante for violada.
 * Um teste que apenas exercita o módulo relacionado, sem asserção sobre a
 * propriedade, não conta como protetor e não deve ser listado aqui.
 */
const PROTECTED_BY = Object.freeze({
  'INV-CLIN-001': [
    ['clinical-safety-invariants.test.mjs', 'legacy syndrome templates never prewrite clinical negatives'],
    ['clinical-safety-invariants.test.mjs', 'free-text HDA does not gain findings when no conditional flag was confirmed'],
    ['hda-composer.test.mjs', 'diarrhea selection opens an integral HDA without fabricated negatives'],
    ['hda-composer.test.mjs', 'default diarrhea findings all start unknown'],
    ['hda-composer.test.mjs', 'unknown findings stay absent instead of being converted to negatives'],
    ['document-engine.test.mjs', 'empty HPP fields never become NEGA'],
    ['clinical-state.test.mjs', 'new clinical field starts unconfirmed and does not authorize rendering']
  ],
  'INV-CLIN-002': [
    ['document-engine.test.mjs', 'unconfirmed physical exam is omitted'],
    ['document-engine.test.mjs', 'confirmed normal template authorizes physical exam rendering'],
    ['clinical-state.test.mjs', 'confirmed template records explicit physician action and template identity']
  ],
  'INV-CLIN-003': [
    ['context-coordination.test.mjs', 'template compatibility depends only on explicit protocol metadata, never on QP text'],
    ['protocol-engine.test.mjs', 'default context exposes only protocol owned fields and never invents values']
  ],
  'INV-SCORE-001': [
    ['scores.test.mjs', 'score starts incomplete with null score and unanswered variables'],
    ['scores.test.mjs', 'partially answered score remains incomplete and has no interpretation'],
    ['scores.test.mjs', 'Glasgow is incomplete until all three components are informed']
  ],
  'INV-SCORE-002': [
    ['tool-state.test.mjs', 'tool can be available without being applicable'],
    ['tool-state.test.mjs', 'applicable HEART remains not calculable while troponin is missing'],
    ['document-tool-application.test.mjs', 'calculable but unapplied tool stays out of the clinical document']
  ],
  'INV-DOC-001': [
    ['document-tool-application.test.mjs', 'calculable but unapplied tool stays out of the clinical document'],
    ['reassessment-document.test.mjs', 'scores section disappears when no score is applied and calculable']
  ],
  'INV-TEMP-001': [
    ['workflow-engine.test.mjs', 'reassessing creates a temporal child event without overwriting admission snapshot'],
    ['workflow-engine.test.mjs', 'admission snapshot can be refreshed before reassessment and becomes immutable afterwards'],
    ['reassessment-document.test.mjs', 'reassessment preserves exact QP inline quoted format and admission HDA label']
  ],
  'INV-STOR-001': [
    ['storage-io.test.mjs', 'missing storage adapter is an explicit persistence failure, never missing data'],
    ['storage-io.test.mjs', 'corrupted stored JSON never masquerades as absent data'],
    ['storage-io.test.mjs', 'storage writes never fail silently']
  ],
  'INV-METRIC-001': [
    ['productivity.test.mjs', 'invalid or missing encounter timestamps are ignored'],
    ['productivity.test.mjs', 'one encounter without an explicit live clock does not fabricate a patients per hour value'],
    ['productivity.test.mjs', 'zero or negative duration returns no numeric productivity rate'],
    ['product-convergence.test.mjs', 'productivity reader does not report corrupted encounter state as zero patients']
  ],
  // INV-GOV-001 é meta: a propriedade que ele afirma ("a suíte comprova apenas os
  // testes presentes") é justamente o que este arquivo passa a verificar.
  'INV-GOV-001': [
    ['invariant-coverage.test.mjs', 'every invariant declared in the registry has at least one mapped protecting test'],
    ['invariant-coverage.test.mjs', 'every mapped protecting test still exists with the exact declared name']
  ]
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
  // Casa test('nome' e test("nome", tolerando espaço após `test(`.
  const escaped = testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`test\\(\\s*(['"\`])${escaped}\\1`).test(source);
}

test('every invariant declared in the registry has at least one mapped protecting test', () => {
  const ids = registryInvariantIds(readRegistry());

  assert.ok(
    ids.length > 0,
    'nenhum invariante encontrado em INVARIANT_REGISTRY.md — o formato dos títulos mudou e este gate deixou de enxergar o registry'
  );

  const unprotected = ids.filter((id) => !(PROTECTED_BY[id]?.length > 0));

  assert.deepEqual(
    unprotected,
    [],
    `invariante(s) sem proteção automatizada mapeada: ${unprotected.join(', ')}. `
      + 'Um invariante crítico sem teste rastreável é uma promessa em prosa. '
      + 'Mapeie o teste que o protege em PROTECTED_BY, ou registre explicitamente '
      + 'em SHARED_AUDIT_LOG.md que ele permanece descoberto e por quê.'
  );
});

test('every mapped protecting test still exists with the exact declared name', () => {
  const missing = [];

  for (const [invariant, protectors] of Object.entries(PROTECTED_BY)) {
    for (const [fileName, testName] of protectors) {
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
      + 'Isto é o INV-GOV-001 em ação. Se a remoção for intencional, aponte o novo '
      + 'protetor equivalente em PROTECTED_BY e registre a segunda leitura — não '
      + 'apague a linha para a suíte voltar ao verde.'
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
