// Fronteira de rede — o dado clínico não sai do dispositivo.
//
// `README.md` declara: "Nesta fase os dados permanecem no dispositivo. Não existe backend nem
// sincronização em nuvem." Hoje isso é verdade, e é a maior vantagem de segurança do projeto.
// Até agora, porém, a afirmação existia apenas em prosa: nada na suíte reprovava se ela
// deixasse de valer.
//
// Esta guarda foi escrita ANTES da API existir, deliberadamente. A decisão de produto é que a
// API seja de licença/ativação, sem dado de paciente. Uma promessa dessas não se sustenta por
// intenção: sustenta-se por um teste que reprova quando um módulo clínico ganha acesso à rede.
//
// Como acrescentar um cliente de licença sem quebrar esta guarda:
//   1. declare o módulo em NETWORK_ALLOWED, com razão e verificação;
//   2. o módulo declarado NÃO pode referenciar campo clínico algum — a asserção abaixo confere
//      isso contra os ids reais do formulário, não contra uma lista escrita à mão.
//
// O que esta guarda NÃO prova: que um servidor, uma vez existindo, trate bem o que recebe.
// Ela protege a fronteira de saída do cliente, e nada além disso.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

/** Todo módulo JavaScript efetivamente embarcado no produto. */
function shippedModules() {
  const files = ['app.js', 'service-worker.js'];
  for (const dir of ['src', 'assets']) {
    for (const name of readdirSync(new URL(`${dir}/`, root))) {
      if (name.endsWith('.js')) files.push(`${dir}/${name}`);
    }
  }
  return files.sort();
}

const SHIPPED = shippedModules();

/** Piso ancorado: a varredura não pode encolher em silêncio. */
const SHIPPED_FLOOR = 25;

const NETWORK_PRIMITIVE = /\bfetch\s*\(|XMLHttpRequest|new\s+WebSocket|sendBeacon|new\s+EventSource/;

/**
 * Módulos autorizados a tocar a rede, cada um com a razão e a verificação do limite.
 * Acrescentar entrada aqui é decisão consciente e visível na revisão.
 */
const NETWORK_ALLOWED = Object.freeze({
  'service-worker.js': {
    reason: 'app shell offline-first; encaminha requisições que o navegador já emitiu',
    verify: (source) => {
      // Todo `fetch(` do service worker precisa encaminhar a requisição original. Compor uma
      // requisição própria — URL em template, corpo, cabeçalho — seria exfiltração potencial.
      const calls = [...source.matchAll(/\bfetch\s*\(([^)]*)\)/g)].map((match) => match[1].trim());
      assert.ok(calls.length > 0, 'O service worker deixou de encaminhar requisições; a guarda perdeu o objeto.');
      for (const argument of calls) {
        assert.equal(
          argument,
          'event.request',
          `O service worker passou a compor uma requisição própria: fetch(${argument}). ` +
          'Encaminhar o que o navegador já pediu é aceitável; construir requisição não é.'
        );
      }
      assert.doesNotMatch(
        source,
        /method:\s*['"]POST['"]|body:/i,
        'O service worker passou a enviar corpo de requisição. Isso é uma via de saída de dado.'
      );
    }
  }
});

/** Ids dos campos clínicos, derivados do mapa real do formulário — não escritos à mão. */
function clinicalFieldIds() {
  const appJs = read('assets/app.js');
  const start = appJs.indexOf('const FORM_IDS = {');
  assert.ok(start >= 0, 'FORM_IDS sumiu de assets/app.js; a derivação dos campos clínicos perdeu a fonte.');
  const end = appJs.indexOf('};', start);
  const block = appJs.slice(start, end);
  const ids = [...block.matchAll(/'([\w-]+)'/g)].map((match) => match[1]);
  return [...new Set(ids)].sort();
}

const CLINICAL_IDS = clinicalFieldIds();

test('the shipped surface is fully scanned and never shrinks silently', () => {
  assert.ok(
    SHIPPED.length >= SHIPPED_FLOOR,
    `A varredura caiu de ${SHIPPED_FLOOR} para ${SHIPPED.length} módulos. Ou o produto encolheu, ` +
    'ou a enumeração deixou de encontrar os arquivos — nos dois casos esta guarda passou a ' +
    'exigir menos. Atualize SHIPPED_FLOOR conscientemente.'
  );
  assert.ok(SHIPPED.includes('service-worker.js'));
  assert.ok(SHIPPED.includes('assets/app.js'));
  assert.ok(
    CLINICAL_IDS.length >= 15,
    `Apenas ${CLINICAL_IDS.length} campos clínicos derivados; o mapa do formulário mudou de forma.`
  );
});

test('no shipped module reaches the network outside the declared allow-list', () => {
  const offenders = [];
  for (const file of SHIPPED) {
    if (NETWORK_ALLOWED[file]) continue;
    if (NETWORK_PRIMITIVE.test(read(file))) offenders.push(file);
  }
  assert.deepEqual(
    offenders,
    [],
    `Módulo com acesso à rede fora da lista declarada: ${offenders.join(', ')}. ` +
    'O README afirma que o dado permanece no dispositivo. Se este acesso é intencional, ' +
    'declare-o em NETWORK_ALLOWED com razão e limite verificáveis.'
  );
});

test('every allow-listed module respects its declared network limit', () => {
  for (const [file, entry] of Object.entries(NETWORK_ALLOWED)) {
    assert.ok(SHIPPED.includes(file), `"${file}" está autorizado mas não é mais embarcado; remova a entrada.`);
    entry.verify(read(file));
  }
});

test('no module authorized to reach the network touches a clinical field', () => {
  // A regra que sustenta a decisão de escopo: a API é de licença/ativação. Um módulo que fala
  // com a rede e ao mesmo tempo lê campo clínico é, por construção, uma via de saída de dado
  // de paciente — mesmo que hoje não envie nada.
  for (const file of Object.keys(NETWORK_ALLOWED)) {
    const source = read(file);
    const touched = CLINICAL_IDS.filter((id) => source.includes(`'${id}'`) || source.includes(`"${id}"`));
    assert.deepEqual(
      touched,
      [],
      `${file} tem acesso à rede e referencia campo(s) clínico(s): ${touched.join(', ')}. ` +
      'Separe a responsabilidade: quem fala com a rede não lê prontuário.'
    );
  }
});

test('the privacy claim under guard is still the claim the README makes', () => {
  // Impede que guarda e promessa se separem em silêncio: se o README deixar de afirmar que o
  // dado permanece no dispositivo, esta guarda passa a proteger algo que ninguém mais promete.
  assert.match(
    read('README.md'),
    /os dados permanecem no dispositivo/i,
    'O README deixou de afirmar que os dados permanecem no dispositivo. Se a política mudou, ' +
    'esta guarda precisa ser reescrita conscientemente — e não continuar passando por inércia.'
  );
});
