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

const role = { id: 'role', label: 'Real company', category: 'job', x: 40, width: 70, bottom: 22, height: 12 };
function runUntil(engine, predicate, frames = 1500) {
  let state = engine.snapshot();
  for (let i = 0; i < frames && state.status === 'running' && !predicate(state); i++) state = engine.step(1 / 120);
  return state;
}
function landOnFirstRole(engine) {
  engine.start(); engine.move(1);
  runUntil(engine, s => s.x >= 55); engine.move(0);
  runUntil(engine, s => s.vx === 0); engine.jump();
  return runUntil(engine, s => s.support === role.id);
}

test('only Arcade exposes the platformer, with no game or animation loop until Play', async () => {
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
        assert.equal(f.win.document.querySelector('[data-timeline-runner]').hidden, true, 'the flood is hidden until Play too');
        assert.equal(initTimelineRunner(f.win.document), null, 'mount only once');
      } else assert.equal(controller, null);
    } finally { await f.win.happyDOM.close(); }
  }
});

test('desktop and narrow courses preserve every actual role bar and add unlabeled platforms', async () => {
  for (const width of [1100, 390]) {
    const f = fixture(width);
    try {
      const geometry = readTimelineGeometry(f.chart);
      const controller = initTimelineRunner(f.win.document); controller.start();
      const actual = [...f.chart.querySelectorAll('.tlp-bar')];
      const real = controller.snapshot().platforms.filter(bar => bar.real);
      assert.equal(geometry.bars.length, f.win.__SCENES__.length);
      assert.equal(real.length, actual.length);
      geometry.bars.forEach((bar, index) => {
        assert.equal(bar.id, actual[index].dataset.role);
        assert.equal(bar.label, actual[index].dataset.title);
        assert.equal(bar.x, Number.parseFloat(actual[index].style.left));
        assert.equal(bar.width, Number.parseFloat(actual[index].style.width));
        assert.equal(bar.bottom + bar.height, geometry.baseline - Number.parseFloat(actual[index].style.top));
        assert.deepEqual(real[index], { ...bar, real: true, visited: false });
        assert.ok(actual[index].textContent.includes(bar.label));
      });
      assert.ok(f.get('generated').querySelector('.runner-platform'));
      assert.ok(f.get('generated').querySelector('.runner-spike'));
      assert.equal(f.get('generated').textContent, '', 'extra ledges, gems and threats have no text labels');
    } finally { await f.win.happyDOM.close(); }
  }
});

test('movement is manual, reversible, stops on release and cannot run past the left edge', () => {
  const engine = createRunner([role]); engine.start();
  for (let i = 0; i < 300; i++) engine.step(1 / 60);
  assert.equal(engine.snapshot().x, RUNNER.startX);
  engine.move(1); runUntil(engine, s => s.x > 80); engine.move(0);
  const stopped = runUntil(engine, s => s.vx === 0);
  for (let i = 0; i < 120; i++) engine.step(1 / 60);
  assert.equal(engine.snapshot().x, stopped.x);
  engine.move(-1); runUntil(engine, s => s.x === 0);
  assert.equal(engine.snapshot().x, 0); assert.equal(engine.snapshot().facing, -1);
  assert.equal(engine.snapshot().status, 'running', 'bar sides are not threats');
});

test('jump through a real bar from below, land on top, then crouch and drop through it', () => {
  const engine = createRunner([role]); engine.start(); engine.move(1);
  runUntil(engine, s => s.x >= 55); engine.move(0); runUntil(engine, s => s.vx === 0);
  engine.jump();
  const rising = runUntil(engine, s => s.y > role.bottom + role.height);
  assert.ok(rising.vy > 0); assert.equal(rising.support, null);
  const landed = runUntil(engine, s => s.support === role.id);
  assert.equal(landed.y, role.bottom + role.height); assert.equal(landed.grounded, true);
  assert.equal(landed.realVisited, 1); assert.equal(landed.checkpoint.label, role.label);
  engine.crouch(true); engine.step(1 / 60);
  assert.equal(engine.snapshot().y, landed.y); assert.equal(engine.snapshot().duck, true);
  engine.jump(); engine.step(1 / 60);
  assert.ok(engine.snapshot().y < landed.y);
  const ground = runUntil(engine, s => s.grounded && s.support === null);
  assert.equal(ground.y, 0); assert.equal(ground.realVisited, 1);
});

test('air jumps do not create unlimited flight; running off a bar falls and leaves a brief coyote jump', () => {
  const engine = createRunner([role]); landOnFirstRole(engine);
  engine.jump(); engine.step(.05); const rising = engine.snapshot();
  engine.jump(); engine.step(.05);
  assert.ok(engine.snapshot().vy < rising.vy, 'no second impulse in midair');
  assert.equal(runUntil(engine, s => s.support === role.id).support, role.id);
  engine.move(-1);
  const edge = runUntil(engine, s => !s.grounded);
  assert.ok(edge.y < role.bottom + role.height); assert.equal(edge.support, null);
  engine.jump(); engine.step(1 / 120);
  assert.ok(engine.snapshot().vy > 0, 'last-moment jump still works just off the edge');
});

test('spikes cause a retry at the last real checkpoint; role progress persists and respawn is safe', () => {
  const engine = createRunner([role]);
  const landed = landOnFirstRole(engine);
  assert.equal(landed.support, role.id);
  engine.move(1);
  const hit = runUntil(engine, s => s.status === 'over');
  assert.equal(hit.status, 'over'); assert.ok(hit.hit.id.startsWith('spike-'));
  const respawned = engine.respawn();
  assert.equal(respawned.x, landed.checkpoint.x); assert.equal(respawned.y, landed.y);
  assert.equal(respawned.realVisited, 1); assert.equal(respawned.gems, hit.gems);
  for (let i = 0; i < 120; i++) engine.step(1 / 60);
  assert.equal(engine.snapshot().status, 'running');
  assert.equal(engine.snapshot().x, respawned.x);
  const initial = engine.start(); assert.equal(initial.realVisited, 0); assert.equal(initial.score, 0);
});

test('the upper route supports repeated jumps, gem collection and exploration beyond the chart', () => {
  const engine = createRunner([role]); engine.start();
  let state = engine.snapshot();
  // Play twenty successive ledges through the public controls, including rises,
  // descents and ledges with spikes. No teleporting or internal state injection.
  for (let i = 0; i < 20; i++) {
    const target = state.platforms.find(bar => bar.id === `ledge-${i}`);
    assert.ok(target);
    engine.jump();
    let reached = false;
    for (let frame = 0; frame < 300 && state.status === 'running'; frame++) {
      const distance = target.x + 34 - state.x;
      engine.move(Math.abs(distance) < 17 ? 0 : Math.sign(distance));
      state = engine.step(1 / 120);
      if (state.support === target.id && Math.abs(distance) < 17 && Math.abs(state.vx) < 1) { reached = true; break; }
    }
    assert.equal(reached, true, `ledge ${i} must be reachable; at ${state.x},${state.y}, support ${state.support}, hit ${state.hit?.id}`);
    assert.equal(state.status, 'running');
  }
  assert.equal(state.phase, 'bonus'); assert.ok(state.gems >= 19);
  assert.ok(state.landings >= 20); assert.ok(state.platforms.length < 50);
  assert.ok(state.hazards.length < 20); assert.ok(state.coins.length < 24);
  const gems = state.gems;
  engine.move(1); runUntil(engine, s => s.status === 'over'); engine.respawn();
  assert.equal(engine.snapshot().gems, gems, 'checkpoint retry preserves diamonds');
  assert.ok(!engine.snapshot().coins.some(coin => coin.id === 'gem-0'), 'revisiting does not respawn a collected diamond');
});

test('pause freezes physics, large frame gaps stay bounded, and restarting resets the world', () => {
  const engine = createRunner([role]); const initial = engine.start();
  engine.move(1); engine.step(.02); engine.pause();
  const paused = engine.snapshot(); engine.step(100); engine.jump(); engine.crouch(true); engine.move(-1);
  assert.deepEqual(engine.snapshot(), paused);
  engine.resume(); engine.move(1); const before = engine.snapshot(); engine.step(100);
  assert.ok(engine.snapshot().x - before.x < 12);
  assert.deepEqual(engine.start(), initial);
  const copy = engine.snapshot(); copy.platforms[0].x = -999; copy.x = 10000;
  assert.deepEqual(engine.snapshot(), initial);
});

test('keyboard and simultaneous touch controls move, jump, duck, pause, restart and restore the chart', async () => {
  const f = fixture(390);
  try {
    f.viewport.scrollLeft = 45;
    const controller = initTimelineRunner(f.win.document); f.get('start').click();
    const region = f.win.document.querySelector('[data-timeline-runner]');
    const key = (type, value) => region.dispatchEvent(new f.win.KeyboardEvent(type, { key: value, bubbles: true }));
    assert.equal(controller.snapshot().status, 'running');
    assert.equal(f.chart.inert, true); assert.equal(f.win.document.activeElement, region);
    f.tick(120); assert.equal(controller.snapshot().x, RUNNER.startX);
    key('keydown', 'ArrowRight'); f.tick(12); key('keyup', 'ArrowRight');
    assert.ok(controller.snapshot().x > RUNNER.startX);
    key('keydown', 'ArrowUp'); f.tick(5); assert.ok(controller.snapshot().y > 0);
    f.get('pause').click(); const paused = controller.snapshot(); f.tick(100);
    assert.deepEqual(controller.snapshot(), paused); assert.equal(f.frames.size, 0);
    f.get('retry').click(); assert.equal(controller.snapshot().status, 'running');
    f.win.dispatchEvent(new f.win.Event('blur')); assert.equal(controller.snapshot().status, 'paused');
    f.get('restart').click(); assert.equal(controller.snapshot().x, RUNNER.startX);
    f.get('right').dispatchEvent(new f.win.PointerEvent('pointerdown', { pointerId: 1, cancelable: true }));
    f.get('jump').click(); f.tick(12);
    assert.ok(controller.snapshot().x > RUNNER.startX); assert.ok(controller.snapshot().y > 0);
    f.get('right').dispatchEvent(new f.win.PointerEvent('pointercancel', { pointerId: 1 }));
    f.tick(20); const stoppedX = controller.snapshot().x; f.tick(20);
    assert.equal(controller.snapshot().x, stoppedX);
    key('keydown', 'ArrowDown'); assert.equal(controller.snapshot().duck, true);
    key('keyup', 'ArrowDown'); assert.equal(controller.snapshot().duck, false);
    f.get('duck').dispatchEvent(new f.win.PointerEvent('pointerdown', { pointerId: 2, cancelable: true }));
    assert.equal(controller.snapshot().duck, true);
    f.get('duck').dispatchEvent(new f.win.PointerEvent('lostpointercapture', { pointerId: 2 }));
    assert.equal(controller.snapshot().duck, false);
    key('keydown', 'a'); f.tick(10); key('keyup', 'a');
    assert.equal(f.get('avatar').dataset.facing, 'left');
    f.win.dispatchEvent(new f.win.Event('resize')); assert.equal(controller.snapshot().status, 'paused');
    key('keydown', 'Escape');
    assert.equal(region.hidden, true); assert.equal(f.frames.size, 0);
    assert.equal(controller.snapshot().status, 'idle');
    assert.equal(f.chart.inert, false); assert.equal(f.chart.style.transform, '');
    assert.equal(f.viewport.scrollLeft, 45); assert.equal(f.win.document.activeElement, f.get('start'));
    f.chart.querySelector('.tlp-bar').click();
    assert.equal(f.win.document.querySelector('#tlpModal').getAttribute('aria-hidden'), 'false');
  } finally { await f.win.happyDOM.close(); }
});

test('a spike hit shows checkpoint retry, stops the loop and allows a full restart', async () => {
  const f = fixture();
  try {
    const controller = initTimelineRunner(f.win.document); controller.start();
    const region = f.win.document.querySelector('[data-timeline-runner]');
    region.dispatchEvent(new f.win.KeyboardEvent('keydown', { key: 'd', bubbles: true }));
    f.tick(250);
    assert.equal(controller.snapshot().status, 'over'); assert.equal(f.frames.size, 0);
    assert.equal(f.win.document.activeElement, f.get('retry'));
    assert.equal(f.get('retry').textContent, 'Back to checkpoint');
    f.get('retry').click(); assert.equal(controller.snapshot().status, 'running');
    assert.equal(controller.snapshot().x, RUNNER.startX);
    f.tick(100); assert.equal(controller.snapshot().x, RUNNER.startX, 'retry clears held keys');
    f.get('pause').click(); f.get('restart').click();
    assert.equal(controller.snapshot().score, 0);
    f.get('exit').click(); assert.equal(controller.snapshot().status, 'idle');
  } finally { await f.win.happyDOM.close(); }
});

test('the visible flood tracks its collision line, warns, snoozes by key or button, and resets on retry', async () => {
  for (const width of [390, 1100]) {
    const f = fixture(width);
    try {
      const controller = initTimelineRunner(f.win.document); controller.start();
      const region = f.win.document.querySelector('[data-timeline-runner]');
      assert.ok(f.get('flood').textContent.includes('quick call?'));
      assert.ok(f.get('flood').querySelector('svg'), 'the sea carries miniature computer icons');
      assert.equal(f.get('flood').getAttribute('aria-hidden'), 'true', 'decorative notifications do not spam assistive tech');
      f.tick(370);
      assert.equal(controller.snapshot().flood.phase, 'warning');
      assert.match(f.get('flood-warning').textContent, /Incoming!/);
      assert.equal(Number.parseFloat(f.get('flood').style.top), Number.parseFloat(f.get('ground').style.top) - controller.snapshot().flood.height);
      region.dispatchEvent(new f.win.KeyboardEvent('keydown', { key: 'm', bubbles: true }));
      assert.equal(controller.snapshot().flood.phase, 'muted');
      assert.equal(f.get('snooze').getAttribute('aria-disabled'), 'true');
      assert.match(f.get('snooze').textContent, /Snoozed/);
      f.tick(60); const cooldown = controller.snapshot().flood.cooldown;
      f.get('snooze').click(); assert.equal(controller.snapshot().flood.cooldown, cooldown, 'repeat clicks cannot reset the cooldown');
      controller.pause(); const paused = controller.snapshot(), drift = f.get('flood').style.getPropertyValue('--flood-drift');
      f.tick(500);
      assert.deepEqual(controller.snapshot(), paused);
      assert.equal(f.get('flood').style.getPropertyValue('--flood-drift'), drift);
      controller.resume(); f.tick(700);
      assert.equal(controller.snapshot().hit.type, 'flood');
      assert.equal(f.get('title').textContent, 'This could have been an email.');
      assert.equal(f.win.document.activeElement, f.get('retry'));
      f.get('retry').click();
      assert.equal(controller.snapshot().flood.phase, 'quiet');
      assert.equal(f.get('snooze').getAttribute('aria-disabled'), 'false');
      f.get('snooze').click(); assert.equal(controller.snapshot().flood.phase, 'muted');
      f.get('exit').click();
      assert.equal(region.hidden, true); assert.equal(controller.snapshot().status, 'idle');
      assert.equal(f.frames.size, 0);
    } finally { await f.win.happyDOM.close(); }
  }
});
