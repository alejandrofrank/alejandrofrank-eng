import test from 'node:test';
import assert from 'node:assert/strict';
import { compareNames } from '../public/play/catalog-engine/match.mjs';
import { CUSTOMS_SHIFTS, GARMENT_ROUNDS, createCustomsSession, createGarmentSession, inspectRack } from '../public/play/games/identity-state.mjs';

test('customs paperwork exercises conversion, omissions, conflicts, qualifiers and multipacks through the real matcher', () => {
  const expected = ['yes', 'uncertain', 'no', 'no', 'yes', 'uncertain', 'no', 'yes', 'uncertain'];
  const answers = CUSTOMS_SHIFTS.flatMap(shift => shift.documents.map(document => compareNames(shift.request, document.name).decision));
  assert.deepEqual(answers, expected);
  const session = createCustomsSession();
  session.next();
  assert.equal(session.getState().index, 0, 'cannot skip unstamped paperwork');
  for (const answer of expected) {
    session.stamp(answer);
    const count = session.getState().ledger.length;
    session.stamp(answer);
    assert.equal(session.getState().ledger.length, count, 'double click cannot stamp twice');
    session.next();
  }
  const state = session.getState();
  assert.equal(state.cleared, true);
  assert.equal(state.errors, 0);
  assert.deepEqual(state.ledger.filter(row => row.decision === 'yes').map(row => row.id), ['ML-101', 'RC-202', 'CF-302']);
});

test('three customs errors stop intake, retain the audit and reset cleanly', () => {
  const session = createCustomsSession();
  for (const stamp of ['no', 'yes', 'yes']) { session.stamp(stamp); session.next(); }
  assert.equal(session.getState().finished, true);
  assert.equal(session.getState().cleared, false);
  assert.equal(session.getState().ledger.length, 3);
  session.stamp('no');
  assert.equal(session.getState().ledger.length, 3);
  assert.throws(() => session.stamp('maybe'), RangeError);
  session.reset();
  assert.equal(session.getState().index, 0);
  assert.equal(session.getState().ledger.length, 0);
  assert.equal(session.getState().errors, 0);
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
