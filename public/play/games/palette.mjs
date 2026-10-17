import { WORKSHOP_LEVELS, WORKSHOP_TOOLS, createWorkshopSession, compareWorkshopImages, toolUnavailable } from './palette-model.mjs';

export function initPaletteGame() {
  const root = document.getElementById('palette-game');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const q = id => root.querySelector(`#pl-${id}`);
  const game = createWorkshopSession();
  const shortcuts = { turn:'Rotate 90°', mirror:'Flip horizontally', left:'Crop current frame', right:'Crop current frame', small:'16 columns · 4 colors', ink:'2 colors · no dots', diffuse:'2 colors · diffusion', ordered:'2 colors · Bayer' };
  const draw = (id,image) => {
    const canvas = q(id);
    canvas.width = image.width; canvas.height = image.height;
    canvas.getContext('2d').putImageData(new ImageData(image.data,image.width,image.height),0,0);
    canvas.parentElement.style.setProperty('--columns',image.width);
    canvas.parentElement.style.setProperty('--rows',image.height);
  };
  const focusTitle = () => q('title').focus({ preventScroll:true });

  function render(message = '') {
    const state = game.state, { level, image, target, operations, verdict } = state;
    q('level').value = String(state.index);
    q('title').textContent = level.title;
    q('brief').textContent = level.brief;
    q('moves').textContent = `${operations.length} / ${level.budget}`;
    q('best').textContent = state.best[state.index] === undefined ? `Goal: ${level.par} moves` : `Best: ${state.best[state.index]} moves`;
    q('completed').textContent = `${state.cleared.length} / ${state.total} jobs`;
    q('target-size').textContent = `${target.width} × ${target.height} pixels`;
    q('output-size').textContent = `${image.width} × ${image.height} pixels`;
    q('source-size').textContent = `${state.source.width} × ${state.source.height} source pixels`;
    q('target').setAttribute('aria-label', `Target for ${level.title}, ${target.width} by ${target.height} pixels`);
    q('output').setAttribute('aria-label', `Current image after ${operations.length} operations, ${image.width} by ${image.height} pixels`);
    draw('target',target); draw('output',image); draw('source',state.source);
    const comparison = verdict || compareWorkshopImages(image,target);
    draw('difference',comparison.difference);
    q('difference-caption').textContent = comparison.sameSize
      ? `${comparison.matching} / ${comparison.total} exact pixels. Pink pixels differ; dark pixels agree.`
      : `Size mismatch: current ${image.width} × ${image.height}, target ${target.width} × ${target.height}. The map compares coordinates inside the target frame.`;
    const focusedTool = root.querySelector('[data-workshop-tool]:focus');
    root.querySelectorAll('[data-workshop-tool]').forEach(button => {
      const unavailable = toolUnavailable(image,button.dataset.workshopTool);
      button.disabled = Boolean(verdict?.won || !state.remaining || unavailable);
      button.title = unavailable || WORKSHOP_TOOLS[button.dataset.workshopTool].detail;
    });
    q('undo').disabled = operations.length === 0;
    q('submit').disabled = Boolean(verdict?.won);
    q('next').hidden = !verdict?.won || state.index === state.total - 1;
    q('history').replaceChildren(...Array.from({length:level.budget},(_,i) => {
      const slot = document.createElement('li');
      slot.dataset.filled = String(i < operations.length);
      slot.textContent = operations[i] ? `${i + 1}. ${WORKSHOP_TOOLS[operations[i]].name}` : `${i + 1}. Empty`;
      return slot;
    }));
    q('hint').textContent = level.hint;
    q('lesson').textContent = level.lesson;
    const status = q('status');
    status.dataset.outcome = verdict?.won ? 'won' : verdict ? 'lost' : '';
    status.textContent = verdict?.won
      ? `${'★'.repeat(verdict.stars)} Job accepted in ${operations.length} moves. Every pixel matches. ${state.cleared.length} of ${state.total} jobs completed.`
      : verdict ? !verdict.sameSize
        ? `The frame is ${image.width} × ${image.height}; the order needs ${target.width} × ${target.height}. Undo or change the crop and orientation.`
        : `${verdict.matching} / ${verdict.total} pixels match. ${state.remaining ? `${state.remaining} moves remain.` : 'Move budget used: undo a step or start over.'} Open the difference map to inspect the mismatch.`
      : message || `Make the target in ${level.budget} moves or fewer. Every tool changes the current image. Undo is free; there is no timer.`;
    if (focusedTool?.disabled) {
      const nextControl = state.remaining && !verdict?.won ? root.querySelector('[data-workshop-tool]:not(:disabled)') : null;
      (nextControl || q('submit')).focus({ preventScroll:true });
    }
  }

  function load(index) {
    game.select(index);
    q('tools').replaceChildren(...WORKSHOP_LEVELS[index].tools.map(tool => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.workshopTool = tool;
      const icon = document.createElement('span'); icon.textContent = WORKSHOP_TOOLS[tool].icon; icon.setAttribute('aria-hidden','true');
      const label = document.createElement('strong'); label.textContent = WORKSHOP_TOOLS[tool].name;
      const detail = document.createElement('small'); detail.textContent = shortcuts[tool];
      button.append(icon,label,detail);
      button.addEventListener('click',() => {
        if (!game.apply(tool)) return;
        const state = game.state;
        render(`${WORKSHOP_TOOLS[tool].name} applied. ${state.remaining ? `${state.remaining} moves remain.` : 'Move budget used. Check your pixels, or undo to change the recipe.'}`);
      });
      return button;
    }));
    q('hint-panel').open = false;
    render();
  }

  q('level').addEventListener('change',() => { load(Number(q('level').value)); focusTitle(); });
  q('submit').addEventListener('click',() => {
    const result = game.check(); render();
    if (result.won) (q('next').hidden ? q('reset') : q('next')).focus({ preventScroll:true });
  });
  q('undo').addEventListener('click',() => {
    game.undo(); render('Last operation removed. The earlier pixels are restored exactly.');
    if (q('undo').disabled) q('submit').focus({ preventScroll:true });
  });
  q('reset').addEventListener('click',() => { load(game.state.index); focusTitle(); });
  q('next').addEventListener('click',() => {
    if (!game.next()) return;
    load(game.state.index); focusTitle();
  });
  load(0); root.hidden = false;
}
