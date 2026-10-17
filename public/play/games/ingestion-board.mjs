// Original, bounded factory puzzle. These operations model loader invariants;
// they do not execute GCP, a CSV parser, a lock manager, or production code.
export const WIDTH = 7;
export const HEIGHT = 5;
export const DIRECTIONS = ['north', 'east', 'south', 'west'];
export const TOOL_DEFS = {
  belt: { name: 'Conveyor', short: 'Belt', help: 'Move a packet in the arrow direction.', group: 'belt' },
  check: { name: 'Receipt gate', short: 'Gate', help: 'Fresh: follow the arrow. Receipt found: turn right, toward RETURNS.', group: 'check' },
  read: { name: 'Archive reader', short: 'Read', help: 'Load the exact file generation. Costs one read.', group: 'read' },
  latest: { name: 'Newest-only merger', short: 'Latest', help: 'Commit only if the observation is newer. Costs one merge attempt.', group: 'merge' },
  overwrite: { name: 'Arrival-order merger', short: 'Last in', help: 'Overwrite with the last delivery, even if its observation is older.', group: 'merge' },
  receipt: { name: 'Receipt printer', short: 'Stamp', help: 'Print a completion receipt. Put this after a successful merge.', group: 'receipt' },
};
export const cellName = index => `${String.fromCharCode(65 + index % WIDTH)}${Math.floor(index / WIDTH) + 1}`;
export const cellIndex = name => (Number(name.slice(1)) - 1) * WIDTH + name.charCodeAt(0) - 65;
const tile = (kind, dir = 1) => ({ kind, dir });
function layout(entries) {
  const board = Array(WIDTH * HEIGHT).fill(null);
  for (const [name, kind, dir = 1] of entries) board[cellIndex(name)] = tile(kind, dir);
  return board;
}
const standard = [
  ['B3', 'check', 0], ['B2', 'belt'], ['C2', 'read'], ['D2', 'latest'], ['E2', 'receipt'], ['F2', 'belt', 2], ['F3', 'belt'],
  ['C3', 'belt', 2], ['C4', 'belt', 3], ['B4', 'belt', 2],
];
const upper = [
  ['B3', 'check', 0], ['B2', 'belt', 0], ['B1', 'belt'], ['C1', 'read'], ['D1', 'latest'], ['E1', 'receipt'], ['F1', 'belt', 2], ['F2', 'belt', 2], ['F3', 'belt'],
  ['C3', 'belt', 2], ['C4', 'belt', 3], ['B4', 'belt', 2],
];
const event = (tag, generation, time, price) => ({ tag, generation, time, price });
const shared = { source: cellIndex('A3'), output: cellIndex('G3'), returns: cellIndex('B5') };
export const FACTORY_LEVELS = [
  { ...shared, title: 'First shift', brief: 'One shipment. Finish the conveyor, read the file, commit its row, then print its receipt. Deliver the crate to OUT.',
    walls: ['D3', 'D4', 'E4'].map(cellIndex), initial: layout([['B3', 'belt', 0], ['B2', 'belt'], ['F2', 'belt', 2], ['F3', 'belt']]),
    events: [event('A', '41', '09:00', '2.49')], expected: { time: '09:00', price: '2.49' }, budget: { reads: 1, merges: 1, parts: 7 },
    hint: 'Complete the top corridor: C2 = Read →, D2 = Latest →, E2 = Stamp →. The existing belts carry the crate into OUT.' },
  { ...shared, title: 'The return lane', brief: 'The shipment arrives twice. Build a receipt gate before the reader and send the duplicate down its own return conveyor. Only one read is allowed.',
    walls: ['D3', 'D4', 'E4'].map(cellIndex), initial: layout(standard.filter(([name]) => !['B3', 'C3', 'C4', 'B4'].includes(name))),
    events: [event('A', '41', '09:00', '2.49'), event('A′', '41', '09:00', '2.49')], expected: { time: '09:00', price: '2.49' }, budget: { reads: 1, merges: 1, parts: 10 },
    hint: 'B3 = Gate ↑: fresh crates go north; duplicates turn east. Complete RETURNS: C3 belt ↓, C4 belt ←, B4 belt ↓.' },
  { ...shared, title: 'The late truck', brief: 'An older observation arrives after the new one. The conveyor runs, but its merger keeps the wrong price. Replace the machine that causes the regression.',
    walls: ['D3', 'D4', 'E4'].map(cellIndex), initial: layout(standard.map(entry => entry[0] === 'D2' ? ['D2', 'overwrite'] : entry)),
    events: [event('B', '42', '10:00', '2.79'), event('A', '41', '09:00', '2.49'), event('B′', '42', '10:00', '2.79')], expected: { time: '10:00', price: '2.79' }, budget: { reads: 2, merges: 2, parts: 10 },
    hint: 'Replace D2 with Latest →. Arrival-order merging overwrites 10:00 with 09:00; a newest-only merger preserves the newer observation.' },
  { ...shared, title: 'Blackout', brief: 'The center aisle is closed. The first merge loses power before committing; its retry must finish the work. Repair the machine order without losing a crate to a false receipt.',
    walls: ['D2', 'D3', 'D4', 'E4'].map(cellIndex), initial: layout(upper.map(entry => entry[0] === 'D1' ? ['D1', 'receipt'] : entry[0] === 'E1' ? ['E1', 'latest'] : entry)),
    events: [event('C', '43', '11:00', '3.15'), event('C′', '43', '11:00', '3.15')], expected: { time: '11:00', price: '3.15' }, budget: { reads: 2, merges: 2, parts: 12 }, failFirstMerge: true,
    hint: 'Erase D1 and E1, then place Latest → at D1 and Stamp → at E1. A receipt printed before the failed commit sends the retry to RETURNS too early.' },
  { ...shared, title: 'Rush hour', brief: 'Build the whole factory. Five deliveries, one injected blackout, two duplicate returns, and an older observation. The lower-left aisle is now blocked too.',
    walls: ['D2', 'D3', 'D4', 'E4', 'B4'].map(cellIndex), initial: layout([]),
    events: [event('B', '42', '10:00', '2.79'), event('A', '41', '09:00', '2.49'), event('B′', '42', '10:00', '2.79'), event('A′', '41', '09:00', '2.49'), event('B″', '42', '10:00', '2.79')],
    expected: { time: '10:00', price: '2.79' }, budget: { reads: 3, merges: 3, parts: 12 }, failFirstMerge: true,
    hint: 'Main line: B3 Gate ↑, B2 belt ↑, B1 belt →, C1 Read →, D1 Latest →, E1 Stamp →, F1 belt ↓, F2 belt ↓, F3 belt →. Return line: C3 belt ↓, C4 belt ↓, C5 belt ←.' },
];

export function cloneBoard(board) { return board.map(value => value ? { ...value } : null); }
export function fixedKind(level, index) {
  if (index === level.source) return 'source';
  if (index === level.output) return 'output';
  if (index === level.returns) return 'returns';
  if (level.walls.includes(index)) return 'wall';
  return null;
}
export function validateBoard(level, board) {
  if (!Array.isArray(board) || board.length !== WIDTH * HEIGHT) throw new TypeError('Factory floor must contain 35 cells.');
  for (let index = 0; index < board.length; index++) {
    const value = board[index];
    if (value === null) continue;
    if (!value || !Object.hasOwn(TOOL_DEFS, value.kind) || !Number.isInteger(value.dir) || value.dir < 0 || value.dir > 3 || fixedKind(level, index)) throw new TypeError('Invalid machine or occupied floor cell.');
  }
}
export function placeTile(levelIndex, original, index, kind, dir = 1) {
  const level = FACTORY_LEVELS[levelIndex];
  if (!level) throw new RangeError('Unknown floor.');
  validateBoard(level, original);
  if (!Number.isInteger(index) || index < 0 || index >= original.length || fixedKind(level, index)) return { board: original, error: 'This floor tile is fixed. Build on an empty or editable tile.' };
  const board = cloneBoard(original);
  if (kind === 'erase') board[index] = null;
  else if (kind === 'rotate') {
    if (!board[index]) return { board: original, error: 'Place a conveyor or machine before rotating it.' };
    board[index].dir = (board[index].dir + 1) % 4;
  } else {
    if (!Object.hasOwn(TOOL_DEFS, kind) || !Number.isInteger(dir) || dir < 0 || dir > 3) throw new TypeError('Unknown tool or direction.');
    const group = TOOL_DEFS[kind].group;
    if (group !== 'belt' && board.some((value, at) => at !== index && value && TOOL_DEFS[value.kind].group === group)) return { board: original, error: `Only one ${group === 'merge' ? 'merger' : TOOL_DEFS[kind].name.toLowerCase()} is available. Erase its old tile before moving it.` };
    board[index] = tile(kind, dir);
  }
  if (board.filter(Boolean).length > level.budget.parts) return { board: original, error: `All ${level.budget.parts} floor parts are in use. Erase a spare tile before building.` };
  return { board, error: null };
}

export function createRoutingFactory(levelIndex, inputBoard) {
  const level = FACTORY_LEVELS[levelIndex];
  if (!level) throw new RangeError('Unknown floor.');
  validateBoard(level, inputBoard);
  const board = cloneBoard(inputBoard), receipts = new Set(), log = [], outcomes = [], visitedCells = new Set();
  let packet = null, eventIndex = 0, reads = 0, merges = 0, failures = 0, ticks = 0, row = null, done = false, started = false;
  let position = level.source, activeTag = level.events[0].tag, action = 'ready', lastDirection = 1, fatal = '';
  let message = 'Build the missing conveyor, then release a packet.';
  function finishDelivery(outcome) {
    outcomes.push({ tag: packet.event.tag, outcome }); packet = null; eventIndex++;
    if (eventIndex === level.events.length) done = true;
  }
  function fail(reason) { fatal = reason; message = reason; action = 'fault'; done = true; }
  function result() {
    if (!done) return null;
    const reasons = fatal ? [fatal] : [];
    if (!row) reasons.push('No observation reached the warehouse.');
    else if (row.time !== level.expected.time || row.price !== level.expected.price) reasons.push(`Warehouse retained ${row.price} USD at ${row.time}, not ${level.expected.price} USD at ${level.expected.time}.`);
    if (reads > level.budget.reads) reasons.push(`${reads} reads exceed the ${level.budget.reads}-read budget. Put the gate before the reader.`);
    if (merges > level.budget.merges) reasons.push(`${merges} merge attempts exceed the budget of ${level.budget.merges}.`);
    if (level.events.some(event => !receipts.has(event.generation))) reasons.push('A processed file is missing its completion receipt.');
    return { won: reasons.length === 0, reasons };
  }
  return {
    get state() { return { levelIndex, position, activeTag, action, lastDirection, eventIndex, reads, merges, ticks, started, done, message,
      row: row ? { ...row } : null, receipts: [...receipts], log: [...log], outcomes: outcomes.map(value => ({ ...value })), visited: [...visitedCells],
      carrying: !!packet?.loaded, duplicate: !!packet?.duplicate, result: result() }; },
    step() {
      if (done) return this.state;
      started = true; ticks++;
      if (board.filter(Boolean).length > level.budget.parts) { fail(`The factory exceeds its ${level.budget.parts}-part limit.`); log.push(message); return this.state; }
      if (!packet) {
        packet = { event: level.events[eventIndex], pos: level.source, dir: 1, loaded: false, committed: false, duplicate: false, visited: new Set([level.source]) };
        position = level.source; activeTag = packet.event.tag; action = 'spawn'; lastDirection = 1;
        message = `${activeTag}: received generation #${packet.event.generation}, observed ${packet.event.time}.`;
        log.push(message); return this.state;
      }
      const x = packet.pos % WIDTH, y = Math.floor(packet.pos / WIDTH), [dx, dy] = [[0,-1],[1,0],[0,1],[-1,0]][packet.dir];
      lastDirection = packet.dir;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= WIDTH || ny < 0 || ny >= HEIGHT) fail(`${activeTag} fell off the floor after ${cellName(packet.pos)}. Rotate the outgoing arrow.`);
      else {
        position = ny * WIDTH + nx;
        const fixed = fixedKind(level, position), machine = board[position];
        if (packet.visited.has(position)) fail(`Conveyor loop: ${activeTag} returned to ${cellName(position)}. Give it a route to a bin.`);
        else if (fixed === 'wall') fail(`${activeTag} hit the closed aisle at ${cellName(position)}. Route around it.`);
        else if (fixed === 'source') fail(`${activeTag} ran backward into the input dock.`);
        else if (fixed === 'output') {
          if (packet.duplicate) fail(`${activeTag} is a duplicate. Route the gate’s right-hand exit to RETURNS.`);
          else if (!packet.committed || !receipts.has(packet.event.generation)) fail(`${activeTag} reached OUT before both commit and receipt were complete.`);
          else { action = 'delivered'; message = `${activeTag}: committed shipment reached OUT.`; finishDelivery('delivered'); }
        } else if (fixed === 'returns') {
          if (!packet.duplicate) fail(`${activeTag} is not a verified duplicate. It cannot use RETURNS.`);
          else { action = 'returned'; message = `${activeTag}: duplicate returned without more warehouse work.`; finishDelivery('returned'); }
        } else if (!machine) fail(`Conveyor gap at ${cellName(position)}. ${activeTag} has nowhere to go.`);
        else {
          packet.pos = position; packet.visited.add(position); visitedCells.add(position); packet.dir = machine.dir; action = machine.kind;
          const event = packet.event;
          if (machine.kind === 'belt') message = `${activeTag}: conveyor ${cellName(position)} → ${DIRECTIONS[machine.dir]}.`;
          else if (machine.kind === 'check') {
            packet.duplicate = receipts.has(event.generation);
            if (packet.duplicate) packet.dir = (machine.dir + 1) % 4;
            message = `${activeTag}: ${packet.duplicate ? 'receipt found → right-hand return lane' : 'no receipt → forward to processing'}.`;
          } else if (machine.kind === 'read') { reads++; packet.loaded = true; message = `${activeTag}: read #${event.generation} → ${event.price} USD at ${event.time}.`; }
          else if (machine.kind === 'receipt') { receipts.add(event.generation); message = `${activeTag}: completion receipt #${event.generation} printed.`; }
          else if (!packet.loaded) fail(`${activeTag} reached a merger without its file. Place the archive reader earlier on the conveyor.`);
          else {
            merges++;
            if (level.failFirstMerge && failures === 0) { failures++; action = 'blackout'; message = `${activeTag}: power loss BEFORE commit. A retry is waiting at the input dock.`; finishDelivery('retry'); }
            else {
              packet.committed = true;
              if (!row || machine.kind === 'overwrite' || event.time > row.time) { row = { ...event }; message = `${activeTag}: warehouse committed ${event.price} USD at ${event.time}.`; }
              else message = `${activeTag}: older observation ignored; warehouse keeps ${row.price} USD at ${row.time}.`;
            }
          }
        }
      }
      log.push(message);
      return this.state;
    },
  };
}
