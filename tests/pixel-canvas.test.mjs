import test from 'node:test';
import assert from 'node:assert/strict';
import { createPixelCanvas, SEED } from '../public/play/pixel-canvas.mjs';

test('a drag is one undo step, including repeated passes over a pixel', () => {
  const canvas = createPixelCanvas();
  canvas.beginStroke();
  canvas.paint(0, 2);
  canvas.paint(1, 2);
  canvas.paint(0, 3);
  canvas.endStroke();
  assert.deepEqual(canvas.state().pixels.slice(0, 2), [3, 2]);
  canvas.undo();
  assert.deepEqual(canvas.state().pixels, SEED);
  assert.equal(canvas.state().canUndo, false);
});

test('clear can be undone and an unchanged stroke does not pollute undo', () => {
  const canvas = createPixelCanvas();
  canvas.paint(0, 0);
  assert.equal(canvas.state().canUndo, false);
  canvas.clear();
  assert.equal(canvas.state().painted, 0);
  canvas.clear();
  canvas.undo();
  assert.deepEqual(canvas.state().pixels, SEED);
  assert.equal(canvas.state().canUndo, false);
});

test('out-of-bounds input and external state changes cannot corrupt the canvas', () => {
  const canvas = createPixelCanvas();
  for (const [index, color] of [[-1, 1], [64, 1], [0.5, 1], [0, 4], [0, NaN]]) canvas.paint(index, color);
  const snapshot = canvas.state();
  snapshot.pixels[0] = 99;
  assert.deepEqual(canvas.state().pixels, SEED);
  assert.equal(canvas.state().canUndo, false);
});
