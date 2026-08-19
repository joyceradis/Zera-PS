// Proveniência na justificativa de alto custo — o achado só entra se tiver sido confirmado.
//
// `README.md` declara entre os contratos de segurança: "migração técnica não fabrica confirmação
// clínica". A migração de autosave v1 honra isso literalmente: carrega o texto do formulário e
// deixa TODO o estado clínico não confirmado (`assets/storage.js :: migrateLegacyAutosave`).
//
// O document engine respeita: `canRenderClinicalField` recusa, e a evolução sai sem exame físico.
//
// A justificativa não respeita. `observedFieldFromInput` (`src/product-convergence.js`) lê o valor
// cru do input e devolve `{ state: 'present', source: 'physician_observation', confirmed: true }`,
// fabricando a confirmação que a migração recusou. O portão fica satisfeito por construção.
//
// Demonstrado por interação real, não por leitura: mesma sessão, mesmo dado, dois documentos.
//   evolução      → omite o exame físico
//   justificativa → "AO EXAME FÍSICO, DESTACA-SE: ... BLUMBERG POSITIVO"
//
// O documento que afirma é o que vai para a operadora de saúde.
//
// A correção exige que a justificativa consulte o estado clínico real em vez de reconstruí-lo do
// DOM — o `clinicalState` vive no escopo de `assets/app.js` e não é exportado. Isso é desenho de
// Core, não correção localizada, então este setor registra RED e faz handoff.

import test from 'node:test';
import assert from 'node:assert/strict';
import { bootApp } from './helpers/boot-surface.mjs';

const FINDING = 'BLUMBERG POSITIVO';

const app = await bootApp({
  seed: {
    // Autosave no formato legado v1: dispara a migração real do produto.
    'zera-ps:autosave:v1': {
      qp: 'DOR ABDOMINAL',
      hda: 'DOR ABDOMINAL HA 8 HORAS EM FID',
      abd: `DOR A DESCOMPRESSAO EM FID, ${FINDING}`,
      'estado-geral': 'REG, DESIDRATADO ++/4+'
    }
  }
});

test('the migrated exam text reaches the screen but is not confirmed', () => {
  // Pré-condição do vetor: o texto está na tela e a migração não o confirmou.
  assert.ok(app.byId('abd').value.includes(FINDING),
    'A migração não trouxe o texto do exame; o cenário perdeu o objeto.');
});

test('the medical record correctly omits an exam finding that was never confirmed', async () => {
  app.click('generate-evolution');
  await app.flush();
  const record = app.byId('evolution-output').value;

  assert.equal(record.includes('# EXAME FÍSICO:'), false,
    'A evolução passou a publicar exame físico não confirmado. Este é o comportamento CORRETO ' +
    'hoje e a referência do vetor seguinte — se ele mudar, o invariante de proveniência caiu ' +
    'no próprio prontuário.');
  assert.equal(record.includes(FINDING), false);
});

test('the high-cost justification must not assert a finding the record refuses to publish',
  { todo: 'issue #77 — aguarda correção de Platform/Core; RED conhecido, não bloqueia a suíte' },
  async () => {
    app.type('justification-exam-name', 'TC DE ABDOME E PELVE');
    await app.flush();
    app.click('generate-justification');
    await app.flush();

    const justification = app.byId('justification-output').value;
    assert.equal(
      justification.includes(FINDING),
      false,
      'A justificativa afirma à operadora um achado de exame físico que a aplicação recusa a ' +
      'publicar no prontuário por não estar confirmado. Mesma sessão, mesmo dado, dois ' +
      'documentos discordantes — e o que afirma é o de uso externo.'
    );
  });

test('the justification still carries what the physician did confirm', async () => {
  // Contraprova: sem ela, a correção do vetor acima poderia ser "parar de citar exame físico",
  // que resolveria o defeito destruindo a função.
  const justification = app.byId('justification-output').value;
  assert.ok(justification.includes('DOR ABDOMINAL HA 8 HORAS EM FID'),
    'A justificativa deixou de reaproveitar a HDA que a médica escreveu.');
  assert.ok(justification.includes('TC DE ABDOME E PELVE'),
    'A justificativa deixou de nomear o exame solicitado.');
});
