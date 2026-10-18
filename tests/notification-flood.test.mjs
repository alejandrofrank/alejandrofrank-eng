import test from 'node:test';
import assert from 'node:assert/strict';
import { createNotificationFlood, FLOOD } from '../public/timeline/notification-flood.mjs';
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

test('a full warning period precedes the first flood, and idle players can be caught', () => {
  const engine = createRunner([role]); engine.start();
  let state = advance(engine, 4);
  assert.equal(state.flood.phase, 'quiet'); assert.ok(state.flood.height < 0);
  state = advance(engine, 2);
  assert.equal(state.flood.phase, 'warning'); assert.ok(state.flood.remaining > 1);
  assert.equal(state.status, 'running');
  state = advance(engine, 1.9);
  assert.equal(state.status, 'running'); assert.ok(state.flood.height < 0);
  state = advance(engine, 4);
  assert.equal(state.status, 'over'); assert.equal(state.hit.type, 'flood');
  assert.ok(state.flood.height > state.y + 3);
});

test('waves grow, ebb all the way down, warn again, and keep the highest route above water', () => {
  const flood = createNotificationFlood();
  advance(flood, 13.5);
  const peaks = [flood.snapshot().height];
  for (let wave = 1; wave < 5; wave++) peaks.push(advance(flood, 19).height);
  assert.deepEqual(peaks.map(Math.round), [60, 96, 132, 164, 164]);
  assert.ok(Math.max(...peaks) < 208, 'upper ledges remain a refuge');
  assert.equal(advance(flood, 8).phase, 'quiet');
  assert.equal(flood.snapshot().height, FLOOD.floor);
  assert.equal(advance(flood, 3).phase, 'warning');
  assert.equal(advance(flood, 3).phase, 'rising');
});

test('standing on a bar protects against a low wave, but a later higher wave reaches it', () => {
  const engine = createRunner([{ ...role, bottom: 76 }]); landOn(engine);
  let state = advance(engine, 15);
  assert.equal(state.y, 88); assert.equal(state.status, 'running');
  assert.equal(state.realVisited, 1);
  state = advance(engine, 20);
  assert.equal(state.status, 'over'); assert.equal(state.hit.type, 'flood');
  assert.equal(state.flood.wave, 2);
});

test('Do not disturb drains the sea, holds its wave, rejects spam and recharges in game time', () => {
  const flood = createNotificationFlood(); advance(flood, 13.5);
  const unread = flood.snapshot().unread;
  assert.equal(flood.snooze(), true); assert.equal(flood.snooze(), false);
  const muted = advance(flood, 1);
  assert.equal(muted.phase, 'muted'); assert.equal(muted.height, FLOOD.floor);
  assert.equal(muted.unread, unread); assert.ok(muted.cooldown > 22);
  advance(flood, 4.1);
  assert.equal(flood.snapshot().phase, 'high');
  assert.ok(flood.snapshot().height < 0, 'leaving snooze never snaps the water back to its crest');
  assert.equal(flood.snooze(), false);
  advance(flood, 19);
  assert.equal(flood.snapshot().cooldown, 0); assert.equal(flood.snooze(), true);
});

test('pause freezes warnings, water, drifting artwork and recharge; retry resets the flood safely', () => {
  const engine = createRunner([role]); landOn(engine);
  assert.equal(engine.snooze(), true); advance(engine, 1);
  engine.pause(); const paused = engine.snapshot(); advance(engine, 100);
  assert.deepEqual(engine.snapshot(), paused); assert.equal(engine.snooze(), false);
  engine.resume(); advance(engine, 20);
  const caught = engine.snapshot();
  assert.equal(caught.status, 'over'); assert.equal(caught.hit.type, 'flood');
  assert.equal(engine.snooze(), false);
  const safe = engine.respawn();
  assert.equal(safe.y, 34); assert.equal(safe.realVisited, 1); assert.equal(safe.score, caught.score);
  assert.equal(safe.flood.height, FLOOD.floor); assert.equal(safe.flood.remaining, FLOOD.grace);
  assert.equal(safe.flood.cooldown, 0); assert.equal(safe.flood.unread, 0);
  assert.equal(advance(engine, 7).status, 'running');
});

test('snoozing protects a player dropping through the sea while it drains', () => {
  const engine = createRunner([{ ...role, bottom: 76 }]); landOn(engine);
  for (let frame = 0; frame < 4500 && engine.snapshot().flood.height < 80; frame++) engine.step(1 / 120);
  assert.equal(engine.snapshot().status, 'running'); assert.ok(engine.snapshot().flood.height >= 80);
  engine.snooze(); engine.crouch(true); engine.jump();
  const state = advance(engine, .65);
  assert.equal(state.status, 'running'); assert.equal(state.y, 0);
  assert.equal(state.flood.phase, 'muted'); assert.equal(state.flood.height, FLOOD.floor);
});

test('flood snapshots cannot alter the sea or bypass its recharge', () => {
  const flood = createNotificationFlood(); flood.snooze();
  const copy = flood.snapshot(); copy.cooldown = 0; copy.height = 100000;
  assert.equal(flood.snooze(), false); assert.equal(flood.snapshot().height, FLOOD.floor);
  flood.reset(); assert.equal(flood.snapshot().cooldown, 0); assert.equal(flood.snapshot().elapsed, 0);
});
