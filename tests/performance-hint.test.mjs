import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { Window } from 'happy-dom';
import { createFrameHealthMonitor, initPerformanceHint } from '../public/performance-hint.mjs';

const { outputFiles } = await build({ stdin: { contents: "export { gradientMarkup } from './src/gradient'; export { personalStyles } from './src/personal-styles';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const { gradientMarkup, personalStyles } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString('base64')}`);
const fixtures = [];
afterEach(async () => { await Promise.all(fixtures.splice(0).map(f => { f.controller.destroy(); return f.win.happyDOM.close(); })); });

function fixture({ savedLight = false, dismissed = false, reduced = false, blockedStorage = false } = {}) {
  const win = new Window({ url: 'https://portfolio.test/', settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  win.document.body.innerHTML = `<style>${personalStyles.replaceAll('@media(', '@media (')}</style>${gradientMarkup}<a class="view-choice" aria-current="page" href="/">Original</a><button id="reading">Reading the page</button>`;
  Object.defineProperty(win.document, 'readyState', { configurable: true, value: 'complete' });
  let hidden = false, time = 0, sequence = 0;
  Object.defineProperty(win.document, 'hidden', { configurable: true, get: () => hidden });
  Object.defineProperty(win, 'performance', { configurable: true, value: { now: () => time } });
  const media = new win.EventTarget(); media.matches = reduced; win.matchMedia = () => media;
  if (savedLight) win.localStorage.setItem('portfolio-effects', 'light');
  if (dismissed) win.sessionStorage.setItem('portfolio-performance-dismissed', '1');
  if (blockedStorage) for (const storage of ['localStorage', 'sessionStorage']) Object.defineProperty(win, storage, { get() { throw new Error('Storage blocked'); } });
  const pending = new Map();
  win.requestAnimationFrame = fn => { const id = ++sequence; pending.set(id, fn); return id; };
  win.cancelAnimationFrame = id => pending.delete(id);
  win.HTMLCanvasElement.prototype.getContext = () => ({ createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {} });
  win.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
  const f = { win, media, pending,
    root: win.document.querySelector('.color-world'),
    tick(milliseconds, interval = 1000 / 60) {
      for (let elapsed = 0; elapsed < milliseconds; elapsed += interval) {
        time += interval; const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(fn => fn(time));
      }
    },
    hide(value) { hidden = value; win.document.dispatchEvent(new win.Event('visibilitychange')); },
    get notice() { return win.document.querySelector('.performance-hint'); },
  };
  f.controller = initPerformanceHint(win.document);
  fixtures.push(f); return f;
}

test('frame health requires sustained poor rendering, not 30 fps, a hitch or one bad window', () => {
  for (const interval of [1000 / 60, 1000 / 30]) {
    const sample = createFrameHealthMonitor(); let result;
    for (let now = 0; now <= 13000; now += interval) { result = sample(now); assert.notEqual(result, 'slow'); }
    assert.equal(result, 'done');
  }
  const sample = createFrameHealthMonitor(); sample(0);
  for (let now = 80; now <= 2000; now += 80) assert.notEqual(sample(now), 'slow');
  for (let now = 2016; now <= 8000; now += 16) assert.notEqual(sample(now), 'slow');
  assert.notEqual(sample(20000), 'slow', 'a suspended frame is discarded');
});

test('a healthy visit never prompts and sampling stops after a bounded period', () => {
  const f = fixture(); f.tick(16000);
  assert.equal(f.notice, null); assert.equal(f.pending.size, 0);
  // Pointer activity can begin another bounded sample, at most three per page.
  for (let i = 0; i < 4; i++) { f.win.dispatchEvent(new f.win.PointerEvent('pointermove')); f.tick(16000); }
  assert.equal(f.notice, null); assert.equal(f.pending.size, 0);
});

test('sustained stuttering offers help without taking focus; light mode stops real ripple work', () => {
  const f = fixture(); const reading = f.win.document.getElementById('reading'); reading.focus();
  f.tick(7000, 80);
  assert.ok(f.notice); assert.equal(f.pending.size, 0);
  assert.equal(f.win.document.activeElement, reading);
  assert.match(f.notice.textContent, /Use graphics acceleration when available/);
  assert.match(f.notice.textContent, /does not confirm that acceleration is off/);
  for (const script of f.win.document.querySelectorAll('script:not([type=module])')) f.win.eval(script.textContent);
  f.win.dispatchEvent(new f.win.PointerEvent('pointermove', { pointerType: 'mouse', clientX: 200, clientY: 100 }));
  assert.ok(f.pending.size > 0, 'the existing full background remains interactive');
  f.notice.querySelector('[data-use-light]').click();
  assert.equal(f.root.dataset.effects, 'light'); assert.equal(f.pending.size, 0);
  assert.equal(f.win.localStorage.getItem('portfolio-effects'), 'light');
  assert.equal(f.notice.hidden, true);
  assert.equal(f.win.getComputedStyle(f.root.querySelector('.color-band')).animation, 'none');
  assert.equal(f.win.getComputedStyle(f.root.querySelector('.color-band')).filter, 'none');
  f.win.dispatchEvent(new f.win.PointerEvent('pointermove', { pointerType: 'mouse', clientX: 800, clientY: 500 }));
  assert.equal(f.pending.size, 0, 'lighter mode cannot restart the pixel simulation');
  f.win.document.querySelector('.effects-restore').click();
  assert.equal(f.root.dataset.effects, 'full'); assert.equal(f.win.localStorage.getItem('portfolio-effects'), null);
  assert.equal(f.notice.hidden, true, 'restoring effects does not immediately nag again');
});

test('background tabs and reduced motion do not produce warnings', () => {
  const f = fixture(); f.tick(3500, 80); f.hide(true);
  assert.equal(f.pending.size, 0); f.tick(30000, 80); assert.equal(f.notice, null);
  f.hide(false); f.tick(16000); assert.equal(f.notice, null);
  const quiet = fixture({ reduced: true });
  assert.equal(quiet.pending.size, 0); quiet.tick(16000, 80); assert.equal(quiet.notice, null);
  const active = fixture(); active.tick(2500, 80);
  active.media.matches = true; active.media.dispatchEvent(new active.win.Event('change'));
  assert.equal(active.pending.size, 0); assert.equal(active.notice, null);
});

test('dismissal lasts for the session and lighter effects survive a returning visit', () => {
  const f = fixture(); f.tick(7000, 80); f.notice.querySelector('[data-dismiss]').click();
  assert.equal(f.win.sessionStorage.getItem('portfolio-performance-dismissed'), '1');
  f.win.dispatchEvent(new f.win.PointerEvent('pointermove')); assert.equal(f.pending.size, 0);
  const dismissed = fixture({ dismissed: true }); assert.equal(dismissed.pending.size, 0);
  const returning = fixture({ savedLight: true });
  assert.equal(returning.root.dataset.effects, 'light'); assert.equal(returning.pending.size, 0);
  assert.equal(returning.win.document.querySelector('.effects-restore').hidden, false);
});

test('blocked storage still permits lighter effects and reverting them; other appearances get no notice', () => {
  const f = fixture({ blockedStorage: true }); f.tick(7000, 80);
  f.notice.querySelector('[data-use-light]').click(); assert.equal(f.root.dataset.effects, 'light');
  f.win.document.querySelector('.effects-restore').click(); assert.equal(f.root.dataset.effects, 'full');
  f.root.remove(); assert.equal(initPerformanceHint(f.win.document), undefined);
});
