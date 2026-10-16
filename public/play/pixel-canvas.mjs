export const PALETTES = {
  orchard: ['#182524', '#e6a16e', '#9bc994', '#f5eccd'],
  dusk: ['#211c35', '#ba95ec', '#ee9ead', '#fff0cc'],
  pocket: ['#182d29', '#416849', '#8ca970', '#dce5ad'],
};

export const SEED = [
  '00011000', '00111100', '01133110', '11311131',
  '11111111', '00033000', '00333300', '00000000',
].join('').split('').map(Number);

export function createPixelCanvas() {
  let pixels = [...SEED];
  let before = null;
  const history = [];
  const same = (a, b) => a.every((value, i) => value === b[i]);
  function endStroke() {
    if (before && !same(before, pixels)) {
      history.push(before);
      if (history.length > 100) history.shift();
    }
    before = null;
  }
  return {
    state: () => ({ pixels: [...pixels], canUndo: history.length > 0, painted: pixels.filter(value => value !== 0).length }),
    beginStroke() { if (!before) before = [...pixels]; },
    paint(index, color) {
      if (!Number.isInteger(index) || index < 0 || index >= 64 || !Number.isInteger(color) || color < 0 || color > 3) return;
      const standalone = before === null;
      if (standalone) before = [...pixels];
      pixels[index] = color;
      if (standalone) endStroke();
    },
    endStroke,
    undo() { endStroke(); if (history.length) pixels = history.pop(); },
    clear() { endStroke(); before = [...pixels]; pixels.fill(0); endStroke(); },
  };
}
