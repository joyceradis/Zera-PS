window.ZERA_DATA = {
  normalExam: {
    estadoGeral: 'BEG, LOTE, CORADO, HIDRATADO, ANICTÉRICO, ACIANÓTICO, AFEBRIL',
    acv: 'RCR, 2T, BNF, SEM SOPROS',
    ar: 'MV PRESENTE BILATERALMENTE, SEM RUÍDOS ADVENTÍCIOS',
    abd: 'PLANO, FLÁCIDO, INDOLOR À PALPAÇÃO, SEM SINAIS DE IRRITAÇÃO PERITONEAL',
    ext: 'SEM EDEMAS, PULSOS PERIFÉRICOS PALPÁVEIS E SIMÉTRICOS',
    neuro: 'LOTE, GLASGOW 15, SEM DÉFICITS NEUROLÓGICOS FOCAIS'
  },
  hppNegative: {
    comorbidades: 'NEGA',
    muc: 'NEGA',
    alergias: 'NEGA',
    habitos: 'NEGA',
    cirurgias: 'NEGA'
  },
  storageKeys: {
    drafts: 'zera-ps:drafts:v1',
    autosave: 'zera-ps:autosave:v1'
  }
};

(() => {
  'use strict';

  const QUICK_CHOICES = {
    comorbidades: {
      exclusive: 'NEGA',
      options: [
        'NEGA',
        'HAS',
        'DM2',
        'DLP',
        'ASMA',
        'DPOC',
        'IC',
        'DAC',
        'DRC',
        'HIPOTIREOIDISMO',
        'OBESIDADE'
      ]
    },

    muc: {
      exclusive: 'NEGA',
      options: [
        'NEGA',
        'LOSARTANA',
        'ANLODIPINO',
        'HIDROCLOROTIAZIDA',
        'METFORMINA',
        'INSULINA',
        'LEVOTIROXINA',
        'AAS',
        'ESTATINA'
      ]
    },

    alergias: {
      exclusive: 'NEGA',
      options: [
        'NEGA',
        'DIPIRONA',
        'AINE',
        'PENICILINA',
        'AMOXICILINA',
        'SULFA'
      ]
    },

    habitos: {
      exclusive: 'NEGA',
      options: [
        'NEGA',
        'TABAGISMO',
        'EX-TABAGISMO',
        'ETILISMO',
        'NEGA TABAGISMO',
        'NEGA ETILISMO'
      ]
    },

    cirurgias: {
      exclusive: 'NEGA',
      options: [
        'NEGA',
        'APENDICECTOMIA',
        'COLECISTECTOMIA',
        'CESÁREA',
        'HISTERECTOMIA',
        'BARIÁTRICA'
      ]
    },

    'estado-geral': {
      groups: [
        ['BEG', 'REG', 'MEG'],
        ['LOTE', 'CONFUSO', 'REBAIXADO'],
        ['CORADO', 'HIPOCORADO'],
        ['HIDRATADO', 'HIPOHIDRATADO', 'DESIDRATADO'],
        ['ANICTÉRICO', 'ICTÉRICO'],
        ['ACIANÓTICO', 'CIANÓTICO'],
        ['AFEBRIL', 'FEBRIL']
      ]
    },

    acv: {
      options: [
        'RCR',
        '2T',
        'BNF',
        'SEM SOPROS',
        'TAQUICÁRDICO',
        'BRADICÁRDICO',
        'ARRÍTMICO',
        'COM SOPRO'
      ]
    },

    ar: {
      options: [
        'MV PRESENTE BILATERALMENTE',
        'SEM RUÍDOS ADVENTÍCIOS',
        'SEM DESCONFORTO RESPIRATÓRIO',
        'SIBILOS',
        'ESTERTORES',
        'RONCOS',
        'MV REDUZIDO',
        'COM DESCONFORTO RESPIRATÓRIO'
      ]
    },

    abd: {
      options: [
        'PLANO',
        'FLÁCIDO',
        'RHA PRESENTES',
        'INDOLOR À PALPAÇÃO',
        'DOLOROSO DIFUSAMENTE',
        'DOR LOCALIZADA',
        'SEM DEFESA',
        'SEM SINAIS DE IRRITAÇÃO PERITONEAL',
        'COM DEFESA',
        'DB+'
      ]
    },

    ext: {
      options: [
        'SEM EDEMAS',
        'PULSOS PERIFÉRICOS PALPÁVEIS E SIMÉTRICOS',
        'TEC < 2S',
        'COM EDEMA',
        'ASSIMETRIA',
        'EMPASTAMENTO DE PANTURRILHA'
      ]
    },

    neuro: {
      options: [
        'LOTE',
        'GLASGOW 15',
        'SEM DÉFICITS NEUROLÓGICOS FOCAIS',
        'SEM SINAIS MENÍNGEOS',
        'CONFUSO',
        'COM DÉFICIT FOCAL',
        'COM SINAIS MENÍNGEOS'
      ]
    }
  };

  const $ = (id) => document.getElementById(id);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const normalize = (value) =>
    String(value || '').trim().toUpperCase();

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[char]));
  }

  function injectStyles() {
    const style = document.createElement('style');

    style.textContent = `
      .quick-block {
        margin: 0 0 22px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: var(--radius-sm);
        background: linear-gradient(
          180deg,
          #ffffff 0%,
          #f8fbfd 100%
        );
      }

      .quick-block .field {
        margin: 0;
      }

      .quick-block textarea {
        min-height: 170px;
      }

      .quick-help {
        margin: 7px 0 0;
        color: var(--muted);
        font-size: .78rem;
      }

      .quick-choice-wrap {
        margin: 8px 0 10px;
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: var(--surface-2);
      }

      .quick-choice-title {
        display: block;
        margin-bottom: 9px;
        color: var(--muted);
        font-size: .72rem;
        font-weight: 800;
        letter-spacing: .05em;
        text-transform: uppercase;
      }

      .quick-choice-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .quick-chip {
        min-height: 40px;
        padding: 9px 12px;
        border: 1px solid var(--line-strong);
        border-radius: 999px;
        background: var(--surface);
        color: var(--ink);
        font-size: .78rem;
        font-weight: 800;
        line-height: 1.1;
      }

      .quick-chip.active {
        border-color: var(--navy);
        background: var(--navy);
        color: #fff;
        box-shadow: 0 5px 15px rgba(11, 31, 51, .12);
      }

      .quick-chip:active {
        transform: translateY(1px);
      }

      .field.has-quick-choices > input {
        margin-top: 2px;
      }

      .field.has-quick-choices > span:first-child::after {
        content: " · seleção rápida + edição livre";
        color: var(--muted);
        font-size: .7rem;
        font-weight: 600;
      }

      .preview-panel .output-area {
        min-height: 520px;
        white-space: pre-wrap;
      }

      @media (max-width: 1100px) {
        .content-grid {
          grid-template-columns: 1fr !important;
        }

        .preview-panel {
          order: -1;
        }

        .preview-sticky {
          position: static !important;
        }

        .preview-panel .output-area {
          min-height: 420px;
        }
      }

      @media (max-width: 600px) {
        .quick-block,
        .quick-choice-wrap {
          padding: 12px;
        }

        .quick-chip {
          min-height: 44px;
          padding: 10px 12px;
          font-size: .76rem;
        }

        .preview-panel .output-area {
          min-height: 360px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function optionEntries(config) {
    if (config.groups) {
      return config.groups.flatMap((group, groupIndex) =>
        group.map((value) => ({
          value,
          group: String(groupIndex)
        }))
      );
    }

    return (config.options || []).map((value) => ({
      value,
      group: ''
    }));
  }

  function parseValues(value) {
    return normalize(value)
      .split(/\s*,\s*|\s*;\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function buildQuickNotes() {
    const hda = $('hda');
    const hdaField = hda?.closest('.field');
    const formSection = hdaField?.closest('.form-section');

    if (
      !hda ||
      !hdaField ||
      !formSection ||
      $('quick-notes')
    ) {
      return;
    }

    const block = document.createElement('div');
    block.className = 'quick-block';

    block.innerHTML = `
      <label class="field">
        <span>HDA — BLOCO ÚNICO</span>

        <textarea
          id="quick-notes"
          rows="8"
          placeholder="DIGITE OU COLE A HISTÓRIA COMPLETA DO QUADRO EM UM ÚNICO BLOCO"
        ></textarea>

        <small class="quick-help">
          ESTE É O CAMPO UTILIZADO PARA GERAR A HDA.
        </small>
      </label>
    `;

    formSection.insertBefore(block, hdaField);

    hdaField.hidden = true;

    const quickNotes = $('quick-notes');

    quickNotes.value = hda.value || '';

    quickNotes.addEventListener('input', () => {
      hda.value = quickNotes.value;

      hda.dispatchEvent(
        new Event('input', {
          bubbles: true
        })
      );
    });
  }

  function buildChoices() {
    Object.entries(QUICK_CHOICES).forEach(
      ([targetId, config]) => {
        const input = $(targetId);
        const field = input?.closest('.field');

        if (
          !input ||
          !field ||
          field.querySelector(
            `[data-quick-wrapper="${targetId}"]`
          )
        ) {
          return;
        }

        field.classList.add('has-quick-choices');

        input.placeholder =
          'EDITE OU ACRESCENTE AQUI, SE NECESSÁRIO';

        const wrapper = document.createElement('div');

        wrapper.className = 'quick-choice-wrap';
        wrapper.dataset.quickWrapper = targetId;

        wrapper.innerHTML = `
          <span class="quick-choice-title">
            TOQUE PARA SELECIONAR
          </span>

          <div class="quick-choice-grid">
            ${optionEntries(config).map((item) => `
              <button
                type="button"
                class="quick-chip"
                data-value="${escapeHtml(item.value)}"
                data-group="${item.group}"
              >
                ${escapeHtml(item.value)}
              </button>
            `).join('')}
          </div>
        `;

        input.before(wrapper);

        $$('.quick-chip', wrapper).forEach((button) => {
          button.addEventListener('click', () => {
            handleChoice(
              targetId,
              config,
              button
            );
          });
        });

        input.addEventListener('input', () => {
          syncButtons(targetId);
        });

        syncButtons(targetId);
      }
    );
  }

  function handleChoice(
    targetId,
    config,
    button
  ) {
    const input = $(targetId);

    const wrapper =
      button.closest('[data-quick-wrapper]');

    if (!input || !wrapper) {
      return;
    }

    const value =
      normalize(button.dataset.value);

    const group =
      button.dataset.group;

    const wasActive =
      button.classList.contains('active');

    const known = new Set(
      optionEntries(config).map((item) =>
        normalize(item.value)
      )
    );

    const extras =
      parseValues(input.value).filter(
        (item) => !known.has(item)
      );

    if (
      config.exclusive &&
      value === normalize(config.exclusive)
    ) {
      $$('.quick-chip', wrapper).forEach(
        (item) =>
          item.classList.remove('active')
      );

      if (!wasActive) {
        button.classList.add('active');
      }
    } else {
      if (config.exclusive) {
        $$('.quick-chip', wrapper).forEach(
          (item) => {
            if (
              normalize(item.dataset.value) ===
              normalize(config.exclusive)
            ) {
              item.classList.remove('active');
            }
          }
        );
      }

      if (group !== '') {
        $$(
          `.quick-chip[data-group="${group}"]`,
          wrapper
        ).forEach((item) =>
          item.classList.remove('active')
        );
      }

      button.classList.toggle(
        'active',
        !wasActive
      );
    }

    const selected =
      $$('.quick-chip.active', wrapper).map(
        (item) => item.dataset.value
      );

    const onlyExclusive =
      selected.length === 1 &&
      normalize(selected[0]) ===
        normalize(config.exclusive);

    input.value = [
      ...selected,
      ...(onlyExclusive ? [] : extras)
    ].join(', ');

    input.dispatchEvent(
      new Event('input', {
        bubbles: true
      })
    );
  }

  function syncButtons(targetId) {
    const input = $(targetId);

    const wrapper =
      document.querySelector(
        `[data-quick-wrapper="${targetId}"]`
      );

    if (!input || !wrapper) {
      return;
    }

    const selected =
      new Set(parseValues(input.value));

    $$('.quick-chip', wrapper).forEach(
      (button) => {
        button.classList.toggle(
          'active',
          selected.has(
            normalize(button.dataset.value)
          )
        );
      }
    );
  }

  function syncAll() {
    Object.keys(QUICK_CHOICES).forEach(
      syncButtons
    );

    const quickNotes = $('quick-notes');
    const hda = $('hda');

    if (
      quickNotes &&
      hda &&
      document.activeElement !== quickNotes
    ) {
      quickNotes.value = hda.value || '';
    }
  }

  function bindSyncTriggers() {
    document.addEventListener(
      'click',
      (event) => {
        const trigger =
          event.target.closest(
            '.template-button, ' +
            '[data-load-draft], ' +
            '#fill-negatives, ' +
            '#fill-normal-exam, ' +
            '#clear-form, ' +
            '#generate-evolution'
          );

        if (!trigger) {
          return;
        }

        window.setTimeout(() => {
          syncAll();

          if (
            trigger.id ===
            'generate-evolution'
          ) {
            $('evolution-output')
              ?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
          }
        }, 0);
      }
    );
  }

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      injectStyles();
      buildQuickNotes();
      buildChoices();
      bindSyncTriggers();

      window.setTimeout(
        syncAll,
        0
      );
    }
  );
})();