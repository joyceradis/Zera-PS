const $ = (id) => document.getElementById(id);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const normalize = (value) => String(value ?? '').trim().toUpperCase();

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function showFeedback(message) {
  const node = $('action-feedback');
  if (!node) return;
  node.textContent = message;
  clearTimeout(showFeedback.timer);
  showFeedback.timer = setTimeout(() => { node.textContent = ''; }, 4200);
}

function injectUiStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .quick-choice-wrap{margin:8px 0 10px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--surface-2)}
    .quick-choice-title{display:block;margin-bottom:9px;color:var(--muted);font-size:.72rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
    .quick-choice-grid{display:flex;flex-wrap:wrap;gap:8px}
    .quick-chip{min-height:40px;padding:9px 12px;border:1px solid var(--line-strong);border-radius:999px;background:var(--surface);color:var(--ink);font-size:.78rem;font-weight:800;line-height:1.1}
    .quick-chip.active{border-color:var(--navy);background:var(--navy);color:#fff;box-shadow:0 5px 15px rgba(11,31,51,.12)}
    .field.has-quick-choices>span:first-child::after{content:" · seleção rápida + edição livre";color:var(--muted);font-size:.7rem;font-weight:600}
    .score-answer{display:grid;grid-template-columns:minmax(0,1fr) 130px;gap:12px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:10px 11px;font-size:.84rem}
    .score-answer select{width:100%;border:1px solid var(--line-strong);border-radius:9px;background:#fff;padding:8px}
    .score-result.incomplete strong{font-size:.92rem}.score-result.incomplete span{font-weight:700}
    .safety-hint{margin:8px 0 0;color:var(--muted);font-size:.72rem}
    @media(max-width:600px){.quick-chip{min-height:44px}.score-answer{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function renderTemplates(templates, onApply) {
  const container = $('template-grid');
  if (!container) return;
  container.innerHTML = templates.map((template) =>
    `<button type="button" class="template-button" data-template="${escapeHtml(template.id)}">${escapeHtml(template.label)}</button>`
  ).join('');
  $$('.template-button', container).forEach((button) =>
    button.addEventListener('click', () => onApply(button.dataset.template))
  );
}

function setActiveTemplate(id) {
  $$('.template-button').forEach((button) =>
    button.classList.toggle('active', button.dataset.template === id)
  );
}

function optionEntries(config) {
  if (config.groups) {
    return config.groups.flatMap((group, groupIndex) =>
      group.map((value) => ({ value, group: String(groupIndex) }))
    );
  }
  return (config.options || []).map((value) => ({ value, group: '' }));
}

function parseValues(value) {
  return normalize(value).split(/\s*,\s*|\s*;\s*/).map((item) => item.trim()).filter(Boolean);
}

function buildQuickChoices(configs, fieldMap, onInput) {
  Object.entries(configs).forEach(([key, config]) => {
    const targetId = fieldMap[key] || key;
    const input = $(targetId);
    const field = input?.closest('.field');
    if (!input || !field || field.querySelector(`[data-quick-wrapper="${targetId}"]`)) return;
    field.classList.add('has-quick-choices');
    const wrapper = document.createElement('div');
    wrapper.className = 'quick-choice-wrap';
    wrapper.dataset.quickWrapper = targetId;
    wrapper.innerHTML = `<span class="quick-choice-title">TOQUE PARA SELECIONAR</span><div class="quick-choice-grid">${optionEntries(config).map((item) => `<button type="button" class="quick-chip" data-value="${escapeHtml(item.value)}" data-group="${item.group}">${escapeHtml(item.value)}</button>`).join('')}</div>`;
    input.before(wrapper);
    $$('.quick-chip', wrapper).forEach((button) => button.addEventListener('click', () => {
      const wasActive = button.classList.contains('active');
      const value = normalize(button.dataset.value);
      const known = new Set(optionEntries(config).map((item) => normalize(item.value)));
      const extras = parseValues(input.value).filter((item) => !known.has(item));
      if (config.exclusive && value === normalize(config.exclusive)) {
        $$('.quick-chip', wrapper).forEach((item) => item.classList.remove('active'));
        if (!wasActive) button.classList.add('active');
      } else {
        if (config.exclusive) $$('.quick-chip', wrapper).filter((item) => normalize(item.dataset.value) === normalize(config.exclusive)).forEach((item) => item.classList.remove('active'));
        if (button.dataset.group !== '') $$( `.quick-chip[data-group="${button.dataset.group}"]`, wrapper).forEach((item) => item.classList.remove('active'));
        button.classList.toggle('active', !wasActive);
      }
      const selected = $$('.quick-chip.active', wrapper).map((item) => item.dataset.value);
      const onlyExclusive = selected.length === 1 && config.exclusive && normalize(selected[0]) === normalize(config.exclusive);
      input.value = [...selected, ...(onlyExclusive ? [] : extras)].join(', ');
      onInput(key, input.value);
      syncQuickChoice(targetId);
    }));
    input.addEventListener('input', () => { onInput(key, input.value); syncQuickChoice(targetId); });
    syncQuickChoice(targetId);
  });
}

function syncQuickChoice(targetId) {
  const input = $(targetId);
  const wrapper = document.querySelector(`[data-quick-wrapper="${targetId}"]`);
  if (!input || !wrapper) return;
  const selected = new Set(parseValues(input.value));
  $$('.quick-chip', wrapper).forEach((button) => button.classList.toggle('active', selected.has(normalize(button.dataset.value))));
}

function syncAllQuickChoices(configs, fieldMap) {
  Object.keys(configs).forEach((key) => syncQuickChoice(fieldMap[key] || key));
}

function renderScores(definitions, onAnswer, onGlasgowChange) {
  const container = $('scores-container');
  if (!container) return;
  const cards = definitions.map((score) => `<article class="score-card" data-score-card="${score.id}"><h2>${score.title}</h2><p class="score-description">${score.description}</p><div class="score-options">${score.items.map((item) => `<label class="score-answer"><span>${item.label}</span><select data-score-answer="${item.key}"><option value="">Não informado</option><option value="false">Não</option><option value="true">Sim</option></select></label>`).join('')}</div><div class="score-result incomplete"><strong data-score-value>INCOMPLETO</strong><span data-score-text>Responda todos os itens para calcular.</span></div></article>`);
  cards.push(`<article class="score-card" data-score-card="glasgow"><h2>Escala de Coma de Glasgow</h2><p class="score-description">Informe os três componentes para calcular.</p>${[['eye','Abertura ocular',[[4,'Espontânea'],[3,'À voz'],[2,'À pressão'],[1,'Ausente']]],['verbal','Resposta verbal',[[5,'Orientada'],[4,'Confusa'],[3,'Palavras'],[2,'Sons'],[1,'Ausente']]],['motor','Resposta motora',[[6,'Obedece comandos'],[5,'Localiza'],[4,'Retirada'],[3,'Flexão anormal'],[2,'Extensão'],[1,'Ausente']]]].map(([key,label,options]) => `<label class="field"><span>${label}</span><select data-glasgow="${key}"><option value="">Não informado</option>${options.map(([value,text]) => `<option value="${value}">${value} — ${text}</option>`).join('')}</select></label>`).join('')}<div class="score-result incomplete"><strong data-score-value>INCOMPLETO</strong><span data-score-text>Informe abertura ocular, resposta verbal e resposta motora.</span></div></article>`);
  container.innerHTML = cards.join('');
  $$('[data-score-card]').forEach((card) => $$('[data-score-answer]', card).forEach((select) => select.addEventListener('change', () => onAnswer(card.dataset.scoreCard, select.dataset.scoreAnswer, select.value))));
  $$('[data-glasgow]').forEach((select) => select.addEventListener('change', onGlasgowChange));
}

function updateScoreCard(id, result) {
  const card = document.querySelector(`[data-score-card="${id}"]`);
  if (!card) return;
  const resultNode = card.querySelector('.score-result');
  const value = card.querySelector('[data-score-value]');
  const text = card.querySelector('[data-score-text]');
  const incomplete = result.status !== 'complete';
  resultNode.classList.toggle('incomplete', incomplete);
  value.textContent = incomplete ? 'INCOMPLETO' : `${result.score} ${result.score === 1 ? 'ponto' : 'pontos'}`;
  text.textContent = incomplete ? 'Responda todos os itens para calcular.' : result.interpretation;
}

function activateView(name) {
  $$('.view').forEach((view) => view.classList.toggle('active', view.id === `view-${name}`));
  $$('.nav-button').forEach((button) => button.classList.toggle('active', button.dataset.view === name));
  const active = $(`view-${name}`);
  if ($('view-title')) $('view-title').textContent = active?.dataset.title || 'Zera PS';
  $('sidebar')?.classList.remove('open');
  $('sidebar-overlay')?.classList.remove('open');
}

function reportPwaRegistrationError(error) {
  console.error('Zera PS: falha ao registrar service worker', error);
  window.dispatchEvent(new CustomEvent('zera:pwa-registration-error', { detail: { error } }));
}

function setupPwa() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(reportPwaRegistrationError);
    });
  }
  let installPrompt;
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installPrompt = event; if ($('install-button')) $('install-button').hidden = false; });
  $('install-button')?.addEventListener('click', async () => { if (!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; $('install-button').hidden = true; });
}

function updateConnection() {
  const status = $('connection-status');
  if (!status) return;
  status.textContent = navigator.onLine ? 'ONLINE' : 'OFFLINE';
  status.classList.toggle('offline', !navigator.onLine);
}

export { $, $$, escapeHtml, showFeedback, injectUiStyles, renderTemplates, setActiveTemplate, buildQuickChoices, syncAllQuickChoices, renderScores, updateScoreCard, activateView, setupPwa, updateConnection };
