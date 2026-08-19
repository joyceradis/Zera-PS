// Harness de interação — um plantão, vários pacientes, sobre a superfície real.
//
// Todos os defeitos que a Founder encontrou usando o produto são de FIAÇÃO entre módulo e
// documento: perda de dado ao atualizar, contaminação entre pacientes, controle inalcançável,
// dois handlers no mesmo botão. A suíte cobria motores puros e não enxergava nenhum deles.
//
// Aqui o `app.html` real é carregado, o entrypoint real (`app.js`) é importado, e a interação
// acontece por evento — clique e digitação com bolha —, não por chamada de função interna.
//
// Um boot por arquivo: os módulos guardam estado no escopo do módulo. Isso não é contorno, é
// fidelidade — um plantão real também é um carregamento só, com pacientes em sequência. Os
// cenários abaixo estão em ordem deliberada.
//
// LIMITE DECLARADO: reproduz árvore, eventos, seletores e estado. NÃO reproduz layout, CSS,
// foco real, viewport, service worker nem PWA/offline. Nada aqui autoriza afirmação sobre
// aparência, acessibilidade visual ou comportamento offline — esses gates seguem abertos.

import test from 'node:test';
import assert from 'node:assert/strict';
import { bootApp } from './helpers/boot-surface.mjs';

const app = await bootApp();

const PATIENT_ONE = 'DOR TORACICA HA 2 HORAS, INICIO SUBITO, SUDORESE';
const PATIENT_TWO = 'CEFALEIA HA 3 DIAS, SEM SINAIS DE ALARME';

// ── 1. Alcance real da superfície ────────────────────────────────────────────

test('the clinical surface a physician can actually operate', () => {
  // Alcançável = nem o nó nem nenhum ancestral está oculto. É a pergunta que a suíte de
  // motores não sabia fazer, e a que revelou que a camada temporal estava morta.
  for (const id of ['qp-free', 'generate-evolution', 'copy-evolution', 'save-draft', 'clear-form',
    'estado-geral', 'laboratoriais', 'imagem', 'hipoteses', 'conduta', 'evolution-output']) {
    assert.equal(app.isReachable(id), true, `#${id} deveria estar alcançável no Atendimento e não está.`);
  }
});

test('the protocol layer has no entry point in the shipped surface', () => {
  // Este vetor NÃO celebra o estado atual: ele o fixa. `retireLegacyWorkflowSurface` remove
  // `.workflow-card` do documento, e com ela o único controle que monta um protocolo. Sem
  // protocolo montado não há HEART, pendências, resultados seriados nem progressive disclosure.
  //
  // A consequência precisa ficar dita: o espaço declarativo que `INV-CLIN-003` protege
  // exaustivamente descreve código que a médica não alcança hoje. A cobertura segue correta
  // como propriedade do código e não deve ser lida como propriedade do produto.
  //
  // Quando o protocolo ganhar porta de entrada, ESTE TESTE FALHA — e é para falhar: significa
  // que a afirmação acima deixou de valer e precisa ser reescrita.
  assert.equal(app.byId('workflow-scenario'), null,
    'O seletor de cenário voltou ao documento. Se o protocolo ganhou porta de entrada, atualize ' +
    'este teste e reveja a leitura de alcance do INV-CLIN-003 registrada na auditoria.');
  assert.equal(app.document.querySelector('.workflow-card'), null,
    'O cartão de workflow voltou ao documento; a cadeia descrita acima mudou.');
});

// ── 2. Um dono por controle ──────────────────────────────────────────────────

test('action controls have a declared number of owners, never an accidental one', () => {
  // `45e7341` corrigiu dois handlers competindo no botão de reavaliação. Este vetor impede a
  // reincidência em qualquer controle de ação, e declara os casos onde mais de um dono é
  // intencional.
  const EXPECTED_OWNERS = Object.freeze({
    'generate-reassessment': 1,
    'generate-admission': 1,
    'generate-discharge': 1,
    'clear-form': 1,
    'save-draft': 1,
    // Dois donos, deliberado e ordenado: assets/app.js gera o documento e src/temporal-ui.js
    // pós-processa em microtask, injetando scores aplicados. A ordem é garantida pelo
    // queueMicrotask, não por sorte de registro.
    'generate-evolution': 2
  });
  for (const [id, expected] of Object.entries(EXPECTED_OWNERS)) {
    assert.equal(app.listenerCount(id, 'click'), expected,
      `#${id} tem ${app.listenerCount(id, 'click')} handler(s) de clique, esperado ${expected}. ` +
      'Handler a mais é caminho concorrente; a menos é função perdida. Os dois já aconteceram neste projeto.');
  }
});

// ── 3. Primeiro paciente ─────────────────────────────────────────────────────

test('typing the free-text intake starts an Atendimento and produces a document', async () => {
  app.type('qp-free', PATIENT_ONE);
  await app.flush();

  assert.equal(app.byId('atendimento-state').textContent, 'EM REGISTRO',
    'Digitar conteúdo clínico não passou o Atendimento para EM REGISTRO.');

  app.click('generate-evolution');
  await app.flush();

  const document = app.byId('evolution-output').value;
  assert.ok(document.includes(PATIENT_ONE),
    'O documento gerado não contém o que foi digitado; a ponte da interface até o motor quebrou.');
  assert.equal(document.includes('# HIPÓTESES DIAGNÓSTICAS:'), false,
    'Documento ganhou hipótese sem que a médica digitasse — INV-CLIN-003 pela via da interface real.');
});

test('regenerating without manual editing never interrupts the physician', async () => {
  const before = app.confirmCalls().length;
  app.click('generate-evolution');
  await app.flush();
  assert.equal(app.confirmCalls().length, before,
    'Atualizar a evolução sem edição manual pediu confirmação. Interrupção sem causa é fricção ' +
    'que o roadmap classifica como P1.');
});

test('manual editing of the final document is not destroyed without asking', async () => {
  // O defeito original: "apertei o botão errado e não tem como voltar".
  const edited = `${app.byId('evolution-output').value}\n# OBSERVAÇÃO MANUAL DA MÉDICA`;
  app.type('evolution-output', edited);
  await app.flush();

  app.answerConfirm(false);
  const before = app.confirmCalls().length;
  app.click('generate-evolution');
  await app.flush();

  assert.ok(app.confirmCalls().length > before, 'Sobrescrever edição manual não pediu confirmação.');
  assert.equal(app.byId('evolution-output').value, edited,
    'A médica recusou a substituição e a edição manual foi destruída assim mesmo.');

  app.answerConfirm(true);
  app.click('generate-evolution');
  await app.flush();
  assert.equal(app.byId('evolution-output').value.includes('# OBSERVAÇÃO MANUAL DA MÉDICA'), false,
    'A médica aceitou a substituição e o documento não foi regenerado.');
});

// ── 4. Troca de paciente — a fronteira que mais importa ───────────────────────

test('clearing the Atendimento leaves nothing of the previous patient anywhere', async () => {
  // Preenche o máximo de superfície antes de limpar: quanto mais estado houver, mais honesto
  // é o vetor. Inclui a justificativa, que foi o campo que vazou.
  app.type('hipoteses', 'SINDROME CORONARIANA AGUDA');
  app.type('conduta', 'SOLICITO ECG');
  app.type('reav-evolucao', 'REAVALIO PACIENTE DO PRIMEIRO ATENDIMENTO');
  app.type('int-justificativa', 'JUSTIFICATIVA DE INTERNACAO DO PRIMEIRO PACIENTE');
  app.type('alta-resumo', 'SUMARIO DE ALTA DO PRIMEIRO PACIENTE');
  app.byId('justification-output').value = 'JUSTIFICATIVA GERADA PARA O PRIMEIRO PACIENTE';
  await app.flush();

  app.answerConfirm(true);
  app.click('clear-form');
  await app.flush();
  app.runTimers();
  await app.flush();

  const carried = [];
  for (const id of ['qp-free', 'qp', 'hda', 'hipoteses', 'conduta', 'evolution-output',
    'reav-evolucao', 'reav-exames', 'reav-conduta', 'reassessment-output',
    'int-diagnostico', 'int-justificativa', 'int-prescricao', 'admission-output',
    'alta-diagnostico', 'alta-resumo', 'alta-medicacoes', 'alta-orientacoes', 'discharge-output',
    'justification-output']) {
    const node = app.byId(id);
    if (node && node.value) carried.push(`${id}="${node.value}"`);
  }
  assert.deepEqual(carried, [],
    `Após limpar, ${carried.length} campo(s) ainda carregam o paciente anterior: ${carried.join(', ')}. ` +
    'Isso é contaminação entre pacientes no documento clínico.');

  assert.equal(app.byId('atendimento-state').textContent, 'NOVO ATENDIMENTO',
    'A tela continuou anunciando EM REGISTRO depois de limpar.');
});

// ── 5. Contraprova: a superfície continua servindo o paciente seguinte ────────

test('the surface still works for the next patient', async () => {
  // Sem esta contraprova, o vetor anterior passaria caso "Limpar" tivesse quebrado a tela.
  app.type('qp-free', PATIENT_TWO);
  await app.flush();
  app.click('generate-evolution');
  await app.flush();

  const document = app.byId('evolution-output').value;
  assert.ok(document.includes(PATIENT_TWO), 'O segundo paciente não chega ao documento.');
  assert.equal(document.includes('SINDROME CORONARIANA AGUDA'), false,
    'O documento do segundo paciente carrega hipótese do primeiro.');
  assert.equal(document.includes('DOR TORACICA'), false,
    'O documento do segundo paciente carrega a queixa do primeiro.');
});
