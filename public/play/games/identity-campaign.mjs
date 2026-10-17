import { compareNames } from '../catalog-engine/match.mjs';

export const STAMP_LABELS = { yes: 'Approve', no: 'Reject', uncertain: 'Hold' };
const listings = (prefix, kind, names) => names.map((name, index) => ({
  id: `${prefix}-${index + 1}`, kind, name,
  supplier: ['North shelf', 'Corner shop', 'City market', 'Warehouse 04'][index % 4],
}));

// All names are fictional. No answer flags: the pinned matcher judges each declaration.
export const CUSTOMS_SHIFTS = [
  { id: 'first-stamp', mode: 'stamp', title: 'Learn the stamp', tier: 'Induction',
    brief: 'Start with one declaration. Different words and units can still describe exactly the same product.',
    hint: 'Translate the unit before comparing the number: 0.5 litres is 500 millilitres. Descremada means skim.',
    request: 'Norte skim milk 500 ml',
    documents: listings('IN', 'milk', ['Norte leche descremada 0.5 L']) },
  { id: 'missing-evidence', mode: 'stamp', title: 'Know when to hold', tier: 'Induction',
    brief: 'A familiar brand and size are not enough. A missing attribute must not become a guessed match.',
    hint: 'Look for the preparation: ground and instant are different coffee variants. Unspecified is neither one.',
    request: 'Viento cafe molido 200 g',
    documents: listings('RV', 'coffee', ['Viento coffee 200 g']) },
  { id: 'milk-lineup', mode: 'lineup', title: 'One fits. Two almost fit.', tier: 'Shelf inspection',
    brief: 'The desk is now a shelf. Select the one verified identity, then commit your inspection. Packaging similarity is not evidence.',
    hint: 'Check milk variant and per-container volume separately. A smaller carton can share every other word.',
    request: 'Loma leche entera 1 L',
    documents: listings('ML', 'milk', ['Loma whole milk 1000 ml', 'Loma skim milk 1 L', 'Loma whole milk 200 ml']) },
  { id: 'rice-lineup', mode: 'lineup', title: 'Same bag. Different product.', tier: 'Shelf inspection',
    brief: 'Four near-neighbours. Brand, variety and weight must all agree; a matching noun proves very little.',
    hint: 'Blanco means white; integral means brown. Compare brand and normalized weight as well as the grain.',
    request: 'Sol arroz blanco 1 kg',
    documents: listings('RC', 'rice', ['Sol white rice 1000 g', 'Sol brown rice 1 kg', 'Viento white rice 1 kg', 'Sol white rice 500 g']) },
  { id: 'flour-lineup', mode: 'lineup', title: 'A blank is not a wildcard.', tier: 'Evidence inspection',
    brief: 'Five bags compete for one identity. Some are wrong; some simply do not provide enough evidence.',
    hint: 'A missing flour variant is a reason to hold. It is not permission to treat white and yellow maize as interchangeable.',
    request: 'Norte harina blanca 1 kg',
    documents: listings('FL', 'flour', ['Norte white flour 1000 g', 'Norte yellow flour 1 kg', 'Norte white flour 500 g', 'Sol white flour 1 kg', 'Norte flour 1 kg']) },
  { id: 'coffee-lineup', mode: 'lineup', title: 'Two small packs ≠ one large pack.', tier: 'Evidence inspection',
    brief: 'Six declarations. Keep per-pack size, pack count and preparation separate. Unsupported claims must stay in review.',
    hint: 'A 2 × 200 g presentation is not a 400 g presentation. The matcher compares size and pack as separate attributes; Vto is a supported alias for Viento.',
    request: 'Viento cafe molido 200 g pack 2',
    documents: listings('CF', 'coffee', ['Vto ground coffee 0.2 kg pack 2', 'Viento ground coffee 200 g', 'Viento instant coffee 200 g pack 2', 'Viento ground coffee 400 g', 'Viento coffee 200 g pack 2', 'Viento ground coffee 200 g premium pack 2']) },
  { id: 'chicken-lineup', mode: 'lineup', title: 'The closest one can still be wrong.', tier: 'Senior inspection', allowNoMatch: true,
    brief: 'Seven close declarations. Find a fully supported identity. A convincing candidate that needs review must stay outside the catalog.',
    hint: 'A conflicting cut or size is a rejection. An unsupported qualifier or missing cut needs review. Neither is a verified match.',
    request: 'Pollo pechuga 500 g',
    documents: listings('CH', 'chicken', ['Chicken breast 1 kg', 'Chicken neck 500 g', 'Whole chicken 500 g', 'Chicken 500 g', 'Chicken breast 500 g organic', 'Chicken breast 500 g pack 2', 'Chicken breast 0 g']) },
  { id: 'broth-lineup', mode: 'lineup', title: 'The full inspection.', tier: 'Senior inspection',
    brief: 'Eight declarations mix volume, mass, brand, pack count and incomplete detail. Find the one that survives every check.',
    hint: 'Equal numbers can hide different dimensions: 500 g is not 500 ml. Normalize litres to millilitres, then check the brand, variant and pack count.',
    request: 'Norte caldo pollo 500 ml pack 2',
    documents: listings('BR', 'broth', ['Norte chicken broth 0.5 L pack 2', 'Norte chicken broth 500 ml', 'Norte chicken broth 1 L', 'Norte chicken broth 500 g pack 2', 'Sol chicken broth 500 ml pack 2', 'Norte broth 500 ml pack 2', 'Norte chicken broth 500 ml organic pack 2', 'Norte chicken broth 250 ml pack 2']) },
];

export function auditCustomsScenario(scenario) {
  return scenario.documents.map(document => ({ ...document, evidence: compareNames(scenario.request, document.name) }));
}

export function customsAnswer(scenario) {
  const audit = auditCustomsScenario(scenario);
  if (scenario.mode === 'stamp') return audit[0].evidence.decision;
  const verified = audit.filter(row => row.evidence.decision === 'yes');
  if (verified.length > 1 || (!verified.length && !scenario.allowNoMatch)) throw new Error(`Invalid customs lineup: ${scenario.id}`);
  return verified[0]?.id ?? 'none';
}

function campaignFor(seed) {
  let randomState = seed >>> 0;
  const random = () => { randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0; return randomState / 4294967296; };
  return CUSTOMS_SHIFTS.map(shift => {
    const documents = shift.documents.map(document => ({ ...document }));
    for (let i = documents.length - 1; i > 0; i -= 1) {
      const other = Math.floor(random() * (i + 1));
      [documents[i], documents[other]] = [documents[other], documents[i]];
    }
    return { ...shift, documents };
  });
}

export function createCustomsSession(initialSeed = Date.now()) {
  if (!Number.isFinite(initialSeed)) throw new TypeError('Seed must be a finite number');
  let seed = initialSeed >>> 0;
  let campaign = campaignFor(seed);
  let index = 0, errors = 0, streak = 0, bestStreak = 0;
  let ledger = [], result = null;
  let hints = new Set();
  const limit = 3;
  const getState = () => ({
    scenario: campaign[index], index, total: campaign.length, errors, limit, streak, bestStreak, seed,
    ledger: [...ledger], result, resolved: Boolean(result), hintsUsed: hints.size, hintUsed: hints.has(index),
    finished: errors >= limit || ledger.length === campaign.length,
    cleared: ledger.length === campaign.length && errors < limit,
  });
  function commit(decision, mode) {
    const scenario = campaign[index];
    if (getState().finished || result) return getState();
    if (scenario.mode !== mode) throw new TypeError(`This checkpoint requires ${scenario.mode}`);
    if (mode === 'stamp' && !Object.hasOwn(STAMP_LABELS, decision)) throw new RangeError('Unknown stamp');
    if (mode === 'lineup' && decision !== 'none' && !scenario.documents.some(row => row.id === decision)) throw new RangeError('Unknown product');
    const audit = auditCustomsScenario(scenario);
    const expected = customsAnswer(scenario);
    const accepted = mode === 'stamp' ? decision === 'yes' ? audit[0] : null : audit.find(row => row.id === decision) ?? null;
    result = { id: scenario.id, title: scenario.title, request: scenario.request, mode, decision, expected, correct: decision === expected, audit, accepted, hintUsed: hints.has(index) };
    if (!result.correct) { errors += 1; streak = 0; } else { streak += 1; bestStreak = Math.max(bestStreak, streak); }
    ledger = [...ledger, result];
    return getState();
  }
  return {
    getState,
    stamp: decision => commit(decision, 'stamp'),
    choose: id => commit(id, 'lineup'),
    useHint() { if (!result && !getState().finished) hints.add(index); return getState(); },
    next() { if (result && !getState().finished) { index += 1; result = null; } return getState(); },
    reset(nextSeed = (seed + 0x9e3779b9) >>> 0) {
      if (!Number.isFinite(nextSeed)) throw new TypeError('Seed must be a finite number');
      seed = nextSeed >>> 0; campaign = campaignFor(seed); index = 0; errors = 0; streak = 0; bestStreak = 0; ledger = []; result = null; hints = new Set();
      return getState();
    },
  };
}
