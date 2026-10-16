import { render, PALETTES } from './image-engine/core.mjs';
import { createSample } from './image-engine/samples.mjs';

export const DEMO_PALETTES = {
  gray: ['#161616', '#606060', '#aaaaaa', '#f4f4f4'],
  ink: PALETTES.ink,
  moss: PALETTES.moss,
};

// The two runs differ only in representation. Grid, source and adjustments agree.
export function compareImage({ sample = 'still-life', columns = 64, palette = 'gray' } = {}) {
  if (![16, 32, 64, 128].includes(columns) || !Object.hasOwn(DEMO_PALETTES, palette)) throw new Error('Choose a supported grid and palette.');
  const source = createSample(sample);
  const settings = { columns, palette: DEMO_PALETTES[palette], noise: 0, strength: 1, algorithm: 'floyd' };
  return {
    source,
    plain: render(source, { ...settings, mode: 'pixels' }),
    dithered: render(source, { ...settings, mode: 'dither' }),
  };
}

export function identicalPixels(a, b) {
  return a.width === b.width && a.height === b.height && a.data.length === b.data.length && a.data.every((value, i) => value === b.data[i]);
}
