import test from 'node:test';
import assert from 'node:assert/strict';
import { compareNames } from '../public/play/catalog-engine/match.mjs';
import { CUSTOMS_SHIFTS, GARMENT_ROUNDS, createCustomsSession, createGarmentSession, inspectRack, auditCustomsScenario, customsAnswer } from '../public/play/games/identity-state.mjs';

const expectedAnswers = ['yes', 'uncertain', 'ML-1', 'RC-1', 'FL-1', 'CF-1', 'none', 'BR-1'];
function resolve(session, answer = customsAnswer(session.getState().scenario)) {
  return session.getState().scenario.mode === 'stamp' ? session.stamp(answer) : session.choose(answer);
}
function complete(session) {
  const orders = [];
  while (!session.getState().finished) {
    orders.push(session.getState().scenario.documents.map(row => row.id));
    resolve(session);
    session.next();
  }
  return orders;
}

test('campaign escalates from stamps to 3–8 products and judges 35 distinct declarations with the real matcher', () => {
  assert.equal(CUSTOMS_SHIFTS.length, 8);
  assert.deepEqual(CUSTOMS_SHIFTS.filter(shift => shift.mode === 'lineup').map(shift => shift.documents.length), [3, 4, 5, 6, 7, 8]);
  assert.equal(new Set(CUSTOMS_SHIFTS.flatMap(shift => shift.documents.map(row => row.name))).size, 35);
  assert.equal(new Set(CUSTOMS_SHIFTS.flatMap(shift => shift.documents.map(row => row.kind))).size, 6);
  assert.deepEqual(CUSTOMS_SHIFTS.map(customsAnswer), expectedAnswers);
  for (const shift of CUSTOMS_SHIFTS) {
    const audit = auditCustomsScenario(shift);
    audit.forEach(row => assert.deepEqual(row.evidence, compareNames(shift.request, row.name)));
    if (shift.mode === 'lineup') assert.equal(audit.filter(row => row.evidence.decision === 'yes').length, shift.allowNoMatch ? 0 : 1);
  }
});

test('a full clean campaign cannot skip unresolved checkpoints or count repeated submissions', () => {
  const session = createCustomsSession(11);
  session.next();
  assert.equal(session.getState().index, 0);
  for (const answer of expectedAnswers) {
    resolve(session, answer);
    const count = session.getState().ledger.length;
    resolve(session, answer);
    assert.equal(session.getState().ledger.length, count);
    session.next();
    const index = session.getState().index;
    session.next();
    assert.equal(session.getState().index, index);
  }
  const state = session.getState();
  assert.equal(state.cleared, true);
  assert.equal(state.errors, 0);
  assert.equal(state.streak, 8);
  assert.equal(state.bestStreak, 8);
  assert.equal(state.ledger.filter(row => row.accepted).length, 6);
  assert.equal(state.ledger.flatMap(row => row.audit).length, 35);
});

test('three citations close the campaign and retain incorrect admissions for the manifest', () => {
  const session = createCustomsSession(12);
  session.stamp('no'); session.next();
  session.stamp('yes'); session.next();
  session.choose('ML-2'); session.next();
  const state = session.getState();
  assert.equal(state.finished, true);
  assert.equal(state.cleared, false);
  assert.equal(state.index, 2);
  assert.equal(state.ledger.length, 3);
  assert.equal(state.ledger[1].accepted.evidence.decision, 'uncertain');
  assert.equal(state.ledger[2].accepted.evidence.decision, 'no');
  assert.deepEqual(session.choose('ML-1'), state);
});

test('a seeded replay changes positions while preserving each lineup and its computed answer', () => {
  const first = createCustomsSession(42);
  const original = complete(first);
  assert.deepEqual(complete(createCustomsSession(42)), original);
  first.reset();
  const shuffled = complete(first);
  assert.notDeepEqual(shuffled, original);
  original.forEach((ids, index) => assert.deepEqual([...ids].sort(), [...shuffled[index]].sort()));
  first.reset(42);
  assert.deepEqual(complete(first), original);
});

test('no-match checkpoint never promotes an uncertain product to a verified identity', () => {
  const session = createCustomsSession(2);
  for (let i = 0; i < 6; i += 1) { resolve(session); session.next(); }
  assert.equal(session.getState().scenario.id, 'chicken-lineup');
  session.choose('CH-4');
  assert.equal(session.getState().result.expected, 'none');
  assert.equal(session.getState().result.accepted.evidence.decision, 'uncertain');
  assert.equal(session.getState().result.correct, false);
  assert.equal(session.getState().streak, 0);
  assert.equal(session.getState().bestStreak, 6);
});

test('invalid actions do not mutate play, hints count once, reset clears progress, and ambiguous lineups are rejected', () => {
  const session = createCustomsSession(22);
  const before = session.getState();
  assert.throws(() => session.stamp('maybe'), RangeError);
  assert.throws(() => session.choose('none'), TypeError);
  assert.deepEqual(session.getState(), before);
  session.useHint(); session.useHint();
  assert.equal(session.getState().hintsUsed, 1);
  assert.equal(session.getState().hintUsed, true);
  resolve(session); session.next();
  assert.equal(session.getState().hintUsed, false);
  resolve(session); session.next();
  assert.throws(() => session.choose('missing-id'), RangeError);
  assert.throws(() => session.stamp('yes'), TypeError);
  session.reset();
  assert.equal(session.getState().hintsUsed, 0);
  assert.equal(session.getState().ledger.length, 0);
  assert.equal(session.getState().streak, 0);
  const lineup = CUSTOMS_SHIFTS[2];
  assert.throws(() => customsAnswer({ ...lineup, documents: [lineup.documents[0], { ...lineup.documents[0], id: 'duplicate' }] }), /Invalid customs lineup/);
  assert.throws(() => customsAnswer({ ...lineup, documents: [lineup.documents[1]] }), /Invalid customs lineup/);
  assert.throws(() => createCustomsSession(NaN), TypeError);
});

test('every garment rack has one solution and each feature must independently satisfy the constraint', () => {
  const solutions = GARMENT_ROUNDS.map(round => round.options.map((card, index) => inspectRack([...round.pair, card]).pass ? index : -1).filter(index => index >= 0));
  assert.deepEqual(solutions, [[2], [4], [0]]);
  const mixed = inspectRack([...GARMENT_ROUNDS[0].pair, GARMENT_ROUNDS[0].options[1]]);
  assert.equal(mixed.pass, false);
  assert.deepEqual(mixed.checks.map(check => check.pass), [true, true, false]);
  assert.throws(() => inspectRack(GARMENT_ROUNDS[0].pair), TypeError);
});

test('garment attempts are bounded, repeat clicks cannot consume attempts, and completion records all racks', () => {
  const session = createGarmentSession();
  session.next();
  assert.equal(session.getState().index, 0);
  session.choose(0);
  session.choose(0);
  assert.equal(session.getState().guesses.length, 1);
  session.choose(1);
  assert.equal(session.getState().resolved, true);
  session.choose(2);
  assert.equal(session.getState().score, 0, 'cannot repair a resolved rack by clicking its answer');
  session.next();
  session.choose(4);
  session.next();
  session.choose(0);
  assert.equal(session.getState().finished, true);
  assert.equal(session.getState().score, 2);
  assert.throws(() => session.choose(9), RangeError);
  session.reset();
  assert.equal(session.getState().guesses.length, 0);
  assert.equal(session.getState().score, 0);
});
