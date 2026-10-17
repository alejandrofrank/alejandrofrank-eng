export { CUSTOMS_SHIFTS, STAMP_LABELS, createCustomsSession, auditCustomsScenario, customsAnswer } from './identity-campaign.mjs';

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
