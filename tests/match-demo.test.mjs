import test from 'node:test';
import assert from 'node:assert/strict';
import { compareNames, keywordBaseline } from '../public/play/catalog-engine/match.mjs';
import { EXAMPLE_PAIRS } from '../public/play/match-demo.mjs';

test('demo exposes both a keyword false accept and a keyword false rejection', () => {
  assert.equal(keywordBaseline(...EXAMPLE_PAIRS.size), true);
  const mismatch = compareNames(...EXAMPLE_PAIRS.size);
  assert.equal(mismatch.decision, 'no');
  assert.equal(mismatch.checks.find(check => check.key === 'size').status, 'conflict');
  assert.equal(keywordBaseline(...EXAMPLE_PAIRS.units), false);
  assert.equal(compareNames(...EXAMPLE_PAIRS.units).decision, 'yes');
});

test('missing and unknown qualifiers remain uncertain', () => {
  assert.equal(compareNames(...EXAMPLE_PAIRS.missing).decision, 'uncertain');
  assert.equal(compareNames('Loma leche entera 1 L', 'Loma leche entera 1 L organic').decision, 'uncertain');
});
