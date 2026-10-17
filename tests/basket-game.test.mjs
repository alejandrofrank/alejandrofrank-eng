import test from 'node:test';
import assert from 'node:assert/strict';
import { BASKET_LEVELS, evaluateBasket, normalizeOffer } from '../public/play/games/basket-model.mjs';

test('all basket levels have a feasible exact order within budget', () => {
  [[0, 2, 0, 1], [0, 2, 0, 1], [0, 0, 2, 0, 1, 0]].forEach((quantities, i) => {
    const result = evaluateBasket(i, quantities);
    assert.equal(result.won, true); assert.deepEqual(result.amounts, { milk: 2, rice: 1 });
  });
});
test('cheap packs can exceed the budget and incomplete baskets cannot win', () => {
  const small = evaluateBasket(0, [10, 0, 2, 0]);
  assert.equal(small.exact, true); assert.equal(small.total, 8.3); assert.equal(small.won, false);
  assert.equal(evaluateBasket(0, [0, 0, 0, 0]).won, false);
});
test('dated FX conversion and stale observations affect eligibility independently of price', () => {
  const converted = normalizeOffer(BASKET_LEVELS[1].offers[1]);
  assert.equal(converted.usd, 1.8); assert.equal(converted.unitPrice, 1.8);
  const stale = evaluateBasket(2, [2, 0, 0, 1, 0, 0]);
  assert.equal(stale.total, 3); assert.equal(stale.exact, true); assert.equal(stale.won, false); assert.equal(stale.invalid.length, 2);
  assert.equal(evaluateBasket(2, [0, 2, 0, 0, 1, 0]).invalid[0].id, 'B');
  assert.throws(() => evaluateBasket(0, [-1, 0, 0, 0]));
});
