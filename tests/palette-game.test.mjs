import test from 'node:test';
import assert from 'node:assert/strict';
import { PALETTE_LEVELS, SWATCHES, evaluatePalette, renderPalette } from '../public/play/games/palette-model.mjs';

test('each palette puzzle has a reproducible solution using the real renderer', () => {
  for (let i = 0; i < PALETTE_LEVELS.length; i++) {
    const level = PALETTE_LEVELS[i];
    const result = evaluatePalette(i, level.colors, level.method);
    assert.equal(result.won, true); assert.equal(result.matching, 1536);
    assert.deepEqual(result.target.data, renderPalette(i, [...level.colors].reverse(), level.method).data);
    const allowed = new Set(level.colors.map(n => SWATCHES[n][1].toLowerCase()));
    for (let p = 0; p < result.output.data.length; p += 4) {
      const hex = '#' + [...result.output.data.slice(p, p + 3)].map(n => n.toString(16).padStart(2, '0')).join('');
      assert.ok(allowed.has(hex));
    }
  }
});
test('incorrect colors and incorrect diffusion cannot claim an exact recovery', () => {
  const wrong = evaluatePalette(0, [0, 2, 4, 6], 'pixels');
  assert.equal(wrong.won, false); assert.equal(wrong.correctColors, 2); assert.ok(wrong.matching < wrong.total);
  const method = evaluatePalette(2, PALETTE_LEVELS[2].colors, 'floyd');
  assert.equal(method.won, false); assert.equal(method.correctMethod, false); assert.ok(method.matching < method.total);
  assert.throws(() => renderPalette(0, [0, 0, 1, 2], 'pixels'));
});
