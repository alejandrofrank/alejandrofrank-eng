import { render } from '../image-engine/core.mjs';

export const WORKSHOP_INK = ['#17202b', '#f1eddf'];
export const WORKSHOP_PALETTE = ['#17202b', '#7d9970', '#eca778', '#f1eddf'];
const SOURCE_PALETTE = ['#17202b','#f1eddf','#7d9970','#c36a62','#447d98','#eca778','#69415a','#81c8be','#30353c','#4c5157','#696d71','#86898c','#a3a5a6','#c0c1c0','#d8d7d1','#e4d4b2'];
export const WORKSHOP_TOOLS = {
  turn: { name: 'Turn right', icon: '↻', detail: 'Rotate the current pixels 90° clockwise.', kind: 'geometry' },
  mirror: { name: 'Mirror', icon: '↔', detail: 'Flip left and right in the current frame.', kind: 'geometry' },
  left: { name: 'Keep left half', icon: '◧', detail: 'Discard the right half. Needs at least 32 columns.', kind: 'geometry' },
  right: { name: 'Keep right half', icon: '◨', detail: 'Discard the left half. Needs at least 32 columns.', kind: 'geometry' },
  small: { name: 'Shrink to 16', icon: '▦', detail: 'Area-average to 16 columns, then map to four fixed colors. Detail is lost.', kind: 'renderer' },
  ink: { name: 'Solid ink', icon: '◐', detail: 'Map each pixel to the nearest of two fixed ink colors.', kind: 'renderer' },
  diffuse: { name: 'Spread the error', icon: '⠿', detail: 'Print with two inks using Floyd–Steinberg error diffusion.', kind: 'renderer' },
  ordered: { name: 'Ordered dots', icon: '⠶', detail: 'Print with two inks using a repeating Bayer pattern.', kind: 'renderer' },
};

export const WORKSHOP_LEVELS = [
  { title: 'Turn the signal', brief: 'The marker has the wrong orientation. Match its corners and direction using only turn and mirror.',
    lesson: 'A turn and a mirror do not commute: reversing their order can put the marker in a different corner.',
    hint: 'Mirror the original left-to-right, then turn it clockwise.', scene: 0, width: 32, budget: 3, par: 2,
    tools: ['turn','mirror'], solution: ['mirror','turn'] },
  { title: 'Save half the poster', brief: 'The target is a wide strip cut from the source. Keep the correct half and orient it without changing its pixels.',
    lesson: 'A crop uses the current coordinate frame. Turning first changes which source region “right half” refers to.',
    hint: 'Keep the right half of the original, then turn it clockwise.', scene: 1, width: 32, budget: 3, par: 2,
    tools: ['turn','mirror','left','right'], solution: ['right','turn'] },
  { title: 'Print before the cut', brief: 'Recover the right-hand strip from an already printed poster. Its dotted shading must match, pixel for pixel.',
    lesson: 'Error diffusion carries error across neighboring pixels. Cropping before printing changes the error arriving at the new edge.',
    hint: 'Spread the error on the whole poster first. Then keep its right half.', scene: 2, width: 32, budget: 3, par: 2,
    tools: ['left','right','ink','diffuse','ordered'], solution: ['diffuse','right'] },
  { title: 'The small print', brief: 'Make the 16 × 16 print, then orient it. The target uses a regular dot pattern, not random noise.',
    lesson: 'Resampling and quantization throw away different information. Shrinking an already printed pattern does not recreate printing at the smaller grid.',
    hint: 'Shrink to 16, apply Ordered dots, then turn right. The dots turn with the finished print.', scene: 3, width: 32, budget: 4, par: 3,
    tools: ['turn','mirror','small','ink','diffuse','ordered'], solution: ['small','ordered','turn'] },
  { title: 'Repair the thumbnail', brief: 'Recover a small, mirrored print from this two-panel source. Choose a region, preserve the intended shading and fit the result into six moves.',
    lesson: 'The recipe must preserve both spatial intent and processing order. Geometry belongs to this puzzle; sampling and two-ink printing run the repository renderer.',
    hint: 'Keep the right half → turn right → shrink to 16 → spread the error → mirror.', scene: 4, width: 64, budget: 6, par: 5,
    tools: ['turn','mirror','left','right','small','ink','diffuse','ordered'], solution: ['right','turn','small','diffuse','mirror'] },
];

const copy = image => ({ width: image.width, height: image.height, data: new Uint8ClampedArray(image.data) });
const settings = (columns, palette, method = 'pixels') => ({ columns, palette, mode: method === 'pixels' ? 'pixels' : 'dither', algorithm: method === 'pixels' ? 'floyd' : method, strength: 1, noise: 0, seed: 42 });

export function workshopSource(levelIndex) {
  const level = WORKSHOP_LEVELS[levelIndex];
  if (!level || !Number.isInteger(levelIndex)) throw new RangeError('Unknown workshop job');
  const width = level.width, height = 32, data = new Uint8ClampedArray(width * height * 4);
  // Original, asymmetric posters: a directional signal over shaded terrain.
  // Their small marks make geometry and pixel losses inspectable at this scale.
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const local = x % 32, panel = Math.floor(x / 32), scene = level.scene;
    const t = .1 + .75 * (local + y * .7) / 53;
    let color = [42 + 185 * t, 55 + 155 * t, 65 + 114 * t];
    if (y > 23 - 5 * Math.sin(local / 6 + scene + panel)) color = [50 + local * 2, 86 + y, 69 + local];
    if ((local - 23) ** 2 + (y - 8) ** 2 <= 15) color = [241, 237, 223];
    if ((local >= 5 && local <= 8 && y >= 9 && y <= 22) || (y >= 9 && y <= 12 && local >= 5 && local <= 18) || (local >= 15 && local <= 21 && Math.abs(y - 10) <= local - 15)) color = panel ? [68,125,152] : [195,106,98];
    if (local >= 3 && local <= 5 && y >= 25 && y <= 27) color = [23,32,43];
    if (local === 12 && y >= 17 && y <= 24) color = [241,237,223];
    const offset = (y * width + x) * 4;
    data.set([...color,255],offset);
  }
  return copy(render({ width, height, data }, settings(width, SOURCE_PALETTE)));
}

export function toolUnavailable(image, tool) {
  if (!WORKSHOP_TOOLS[tool]) return 'Unknown tool.';
  if (['left','right'].includes(tool) && image.width < 32) return 'The crop needs at least 32 columns.';
  if (tool === 'small' && image.width <= 16) return 'This image already has 16 columns or fewer.';
  if (WORKSHOP_TOOLS[tool].kind === 'renderer' && image.width < 16) return 'The renderer needs at least 16 columns. Turn the image or undo.';
  return '';
}

export function applyWorkshopTool(input, tool) {
  const unavailable = toolUnavailable(input, tool);
  if (unavailable) throw new RangeError(unavailable);
  if (WORKSHOP_TOOLS[tool].kind === 'renderer') {
    const method = tool === 'diffuse' ? 'floyd' : tool === 'ordered' ? 'bayer' : 'pixels';
    return copy(render(input, settings(tool === 'small' ? 16 : input.width, tool === 'small' ? WORKSHOP_PALETTE : WORKSHOP_INK, method)));
  }
  const width = tool === 'turn' ? input.height : ['left','right'].includes(tool) ? input.width / 2 : input.width;
  const height = tool === 'turn' ? input.width : input.height;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const sx = tool === 'turn' ? y : tool === 'mirror' ? input.width - 1 - x : tool === 'right' ? x + width : x;
    const sy = tool === 'turn' ? input.height - 1 - x : y;
    const from = (sy * input.width + sx) * 4;
    data.set(input.data.subarray(from, from + 4), (y * width + x) * 4);
  }
  return { width, height, data };
}

export function workshopRecipe(index, operations) {
  const level = WORKSHOP_LEVELS[index];
  if (!level) throw new RangeError('Unknown workshop job');
  if (!Array.isArray(operations) || operations.some(tool => !level.tools.includes(tool))) throw new TypeError('Tool unavailable in this job');
  let image = workshopSource(index);
  for (const tool of operations) image = applyWorkshopTool(image, tool);
  return image;
}

export function compareWorkshopImages(output, target) {
  const sameSize = output.width === target.width && output.height === target.height;
  let matching = 0;
  const difference = { width: target.width, height: target.height, data: new Uint8ClampedArray(target.data.length) };
  for (let y = 0; y < target.height; y++) for (let x = 0; x < target.width; x++) {
    const p = (y * target.width + x) * 4, q = (y * output.width + x) * 4;
    const equal = x < output.width && y < output.height && target.data.subarray(p,p + 4).every((value,k) => value === output.data[q+k]);
    if (sameSize && equal) matching++;
    difference.data.set(equal ? [43,60,49,255] : [242,157,168,255],p);
  }
  return { sameSize, matching, total: target.width * target.height, difference, exact: sameSize && matching === target.width * target.height };
}

export function createWorkshopSession() {
  let index = 0, operations = [], frames, target, verdict = null;
  const best = new Map();
  function load(next) {
    if (!Number.isInteger(next) || !WORKSHOP_LEVELS[next]) throw new RangeError('Unknown workshop job');
    index = next; operations = []; frames = [workshopSource(index)];
    target = workshopRecipe(index, WORKSHOP_LEVELS[index].solution); verdict = null;
  }
  load(0);
  return {
    get state() {
      return { index, total: WORKSHOP_LEVELS.length, level: structuredClone(WORKSHOP_LEVELS[index]), operations: [...operations],
        source: copy(frames[0]), image: copy(frames.at(-1)), target: copy(target),
        verdict: verdict ? structuredClone(verdict) : null, best: Object.fromEntries(best), cleared: [...best.keys()],
        remaining: WORKSHOP_LEVELS[index].budget - operations.length };
    },
    apply(tool) {
      const level = WORKSHOP_LEVELS[index];
      if (verdict?.won || operations.length >= level.budget || !level.tools.includes(tool) || toolUnavailable(frames.at(-1),tool)) return false;
      frames.push(applyWorkshopTool(frames.at(-1),tool)); operations.push(tool); verdict = null; return true;
    },
    undo() {
      if (!operations.length) return false;
      operations.pop(); frames.pop(); verdict = null; return true;
    },
    check() {
      const comparison = compareWorkshopImages(frames.at(-1),target);
      const level = WORKSHOP_LEVELS[index];
      const won = comparison.exact && operations.length <= level.budget;
      const stars = won ? operations.length <= level.par ? 3 : operations.length <= level.par + 1 ? 2 : 1 : 0;
      verdict = { ...comparison, won, moves: operations.length, stars };
      if (won && (!best.has(index) || operations.length < best.get(index))) best.set(index,operations.length);
      return structuredClone(verdict);
    },
    next() { if (!verdict?.won || index === WORKSHOP_LEVELS.length - 1) return false; load(index + 1); return true; },
    select: load,
    reset() { load(index); },
    restart() { best.clear(); load(0); },
  };
}
