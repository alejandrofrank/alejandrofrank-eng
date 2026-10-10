import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../public/play/catalog-game.mjs';

test('answers cannot be counted twice or skipped before a decision', () => {
  const game = createSession();
  assert.equal(game.next().index, 0);
  assert.equal(game.answer('different').score, 1);
  assert.equal(game.answer('same').score, 1);
  assert.equal(game.state().choice, 'different');
  assert.equal(game.next().index, 1);
  assert.equal(game.state().choice, null);
});

test('conflicts, equivalent units and missing evidence form a complete replayable round', () => {
  const game = createSession();
  game.answer('different'); game.next();
  game.answer('same'); game.next();
  assert.equal(game.answer('uncertain').score, 3);
  assert.equal(game.next().index, 2);
  assert.equal(game.state().last, true);
  assert.equal(game.reset().score, 0);
  assert.equal(game.state().index, 0);
  assert.equal(game.state().choice, null);
});

test('wrong answers do not score and invalid decisions do not mutate state', () => {
  const game = createSession();
  assert.throws(() => game.answer('guess'));
  assert.equal(game.state().choice, null);
  assert.equal(game.answer('same').score, 0);
  assert.equal(game.state().pair.answer, 'different');
});
