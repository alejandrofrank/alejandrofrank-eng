// Native dialog supplies focus containment and makes the arcade floor inert.
// Keeping the same panels alive preserves each game's progress between visits.
export function mountCabinetScreen({ panels, onExit = () => {} }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'arcade-screen'; dialog.id = 'arcade-screen';
  dialog.setAttribute('aria-labelledby', 'arcade-screen-title');
  dialog.innerHTML = '<div class="screen-marquee"><div><span id="arcade-screen-project"></span><h2 id="arcade-screen-title"></h2></div><button type="button" class="screen-exit" aria-label="Back to arcade">← Back to arcade <kbd>Esc</kbd></button></div><div class="screen-viewport"><div class="station-panels"></div></div><div class="screen-rim" aria-hidden="true"><i></i><span>AF / PROJECT ARCADE</span><i></i></div>';
  const actions = document.createElement('nav'); actions.className = 'screen-actions'; actions.setAttribute('aria-label', 'Leave game');
  const home = document.createElement('a'); home.className = 'screen-home'; home.textContent = 'Home';
  home.href = document.querySelector('[data-destination="home"]')?.getAttribute('href') || '/';
  actions.append(home, dialog.querySelector('.screen-exit'));
  dialog.querySelector('.screen-marquee').append(actions);
  document.body.append(dialog);
  const host = dialog.querySelector('.station-panels'), exit = dialog.querySelector('.screen-exit'), viewport = dialog.querySelector('.screen-viewport');
  panels.forEach(panel => { panel.hidden = true; host.append(panel); });
  let returnTo = null, savedOverflow = '', current = null;
  function close({ notify = true } = {}) {
    if (!dialog.open) return;
    dialog.close(); panels.forEach(panel => { panel.hidden = true; });
    document.body.style.overflow = savedOverflow;
    if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    if (notify) onExit(current);
  }
  exit.addEventListener('click', () => close());
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  return {
    get isOpen() { return dialog.open; },
    get current() { return current; },
    close,
    open(slug, trigger) {
      const panel = panels.find(item => item.dataset.stationPanel === slug); if (!panel) return false;
      const wasOpen = dialog.open; current = slug; returnTo = trigger || returnTo;
      panels.forEach(item => { item.hidden = item !== panel; });
      dialog.style.setProperty('--station', panel.style.getPropertyValue('--station'));
      dialog.querySelector('#arcade-screen-title').textContent = document.getElementById(panel.getAttribute('aria-labelledby'))?.textContent || 'Project game';
      dialog.querySelector('#arcade-screen-project').textContent = panel.querySelector('.console-slot')?.textContent || 'PROJECT ARCADE';
      if (!wasOpen) {
        savedOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
        dialog.showModal();
        const origin = trigger?.closest('.station')?.getBoundingClientRect(), bounds = dialog.getBoundingClientRect();
        dialog.style.setProperty('--screen-origin-x', origin ? `${origin.left + origin.width / 2 - bounds.left}px` : '50%');
        dialog.style.setProperty('--screen-origin-y', origin ? `${origin.top + origin.height / 3 - bounds.top}px` : '35%');
      }
      viewport.scrollTop = 0; exit.focus({ preventScroll: true }); return true;
    },
  };
}
