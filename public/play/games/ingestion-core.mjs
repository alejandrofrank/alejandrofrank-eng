// A bounded teaching model of receipt / read / commit ordering, not the GCP loader.
export const OPERATIONS = Object.freeze({
  check: { name: 'Check receipt', hint: 'Already completed? Send this delivery straight to the exit.' },
  read: { name: 'Read file', hint: 'Load this exact generation. Costs one archive read.' },
  merge: { name: 'Merge rows', hint: 'Commit the loaded observation to the warehouse. Costs one merge attempt.' },
  receipt: { name: 'Save receipt', hint: 'Mark this generation completed. A retry will trust this mark.' },
});

const delivery = (tag, generation, time, price) => ({ tag, generation, time, price, product: 'milk' });
export const LEVELS = [
  { title: 'The echo', brief: 'The same file arrives twice. Deliver its row while spending just one read and one merge.',
    events: [delivery('A', '41', '09:00', '2.49'), delivery('A′', '41', '09:00', '2.49')],
    expected: { time: '09:00', price: '2.49' }, budget: { reads: 1, merges: 1 },
    initial: ['read', 'check', 'merge', 'receipt'], mergeMode: 'arrival',
    hint: 'A receipt only saves a read when you look for it before opening the file.' },
  { title: 'Out of order', brief: 'A newer price arrives before an older one. Keep 10:00’s price, and avoid work on the repeated delivery.',
    events: [delivery('B', '42', '10:00', '2.79'), delivery('A', '41', '09:00', '2.49'), delivery('B′', '42', '10:00', '2.79')],
    expected: { time: '10:00', price: '2.79' }, budget: { reads: 2, merges: 2 },
    initial: ['check', 'read', 'merge', 'receipt'], mergeMode: 'arrival',
    hint: 'Delivery order is not observation time. Change what the merge keeps.' },
  { title: 'A false promise', brief: 'The first merge fails before commit. Its retry must still reach the warehouse. A receipt must mean the work is done.',
    events: [delivery('C', '43', '11:00', '3.15'), delivery('C′', '43', '11:00', '3.15')],
    expected: { time: '11:00', price: '3.15' }, budget: { reads: 2, merges: 2 }, failFirstMerge: true,
    initial: ['check', 'read', 'receipt', 'merge'], mergeMode: 'newest',
    hint: 'Move Save receipt after Merge rows. A failed commit must not leave a success receipt.' },
];

function validateProgram(program, mode) {
  if (!Array.isArray(program) || program.length > 4 || program.some(op => !Object.hasOwn(OPERATIONS, op)) || new Set(program).size !== program.length) throw new TypeError('Use each available operation at most once.');
  if (!['arrival', 'newest'].includes(mode)) throw new TypeError('Unknown merge rule.');
}

export function createFactory(levelIndex = 0, program = LEVELS[levelIndex]?.initial, mergeMode = LEVELS[levelIndex]?.mergeMode) {
  const level = LEVELS[levelIndex];
  if (!level) throw new RangeError('Unknown factory level.');
  validateProgram(program, mergeMode);
  const commands = [...program];
  let eventIndex = 0, cursor = 0, reads = 0, merges = 0, failures = 0, payload = null, row = null;
  let started = false, done = false, position = -1, lastEvent = null, message = 'Arrange the commands, then run the deliveries.';
  const receipts = new Set(), log = [], outcomes = [];
  function finishDelivery(outcome) {
    outcomes.push(outcome); eventIndex++; cursor = 0; payload = null;
    if (eventIndex === level.events.length) done = true;
  }
  function result() {
    if (!done) return null;
    const reasons = [];
    if (!row) reasons.push('The warehouse is empty. A delivery exited before a row was committed.');
    else if (row.time !== level.expected.time || row.price !== level.expected.price) reasons.push(`The warehouse kept ${row.price} USD at ${row.time}; the target is ${level.expected.price} USD at ${level.expected.time}.`);
    if (reads > level.budget.reads) reasons.push(`${reads} reads exceed the budget of ${level.budget.reads}. Check receipts before reading.`);
    if (merges > level.budget.merges) reasons.push(`${merges} merge attempts exceed the budget of ${level.budget.merges}.`);
    if (level.events.some(event => !receipts.has(event.generation))) reasons.push('Every successfully processed generation needs a completion receipt.');
    return { won: reasons.length === 0, reasons };
  }
  return {
    get state() { return { levelIndex, started, done, eventIndex, cursor, reads, merges, position, lastEvent,
      message, row: row ? { ...row } : null, receipts: [...receipts], log: [...log], outcomes: [...outcomes],
      program: [...commands], mergeMode, result: result() }; },
    step() {
      if (done) return this.state;
      started = true;
      const event = level.events[eventIndex]; lastEvent = event.tag;
      if (!commands.length) { position = -1; message = `${event.tag}: the empty line sends the delivery out without work.`; log.push(message); finishDelivery('empty'); return this.state; }
      const operation = commands[cursor]; position = cursor;
      let ended = false;
      if (operation === 'check') {
        if (receipts.has(event.generation)) { message = `${event.tag}: receipt #${event.generation} found → duplicate exits.`; finishDelivery('duplicate'); ended = true; }
        else message = `${event.tag}: no receipt for #${event.generation}. Continue.`;
      } else if (operation === 'read') {
        reads++; payload = { ...event }; message = `${event.tag}: read exact generation #${event.generation} → ${event.price} USD, observed ${event.time}.`;
      } else if (operation === 'merge') {
        if (!payload) { message = `${event.tag}: cannot merge: no file has been read. Delivery failed.`; finishDelivery('error'); ended = true; }
        else {
          merges++;
          if (level.failFirstMerge && failures === 0) { failures++; message = `${event.tag}: injected failure BEFORE commit. Delivery will retry.`; finishDelivery('retry'); ended = true; }
          else if (!row || mergeMode === 'arrival' || payload.time > row.time) { row = { ...payload }; message = `${event.tag}: committed ${row.price} USD observed ${row.time}.`; }
          else message = `${event.tag}: ${payload.time} is not newer than ${row.time}. Existing row preserved.`;
        }
      } else if (operation === 'receipt') {
        receipts.add(event.generation); message = `${event.tag}: saved completion receipt for #${event.generation}.`;
      }
      log.push(message);
      if (!ended) { cursor++; if (cursor === commands.length) finishDelivery('processed'); }
      return this.state;
    },
  };
}
