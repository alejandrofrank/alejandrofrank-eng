import test from 'node:test';
import assert from 'node:assert/strict';
import { createQueryPuzzle, evaluateQueryPlan, queryPlanSql, QUERY_LEVELS } from '../public/play/games/query-model.mjs';

test('query puzzle checks exact output and budget across all authored levels', () => {
  const game = createQueryPuzzle();
  assert.equal(game.next(), false);
  assert.equal(game.run().won, false);
  assert.equal(game.state.preview.scan, 54);
  game.toggleField('notes');
  game.toggleField('image');
  assert.equal(game.run().won, true);
  assert.equal(game.state.result.scan, 9);
  assert.equal(game.state.result.rows.length, 6);
  assert.equal(game.next(), true);
  assert.equal(game.state.result, null);
  assert.equal(game.state.attempts, 0);
  for (const index of [1, 2]) {
    game.toggleField('notes');
    game.toggleField('image');
    game.togglePartition('2026-10-14');
    game.togglePartition('2026-10-15');
    if (index === 2) game.setLimit(1);
    const result = game.run();
    assert.equal(result.won, true);
    assert.equal(result.scan, 3);
    assert.equal(result.rows.length, index === 1 ? 2 : 1);
    if (index === 1) assert.equal(game.next(), true);
  }
  assert.equal(game.next(), false);
  assert.deepEqual(game.state.solved, [0, 1, 2]);
  game.restart();
  assert.equal(game.state.index, 0);
  assert.deepEqual(game.state.solved, []);
});

test('LIMIT changes result rows but not the scanned blocks', () => {
  const plan = { fields: ['product', 'price'], partitions: ['2026-10-16'], limit: null };
  const all = evaluateQueryPlan(2, plan);
  const one = evaluateQueryPlan(2, { ...plan, limit: 1 });
  assert.equal(all.rows.length, 2);
  assert.equal(one.rows.length, 1);
  assert.equal(all.scan, one.scan);
  assert.deepEqual(all.blocks, one.blocks);
  assert.equal(all.won, false);
  assert.equal(one.won, true);
});

test('same row count on the wrong date and omitted output fields do not pass', () => {
  const wrongDay = evaluateQueryPlan(1, { fields: ['product', 'price'], partitions: ['2026-10-14'], limit: null });
  assert.equal(wrongDay.rows.length, wrongDay.targetRows.length);
  assert.equal(wrongDay.withinBudget, true);
  assert.equal(wrongDay.rowsMatch, false);
  assert.equal(wrongDay.won, false);
  const missing = evaluateQueryPlan(1, { fields: ['price'], partitions: ['2026-10-16'], limit: null });
  assert.equal(missing.rowsMatch, true);
  assert.equal(missing.fieldsMatch, false);
  assert.equal(missing.won, false);
  assert.deepEqual(missing.readFields, ['product', 'price']);
  assert.equal(missing.scan, 3, 'ORDER BY product remains a read dependency');
});

test('empty and unknown selections cannot produce a zero-cost success', () => {
  for (const fields of [[], ['unknown']]) {
    const result = evaluateQueryPlan(0, { fields, partitions: QUERY_LEVELS[0].partitions, limit: null });
    assert.equal(result.valid, false);
    assert.equal(result.rows.length, 0);
    assert.equal(result.scan, 0);
    assert.equal(result.won, false);
  }
  assert.equal(evaluateQueryPlan(0, { fields: ['product', 'price'], partitions: [], limit: null }).won, false);
  assert.throws(() => evaluateQueryPlan(99, {}), RangeError);
});

test('changing a successful plan clears the verdict and resets do not retain stale results', () => {
  const game = createQueryPuzzle();
  game.toggleField('notes');
  game.toggleField('image');
  game.run();
  const previous = game.state;
  previous.preview.plan.fields.length = 0;
  previous.result.rows.length = 0;
  assert.equal(game.state.result.rows.length, 6);
  game.toggleField('price');
  assert.equal(game.state.result, null);
  assert.equal(game.next(), false);
  game.reset();
  assert.equal(game.state.result, null);
  assert.equal(game.state.preview.scan, 54);
});

test('generated SQL reflects explicit dates, selected fields and output-only limit', () => {
  assert.equal(queryPlanSql({ fields: ['price', 'product'], partitions: ['2026-10-16'], limit: 1 }),
    "SELECT product, price\nFROM demo.daily_prices\nWHERE _PARTITIONDATE IN (DATE '2026-10-16')\nORDER BY _PARTITIONDATE, product\nLIMIT 1;");
  assert.match(queryPlanSql({ fields: [], partitions: [], limit: null }), /^-- Select/);
  assert.doesNotMatch(queryPlanSql(QUERY_LEVELS[0]), /WHERE|LIMIT/);
});
