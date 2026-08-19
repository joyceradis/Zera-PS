// Falha de armazenamento — o invariante vale na borda, não só no motor.
//
// `INV-STOR-001` diz que falha de persistência não equivale a ausência de dado, e é verdadeiro
// no motor: `writeStorageItem` lança em vez de falhar calado. A auditoria encontrou o invariante
// perdido no PONTO DE CHAMADA — `saveDraft` não capturava, e o clique não confirmava nem
// sinalizava erro.
//
// Este arquivo exercita a borda: máquina de plantão com armazenamento indisponível, interação
// real, e a pergunta que importa — a médica fica sabendo, e o que ela escreveu continua na tela?

import test from 'node:test';
import assert from 'node:assert/strict';
import { bootApp } from './helpers/boot-surface.mjs';

const WRITTEN = 'EPIGASTRALGIA HA 12 HORAS, NAUSEAS, SEM VOMITOS';
const app = await bootApp();

test('a failing local storage never silently swallows the physician work', async () => {
  app.type('qp-free', WRITTEN);
  await app.flush();

  app.breakStorage(true);
  app.click('save-draft');
  await app.flush();

  const feedback = app.byId('action-feedback')?.textContent || '';
  const status = app.byId('save-status')?.textContent || '';

  assert.notEqual(status, 'SALVO',
    'O armazenamento falhou e a tela anunciou SALVO. Falha de persistência virou falsa confirmação.');
  assert.ok(feedback.trim().length > 0,
    'O armazenamento falhou e nada foi dito à médica. Falha silenciosa é indistinguível de sucesso.');
  assert.equal(app.byId('qp-free').value, WRITTEN,
    'O conteúdo digitado sumiu da tela junto com a falha de armazenamento. O que está escrito ' +
    'precisa sobreviver a um armazenamento indisponível.');
});

test('the surface recovers once storage works again', async () => {
  // Contraprova: sem ela, o vetor acima passaria caso o salvamento tivesse quebrado de vez.
  app.breakStorage(false);
  app.click('save-draft');
  await app.flush();

  assert.equal(app.byId('save-status').textContent, 'SALVO',
    'Com o armazenamento restabelecido, salvar rascunho continuou falhando.');
  assert.ok(app.storageKeys().some((key) => key.includes('drafts')),
    'O rascunho não chegou ao armazenamento local após a recuperação.');
});
