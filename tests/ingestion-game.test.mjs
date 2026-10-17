import test from 'node:test';
import assert from 'node:assert/strict';
import { createFactory, LEVELS } from '../public/play/games/ingestion-core.mjs';

function run(level, program, mode) {
  const factory = createFactory(level, program, mode);
  let steps = 0;
  while (!factory.state.done && steps++ < 40) factory.step();
  assert.ok(factory.state.done, 'each program terminates within a bounded number of steps');
  return factory;
}

test('checking a receipt before reading is the difference between equal output and budget success', () => {
  const initial = run(0, LEVELS[0].initial, 'arrival').state;
  const solved = run(0, ['check', 'read', 'merge', 'receipt'], 'arrival').state;
  assert.deepEqual(initial.row, solved.row);
  assert.equal(initial.reads, 2); assert.equal(initial.result.won, false);
  assert.equal(solved.reads, 1); assert.equal(solved.merges, 1);
  assert.equal(solved.result.won, true); assert.deepEqual(solved.outcomes, ['processed', 'duplicate']);
});

test('late delivery requires an observation-time rule, not arrival ordering', () => {
  const arrival = run(1, LEVELS[1].initial, 'arrival').state;
  const newest = run(1, LEVELS[1].initial, 'newest').state;
  assert.equal(arrival.row.time, '09:00'); assert.equal(arrival.result.won, false);
  assert.equal(newest.row.time, '10:00'); assert.equal(newest.row.price, '2.79');
  assert.equal(newest.reads, 2); assert.equal(newest.merges, 2); assert.equal(newest.result.won, true);
});

test('a receipt before commit loses the retry after a failure; moving it after commit repairs the line', () => {
  const premature = run(2, LEVELS[2].initial, 'newest').state;
  const safe = run(2, ['check', 'read', 'merge', 'receipt'], 'newest').state;
  assert.equal(premature.row, null); assert.deepEqual(premature.receipts, ['43']);
  assert.deepEqual(premature.outcomes, ['retry', 'duplicate']); assert.equal(premature.result.won, false);
  assert.equal(safe.row.price, '3.15'); assert.equal(safe.reads, 2); assert.equal(safe.merges, 2);
  assert.deepEqual(safe.outcomes, ['retry', 'processed']); assert.equal(safe.result.won, true);
});

test('disabled and invalid commands cannot fabricate a winning warehouse', () => {
  for (let index = 0; index < LEVELS.length; index++) {
    assert.equal(run(index, [], 'newest').state.result.won, false);
    assert.equal(run(index, ['check', 'merge', 'receipt'], 'newest').state.result.won, false);
    assert.equal(run(index, ['check', 'read', 'merge'], 'newest').state.result.won, false);
  }
  assert.throws(() => createFactory(0, ['read', 'read']), TypeError);
  assert.throws(() => createFactory(0, ['invent']), TypeError);
  assert.throws(() => createFactory(3), RangeError);
  assert.throws(() => createFactory(0, [], 'random'), TypeError);
});

test('a finished execution is stable and public snapshots cannot mutate the simulation', () => {
  const factory = run(0, ['check', 'read', 'merge', 'receipt'], 'newest');
  const finished = factory.state;
  assert.deepEqual(factory.step(), finished);
  const publicState = factory.state;
  publicState.row.price = '0'; publicState.receipts.length = 0; publicState.program.length = 0;
  assert.deepEqual(factory.state, finished);
});
