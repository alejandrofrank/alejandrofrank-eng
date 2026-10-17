import { SWATCHES, PALETTE_LEVELS, renderPalette, evaluatePalette } from './palette-model.mjs';

export function initPaletteGame() {
  const root = document.getElementById('palette-game');
  if (!root) return;
  const q = id => root.querySelector(`#pl-${id}`);
  let levelIndex = 0, selected, attempts, finished;
  function draw(id, frame) {
    const canvas = q(id);
    canvas.getContext('2d').putImageData(new ImageData(frame.data, frame.width, frame.height), 0, 0);
  }
  function sync() {
    root.querySelectorAll('[data-color]').forEach(button => {
      button.setAttribute('aria-pressed', String(selected.has(Number(button.dataset.color))));
      button.disabled = finished;
    });
    q('selected').textContent = `(${selected.size} / 4)`;
    q('submit').disabled = finished || selected.size !== 4;
    q('method').disabled = finished || levelIndex < 2;
    if (selected.size === 4) draw('output', renderPalette(levelIndex, [...selected], q('method').value));
    else q('output').getContext('2d').clearRect(0, 0, 48, 32);
  }
  function start(index) {
    levelIndex = index; selected = new Set([0, 2, 4, 6]); attempts = 0; finished = false;
    const level = PALETTE_LEVELS[index];
    q('level').value = String(index); q('title').textContent = level.title; q('brief').textContent = level.brief;
    q('hint').textContent = level.hint; q('method').value = index < 2 ? level.method : 'pixels';
    q('next').hidden = true; q('history').replaceChildren();
    q('status').textContent = 'Five attempts. Toggle colors to choose a set of four, then test the recipe.';
    q('status').dataset.outcome = '';
    draw('target', renderPalette(index, level.colors, level.method)); sync();
  }
  q('swatches').innerHTML = SWATCHES.map(([name, color], i) => `<button type="button" data-color="${i}" aria-pressed="false" aria-label="${name}, ${color}"><i style="background:${color}" aria-hidden="true"></i>${name}</button>`).join('');
  q('swatches').addEventListener('click', event => {
    const button = event.target.closest('[data-color]'); if (!button || finished) return;
    const value = Number(button.dataset.color);
    if (selected.has(value)) selected.delete(value); else selected.add(value);
    sync();
  });
  q('method').addEventListener('change', sync);
  q('submit').addEventListener('click', () => {
    if (finished || selected.size !== 4) return;
    const colors = [...selected]; const result = evaluatePalette(levelIndex, colors, q('method').value); attempts++;
    const row = document.createElement('li');
    row.innerHTML = colors.map(i => `<i style="background:${SWATCHES[i][1]}" aria-hidden="true"></i>`).join('');
    row.append(document.createTextNode(` ${colors.map(i => SWATCHES[i][0]).join(', ')} · ${result.correctColors}/4 colors · ${q('method').selectedOptions[0].textContent}: ${result.correctMethod ? 'correct' : 'different'} · ${result.matching}/${result.total} pixels match`));
    q('history').prepend(row);
    finished = result.won || attempts === 5;
    q('status').textContent = result.won ? `Recipe recovered in ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}. All ${result.total} pixels reproduce exactly.`
      : finished ? 'Five attempts used. Inspect the feedback or hint, then start over.' : `${result.correctColors}/4 palette colors found. ${result.matching}/${result.total} pixels match. ${5 - attempts} attempts left.`;
    q('status').dataset.outcome = result.won ? 'won' : finished ? 'lost' : '';
    q('next').hidden = !result.won || levelIndex === 2; sync();
    if (finished) (q('next').hidden ? q('reset') : q('next')).focus();
  });
  q('level').addEventListener('change', () => start(Number(q('level').value)));
  q('reset').addEventListener('click', () => start(levelIndex));
  q('next').addEventListener('click', () => { start(levelIndex + 1); q('title').setAttribute('tabindex', '-1'); q('title').focus(); });
  start(0); root.hidden = false;
}
