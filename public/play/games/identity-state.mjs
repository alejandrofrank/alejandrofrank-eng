import { compareNames } from '../catalog-engine/match.mjs';

// Fictional paperwork. The answer is never stored: the repository's matcher decides it.
export const CUSTOMS_SHIFTS = [
  { title: 'Units are not identity', request: 'Loma leche entera 1 L', documents: [
    { id: 'ML-101', supplier: 'North shelf', name: 'Loma whole milk 1000 ml' },
    { id: 'ML-102', supplier: 'Corner shop', name: 'Loma milk 1 L' },
    { id: 'ML-103', supplier: 'City market', name: 'Loma leche entera 200 ml' },
  ] },
  { title: 'Read the qualifiers', request: 'Sol arroz blanco 1 kg', documents: [
    { id: 'RC-201', supplier: 'City market', name: 'Sol arroz integral 1 kg' },
    { id: 'RC-202', supplier: 'North shelf', name: 'Sol white rice 1000 g' },
    { id: 'RC-203', supplier: 'Corner shop', name: 'Sol arroz blanco premium 1 kg' },
  ] },
  { title: 'One pack is not two', request: 'Viento cafe molido 200 g', documents: [
    { id: 'CF-301', supplier: 'Corner shop', name: 'Viento ground coffee 200 g pack 2' },
    { id: 'CF-302', supplier: 'City market', name: 'Vto cafe molido 0.2 kg' },
    { id: 'CF-303', supplier: 'North shelf', name: 'Viento coffee 200 g' },
  ] },
];

export const STAMP_LABELS = { yes: 'Approve', no: 'Reject', uncertain: 'Hold' };
const documents = CUSTOMS_SHIFTS.flatMap((shift, shiftIndex) => shift.documents.map((document, inShift) => ({
  ...document, request: shift.request, shiftTitle: shift.title, shift: shiftIndex + 1, inShift: inShift + 1,
})));

export function createCustomsSession() {
  let index = 0;
  let errors = 0;
  let ledger = [];
  let stamped = null;
  const limit = 3;
  const getState = () => ({
    document: documents[index], index, total: documents.length, errors, limit,
    ledger: [...ledger], stamped,
    finished: errors >= limit || ledger.length === documents.length,
    cleared: ledger.length === documents.length && errors < limit,
  });
  return {
    getState,
    stamp(decision) {
      if (!Object.hasOwn(STAMP_LABELS, decision)) throw new RangeError('Unknown stamp');
      if (stamped || getState().finished) return getState();
      const document = documents[index];
      const evidence = compareNames(document.request, document.name);
      stamped = { ...document, decision, evidence, correct: decision === evidence.decision };
      if (!stamped.correct) errors += 1;
      ledger = [...ledger, stamped];
      return getState();
    },
    next() {
      if (stamped && !getState().finished) { index += 1; stamped = null; }
      return getState();
    },
    reset() { index = 0; errors = 0; ledger = []; stamped = null; return getState(); },
  };
}

export const GARMENT_ATTRIBUTES = ['shape', 'color', 'pattern'];
const garment = (shape, color, pattern) => ({ shape, color, pattern });
export const GARMENT_ROUNDS = [
  { title: 'Keep the shape. Change the rest.', pair: [garment('tee', 'blue', 'plain'), garment('tee', 'rose', 'stripe')], options: [
    garment('jacket', 'gold', 'dot'), garment('tee', 'gold', 'plain'), garment('tee', 'gold', 'dot'),
    garment('tee', 'rose', 'stripe'), garment('dress', 'gold', 'dot'), garment('tee', 'blue', 'dot'),
  ] },
  { title: 'Different shapes. Shared details.', pair: [garment('jacket', 'gold', 'stripe'), garment('dress', 'gold', 'stripe')], options: [
    garment('tee', 'gold', 'dot'), garment('jacket', 'gold', 'stripe'), garment('dress', 'gold', 'stripe'),
    garment('tee', 'rose', 'stripe'), garment('tee', 'gold', 'stripe'), garment('tee', 'blue', 'stripe'),
  ] },
  { title: 'Find the missing combination.', pair: [garment('dress', 'rose', 'plain'), garment('tee', 'blue', 'plain')], options: [
    garment('jacket', 'gold', 'plain'), garment('tee', 'gold', 'plain'), garment('jacket', 'gold', 'stripe'),
    garment('jacket', 'blue', 'plain'), garment('dress', 'gold', 'plain'), garment('jacket', 'rose', 'plain'),
  ] },
];

export function inspectRack(cards) {
  if (cards.length !== 3 || cards.some(card => GARMENT_ATTRIBUTES.some(key => typeof card[key] !== 'string'))) {
    throw new TypeError('A rack needs three complete garment cards');
  }
  const checks = GARMENT_ATTRIBUTES.map(key => {
    const values = cards.map(card => card[key]);
    const unique = new Set(values).size;
    return { key, values, pass: unique !== 2, rule: unique === 1 ? 'all same' : unique === 3 ? 'all different' : 'two match, one differs' };
  });
  return { pass: checks.every(check => check.pass), checks };
}

export function createGarmentSession() {
  let index = 0;
  let guesses = [];
  let completed = [];
  const getState = () => {
    const result = guesses.at(-1) ?? null;
    return { index, total: GARMENT_ROUNDS.length, round: GARMENT_ROUNDS[index], guesses: [...guesses],
      result, resolved: Boolean(result?.pass || guesses.length >= 2), completed: [...completed],
      score: completed.filter(round => round.pass).length,
      finished: completed.length === GARMENT_ROUNDS.length };
  };
  return {
    getState,
    choose(option) {
      const state = getState();
      if (!Number.isInteger(option) || !state.round.options[option]) throw new RangeError('Unknown garment');
      if (state.resolved || state.finished || guesses.some(guess => guess.option === option)) return state;
      const result = { option, ...inspectRack([...state.round.pair, state.round.options[option]]) };
      guesses = [...guesses, result];
      if (result.pass || guesses.length >= 2) completed = [...completed, { index, pass: result.pass }];
      return getState();
    },
    next() {
      if (getState().resolved && index < GARMENT_ROUNDS.length - 1) { index += 1; guesses = []; }
      return getState();
    },
    reset() { index = 0; guesses = []; completed = []; return getState(); },
  };
}
