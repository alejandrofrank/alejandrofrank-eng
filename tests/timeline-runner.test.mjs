import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Window } from 'happy-dom';
import { createRunner, RUNNER } from '../public/timeline/runner-engine.mjs';
import { initTimelineRunner, readTimelineGeometry } from '../public/timeline/runner.mjs';

const { outputFiles } = await build({ entryPoints: [fileURLToPath(new URL('../src/timeline/page.ts', import.meta.url))], bundle: true, write: false, platform: 'node', format: 'esm' });
const { renderTimelinePage } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString('base64')}`);

function fixture(width = 1100, view = 'arcade') {
  const win = new Window({ url: 'https://portfolio.test/timeline', settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true } });
  win.document.documentElement.innerHTML = renderTimelinePage(view);
  const chart = win.document.querySelector('#tlp'), viewport = chart.parentElement;
  Object.defineProperties(chart, { clientWidth: { value: Math.max(780, width) }, clientHeight: { value: 480 } });
  Object.defineProperties(viewport, { clientWidth: { value: width }, clientHeight: { value: 480 } });
  for (const script of win.document.querySelectorAll('script:not([src]):not([type=module])')) {
    if (!script.textContent.includes('color-motion')) win.eval(script.textContent);
  }
  let nextId = 0, time = 0;
  const frames = new Map();
  win.requestAnimationFrame = callback => { frames.set(++nextId, callback); return nextId; };
  win.cancelAnimationFrame = id => frames.delete(id);
  const tick = (count = 1) => {
    for (let i = 0; i < count; i++) {
      time += 1000 / 60;
      const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(time));
    }
  };
  return { win, chart, viewport, tick, frames, get: name => win.document.querySelector(`[data-runner-${name}]`) };
}

test('only Arcade exposes an opt-in runner; no animation loop or game starts on page load', async () => {
  for (const view of ['original', 'tech', 'arcade']) {
    const f = fixture(1100, view);
    try {
      const controller = initTimelineRunner(f.win.document);
      if (view === 'arcade') {
        assert.equal(controller.snapshot().status, 'idle');
        assert.equal(f.frames.size, 0);
        assert.equal(f.get('invitation').hidden, false);
        assert.ok(f.get('avatar').querySelector('.player-sprite .player-leg.left'));
        assert.equal(f.chart.inert, false);
      } else assert.equal(controller, null);
    } finally { await f.win.happyDOM.close(); }
  }
});

test('desktop and narrow opening courses use every actual bar, including its exact width, lane and title', async () => {
  for (const width of [1100, 390]) {
    const f = fixture(width);
    try {
      const geometry = readTimelineGeometry(f.chart);
      const engine = createRunner(geometry.bars); engine.start();
      const actual = [...f.chart.querySelectorAll('.tlp-bar')];
      assert.equal(geometry.bars.length, f.win.__SCENES__.length);
      assert.equal(engine.snapshot().obstacles.filter(bar => bar.real).length, actual.length);
      geometry.bars.forEach((bar, index) => {
        assert.equal(bar.id, actual[index].dataset.role);
        assert.equal(bar.label, actual[index].dataset.title);
        assert.equal(bar.x, Number.parseFloat(actual[index].style.left));
        assert.equal(bar.width, Number.parseFloat(actual[index].style.width));
        assert.equal(bar.bottom + bar.height, geometry.baseline - Number.parseFloat(actual[index].style.top));
      });
      engine.crouch(true);
      for (let i = 0; i < 3000 && engine.snapshot().phase !== 'endless'; i++) engine.step(1 / 60, width);
      const state = engine.snapshot();
      assert.equal(state.status, 'running');
      assert.equal(state.phase, 'endless');
      assert.equal(state.realCleared, actual.length);
      assert.ok(state.obstacles.some(bar => !bar.real));
    } finally { await f.win.happyDOM.close(); }
  }
});

const obstacle = (bottom, width = 70) => [{ id: 'test', label: 'Test bar', category: 'job', x: 100, width, height: 20, bottom }];
function runUntil(engine, predicate, frames = 1500) {
  let state = engine.snapshot();
  for (let i = 0; i < frames && state.status === 'running' && !predicate(state); i++) state = engine.step(1 / 120);
  return state;
}

test('standing, crouching and jumping have different collision outcomes, including overhead hazards', () => {
  const standing = createRunner(obstacle(22)); standing.start();
  assert.equal(runUntil(standing, s => s.realCleared === 1).status, 'over');
  const duck = createRunner(obstacle(22)); duck.start(); duck.crouch(true);
  assert.equal(runUntil(duck, s => s.realCleared === 1).realCleared, 1);
  const ground = createRunner(obstacle(0, 45)); ground.start(); ground.crouch(true);
  assert.equal(runUntil(ground, s => s.realCleared === 1).status, 'over');
  const jump = createRunner(obstacle(0, 45)); jump.start();
  runUntil(jump, s => s.x + RUNNER.width > 80); jump.jump();
  assert.equal(runUntil(jump, s => s.realCleared === 1).realCleared, 1);
  const coast = createRunner(obstacle(62)); coast.start();
  assert.equal(runUntil(coast, s => s.realCleared === 1).realCleared, 1);
  const wrongJump = createRunner(obstacle(62)); wrongJump.start();
  runUntil(wrongJump, s => s.x + RUNNER.width > 65); wrongJump.jump();
  assert.equal(runUntil(wrongJump, s => s.realCleared === 1).status, 'over');
});

test('endless courses remain playable as speed rises; obstacle storage stays bounded', () => {
  for (const seed of [17, 42, 99]) {
    const engine = createRunner(obstacle(80, 25), seed); engine.start();
    let state = engine.snapshot();
    for (let i = 0; i < 26000 && state.status === 'running'; i++) {
      const next = state.obstacles.filter(b => b.x + b.width > state.x).sort((a, b) => a.x - b.x)[0];
      const distance = next?.x - state.x - RUNNER.width;
      engine.crouch(next?.bottom === 26 && distance < 100);
      if (next?.bottom === 0 && distance < state.speed * .12 && state.y === 0) engine.jump();
      state = engine.step(1 / 120, 1100);
    }
    assert.equal(state.status, 'running', `course seed ${seed} must allow recovery between obstacles; hit ${state.hit?.label}`);
    assert.ok(state.cleared > 50);
    assert.ok(state.speed > 300 && state.speed <= 310);
    assert.ok(state.obstacles.length < 14);
  }
});

test('pause freezes physics, retry is repeatable, and stalled frames cannot tunnel through bars', () => {
  const engine = createRunner(obstacle(0)); const initial = engine.start();
  engine.step(.02); engine.pause();
  const paused = engine.snapshot(); engine.step(100); engine.jump(); engine.crouch(true);
  assert.deepEqual(engine.snapshot(), paused);
  engine.resume(); const before = engine.snapshot(); engine.step(100);
  assert.ok(engine.snapshot().x - before.x < 16);
  assert.deepEqual(engine.start(), initial);
  const copy = engine.snapshot(); copy.obstacles[0].x = -999; copy.x = 10000;
  assert.deepEqual(engine.snapshot(), initial);
});

test('real controls start, jump, duck, pause, resume, retry and exit back to working experience bars', async () => {
  const f = fixture();
  try {
    f.viewport.scrollLeft = 45;
    const controller = initTimelineRunner(f.win.document);
    f.get('start').click();
    const region = f.win.document.querySelector('[data-timeline-runner]');
    assert.equal(controller.snapshot().status, 'running');
    assert.equal(f.chart.inert, true); assert.equal(f.win.document.activeElement, region);
    f.tick(5);
    region.dispatchEvent(new f.win.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    f.tick(5); assert.ok(controller.snapshot().y > 0);
    f.get('pause').click(); const paused = controller.snapshot(); f.tick(100);
    assert.deepEqual(controller.snapshot(), paused); assert.equal(f.frames.size, 0);
    f.get('retry').click(); assert.equal(controller.snapshot().status, 'running');
    f.win.dispatchEvent(new f.win.Event('blur')); assert.equal(controller.snapshot().status, 'paused');
    f.get('retry').click(); f.tick(80);
    region.dispatchEvent(new f.win.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    assert.equal(controller.snapshot().duck, true);
    f.win.document.dispatchEvent(new f.win.KeyboardEvent('keyup', { key: 'ArrowDown' }));
    assert.equal(controller.snapshot().duck, false);
    f.get('duck').dispatchEvent(new f.win.PointerEvent('pointerdown', { pointerId: 1, cancelable: true }));
    assert.equal(controller.snapshot().duck, true);
    f.get('duck').dispatchEvent(new f.win.PointerEvent('pointercancel', { pointerId: 1 }));
    assert.equal(controller.snapshot().duck, false);
    f.tick(300); assert.equal(controller.snapshot().status, 'over');
    assert.equal(f.win.document.activeElement, f.get('retry'));
    f.get('retry').click(); assert.equal(controller.snapshot().x, RUNNER.startX);
    region.dispatchEvent(new f.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(region.hidden, true); assert.equal(f.frames.size, 0);
    assert.equal(controller.snapshot().status, 'idle');
    assert.equal(f.chart.inert, false); assert.equal(f.chart.style.transform, '');
    assert.equal(f.viewport.scrollLeft, 45); assert.equal(f.win.document.activeElement, f.get('start'));
    f.chart.querySelector('.tlp-bar').click();
    assert.equal(f.win.document.querySelector('#tlpModal').getAttribute('aria-hidden'), 'false');
  } finally { await f.win.happyDOM.close(); }
});
