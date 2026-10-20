import { createAimRound, ROUND_SECONDS, BURST_SECONDS, STAGES } from './aim-engine.mjs';

export function initAimRange(root = document.querySelector('[data-aim-range]'), options = {}) {
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const doc = root.ownerDocument, win = doc.defaultView;
  const find = selector => root.querySelector(selector);
  const board = find('[data-range-board]'), grid = find('[data-grid]'), scroll = find('[data-grid-scroll]');
  const layer = find('[data-targets]'), start = find('[data-start]');
  const pauseButton = find('[data-pause]'), stop = find('[data-stop]'), select = find('#aim-input');
  const days = [...grid.querySelectorAll('.range-day')];
  const cells = days.map(day => ({ column: +day.dataset.column, row: +day.dataset.row }));
  const dayByPosition = new Map(days.map(day => [`${day.dataset.column}:${day.dataset.row}`, day]));
  const engine = createAimRound({ ...options, columns: +grid.dataset.columns, cells });
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  const frames = options.frames || { request: callback => win.requestAnimationFrame(callback), cancel: id => win.cancelAnimationFrame(id) };
  const nodes = new Map(), marks = [], listeners = [];
  let frame = null, previousTime = null, lastStage = -1, lastStatus = '', painted = new Set(), blasted = new Set();
  const on = (target, type, callback) => { target.addEventListener(type, callback); listeners.push(() => target.removeEventListener(type, callback)); };
  const say = text => { find('[data-announcement]').textContent = text; };
  const inPlay = status => status === 'starting' || status === 'running';
  function clearFrame() { if (frame !== null) frames.cancel(frame); frame = null; previousTime = null; }
  function visibleWindow() {
    const rect = scroll.getBoundingClientRect();
    const visible = days.filter(day => {
      const cell = day.getBoundingClientRect();
      return cell.width > 0 && cell.left >= rect.left - .5 && cell.right <= rect.right + .5;
    }).map(day => +day.dataset.column);
    return visible.length ? { first: Math.min(...visible), last: Math.max(...visible) } : { first: 0, last: -1 };
  }
  function saveBest(state) {
    try {
      // Square-target scores are separate from the previous floating-target game.
      const key = 'portfolio-grid-aim-best-v2-' + state.mode;
      const best = Math.max(Number(win.localStorage.getItem(key)) || 0, state.score);
      win.localStorage.setItem(key, String(best)); return best;
    } catch { return state.score; }
  }
  function clearMarks() { for (const mark of marks) mark.node.remove(); marks.length = 0; }
  function render() {
    const state = engine.snapshot(), active = state.status === 'running', busy = inPlay(state.status), inRound = busy || state.status === 'paused';
    root.dataset.status = state.status;
    grid.dataset.boot = state.boot;
    find('[data-stat=time]').textContent = state.remaining.toFixed(1);
    find('[data-stat=score]').textContent = String(state.score).padStart(5, '0');
    find('[data-stat=accuracy]').textContent = state.accuracy === null ? '—' : state.accuracy + '%';
    find('[data-stat=combo]').textContent = '×' + state.combo;
    find('[data-progress]').style.setProperty('--remaining', state.remaining / ROUND_SECONDS);
    find('[data-progress-track]').hidden = !inRound;
    find('[data-metrics]').hidden = state.status === 'ready';
    find('[data-stage]').hidden = !inRound;
    find('[data-stage]').textContent = state.status === 'starting' ? 'GET READY' : state.status === 'paused' ? 'PAUSED' : STAGES[state.stage].name;
    find('[data-options]').hidden = inRound;
    start.hidden = busy; layer.hidden = !active;
    pauseButton.hidden = !busy; stop.hidden = state.status === 'ready';
    const glowing = new Set(), urgent = new Set();
    for (const [id, node] of nodes) {
      if (!state.targets.some(target => target.id === id)) { node.remove(); nodes.delete(id); }
    }
    for (const target of state.targets) {
      let node = nodes.get(target.id);
      if (!node) {
        node = doc.createElement('button'); node.type = 'button'; node.className = 'aim-target';
        node.dataset.targetId = String(target.id); node.dataset.slot = String(target.slot);
        node.setAttribute('aria-label', 'Shoot group ' + (target.slot + 1) + ': four glowing squares');
        const key = doc.createElement('span'); key.className = 'target-key'; key.setAttribute('aria-hidden', 'true');
        key.textContent = state.mode === 'keyboard' ? String(target.slot + 1) : '';
        node.append(key); layer.append(node); nodes.set(target.id, node);
      }
      node.style.gridColumn = `${target.column + 1} / span 2`;
      node.style.gridRow = `${target.row + 1} / span 2`;
      node.style.setProperty('--life', Math.max(0, 1 - target.age / target.lifetime));
      if (active) for (let column = target.column; column <= target.column + 1; column++) {
        for (let row = target.row; row <= target.row + 1; row++) {
          const cell = dayByPosition.get(`${column}:${row}`);
          glowing.add(cell); if (target.age / target.lifetime > .7) urgent.add(cell);
        }
      }
    }
    for (const day of new Set([...painted, ...glowing])) {
      day.classList.toggle('is-target', glowing.has(day)); day.classList.toggle('is-urgent', urgent.has(day));
    }
    painted = glowing;
    const blast = new Map();
    if (active) for (const burst of state.bursts) {
      // A thin ring travels from the clump's center, leaving dark cells behind.
      // Cell spacing is equal on both axes, so radial distance stays circular.
      const progress = burst.age / BURST_SECONDS;
      const radius = reduced.matches ? 2.6 : Math.SQRT1_2 + progress * 3;
      for (let column = burst.column - 4; column <= burst.column + 5; column++) {
        if (column < state.window.first || column > state.window.last) continue;
        for (let row = Math.max(0, burst.row - 4); row <= Math.min(6, burst.row + 5); row++) {
          const cell = dayByPosition.get(`${column}:${row}`);
          if (!cell || glowing.has(cell)) continue;
          const distance = Math.hypot(column - burst.column - .5, row - burst.row - .5);
          const strength = Math.max(0, 1 - Math.abs(distance - radius) / .65)
            * (reduced.matches ? .5 : Math.sqrt(1 - progress));
          if (strength <= 0) continue;
          blast.set(cell, Math.max(blast.get(cell) || 0, strength));
        }
      }
    }
    for (const day of new Set([...blasted, ...blast.keys()])) {
      day.classList.toggle('is-burst', blast.has(day));
      if (blast.has(day)) day.style.setProperty('--burst', blast.get(day));
      else day.style.removeProperty('--burst');
    }
    blasted = new Set(blast.keys());
    if (active && state.stage !== lastStage) {
      say(state.mode === 'keyboard' ? 'Press 1, 2 or 3 to hit the matching group.' : STAGES[state.stage].name + '. Shoot the glowing groups of four squares.');
      lastStage = state.stage;
    }
    if (state.status !== lastStatus) {
      const instructions = find('[data-instructions]'), result = find('[data-result]'); result.hidden = state.status !== 'finished';
      if (state.status === 'starting') {
        instructions.textContent = 'The grid lights up, then goes dark. Get ready for the glowing groups.';
        say('Get ready. The round begins after the grid lights up and goes dark.');
      } else if (active) {
        instructions.textContent = state.mode === 'keyboard' ? '1 / 2 / 3 to hit groups · Esc to pause' : 'Hit a glowing 2 × 2 group · misses −25 · Esc to pause';
      } else if (state.status === 'paused') {
        start.textContent = '▶ Resume'; instructions.textContent = 'Paused. The clock is frozen. Resume or exit to the graph.';
        say('Game paused. Resume or exit.');
      } else if (state.status === 'finished') {
        const best = saveBest(state); start.textContent = '▶ Play again';
        instructions.textContent = 'Round complete. The contribution colors are restored.';
        result.textContent = `${state.mode === 'keyboard' ? 'Keyboard practice · ' : ''}${state.score.toLocaleString()} points · ${state.hits} hits · ${state.accuracy ?? 0}% accuracy · ${state.escaped} escaped · best streak ${state.bestCombo}${state.reaction === null ? '' : ' · ' + state.reaction + ' ms average to hit'}. Personal best: ${best.toLocaleString()}.`;
        say(result.textContent);
      } else if (state.status === 'ready') {
        start.textContent = '▶ Play'; instructions.textContent = 'Play a 30-second round on the squares. Hit the glowing groups of four.';
      }
      lastStatus = state.status;
    }
    return state;
  }
  function tick(time) {
    frame = null;
    const delta = previousTime === null ? 0 : Math.max(0, (time - previousTime) / 1000); previousTime = time;
    engine.step(delta);
    for (let index = marks.length - 1; index >= 0; index--) {
      marks[index].age += delta;
      if (marks[index].age > .4) { marks[index].node.remove(); marks.splice(index, 1); }
    }
    if (inPlay(render().status)) frame = frames.request(tick);
    else { clearFrame(); clearMarks(); start.focus({ preventScroll: true }); }
  }
  function run() {
    clearFrame();
    const setup = { mode: select.value, skipIntro: reduced.matches, window: visibleWindow() };
    if (engine.snapshot().status === 'paused') engine.resume(setup);
    else { engine.start(setup); lastStage = -1; clearMarks(); }
    const state = render();
    if (!inPlay(state.status)) { say('Scroll to a section with two complete weeks, then press Play.'); return; }
    doc.querySelectorAll('.lobby-panel[open]').forEach(panel => { panel.open = false; });
    board.focus({ preventScroll: true }); frame = frames.request(tick);
  }
  function pause(focus = false) {
    if (!inPlay(engine.snapshot().status)) return;
    engine.pause(); clearFrame(); clearMarks(); render();
    if (focus) start.focus({ preventScroll: true });
  }
  function exit() { clearFrame(); clearMarks(); engine.reset(); lastStage = -1; render(); start.focus({ preventScroll: true }); say('Game closed. The original contribution graph is restored.'); }
  function shoot(id, x, y) {
    const shot = engine.shoot(id); if (!shot) return;
    const mark = doc.createElement('span'); mark.className = 'shot-mark' + (shot.hit ? '' : ' miss');
    mark.textContent = shot.hit ? '+' + shot.points : '−25';
    mark.style.left = ((shot.hit ? shot.x : x) * 100) + '%'; mark.style.top = ((shot.hit ? shot.y : y) * 100) + '%';
    find('[data-feedback]').append(mark); marks.push({ node: mark, age: 0 }); render();
  }
  on(start, 'click', run); on(pauseButton, 'click', () => pause(true)); on(stop, 'click', exit);
  on(grid, 'pointerdown', event => {
    if (engine.snapshot().status !== 'running' || !event.isPrimary || event.button !== 0) return;
    const target = event.target.closest('[data-target-id]'), rect = grid.getBoundingClientRect();
    event.preventDefault();
    shoot(target ? Number(target.dataset.targetId) : undefined, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  });
  on(grid, 'click', event => {
    if (event.detail !== 0) return;
    const target = event.target.closest('[data-target-id]');
    if (target) { shoot(Number(target.dataset.targetId)); board.focus({ preventScroll: true }); }
  });
  on(doc, 'keydown', event => {
    if (event.key === 'Escape') {
      const openPanel = doc.querySelector('.lobby-panel[open]');
      if (openPanel) { openPanel.open = false; openPanel.querySelector('summary').focus(); event.preventDefault(); return; }
      if (inPlay(engine.snapshot().status)) { event.preventDefault(); pause(true); }
      else if (engine.snapshot().status === 'paused' && root.contains(doc.activeElement)) { event.preventDefault(); exit(); }
    }
    const state = engine.snapshot();
    if (state.status === 'running' && state.mode === 'keyboard' && root.contains(doc.activeElement) && !event.repeat && /^[123]$/.test(event.key)) {
      event.preventDefault(); const target = state.targets.find(item => item.slot === Number(event.key) - 1); if (target) shoot(target.id);
    }
  });
  // Show the latest weeks on narrow screens. Play only uses fully visible cells.
  scroll.scrollLeft = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
  on(scroll, 'scroll', () => pause());
  on(doc, 'visibilitychange', () => { if (doc.hidden) pause(); });
  for (const event of ['blur', 'pagehide', 'resize']) on(win, event, () => pause());
  on(reduced, 'change', () => pause());
  doc.querySelectorAll('.lobby-panel').forEach(panel => on(panel, 'toggle', () => { if (panel.open) pause(); }));
  on(doc, 'focusin', event => { if (!root.contains(event.target)) pause(); });
  function openSection() {
    if (win.location.hash === '#projects') { win.location.replace('/play'); return; }
    const section = ['#about', '#contact'].includes(win.location.hash) ? doc.querySelector(win.location.hash) : null;
    if (section) { section.open = true; pause(); }
  }
  on(win, 'hashchange', openSection); openSection(); render();
  start.disabled = !engine.snapshot().canPlay;
  if (start.disabled) find('[data-instructions]').textContent = 'Not enough adjacent days for a four-square target. The activity graph is still available.';
  return { snapshot: engine.snapshot, destroy() { clearFrame(); clearMarks(); listeners.forEach(remove => remove()); engine.reset(); render(); nodes.forEach(node => node.remove()); delete root.dataset.initialized; } };
}
