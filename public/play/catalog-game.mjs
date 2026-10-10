// Fictional teaching pairs, not outputs from the standalone Catalog Match Lab.
export const PAIRS = [
  {
    a: 'Loma whole milk · 1 L', b: 'Loma whole milk · 200 ml', answer: 'different',
    reason: 'The brand and variant agree, but 1,000 ml is not 200 ml. A lower shelf price does not make these the same presentation.',
    checks: [['Brand', 'Loma', 'Loma'], ['Variant', 'Whole milk', 'Whole milk'], ['Volume', '1,000 ml', '200 ml'], ['Pack', '1', '1']],
  },
  {
    a: 'Campo white rice · 1 kg', b: 'Campo arroz blanco · 1000 g', answer: 'same',
    reason: 'The language and units differ. Once normalized, the brand, product, variant, weight and single-pack presentation agree.',
    checks: [['Brand', 'Campo', 'Campo'], ['Variant', 'White rice', 'White rice'], ['Weight', '1,000 g', '1,000 g'], ['Pack', '1', '1']],
  },
  {
    a: 'Sierra ground coffee · 200 g', b: 'Sierra coffee · 200 g', answer: 'uncertain',
    reason: 'Listing B does not say whether the coffee is ground or whole bean. Matching brand and weight cannot fill in that missing evidence.',
    checks: [['Brand', 'Sierra', 'Sierra'], ['Form', 'Ground', 'Not specified'], ['Weight', '200 g', '200 g'], ['Pack', '1', '1']],
  },
];

export function createSession() {
  let index = 0;
  let score = 0;
  let choice = null;
  const state = () => ({ index, total: PAIRS.length, score, choice, pair: PAIRS[index], last: index === PAIRS.length - 1 });
  return {
    state,
    answer(value) {
      if (!['same', 'different', 'uncertain'].includes(value)) throw new Error('Unknown decision');
      if (choice !== null) return state();
      choice = value;
      if (choice === PAIRS[index].answer) score++;
      return state();
    },
    next() {
      if (choice !== null && index < PAIRS.length - 1) { index++; choice = null; }
      return state();
    },
    reset() { index = 0; score = 0; choice = null; return state(); },
  };
}
