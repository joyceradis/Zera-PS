import { CONTEXT_EVENTS } from './context-coordination.js';

function handleDraftLoadClick(event) {
  const trigger = event.target?.closest?.('[data-load-draft]');
  if (!trigger) return;

  queueMicrotask(() => {
    document.dispatchEvent(new CustomEvent(CONTEXT_EVENTS.DOCUMENTATION_RESTORED));
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleDraftLoadClick);
}

export { handleDraftLoadClick };
