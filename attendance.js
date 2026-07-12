(() => {
  'use strict';

  const KEYS = Object.freeze({
    attendances: 'zera-ps:attendances:v2',
    currentId: 'zera-ps:current-attendance-id:v2',
    dailySequence: 'zera-ps:attendance-sequence:v2'
  });

  const STATUS = Object.freeze({
    IN_PROGRESS: 'em_andamento',
    REASSESSMENT: 'reavaliacao_pendente',
    FINISHED: 'finalizado'
  });

  const OUTCOMES = Object.freeze({
    DISCHARGE: 'alta',
    ADMISSION: 'internacao',
    TRANSFER: 'transferencia'
  });

  const now = () => new Date().toISOString();

  function dateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function id() {
    return globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `attendance-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);

      return value
        ? JSON.parse(value)
        : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function list() {
    const items = read(KEYS.attendances, []);

    return Array.isArray(items)
      ? items
          .slice()
          .sort((a, b) =>
            String(b.startedAt).localeCompare(String(a.startedAt))
          )
      : [];
  }

  function nextNumber() {
    const today = dateKey();

    const sequence = read(KEYS.dailySequence, {
      date: today,
      value: 0
    });

    const value =
      sequence.date === today
        ? Number(sequence.value || 0) + 1
        : 1;

    write(KEYS.dailySequence, {
      date: today,
      value
    });

    return value;
  }

  function create(clinical = {}, metadata = {}) {
    const timestamp = now();

    return {
      schemaVersion: 2,

      id: id(),
      number: nextNumber(),

      startedAt: timestamp,
      updatedAt: timestamp,
      finishedAt: null,

      status: STATUS.IN_PROGRESS,
      outcome: null,

      hospital: metadata.hospital || '',
      unit: metadata.unit || '',
      insurance: metadata.insurance || '',

      cidPrincipal: metadata.cidPrincipal || '',
      secondaryCids: [],

      allergies: String(
        clinical.alergias ||
        metadata.allergies ||
        ''
      ).trim(),

      clinical: {
        ...clinical
      },

      reassessments: [],
      reports: []
    };
  }

  function save(attendance, makeCurrent = true) {
    if (!attendance?.id) {
      throw new TypeError('Atendimento inválido.');
    }

    const items = list();

    const updated = {
      ...attendance,
      updatedAt: now()
    };

    const index = items.findIndex(
      (item) => item.id === updated.id
    );

    if (index >= 0) {
      items[index] = updated;
    } else {
      items.unshift(updated);
    }

    if (!write(KEYS.attendances, items)) {
      return null;
    }

    if (makeCurrent) {
      try {
        localStorage.setItem(
          KEYS.currentId,
          updated.id
        );
      } catch {
        return updated;
      }
    }

    return updated;
  }

  function start(clinical = {}, metadata = {}) {
    return save(
      create(clinical, metadata)
    );
  }

  function get(attendanceId) {
    return (
      list().find(
        (item) => item.id === attendanceId
      ) || null
    );
  }

  function current() {
    try {
      return get(
        localStorage.getItem(KEYS.currentId)
      );
    } catch {
      return null;
    }
  }

  function setCurrent(attendanceId) {
    if (!get(attendanceId)) {
      return false;
    }

    try {
      localStorage.setItem(
        KEYS.currentId,
        attendanceId
      );

      return true;
    } catch {
      return false;
    }
  }

  function clearCurrent() {
    try {
      localStorage.removeItem(KEYS.currentId);
      return true;
    } catch {
      return false;
    }
  }

  function updateClinical(clinical = {}) {
    const attendance =
      current() || create();

    return save({
      ...attendance,

      allergies: String(
        clinical.alergias ||
        attendance.allergies ||
        ''
      ).trim(),

      clinical: {
        ...clinical
      }
    });
  }

  function addReassessment(data = {}) {
    const attendance = current();

    if (!attendance) {
      return null;
    }

    return save({
      ...attendance,

      status: STATUS.REASSESSMENT,

      reassessments: [
        ...(attendance.reassessments || []),

        {
          id: id(),
          createdAt: now(),

          evolution: String(
            data.evolution || ''
          ).trim(),

          exams: String(
            data.exams || ''
          ).trim(),

          conduct: String(
            data.conduct || ''
          ).trim()
        }
      ]
    });
  }

  function finish(outcome) {
    if (
      !Object.values(OUTCOMES).includes(outcome)
    ) {
      throw new TypeError('Desfecho inválido.');
    }

    const attendance = current();

    if (!attendance) {
      return null;
    }

    return save({
      ...attendance,

      status: STATUS.FINISHED,
      outcome,
      finishedAt: now()
    });
  }

  window.ZERA_ATTENDANCE = Object.freeze({
    KEYS,
    STATUS,
    OUTCOMES,

    list,
    create,
    save,
    start,
    get,
    current,
    setCurrent,
    clearCurrent,
    updateClinical,
    addReassessment,
    finish
  });
})();
