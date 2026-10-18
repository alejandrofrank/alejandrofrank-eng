import test from 'node:test';
import assert from 'node:assert/strict';
import { createLava, lavaSurface, LAVA } from '../public/timeline/lava.mjs';
import { createRunner } from '../public/timeline/runner-engine.mjs';

function advance(clock, seconds) {
  for (let frame = 0; frame < Math.round(seconds * 120); frame++) clock.step(1 / 120);
  return clock.snapshot();
}
const role = { id: 'role', label: 'Real company', category: 'job', x: 40, width: 70, bottom: 22, height: 12 };
function landOn(engine) {
  engine.start(); engine.move(1);
  while (engine.snapshot().x < 55) engine.step(1 / 120);
  engine.move(0); advance(engine, .2); engine.jump();
  for (let frame = 0; frame < 150 && !engine.snapshot().support; frame++) engine.step(1 / 120);
  assert.equal(engine.snapshot().support, role.id);
}

test('lava starts as a tiny left-edge flow and gives a warning before advancing', () => {
  const lava = createLava(), initial = lava.snapshot();
  assert.equal(initial.front, 8); assert.equal(initial.height, 12); assert.equal(initial.phase, 'ready');
  let state = advance(lava, 4);
  assert.equal(state.phase, 'warning'); assert.equal(state.front, initial.front); assert.equal(state.height, initial.height);
  state = advance(lava, 4);
  assert.equal(state.phase, 'flowing'); assert.ok(state.front > initial.front);
  assert.ok(state.height > initial.height && state.height < 20, 'the first flow stays small');
});

test('the front advances right, gradually grows and speeds up within playable limits', () => {
  const lava = createLava();
  let previous = lava.snapshot();
  for (const duration of [10, 20, 30, 60, 120]) {
    const state = advance(lava, duration);
    assert.ok(state.front > previous.front);
    assert.ok(state.height >= previous.height && state.height <= LAVA.maxHeight);
    assert.ok(state.speed >= previous.speed && state.speed <= LAVA.maxSpeed);
    previous = state;
  }
  assert.equal(previous.height, LAVA.maxHeight); assert.equal(previous.speed, LAVA.maxSpeed);
  assert.ok(previous.speed < 220, 'moving players can still outrun the lava');
});

test('collision follows the tapered leading edge and never floods the ground ahead of it', () => {
  const lava = createLava(), state = advance(lava, 30);
  assert.equal(lavaSurface(state, state.front + 1), 0);
  assert.equal(lavaSurface(state, state.front), 0);
  assert.equal(lavaSurface(state, state.front - LAVA.edge / 2), state.height / 2);
  assert.equal(lavaSurface(state, state.front - LAVA.edge), state.height);
  assert.equal(lavaSurface(state, state.front - 500), state.height);
});

test('waiting at the start is safe during grace, then the lava catches up from the left', () => {
  const engine = createRunner([role]); engine.start();
  let state = advance(engine, 5.9);
  assert.equal(state.status, 'running'); assert.equal(state.x, 12);
  state = advance(engine, 3);
  assert.equal(state.status, 'over'); assert.equal(state.hit.type, 'lava');
  assert.ok(state.lava.front > state.x); assert.ok(lavaSurface(state.lava, state.x + 3) > state.y + 3);
});

test('a real bar shelters the player above the small flow, then becomes unsafe as lava grows', () => {
  const engine = createRunner([role]); landOn(engine);
  let state = advance(engine, 12);
  assert.equal(state.status, 'running'); assert.equal(state.y, 34);
  assert.ok(state.lava.front > state.x); assert.ok(state.lava.height < state.y);
  state = advance(engine, 15);
  assert.equal(state.status, 'over'); assert.equal(state.hit.type, 'lava');
});

test('pausing freezes lava movement and growth; retry puts a small flow behind the checkpoint', () => {
  const engine = createRunner([role]); landOn(engine); advance(engine, 8);
  engine.pause(); const paused = engine.snapshot(); advance(engine, 100);
  assert.deepEqual(engine.snapshot(), paused);
  engine.resume(); const caught = advance(engine, 25);
  assert.equal(caught.status, 'over'); assert.equal(caught.hit.type, 'lava');
  const safe = engine.respawn();
  assert.equal(safe.y, 34); assert.equal(safe.realVisited, 1); assert.equal(safe.score, caught.score);
  assert.equal(safe.lava.height, LAVA.initialHeight); assert.equal(safe.lava.remaining, LAVA.grace);
  assert.equal(safe.x - safe.lava.front, LAVA.retryGap);
  assert.equal(advance(engine, 7).status, 'running');
  const restarted = engine.start(); assert.equal(restarted.lava.front, LAVA.initialFront); assert.equal(restarted.realVisited, 0);
});

test('reset and snapshots cannot leak or mutate lava state', () => {
  const lava = createLava(); advance(lava, 40);
  const original = lava.snapshot(), copy = lava.snapshot(); copy.front = 999999; copy.height = 0;
  assert.deepEqual(lava.snapshot(), original);
  lava.reset(500); const reset = lava.snapshot();
  assert.equal(reset.front, 500); assert.equal(reset.elapsed, 0); assert.equal(reset.height, LAVA.initialHeight);
  lava.step(NaN); lava.step(-1); assert.deepEqual(lava.snapshot(), reset);
});
