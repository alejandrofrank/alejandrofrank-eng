import test from 'node:test';
import assert from 'node:assert/strict';
import { FACTORY_LEVELS, WIDTH, HEIGHT, cellIndex, cloneBoard, placeTile, createRoutingFactory } from '../public/play/games/ingestion-board.mjs';

const standard = [['B3','check',0],['B2','belt',1],['C2','read',1],['D2','latest',1],['E2','receipt',1],['F2','belt',2],['F3','belt',1],['C3','belt',2],['C4','belt',3],['B4','belt',2]];
const upper = [['B3','check',0],['B2','belt',0],['B1','belt',1],['C1','read',1],['D1','latest',1],['E1','receipt',1],['F1','belt',2],['F2','belt',2],['F3','belt',1],['C3','belt',2],['C4','belt',3],['B4','belt',2]];
const routes = [standard.filter(([name]) => !['C3','C4','B4'].includes(name)).map(entry => entry[0] === 'B3' ? ['B3','belt',0] : entry), standard, standard, upper,
  upper.filter(([name]) => !['C4','B4'].includes(name)).concat([['C4','belt',2],['C5','belt',3]])];
function boardFor(index) {
  let board = Array(WIDTH * HEIGHT).fill(null);
  for (const [name, kind, dir] of routes[index]) {
    const changed = placeTile(index, board, cellIndex(name), kind, dir);
    assert.equal(changed.error, null, `solution placement ${name}`); board = changed.board;
  }
  return board;
}
function finish(index, board) {
  const factory = createRoutingFactory(index, board);
  let n = 0; while (!factory.state.done && n++ < 200) factory.step();
  assert.equal(factory.state.done, true, 'routing is bounded'); return factory;
}

test('all five authored factories are buildable within inventory and parts limits and solve their engineering constraints', () => {
  for (let index = 0; index < FACTORY_LEVELS.length; index++) {
    const state = finish(index, boardFor(index)).state;
    assert.deepEqual(state.result, { won: true, reasons: [] }, `shift ${index + 1}`);
    assert.equal(state.row.time, FACTORY_LEVELS[index].expected.time);
    assert.ok(state.reads <= FACTORY_LEVELS[index].budget.reads);
    assert.ok(state.merges <= FACTORY_LEVELS[index].budget.merges);
  }
  const rush = finish(4, boardFor(4)).state;
  assert.deepEqual(rush.outcomes.map(value => value.outcome), ['retry','delivered','delivered','returned','returned']);
  assert.equal(rush.reads, 3); assert.equal(rush.merges, 3);
});

test('authored starting floors need real repairs, not a play-button victory', () => {
  for (let index = 0; index < FACTORY_LEVELS.length; index++) assert.equal(finish(index, FACTORY_LEVELS[index].initial).state.result.won, false);
});

test('the gate physically routes a duplicate right without reading it again', () => {
  const state = finish(1, boardFor(1)).state;
  assert.equal(state.reads, 1); assert.equal(state.merges, 1);
  assert.equal(state.position, cellIndex('B5')); assert.equal(state.outcomes[1].outcome, 'returned');
  assert.ok(state.log.some(line => line.includes('right-hand return lane')));
  const wrongLane = boardFor(1); wrongLane[cellIndex('C3')].dir = 1;
  const blocked = finish(1, wrongLane).state;
  assert.equal(blocked.result.won, false); assert.match(blocked.message, /closed aisle at D3/);
  const lateGate = boardFor(1); lateGate[cellIndex('B3')] = {kind:'read',dir:0}; lateGate[cellIndex('C2')] = {kind:'check',dir:1};
  const wastedRead = finish(1, lateGate).state;
  assert.equal(wastedRead.row.price, '2.49'); assert.equal(wastedRead.reads, 2);
  assert.equal(wastedRead.result.won, false); assert.ok(wastedRead.result.reasons.some(reason => reason.includes('read budget')));
});

test('gap, obstacle, off-floor direction, and cycle stop at the actual broken tile', () => {
  const gap = boardFor(0); gap[cellIndex('C2')] = null;
  assert.match(finish(0, gap).state.message, /gap at C2/);
  const wall = boardFor(0); wall[cellIndex('D2')].dir = 2;
  assert.match(finish(0, wall).state.message, /closed aisle at D3/);
  const cycle = boardFor(0); cycle[cellIndex('B2')].dir = 2;
  assert.match(finish(0, cycle).state.message, /Conveyor loop/);
  const edge = Array(35).fill(null); edge[cellIndex('B3')] = {kind:'belt',dir:0}; edge[cellIndex('B2')] = {kind:'belt',dir:0}; edge[cellIndex('B1')] = {kind:'belt',dir:0};
  assert.match(finish(0, edge).state.message, /fell off the floor/);
});

test('machine order, observation time, and commit-before-receipt materially change warehouse outcomes', () => {
  const beforeRead = boardFor(0); [beforeRead[cellIndex('C2')],beforeRead[cellIndex('D2')]] = [beforeRead[cellIndex('D2')],beforeRead[cellIndex('C2')]];
  assert.match(finish(0, beforeRead).state.message, /without its file/);
  const stale = finish(2, FACTORY_LEVELS[2].initial).state;
  assert.equal(stale.row.time, '09:00'); assert.equal(stale.result.won, false);
  const falseReceipt = finish(3, FACTORY_LEVELS[3].initial).state;
  assert.equal(falseReceipt.row, null); assert.deepEqual(falseReceipt.outcomes.map(value => value.outcome), ['retry','returned']);
  assert.equal(finish(3, boardFor(3)).state.row.price, '3.15');
});

test('placement preserves the old board, enforces fixed tiles and one machine per function, and makes rotation reversible', () => {
  const original = cloneBoard(FACTORY_LEVELS[0].initial);
  const placed = placeTile(0, original, cellIndex('C2'), 'read', 1);
  assert.equal(original[cellIndex('C2')], null);
  assert.match(placeTile(0, placed.board, cellIndex('D2'), 'read', 1).error, /Only one/);
  assert.match(placeTile(0, original, cellIndex('D3'), 'belt', 1).error, /fixed/);
  let rotated = placed.board;
  for (let i = 0; i < 4; i++) rotated = placeTile(0, rotated, cellIndex('C2'), 'rotate').board;
  assert.deepEqual(rotated, placed.board);
  assert.match(placeTile(0, boardFor(0), cellIndex('G1'), 'belt', 1).error, /parts are in use/);
  assert.throws(() => createRoutingFactory(0, []), TypeError);
  const factory = finish(0, boardFor(0)), snapshot = factory.state;
  assert.deepEqual(factory.step(), snapshot);
  factory.state.row.price = '0'; assert.deepEqual(factory.state, snapshot);
});
