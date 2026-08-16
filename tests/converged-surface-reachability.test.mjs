// Alcançabilidade da superfície convergida.
//
// Origem: achado 8 de homologação da Founder, em docs/coordination/active/founder.md —
// "resumo do plantão deve reconhecer snapshots/rascunhos correntes do Atendimento e
// contabilizar imediatamente, sem falso ATENDIDOS: 0".
//
// A instrução da Founder nessa lista é explícita: "Não marcar como resolvido apenas porque
// consta nesta lista." Os testes unitários de produtividade passam — eles alimentam
// `summarizeProductivity` com um snapshot construído à mão. O que nenhum teste exercitava é
// se algum caminho do produto convergido chega a PRODUZIR esse snapshot.
//
// Chega, e o caminho está desligado. Este arquivo fixa a cadeia real para que ela não mude
// em silêncio, e para que a correção seja detectada quando vier.
//
// Cadeia verificada, arquivo por arquivo:
//
//   1. `createEncounter()` é chamado em exatamente um ponto de produto: `handleScenarioChange`
//   2. `handleScenarioChange` só dispara no evento `change` de `#workflow-scenario`
//   3. `#workflow-scenario` é filho de `.workflow-card` em app.html
//   4. `hideLegacyContextSelectors()` marca `.workflow-card` como `hidden`
//   5. `handleStartReassessment()` retorna cedo quando não existe encounter
//   → `zera-ps:encounter:v3` nunca é escrito
//   → `readProductivityRecords()` devolve sempre `[]`
//   → Resumo do Plantão exibe ATENDIDOS: 0 mesmo com atendimento em curso
//
// Consequência maior que o item 8: toda a camada temporal/protocolo — etapas, ferramentas
// clínicas, progressive disclosure de protocolo — está fora de alcance da médica na
// superfície convergida. Isso limita o alcance do INV-CLIN-003 a código não exercido pelo
// produto atual, e está registrado como tal.
//
// Owner da correção: Platform/Core (composição entre camadas, workflow e storage).
// Este setor caracteriza e fixa; não reescreve a arquitetura.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [appHtml, temporalUi, convergence, productivity] = await Promise.all([
  read('app.html'),
  read('src/temporal-ui.js'),
  read('src/product-convergence.js'),
  read('src/productivity.js')
]);

test('the temporal encounter has exactly one production creator, bound to the scenario select', () => {
  // Se surgir um segundo criador, a cadeia abaixo deixa de descrever o produto e este
  // arquivo precisa ser relido por inteiro antes de continuar valendo como evidência.
  const creators = temporalUi.match(/createEncounter\(/g) || [];
  assert.equal(
    creators.length,
    1,
    `src/temporal-ui.js passou a chamar createEncounter() ${creators.length} vezes. ` +
    'A cadeia de alcançabilidade mudou; revise este arquivo e a issue associada.'
  );
  assert.match(
    temporalUi,
    /\$\('workflow-scenario'\)\?\.addEventListener\('change', handleScenarioChange\)/,
    'O criador de encounter deixou de estar ligado ao seletor de cenário.'
  );
  assert.match(
    temporalUi,
    /function handleStartReassessment\(\)\s*\{\s*if \(!encounter\) return;/,
    'A reavaliação deixou de retornar cedo sem encounter. Se ela passou a criar encounter, ' +
    'a cadeia deste arquivo mudou e o achado 8 pode estar resolvido — reveja.'
  );
});

test('the only control that creates an encounter sits inside the card the converged UI hides', () => {
  // Contenção no HTML: o seletor está dentro de `.workflow-card`.
  const card = appHtml.slice(
    appHtml.indexOf('<section class="workflow-card"'),
    appHtml.indexOf('</section>', appHtml.indexOf('<section class="workflow-card"'))
  );
  assert.ok(card.length > 0, 'O cartão de workflow saiu do app.html; a cadeia mudou.');
  assert.match(
    card,
    /<select id="workflow-scenario">/,
    'O seletor de cenário saiu de dentro de .workflow-card. Se ele foi promovido para fora, ' +
    'o achado 8 pode estar resolvido — reveja este arquivo e a issue associada.'
  );

  // E a camada de convergência oculta esse cartão.
  assert.match(
    convergence,
    /const workflowCard = document\.querySelector\('\.workflow-card'\)[\s\S]{0,400}?if \(workflowCard\) workflowCard\.hidden = true;/,
    'A camada de convergência deixou de ocultar .workflow-card. Se isso mudou, a cadeia que ' +
    'produz o falso ATENDIDOS: 0 mudou junto — reveja.'
  );
});

test('the shift summary reads only the temporal encounter key, not the encounter draft', () => {
  // Fecha a cadeia: a única fonte do resumo é a chave que ninguém escreve na UI convergida.
  assert.match(
    convergence,
    /function readProductivityRecords\([\s\S]*?storage\.loadActiveEncounter\(\)/,
    'O leitor de produtividade mudou de fonte.'
  );
  assert.equal(
    /readProductivityRecords[\s\S]{0,400}?(loadAutosave|loadDrafts)/.test(convergence),
    false,
    'O leitor de produtividade passou a considerar autosave/rascunhos do Atendimento. ' +
    'Esse é exatamente o achado 8 da Founder — se foi implementado, atualize este teste e ' +
    'feche a issue associada.'
  );

  // Contraprova de que o motor puro está correto: o defeito é de alcance, não de cálculo.
  assert.match(
    productivity,
    /activeEncounter\?\.startedAt/,
    'O extrator deixou de reconhecer um encounter ativo isolado; o motor puro regrediu.'
  );
});

test('no keyboard-first affordance exists yet on the clinical surface', () => {
  // Achado 2 da Founder: keyboard-first e redução de caminhos concorrentes são P1.
  // Fixa o estado atual para que a primeira implementação seja notada, não absorvida.
  const surfaces = `${appHtml}\n${convergence}\n${temporalUi}`;
  assert.equal(
    /accesskey=|addEventListener\('keydown'|\.key ===|ctrlKey|metaKey/.test(surfaces),
    false,
    'Apareceu um affordance de teclado na superfície clínica. Isso endereça o achado 2 da ' +
    'Founder e precisa de verificação própria — atualize este teste conscientemente.'
  );
});
