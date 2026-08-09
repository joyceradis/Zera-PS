import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HDA_FACT_STATE,
  emptyDiarrheaHdaState,
  defaultDiarrheaHdaState,
  composeDiarrheaHda,
  synchronizeGeneratedHda
} from '../src/hda-composer.js';

test('diarrhea selection opens an integral HDA instead of a one-line shell', () => {
  const text = composeDiarrheaHda(defaultDiarrheaHdaState());

  assert.match(text, /HÁ \[TEMPO\]/);
  assert.match(text, /\[NÚMERO\] EPISÓDIOS/);
  assert.match(text, /FEZES \[CONSISTÊNCIA\]/);
  assert.match(text, /NEGA PRESENÇA DE SANGUE, MUCO OU PUS NAS FEZES/);
  assert.ok(text.length >= 250);
});

test('diarrhea HDA renders chronology and characterization as one complete paragraph', () => {
  const text = composeDiarrheaHda({
    ...emptyDiarrheaHdaState(),
    onsetValue: '2',
    onsetUnit: 'dias',
    episodes: '4-6',
    consistency: 'líquidas'
  });

  assert.equal(
    text,
    'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA HÁ 2 DIAS, COM 4 A 6 EPISÓDIOS NAS ÚLTIMAS 24 HORAS, CARACTERIZADOS POR FEZES LÍQUIDAS.'
  );
});

test('diarrhea HDA separates reported findings from explicitly denied findings', () => {
  const text = composeDiarrheaHda({
    ...emptyDiarrheaHdaState(),
    findings: {
      ...emptyDiarrheaHdaState().findings,
      abdominalPain: HDA_FACT_STATE.PRESENT,
      fever: HDA_FACT_STATE.DENIED,
      blood: HDA_FACT_STATE.DENIED,
      mucus: HDA_FACT_STATE.PRESENT,
      pus: HDA_FACT_STATE.DENIED,
      oralIntolerance: HDA_FACT_STATE.DENIED
    }
  });

  assert.equal(
    text,
    'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA. REFERE DOR ABDOMINAL. REFERE PRESENÇA DE MUCO NAS FEZES. NEGA PRESENÇA DE SANGUE OU PUS NAS FEZES. NEGA FEBRE E INTOLERÂNCIA À VIA ORAL.'
  );
});

test('unknown findings stay absent instead of being converted to negatives', () => {
  const state = emptyDiarrheaHdaState();
  state.findings.fever = HDA_FACT_STATE.PRESENT;

  const text = composeDiarrheaHda(state);

  assert.match(text, /REFERE FEBRE/);
  assert.doesNotMatch(text, /SANGUE|MUCO|PUS|OLIGÚRIA|SÍNCOPE|HIPOTENSÃO/);
});

test('free details are normalized and appended without changing their clinical meaning', () => {
  const text = composeDiarrheaHda({
    ...emptyDiarrheaHdaState(),
    details: 'Fez uso de antibiótico há 7 dias, sem melhora'
  });

  assert.equal(
    text,
    'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA. FEZ USO DE ANTIBIÓTICO HÁ 7 DIAS, SEM MELHORA.'
  );
});

test('generated HDA updates automatically only while the clinician has not edited it', () => {
  assert.deepEqual(synchronizeGeneratedHda({
    currentText: 'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA.',
    previousGeneratedText: 'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA.',
    nextGeneratedText: 'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA HÁ 2 DIAS.'
  }), {
    text: 'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA HÁ 2 DIAS.',
    requiresConfirmation: false
  });

  assert.deepEqual(synchronizeGeneratedHda({
    currentText: 'PACIENTE COM DIARREIA HÁ CERCA DE 48H, PIORA HOJE.',
    previousGeneratedText: 'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA.',
    nextGeneratedText: 'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA HÁ 2 DIAS.'
  }), {
    text: 'PACIENTE COM DIARREIA HÁ CERCA DE 48H, PIORA HOJE.',
    requiresConfirmation: true
  });

  assert.deepEqual(synchronizeGeneratedHda({
    currentText: '',
    previousGeneratedText: 'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA.',
    nextGeneratedText: 'PACIENTE COMPARECE AO PS COM QUADRO DE DIARREIA HÁ 2 DIAS.'
  }), {
    text: '',
    requiresConfirmation: true
  });
});
