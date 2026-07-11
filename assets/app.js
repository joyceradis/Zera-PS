(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const DATA = window.ZERA_DATA;
  const TEMPLATES = window.ZERA_TEMPLATES || [];
  const SCORES = window.ZERA_SCORES || [];

  const evolutionFieldIds = [
    'qp', 'hda', 'comorbidades', 'muc', 'alergias', 'habitos', 'cirurgias',
    'estado-geral', 'acv', 'ar', 'abd', 'ext', 'neuro', 'laboratoriais',
    'imagem', 'hipoteses', 'conduta', 'include-em-tempo', 'em-tempo'
  ];

  const normalize = (value) => String(value || '').trim().toUpperCase();
  const valueOr = (id, fallback) => normalize($(id)?.value) || fallback;
  const listBlock = (value, fallback = 'NA') => {
    const lines = normalize(value)
      .split(/\n+/)
      .map((line) => line.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean);
    return (lines.length ? lines : [fallback]).map((line) => `- ${line}`).join('\n');
  };

  function showFeedback(message) {
    const node = $('action-feedback');
    if (!node) return;
    node.textContent = message;
    window.clearTimeout(showFeedback.timer);
    showFeedback.timer = window.setTimeout(() => { node.textContent = ''; }, 3200);
  }

  function renderTemplates() {
    const container = $('template-grid');
    if (!container) return;
    container.innerHTML = TEMPLATES.map((template) => (
      `<button type="button" class="template-button" data-template="${template.id}">${template.label}</button>`
    )).join('');

    $$('.template-button', container).forEach((button) => {
      button.addEventListener('click', () => applyTemplate(button.dataset.template));
    });
  }

  function applyTemplate(id) {
    const template = TEMPLATES.find((item) => item.id === id);
    if (!template) return;
    $('qp').value = template.qp;
    $('hda').value = template.hda;
    $('hipoteses').value = template.hipoteses;
    $('conduta').value = template.conduta;
    $('laboratoriais').value ||= 'NA';
    $('imagem').value ||= 'NA';
    $$('.template-button').forEach((button) => button.classList.toggle('active', button.dataset.template === id));
    autosave();
    showFeedback(`Modelo ${template.label} aplicado. Revise os campos entre colchetes.`);
  }

  function clearTemplate() {
    $$('.template-button').forEach((button) => button.classList.remove('active'));
  }

  function fillHppNegatives() {
    Object.entries(DATA.hppNegative).forEach(([id, value]) => { $(id).value = value; });
    autosave();
  }

  function fillNormalExam() {
    Object.entries(DATA.normalExam).forEach(([key, value]) => {
      const id = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      if ($(id)) $(id).value = value;
    });
    autosave();
  }

  function generateEvolution() {
    const output = [
      '## EVOLUÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##',
      '',
      `# QP: ${valueOr('qp', 'NA')}`,
      '',
      `# HDA: ${valueOr('hda', 'NA')}`,
      '',
      '# HPP:',
      `- COMORBIDADES: ${valueOr('comorbidades', 'NEGA')}`,
      `- MUC: ${valueOr('muc', 'NEGA')}`,
      `- ALERGIAS: ${valueOr('alergias', 'NEGA')}`,
      `- HÁBITOS: ${valueOr('habitos', 'NEGA')}`,
      `- CIRURGIAS PRÉVIAS: ${valueOr('cirurgias', 'NEGA')}`,
      '',
      '# EXAME FÍSICO:',
      `- ${valueOr('estado-geral', 'NA')}`,
      `- ACV: ${valueOr('acv', 'NA')}`,
      `- AR: ${valueOr('ar', 'NA')}`,
      `- ABD: ${valueOr('abd', 'NA')}`,
      `- EXT: ${valueOr('ext', 'NA')}`,
      `- NEUROLÓGICO: ${valueOr('neuro', 'NA')}`,
      '',
      '# EXAMES COMPLEMENTARES:',
      `- LABORATORIAIS: ${valueOr('laboratoriais', 'NA')}`,
      `- IMAGEM: ${valueOr('imagem', 'NA')}`,
      '',
      '# HIPÓTESES DIAGNÓSTICAS:',
      listBlock($('hipoteses').value),
      '',
      '# CONDUTA:',
      listBlock($('conduta').value)
    ];

    if ($('include-em-tempo').checked) {
      output.push('', '# EM TEMPO:', listBlock($('em-tempo').value));
    }

    $('evolution-output').value = output.join('\n');
    $('save-status').textContent = 'GERADO';
    autosave();
    showFeedback('Evolução gerada. Revise antes de copiar.');
  }

  async function copyTextFrom(targetId) {
    const target = $(targetId);
    if (!target || !target.value.trim()) {
      showFeedback('Não há texto para copiar.');
      return;
    }
    try {
      await navigator.clipboard.writeText(target.value);
    } catch {
      target.select();
      document.execCommand('copy');
    }
    showFeedback('Texto copiado.');
  }

  function collectEvolutionState() {
    const state = {};
    evolutionFieldIds.forEach((id) => {
      const node = $(id);
      if (!node) return;
      state[id] = node.type === 'checkbox' ? node.checked : node.value;
    });
    state.output = $('evolution-output').value;
    return state;
  }

  function restoreEvolutionState(state = {}) {
    evolutionFieldIds.forEach((id) => {
      const node = $(id);
      if (!node || !(id in state)) return;
      if (node.type === 'checkbox') node.checked = Boolean(state[id]);
      else node.value = state[id] || '';
    });
    $('evolution-output').value = state.output || '';
    toggleEmTempo();
  }

  function autosave() {
    try {
      localStorage.setItem(DATA.storageKeys.autosave, JSON.stringify(collectEvolutionState()));
      $('save-status').textContent = 'AUTOSSALVO';
    } catch {
      $('save-status').textContent = 'NÃO SALVO';
    }
  }

  function loadAutosave() {
    try {
      const raw = localStorage.getItem(DATA.storageKeys.autosave);
      if (raw) restoreEvolutionState(JSON.parse(raw));
    } catch { /* armazenamento indisponível */ }
  }

  function getDrafts() {
    try { return JSON.parse(localStorage.getItem(DATA.storageKeys.drafts) || '[]'); }
    catch { return []; }
  }

  function setDrafts(drafts) {
    localStorage.setItem(DATA.storageKeys.drafts, JSON.stringify(drafts));
  }

  function saveDraft() {
    const state = collectEvolutionState();
    if (!state.qp && !state.hda && !state.output) {
      showFeedback('Preencha ao menos a QP ou a HDA antes de salvar.');
      return;
    }
    const drafts = getDrafts();
    drafts.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title: normalize(state.qp) || 'RASCUNHO SEM QP',
      createdAt: new Date().toISOString(),
      state
    });
    setDrafts(drafts.slice(0, 30));
    renderDrafts();
    $('save-status').textContent = 'SALVO';
    showFeedback('Rascunho salvo neste dispositivo.');
  }

  function renderDrafts() {
    const container = $('draft-list');
    if (!container) return;
    const drafts = getDrafts();
    if (!drafts.length) {
      container.innerHTML = '<div class="empty-state">Nenhum rascunho salvo neste dispositivo.</div>';
      return;
    }
    container.innerHTML = drafts.map((draft) => {
      const date = new Date(draft.createdAt).toLocaleString('pt-BR');
      return `<article class="draft-card">
        <div><h3>${escapeHtml(draft.title)}</h3><p>${date}</p></div>
        <div class="draft-actions">
          <button class="button button-secondary button-small" data-load-draft="${draft.id}">Abrir</button>
          <button class="button button-danger button-small" data-delete-draft="${draft.id}">Excluir</button>
        </div>
      </article>`;
    }).join('');

    $$('[data-load-draft]', container).forEach((button) => button.addEventListener('click', () => loadDraft(button.dataset.loadDraft)));
    $$('[data-delete-draft]', container).forEach((button) => button.addEventListener('click', () => deleteDraft(button.dataset.deleteDraft)));
  }

  function loadDraft(id) {
    const draft = getDrafts().find((item) => item.id === id);
    if (!draft) return;
    restoreEvolutionState(draft.state);
    activateView('evolucao');
    $('save-status').textContent = 'RASCUNHO ABERTO';
    showFeedback('Rascunho carregado.');
  }

  function deleteDraft(id) {
    setDrafts(getDrafts().filter((item) => item.id !== id));
    renderDrafts();
  }

  function clearAllDrafts() {
    if (!confirm('Apagar todos os rascunhos salvos neste dispositivo?')) return;
    setDrafts([]);
    renderDrafts();
  }

  function clearForm() {
    if (!confirm('Limpar todos os campos da evolução atual?')) return;
    $('evolution-form').reset();
    $('evolution-output').value = '';
    localStorage.removeItem(DATA.storageKeys.autosave);
    clearTemplate();
    toggleEmTempo();
    $('save-status').textContent = 'NÃO SALVO';
    showFeedback('Campos limpos.');
  }

  function toggleEmTempo() {
    $('em-tempo-field').hidden = !$('include-em-tempo').checked;
  }

  function generateReassessment() {
    $('reassessment-output').value = [
      '## REAVALIAÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##',
      '',
      `# EVOLUÇÃO: ${valueOr('reav-evolucao', 'NA')}`,
      '',
      '# EXAMES DISPONIBILIZADOS:',
      listBlock($('reav-exames').value),
      '',
      '# CONDUTA:',
      listBlock($('reav-conduta').value)
    ].join('\n');
  }

  function generateAdmission() {
    $('admission-output').value = [
      '## SOLICITAÇÃO DE INTERNAÇÃO - HOSPITAL MERIDIONAL SERRA ##',
      '',
      '# DIAGNÓSTICO / HIPÓTESE PRINCIPAL:',
      listBlock($('int-diagnostico').value),
      '',
      `# JUSTIFICATIVA CLÍNICA: ${valueOr('int-justificativa', 'NA')}`,
      '',
      `# DESTINO SOLICITADO: ${valueOr('int-destino', 'ENFERMARIA')}`,
      '',
      '# PRESCRIÇÃO / CUIDADOS INICIAIS:',
      listBlock($('int-prescricao').value)
    ].join('\n');
  }

  function generateDischarge() {
    $('discharge-output').value = [
      '## ALTA PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##',
      '',
      '# DIAGNÓSTICO FINAL:',
      listBlock($('alta-diagnostico').value),
      '',
      `# SUMÁRIO DE ALTA: ${valueOr('alta-resumo', 'NA')}`,
      '',
      '# MEDICAÇÕES DOMICILIARES:',
      listBlock($('alta-medicacoes').value),
      '',
      '# ORIENTAÇÕES E SINAIS DE ALARME:',
      listBlock($('alta-orientacoes').value)
    ].join('\n');
  }

  function renderScores() {
    const container = $('scores-container');
    if (!container) return;
    container.innerHTML = SCORES.map((score) => {
      if (score.custom === 'glasgow') return glasgowCard();
      return `<article class="score-card" data-score-card="${score.id}">
        <h2>${score.title}</h2>
        <p class="score-description">${score.description}</p>
        <div class="score-options">
          ${score.items.map((item, index) => `<label class="score-option"><input type="checkbox" data-score-item="${index}"><span>${item.label}</span></label>`).join('')}
        </div>
        <div class="score-result"><strong data-score-value>0 ponto</strong><span data-score-text>${score.interpret(0)}</span></div>
      </article>`;
    }).join('');

    SCORES.filter((score) => !score.custom).forEach((score) => {
      const card = container.querySelector(`[data-score-card="${score.id}"]`);
      $$('[data-score-item]', card).forEach((input) => input.addEventListener('change', () => updateScore(score, card)));
    });

    ['glasgow-eye', 'glasgow-verbal', 'glasgow-motor'].forEach((id) => $(id)?.addEventListener('change', updateGlasgow));
    updateGlasgow();
  }

  function updateScore(score, card) {
    const total = $$('[data-score-item]', card).reduce((sum, input, index) => sum + (input.checked ? score.items[index].points : 0), 0);
    card.querySelector('[data-score-value]').textContent = `${total} ${total === 1 ? 'ponto' : 'pontos'}`;
    card.querySelector('[data-score-text]').textContent = score.interpret(total);
  }

  function glasgowCard() {
    return `<article class="score-card">
      <h2>Escala de Coma de Glasgow</h2>
      <p class="score-description">Selecione a melhor resposta observada em cada componente.</p>
      <label class="field"><span>Abertura ocular</span><select id="glasgow-eye"><option value="4">4 — Espontânea</option><option value="3">3 — À voz</option><option value="2">2 — À pressão</option><option value="1">1 — Ausente</option></select></label>
      <label class="field"><span>Resposta verbal</span><select id="glasgow-verbal"><option value="5">5 — Orientada</option><option value="4">4 — Confusa</option><option value="3">3 — Palavras</option><option value="2">2 — Sons</option><option value="1">1 — Ausente</option></select></label>
      <label class="field"><span>Resposta motora</span><select id="glasgow-motor"><option value="6">6 — Obedece comandos</option><option value="5">5 — Localiza</option><option value="4">4 — Retirada</option><option value="3">3 — Flexão anormal</option><option value="2">2 — Extensão</option><option value="1">1 — Ausente</option></select></label>
      <div class="score-result"><strong id="glasgow-value">15 pontos</strong><span id="glasgow-text">Registrar componentes e contexto clínico.</span></div>
    </article>`;
  }

  function updateGlasgow() {
    const ids = ['glasgow-eye', 'glasgow-verbal', 'glasgow-motor'];
    if (!ids.every((id) => $(id))) return;
    const total = ids.reduce((sum, id) => sum + Number($(id).value), 0);
    $('glasgow-value').textContent = `${total} pontos`;
    $('glasgow-text').textContent = total <= 8
      ? 'Pontuação associada a rebaixamento importante; avaliar proteção de via aérea e contexto.'
      : 'Interpretar em conjunto com sedação, intoxicação, trauma e exame neurológico.';
  }

  function activateView(name) {
    $$('.view').forEach((view) => view.classList.toggle('active', view.id === `view-${name}`));
    $$('.nav-button').forEach((button) => button.classList.toggle('active', button.dataset.view === name));
    const active = $(`view-${name}`);
    $('view-title').textContent = active?.dataset.title || 'Zera PS';
    closeSidebar();
    if (name === 'rascunhos') renderDrafts();
  }

  function openSidebar() {
    $('sidebar').classList.add('open');
    $('sidebar-overlay').classList.add('open');
  }

  function closeSidebar() {
    $('sidebar').classList.remove('open');
    $('sidebar-overlay').classList.remove('open');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function setupPwa() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
    }

    let installPrompt;
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      installPrompt = event;
      $('install-button').hidden = false;
    });
    $('install-button')?.addEventListener('click', async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      $('install-button').hidden = true;
    });
  }

  function updateConnection() {
    const status = $('connection-status');
    if (!status) return;
    status.textContent = navigator.onLine ? 'ONLINE' : 'OFFLINE';
    status.classList.toggle('offline', !navigator.onLine);
  }

  function bindEvents() {
    $('generate-evolution').addEventListener('click', generateEvolution);
    $('copy-evolution').addEventListener('click', () => copyTextFrom('evolution-output'));
    $('save-draft').addEventListener('click', saveDraft);
    $('clear-form').addEventListener('click', clearForm);
    $('fill-negatives').addEventListener('click', fillHppNegatives);
    $('fill-normal-exam').addEventListener('click', fillNormalExam);
    $('clear-template').addEventListener('click', clearTemplate);
    $('include-em-tempo').addEventListener('change', () => { toggleEmTempo(); autosave(); });
    $('evolution-form').addEventListener('input', autosave);
    $('evolution-output').addEventListener('input', autosave);

    $('generate-reassessment').addEventListener('click', generateReassessment);
    $('generate-admission').addEventListener('click', generateAdmission);
    $('generate-discharge').addEventListener('click', generateDischarge);
    $$('[data-copy-target]').forEach((button) => button.addEventListener('click', () => copyTextFrom(button.dataset.copyTarget)));

    $$('.nav-button').forEach((button) => button.addEventListener('click', () => activateView(button.dataset.view)));
    $('menu-button').addEventListener('click', openSidebar);
    $('sidebar-overlay').addEventListener('click', closeSidebar);
    $('clear-all-drafts').addEventListener('click', clearAllDrafts);
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
  }

  function init() {
    renderTemplates();
    renderScores();
    loadAutosave();
    renderDrafts();
    bindEvents();
    toggleEmTempo();
    updateConnection();
    setupPwa();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
