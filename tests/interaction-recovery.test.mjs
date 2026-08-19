// Recuperação — o que a médica salvou continua sendo o que ela vê.
//
// Dois percursos distintos, e o segundo já falhou uma vez em produção:
//
//   1. recarregar a página com autosave existente;
//   2. abrir um rascunho DEPOIS que a superfície já foi montada.
//
// O segundo é o caso do achado UX-11: `#qp-free` é criado uma única vez, e a restauração de
// rascunho escreve nos campos espelhados. Sem ressincronização, a tela mostrava um paciente e
// o documento carregava outro — e a tecla seguinte destruía o rascunho aberto.
//
// Boot semeado com estado local, que é a única forma de exercitar recuperação num harness que
// admite um boot por processo.

import test from 'node:test';
import assert from 'node:assert/strict';
import { bootApp } from './helpers/boot-surface.mjs';
import { emptyClinicalState } from '../assets/storage.js';

const RECOVERED = 'DOR LOMBAR HA 5 DIAS, SEM FEBRE, SEM DISURIA';

const app = await bootApp({
  seed: {
    'zera-ps:autosave:v2': {
      schemaVersion: 2,
      form: { qp: RECOVERED, hda: RECOVERED, hipoteses: '', conduta: '', includeEmTempo: false },
      clinicalState: emptyClinicalState(),
      output: ''
    }
  }
});

test('reloading with saved work shows the physician what she actually saved', () => {
  // O campo visível é injetado pela convergência DEPOIS que o autosave é restaurado. Se a
  // ordem de boot inverter, a médica volta para uma tela vazia com dado escondido atrás.
  assert.equal(app.byId('qp-free').value, RECOVERED,
    'O campo visível voltou vazio após recuperar autosave. A médica veria tela limpa com dado escondido nos campos espelhados.');
  assert.equal(app.byId('hda').value, RECOVERED, 'A HDA espelhada não foi recuperada.');
  assert.equal(app.byId('atendimento-state').textContent, 'EM REGISTRO',
    'Atendimento recuperado com conteúdo continuou anunciando NOVO ATENDIMENTO.');
});

test('opening a draft after the surface is mounted keeps screen and document in agreement', async () => {
  // Reprodução do percurso do UX-11, de ponta a ponta.
  const PATIENT_A = 'CRISE HIPERTENSIVA, PA 210 POR 120';
  const PATIENT_B = 'ENTORSE DE TORNOZELO A DIREITA';

  app.type('qp-free', PATIENT_A);
  await app.flush();
  app.click('save-draft');
  await app.flush();

  app.answerConfirm(true);
  app.click('clear-form');
  await app.flush();
  app.runTimers();
  await app.flush();

  app.type('qp-free', PATIENT_B);
  await app.flush();

  const open = app.document.querySelector('[data-load-draft]');
  assert.ok(open, 'Nenhum rascunho listado; o vetor perderia o sentido.');
  open.dispatchEvent(new (globalThis.Event)('click', { bubbles: true }));
  await app.flush();

  assert.equal(app.byId('qp-free').value, PATIENT_A,
    'A tela continuou mostrando o paciente anterior depois de abrir o rascunho. Foi exatamente ' +
    'assim que digitar em seguida destruía a QP/HDA restauradas (UX-11).');
  assert.equal(app.byId('hda').value, PATIENT_A, 'Os campos espelhados não receberam o rascunho aberto.');

  // A prova de que a dessincronização não pode mais destruir: digitar agora parte do rascunho.
  app.type('qp-free', `${PATIENT_A} E DOR TORACICA`);
  await app.flush();
  assert.ok(app.byId('hda').value.includes(PATIENT_A),
    'Digitar após abrir o rascunho apagou o conteúdo restaurado.');
});
