import test from 'node:test';
import assert from 'node:assert/strict';
import { BASKET_LEVELS, createBasketSession, evaluateBasket, normalizeOffer } from '../public/play/games/basket-model.mjs';

const solutions = [[0,2,0,1,1,0],[0,1,0,1,0,1],[1,2,1,1,1,0],[0,0,0,3,1,0,1,0,0]];
test('every market has exactly one winning basket across all stock-bounded combinations', () => {
  BASKET_LEVELS.forEach((level, index) => {
    const winners = [], quantities = level.offers.map(() => 0);
    function visit(i) { if (i === quantities.length) { if (evaluateBasket(index, quantities).won) winners.push([...quantities]); return; } for (let n = 0; n <= level.offers[i].stock; n++) { quantities[i] = n; visit(i + 1); } }
    visit(0); assert.deepEqual(winners, [solutions[index]]);
  });
});
test('delivery is charged once per store and cheap small packs cannot bypass capacity', () => {
  const corner = evaluateBasket(1, solutions[1]); assert.equal(corner.fees, 160); assert.equal(corner.total, 990); assert.equal(corner.deliveries.length, 1);
  const small = evaluateBasket(0, [4,0,2,0,0,2]); assert.equal(small.total, 780); assert.equal(small.exact, true); assert.equal(small.packs, 8); assert.equal(small.won, false);
  const mixed = evaluateBasket(1, [3,0,0,1,0,1]); assert.equal(mixed.fees, 200); assert.equal(mixed.total, 1000); assert.equal(mixed.won, false);
});
test('dated FX, identity, freshness and stock are separate constraints', () => {
  const level = BASKET_LEVELS[2]; assert.equal(normalizeOffer(level.offers[0],level).cents,180); assert.equal(normalizeOffer(level.offers[2],level).cents,200);
  assert.equal(evaluateBasket(2,[2,0,1,1,1,0]).overstock[0].id,'A');
  const audit = BASKET_LEVELS[3]; for (const i of [0,1,2,5]) assert.equal(normalizeOffer(audit.offers[i],audit).valid,false);
  assert.equal(normalizeOffer({...audit.offers[3],rate:0},audit).valid,false);
  assert.equal(evaluateBasket(3,[1,0,0,0,1,0,1,0,0]).won,false);
  assert.equal(evaluateBasket(3,[0,1,0,0,1,0,1,0,0]).won,false);
});
test('campaign bounds edits, check attempts and advancement, and snapshots cannot forge wins', () => {
  const game = createBasketSession(); assert.equal(game.next(),false); assert.equal(game.change(0,-1),false);
  const snapshot = game.check(); snapshot.verdict.won = true; assert.equal(game.next(),false);
  game.check(); game.check(); assert.equal(game.state.finished,true); assert.equal(game.change(1,1),false); game.check(); assert.equal(game.state.attempts,3);
  game.reset(); for (let i=0;i<4;i++) {
    solutions[i].forEach((qty,j)=>{for(let n=0;n<qty;n++)assert.equal(game.change(j,1),true);});
    assert.equal(game.check().verdict.won,true); assert.equal(game.change(0,1),false); assert.equal(game.next(),i<3);
  }
  assert.equal(game.state.cleared.length,4); game.restart(); assert.equal(game.state.cleared.length,0); game.select(3); assert.equal(game.state.cleared.length,0);
  game.change(3,1); game.change(3,1); game.change(3,1); assert.equal(game.change(3,1),false);
  assert.throws(()=>game.select(9),RangeError); assert.throws(()=>evaluateBasket(0,[]),TypeError);
});
