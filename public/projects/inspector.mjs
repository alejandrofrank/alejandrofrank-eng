const region = document.querySelector('[data-project-inspector]');
if (region) {
  const trigger = region.querySelector('[data-inspector-launch]');
  const status = region.querySelector('[data-inspector-status]');
  const kind = region.dataset.projectInspector;
  async function load() {
    trigger.disabled = true;
    status.textContent = 'Loading the comparison…';
    try {
      if (kind === 'match') {
        const { initMatchDemo } = await import('/play/match-demo.mjs');
        initMatchDemo();
      } else {
        const { initImageDemo } = await import('/play/image-demo.mjs');
        initImageDemo().activate();
      }
      const focusControls = kind === 'image' && document.activeElement === trigger;
      trigger.hidden = true;
      status.textContent = '';
      if (focusControls) region.querySelector('#image-sample').focus({ preventScroll: true });
    } catch {
      status.textContent = 'The comparison could not load. Try again, or use the project links above.';
      trigger.textContent = 'Try again';
      trigger.disabled = false;
    }
  }
  trigger.hidden = false;
  trigger.addEventListener('click', load);
  if (kind === 'match') load();
}
