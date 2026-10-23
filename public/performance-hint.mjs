const EFFECTS_KEY = 'portfolio-effects';
const DISMISSED_KEY = 'portfolio-performance-dismissed';

// A rendering symptom, not a hardware/driver or browser-setting detector.
// Two consecutive bad two-second windows avoid reacting to one long task.
export function createFrameHealthMonitor() {
  let last = null, elapsed = 0, frames = 0, slowFrames = 0, badWindows = 0, windows = 0, result = 'sampling';
  return now => {
    if (result !== 'sampling') return result;
    if (last === null) { last = now; return 'sampling'; }
    const delta = now - last; last = now;
    if (delta <= 0) return 'sampling';
    // A sleep, suspended tab or debugger pause isn't evidence of poor rendering.
    if (delta > 1500) { elapsed = frames = slowFrames = badWindows = 0; return 'sampling'; }
    elapsed += delta; frames++;
    if (delta >= 50) slowFrames++;
    if (elapsed < 2000) return 'sampling';
    badWindows = elapsed / frames >= 40 && slowFrames / frames >= .35 ? badWindows + 1 : 0;
    windows++; elapsed = frames = slowFrames = 0;
    if (badWindows >= 2) result = 'slow';
    else if (windows >= 6) result = 'done';
    return result;
  };
}

export function initPerformanceHint(doc = document, options = {}) {
  const background = doc.querySelector('.color-world');
  if (!background || background.dataset.performanceReady) return;
  background.dataset.performanceReady = 'true';
  const win = doc.defaultView;
  const frames = options.frames || { request: fn => win.requestAnimationFrame(fn), cancel: id => win.cancelAnimationFrame(id) };
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  const read = (storage, key) => { try { return win[storage].getItem(key); } catch { return null; } };
  const write = (storage, key, value) => { try { value === null ? win[storage].removeItem(key) : win[storage].setItem(key, value); } catch {} };
  let light = read('localStorage', EFFECTS_KEY) === 'light';
  let dismissed = read('sessionStorage', DISMISSED_KEY) === '1';
  let frame = 0, starts = 0, settled = 0, meter, notice, destroyed = false;
  const restore = doc.createElement('button');
  restore.type = 'button'; restore.className = 'effects-restore'; restore.hidden = true;
  restore.textContent = 'Lighter effects · Restore';
  restore.setAttribute('aria-label', 'Restore full background effects');
  doc.body.append(restore);

  function stop() { if (frame) frames.cancel(frame); frame = 0; }
  function sync() {
    background.dataset.effects = light ? 'light' : 'full';
    restore.hidden = !light || reduced.matches;
    if (light || reduced.matches) { stop(); if (notice) notice.hidden = true; }
    win.dispatchEvent(new win.Event('portfolio:effectschange'));
  }
  function dismiss() {
    dismissed = true; write('sessionStorage', DISMISSED_KEY, '1');
    stop(); if (notice) notice.hidden = true;
  }
  function show() {
    if (notice || dismissed || light || reduced.matches) return;
    notice = doc.createElement('aside'); notice.className = 'performance-hint';
    notice.setAttribute('aria-label', 'Background performance');
    notice.innerHTML = `<p role="status">Background motion looks choppy.</p>
      <p>Try lighter effects for a smoother visit, or check your browser’s graphics settings.</p>
      <div class="performance-hint-actions"><button type="button" data-use-light>Use lighter effects</button><button type="button" data-dismiss>Not now</button></div>
      <details><summary>Check graphics acceleration</summary><p>In desktop Chrome, open Settings → System. Check “Use graphics acceleration when available”, then relaunch Chrome if you change it.</p><p>Slow rendering can also come from power-saving mode or a busy device. This notice does not confirm that acceleration is off.</p></details>`;
    notice.querySelector('[data-use-light]').addEventListener('click', () => {
      light = true; write('localStorage', EFFECTS_KEY, 'light'); dismiss(); sync();
      restore.focus({ preventScroll: true });
    });
    notice.querySelector('[data-dismiss]').addEventListener('click', () => {
      dismiss(); doc.querySelector('.view-choice[aria-current=page]')?.focus({ preventScroll: true });
    });
    doc.body.append(notice); // Never move focus when a notice appears.
  }
  function sample(now) {
    frame = 0;
    if (destroyed || doc.hidden || light || reduced.matches || dismissed || doc.querySelector('dialog[open]')) return;
    if (now >= settled) {
      const result = meter(now);
      if (result === 'slow') { show(); return; }
      if (result === 'done') return;
    }
    frame = frames.request(sample);
  }
  function start() {
    if (destroyed || frame || starts >= 3 || doc.readyState !== 'complete' || doc.hidden || light || reduced.matches || dismissed || notice) return;
    starts++; settled = win.performance.now() + 2000; meter = createFrameHealthMonitor();
    frame = frames.request(sample);
  }
  function visibility() { stop(); if (!doc.hidden) start(); }
  function motion() { sync(); if (!reduced.matches) start(); }
  function storage(event) {
    if (event.key === EFFECTS_KEY || event.key === null) { light = read('localStorage', EFFECTS_KEY) === 'light'; sync(); if (!light) start(); }
  }
  restore.addEventListener('click', () => {
    light = false; write('localStorage', EFFECTS_KEY, null); dismiss(); sync();
    doc.querySelector('.view-choice[aria-current=page]')?.focus({ preventScroll: true });
  });
  win.addEventListener('load', start);
  win.addEventListener('pointermove', start, { passive: true });
  win.addEventListener('pagehide', stop);
  win.addEventListener('pageshow', start);
  win.addEventListener('storage', storage);
  doc.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', motion);
  sync(); start();
  return { destroy() {
    destroyed = true; stop(); restore.remove(); notice?.remove();
    win.removeEventListener('load', start); win.removeEventListener('pointermove', start);
    win.removeEventListener('pagehide', stop); win.removeEventListener('pageshow', start);
    win.removeEventListener('storage', storage); doc.removeEventListener('visibilitychange', visibility);
    reduced.removeEventListener('change', motion); delete background.dataset.performanceReady;
  } };
}
