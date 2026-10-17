import { render } from '../image-engine/core.mjs';

export const SWATCHES = [
  ['Ink', '#17202b'], ['Cream', '#f1eddf'], ['Moss', '#7d9970'], ['Clay', '#c36a62'],
  ['Sea', '#447d98'], ['Peach', '#eca778'], ['Plum', '#69415a'], ['Mist', '#81c8be'],
];
export const PALETTE_LEVELS = [
  { title: 'Four colors, one landscape', colors: [0, 1, 2, 3], method: 'pixels', scene: 0,
    brief: 'Recover the four-color palette. Compare the target with your render, then submit a set of four colors.', hint: 'Ink, Cream, Moss and Clay. Color order does not matter to this renderer.' },
  { title: 'Find the missing shades', colors: [0, 1, 4, 5], method: 'floyd', scene: 1,
    brief: 'The target spreads color error between neighboring pixels. Recover its four colors; error diffusion is already selected.', hint: 'Ink, Cream, Sea and Peach. A dotted shade can be a mixture of existing colors.' },
  { title: 'Recover the recipe', colors: [0, 1, 6, 7], method: 'bayer', scene: 2,
    brief: 'Recover the four colors and the rendering method. A correct palette alone will not reproduce the pattern.', hint: 'Ink, Cream, Plum and Mist, with Ordered dots. Look for the repeating texture.' },
];

export function paletteSource(scene = 0) {
  const width = 48, height = 32, data = new Uint8ClampedArray(width * height * 4);
  const ramps = [[31, 55, 54, 230, 196, 153], [37, 55, 83, 238, 183, 125], [42, 39, 66, 181, 204, 187]];
  const c = ramps[scene];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let t = .12 + .78 * (x + y) / (width + height - 2);
    if (y > 21 - 7 * Math.sin(x / 10 + scene)) t *= .42;
    if ((x - 34) ** 2 + (y - 9) ** 2 < 30) t = .98;
    const p = (y * width + x) * 4;
    for (let k = 0; k < 3; k++) data[p + k] = c[k] + (c[k + 3] - c[k]) * t;
    data[p + 3] = 255;
  }
  return { width, height, data };
}

export function renderPalette(levelIndex, colors, method) {
  if (!Number.isInteger(levelIndex) || !PALETTE_LEVELS[levelIndex]) throw new Error('Unknown palette level');
  if (!Array.isArray(colors) || colors.length !== 4 || new Set(colors).size !== 4 || colors.some(i => !Number.isInteger(i) || !SWATCHES[i])) throw new Error('Choose four different colors');
  if (!['pixels', 'floyd', 'bayer'].includes(method)) throw new Error('Unknown rendering method');
  return render(paletteSource(PALETTE_LEVELS[levelIndex].scene), {
    columns: 48, palette: [...colors].sort((a, b) => a - b).map(i => SWATCHES[i][1]),
    mode: method === 'pixels' ? 'pixels' : 'dither', algorithm: method === 'pixels' ? 'floyd' : method,
    strength: 1, noise: 0, seed: 42,
  });
}

export function evaluatePalette(levelIndex, colors, method) {
  const level = PALETTE_LEVELS[levelIndex];
  if (!level) throw new Error('Unknown palette level');
  const target = renderPalette(levelIndex, level.colors, level.method);
  const output = renderPalette(levelIndex, colors, method);
  let matching = 0;
  for (let p = 0; p < target.data.length; p += 4) {
    if (target.data[p] === output.data[p] && target.data[p + 1] === output.data[p + 1] && target.data[p + 2] === output.data[p + 2]) matching++;
  }
  const total = target.width * target.height;
  return { target, output, matching, total, correctColors: colors.filter(i => level.colors.includes(i)).length,
    correctMethod: method === level.method, won: matching === total && method === level.method && colors.every(i => level.colors.includes(i)) };
}
