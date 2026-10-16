import test from 'node:test';
import assert from 'node:assert/strict';
import { compareImage, identicalPixels, DEMO_PALETTES } from '../public/play/image-comparison.mjs';

test('comparison holds grid and palette constant while the method changes pixels', () => {
  const { plain, dithered } = compareImage({ sample: 'still-life', columns: 32, palette: 'gray' });
  assert.deepEqual([plain.width, plain.height], [32, 24]);
  assert.deepEqual([dithered.width, dithered.height], [32, 24]);
  assert.deepEqual(plain.settings.palette, dithered.settings.palette);
  assert.equal(identicalPixels(plain, dithered), false);
  const allowed = new Set(DEMO_PALETTES.gray);
  for (const result of [plain, dithered]) {
    assert.equal(result.counts.reduce((sum, count) => sum + count, 0), 768);
    for (let p = 0; p < result.data.length; p += 4) {
      const hex = '#' + [...result.data.slice(p, p + 3)].map(value => value.toString(16).padStart(2, '0')).join('');
      assert.ok(allowed.has(hex));
    }
  }
});

test('both real renderer outputs repeat exactly across the bundled samples', () => {
  for (const sample of ['terrain', 'still-life', 'signal']) {
    const first = compareImage({ sample, columns: 16, palette: 'ink' });
    const second = compareImage({ sample, columns: 16, palette: 'ink' });
    assert.ok(identicalPixels(first.plain, second.plain));
    assert.ok(identicalPixels(first.dithered, second.dithered));
  }
});

test('unsupported controls fail explicitly instead of changing the comparison silently', () => {
  assert.throws(() => compareImage({ columns: 0 }));
  assert.throws(() => compareImage({ palette: 'unknown' }));
  assert.throws(() => compareImage({ sample: 'unknown' }));
});
