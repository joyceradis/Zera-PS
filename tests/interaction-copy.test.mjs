// Cópia — o ato terminal do produto.
//
// Tudo que o Zera PS faz termina em "Copiar". Se a cópia falha e o app diz que deu certo, a
// médica limpa o Atendimento confiando num texto que não está na área de transferência — e o
// `Limpar` também apaga o autosave. O documento some, e o que ela cola no sistema do hospital é
// o conteúdo anterior da área de transferência, que pode ser o do paciente anterior.
//
// O caminho de falha não é exótico em deploy local de hospital: `navigator.clipboard` só existe
// em contexto seguro. Servido por HTTP na rede interna, ele é `undefined` por especificação, e
// todo o peso cai no fallback `execCommand('copy')` — que é obsoleto e devolve `false` quando
// não copia.
//
// Antes da correção, esse `false` era descartado e a médica ouvia "Texto copiado.".

import test from 'node:test';
import assert from 'node:assert/strict';
import { bootApp } from './helpers/boot-surface.mjs';

const app = await bootApp();
const feedback = () => app.byId('action-feedback').textContent;

test('copying an empty document says there is nothing to copy', async () => {
  app.click('copy-evolution');
  await app.flush();
  assert.match(feedback(), /Não há texto para copiar/,
    'Copiar sem documento gerado deveria avisar, não anunciar sucesso.');
});

test('a successful copy is announced as such', async () => {
  app.type('qp-free', 'CEFALEIA HOLOCRANIANA HA 4 HORAS, SEM DEFICIT FOCAL');
  await app.flush();
  app.click('generate-evolution');
  await app.flush();

  app.click('copy-evolution');
  await app.flush();
  await app.flush();
  assert.match(feedback(), /Texto copiado/,
    'O caminho feliz parou de confirmar a cópia.');
});

test('a copy that did not happen is never announced as done', async () => {
  // Máquina de plantão sem área de transferência utilizável: contexto não seguro e fallback
  // recusando. Os dois caminhos falham.
  app.breakClipboard();
  app.click('copy-evolution');
  await app.flush();
  await app.flush();

  assert.equal(app.clipboardFallbackCalls() > 0, true,
    'O fallback nem chegou a ser tentado; o vetor não exercita o cenário que pretende.');
  assert.doesNotMatch(feedback(), /^Texto copiado/,
    'Os dois caminhos de cópia falharam e a médica foi informada de que o texto foi copiado. ' +
    'Ela limpa o Atendimento confiando nisso, o autosave é apagado junto, e o que ela cola no ' +
    'sistema do hospital é o conteúdo anterior da área de transferência.');
});

test('the failure message keeps the document recoverable instead of just reporting an error', async () => {
  // Uma mensagem de erro que não diz o que fazer, num plantão, equivale a nenhuma. O texto
  // continua na tela: a orientação precisa dizer isso antes que ela limpe.
  assert.match(feedback(), /continua na tela/,
    'A mensagem de falha não informa que o documento ainda está recuperável na tela.');
  assert.match(feedback(), /antes de limpar/,
    'A mensagem de falha não alerta contra limpar o Atendimento, que é o passo que destrói o texto.');
  assert.ok(app.byId('evolution-output').value.length > 0,
    'O documento sumiu da tela junto com a falha de cópia.');
});
