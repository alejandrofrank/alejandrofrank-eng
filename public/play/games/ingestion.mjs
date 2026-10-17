import { FACTORY_LEVELS, TOOL_DEFS, DIRECTIONS, WIDTH, HEIGHT, cellName, cloneBoard, fixedKind, placeTile, createRoutingFactory } from './ingestion-board.mjs';

const shapes = {
  belt: '<path d="M5 5h14v14H5zM8 9l4-4 4 4M8 15l4-4 4 4M8 21l4-4 4 4"/>',
  check: '<path d="M5 21V9h7V3m0 6h7v12M9 6l3-3 3 3M16 18l3 3 3-3"/><path d="m3 15 2 2 4-4"/>',
  read: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v13c0 4 16 4 16 0V5M4 11c0 4 16 4 16 0"/>',
  latest: '<path d="M5 3v8l5 4m9-12v8l-5 4m-2 0v6"/><circle cx="12" cy="9" r="4"/><path d="M12 6v3h2"/>',
  overwrite: '<path d="M4 5h7v7m9-7h-5v7M7 8l4 4 4-4M11 12v8m-4-3 4 4 4-4"/>',
  receipt: '<path d="M6 9V3h12v6M6 16H3V9h18v7h-3M6 13h12v8H6zM9 16h6m-6 3h4"/>',
  rotate: '<path d="M20 9a8 8 0 1 0 0 7M20 3v6h-6"/>',
  erase: '<path d="m3 14 10-11 8 8-10 10H8zM8 9l8 8M11 21h10"/>',
  source: '<path d="M3 9h18v12H3zM8 3h8v9m-7-3 3 3 3-3"/>',
  output: '<path d="M3 9h18v12H3zM8 14l3 3 6-6M8 3h8"/>',
  returns: '<path d="M3 9h18v12H3zM8 4h8a3 3 0 0 1 0 6M8 1 5 4l3 3"/>',
  wall: '<path d="M3 4h18v16H3zM3 10h18M3 15h18M8 4v6m8 0v5m-8 0v5"/>',
};
const icon = (kind, className = '') => `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[kind] || ''}</svg>`;
const arrow = (dir, className = 'pf-exit') => `<svg class="${className}" style="transform:rotate(${dir * 90}deg)" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 17V3m-5 5 5-5 5 5"/></svg>`;
const fixedLabels = { source: 'IN', output: 'OUT', returns: 'RETURNS', wall: 'CLOSED' };

export function initIngestionGame() {
  const root = document.getElementById('ingestion-game');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const panel = root.closest('[data-station-panel]'), q = id => root.querySelector(`#pf-${id}`);
  let levelIndex = 0, board = [], history = [], factory, running = false, timer = null, tool = 'read', direction = 1, focusedCell = 9;
  const cells = [], toolButtons = new Map();
  function stop() { clearTimeout(timer); timer = null; running = false; }
  function chooseTool(kind) {
    tool = kind;
    toolButtons.forEach((button, value) => button.setAttribute('aria-pressed', String(value === kind)));
    q('tool-help').textContent = kind === 'rotate' ? 'Rotate: click a placed tile to turn its outgoing arrow clockwise. The gate’s duplicate exit always turns right.'
      : kind === 'erase' ? 'Erase: click a placed conveyor or machine to return it to your inventory.'
      : `${TOOL_DEFS[kind].name}: ${TOOL_DEFS[kind].help} Choose a floor tile to place it.`;
  }
  for (const kind of [...Object.keys(TOOL_DEFS), 'rotate', 'erase']) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.tool = kind;
    button.setAttribute('aria-label', kind === 'rotate' ? 'Rotate tile' : kind === 'erase' ? 'Erase tile' : `Place ${TOOL_DEFS[kind].name}`);
    button.innerHTML = `${icon(kind)}<span>${TOOL_DEFS[kind]?.short || (kind === 'rotate' ? 'Rotate' : 'Erase')}</span><small></small>`;
    button.addEventListener('click', () => chooseTool(kind)); toolButtons.set(kind, button); q('tools').append(button);
  }
  function describeCell(index) {
    const level = FACTORY_LEVELS[levelIndex], fixed = fixedKind(level, index), value = board[index];
    return `${cellName(index)} · ${fixed ? fixedLabels[fixed] : value ? `${TOOL_DEFS[value.kind].name} → ${DIRECTIONS[value.dir]}${value.kind === 'check' ? `; duplicate exit ${DIRECTIONS[(value.dir + 1) % 4]}` : ''}` : 'empty floor'}`;
  }
  function focusCell(index) {
    focusedCell = index; cells.forEach((button, at) => { button.tabIndex = at === index ? 0 : -1; });
    cells[index].focus({ preventScroll: true }); q('cell-info').textContent = describeCell(index);
  }
  function drawFloor() {
    const level = FACTORY_LEVELS[levelIndex]; cells.length = 0;
    const rows = [];
    for (let y = 0; y < HEIGHT; y++) {
      const row = document.createElement('div'); row.className = 'pf-board-row'; row.setAttribute('role', 'row');
      for (let x = 0; x < WIDTH; x++) {
        const index = y * WIDTH + x, value = board[index], fixed = fixedKind(level, index), kind = fixed || value?.kind || 'empty';
        const button = document.createElement('button'); button.type = 'button'; button.id = `pf-cell-${cellName(index)}`; button.dataset.cell = String(index); button.dataset.kind = kind;
        button.setAttribute('role', 'gridcell'); button.setAttribute('aria-rowindex', String(y + 1)); button.setAttribute('aria-colindex', String(x + 1));
        button.setAttribute('aria-label', `${describeCell(index)}${fixed ? '; fixed tile' : '; click to build'}`);
        button.tabIndex = index === focusedCell ? 0 : -1;
        button.innerHTML = `<span class="pf-cell-name">${cellName(index)}</span>${icon(kind, 'pf-cell-icon')}<span class="pf-cell-label">${fixedLabels[kind] || TOOL_DEFS[kind]?.short || ''}</span>${value ? arrow(value.dir) : kind === 'source' ? arrow(1) : ''}${kind === 'check' ? arrow((value.dir + 1) % 4, 'pf-branch') : ''}`;
        if (kind === 'belt') button.querySelector('.pf-cell-icon').style.transform = `rotate(${value.dir * 90}deg)`;
        button.addEventListener('focus', () => { focusedCell = index; q('cell-info').textContent = describeCell(index); });
        button.addEventListener('click', () => build(index, tool));
        button.addEventListener('keydown', event => {
          const offsets = { ArrowUp: -WIDTH, ArrowDown: WIDTH, ArrowLeft: -1, ArrowRight: 1 };
          if (Object.hasOwn(offsets, event.key)) {
            event.preventDefault(); const next = index + offsets[event.key];
            if (next >= 0 && next < WIDTH * HEIGHT && (!['ArrowLeft', 'ArrowRight'].includes(event.key) || Math.floor(next / WIDTH) === y)) focusCell(next);
          } else if (event.key.toLowerCase() === 'r' || event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); build(index, event.key.toLowerCase() === 'r' ? 'rotate' : 'erase'); }
        });
        cells.push(button); row.append(button);
      }
      rows.push(row);
    }
    q('board').replaceChildren(...rows);
  }
  function resetRun() { stop(); factory = createRoutingFactory(levelIndex, board); render(); }
  function rebuild(message, restoreFocus = false) {
    drawFloor(); resetRun();
    if (message) { q('status').dataset.outcome = ''; q('status').textContent = message; }
    if (restoreFocus) focusCell(focusedCell);
  }
  function remember() { history.push(cloneBoard(board)); if (history.length > 30) history.shift(); }
  function build(index, kind) {
    if (running) return;
    const outcome = placeTile(levelIndex, board, index, kind, direction);
    if (outcome.error) { q('status').dataset.outcome = ''; q('status').textContent = outcome.error; return; }
    remember(); board = outcome.board; focusedCell = index;
    rebuild(`${describeCell(index)}. Factory ready to test.`, true);
  }
  function loadLevel(index) {
    stop(); levelIndex = index; const level = FACTORY_LEVELS[index]; board = cloneBoard(level.initial); history = []; focusedCell = 9;
    q('level').value = String(index); q('level-count').textContent = `SHIFT ${index + 1} / ${FACTORY_LEVELS.length}`;
    q('title').textContent = level.title; q('brief').textContent = level.brief; q('hint').textContent = level.hint;
    q('target').textContent = `${level.expected.price} USD · observed ${level.expected.time}`;
    root.querySelector('.pf-help').open = false; chooseTool(index === 0 ? 'read' : index === 1 || index === 4 ? 'check' : 'latest');
    direction = index === 1 || index === 4 ? 0 : 1; q('direction').value = String(direction); rebuild();
  }
  function render() {
    const state = factory.state, level = FACTORY_LEVELS[levelIndex];
    const heldExecutionFocus = document.activeElement === q('run') || document.activeElement === q('step');
    q('inbox').replaceChildren(...level.events.map((event, index) => {
      const span = document.createElement('span'); span.className = 'pf-incoming'; span.dataset.current = String(index === state.eventIndex && !state.done); span.dataset.used = String(index < state.eventIndex);
      span.textContent = event.tag; span.title = `Generation #${event.generation} · ${event.price} USD · observed ${event.time}`; span.setAttribute('aria-label', `${event.tag}, ${span.title}`); return span;
    }));
    const visited = new Set(state.visited);
    cells.forEach((button, index) => {
      button.disabled = running; button.dataset.active = String(state.started && state.position === index);
      button.dataset.fault = String(['fault', 'blackout'].includes(state.action) && state.position === index); button.dataset.traversed = String(visited.has(index));
    });
    for (const metric of ['reads', 'merges']) { q(metric).textContent = `${state[metric]} / ${level.budget[metric]}`; q(metric).dataset.over = String(state[metric] > level.budget[metric]); }
    q('parts').textContent = `${board.filter(Boolean).length} / ${level.budget.parts}`;
    toolButtons.forEach((button, kind) => {
      button.disabled = running;
      if (!TOOL_DEFS[kind]) return;
      const group = TOOL_DEFS[kind].group, used = board.filter(value => value && TOOL_DEFS[value.kind].group === group).length;
      button.querySelector('small').textContent = group === 'belt' ? `${used} on floor` : `${used} / 1 on floor`;
    });
    q('undo').disabled = running || history.length === 0;
    for (const name of ['clear', 'restore', 'direction', 'level']) q(name).disabled = running;
    q('run').textContent = running ? 'Pause ■' : state.started && !state.done ? 'Resume ▶' : 'Run factory ▶';
    q('run').disabled = state.done; q('step').disabled = running || state.done; q('next').hidden = !state.result?.won || levelIndex === FACTORY_LEVELS.length - 1;
    q('row').textContent = state.row ? `${state.row.price} USD / ${state.row.time}` : 'Empty';
    q('receipts').textContent = state.receipts.length ? `Receipts: ${state.receipts.map(value => '#' + value).join(', ')}` : 'No completion receipts';
    q('deliveries').textContent = ['delivered', 'returned', 'retry'].map(outcome => state.outcomes.filter(value => value.outcome === outcome).length).join(' / ');
    q('ticks').textContent = `${state.ticks} conveyor steps`;
    const crate = q('packet'); crate.hidden = !state.started;
    crate.style.left = `${(state.position % WIDTH + .5) / WIDTH * 100}%`; crate.style.top = `${(Math.floor(state.position / WIDTH) + .5) / HEIGHT * 100}%`;
    crate.querySelector('b').textContent = state.activeTag; crate.dataset.carrying = String(state.carrying); crate.dataset.duplicate = String(state.duplicate); crate.dataset.fault = String(['fault', 'blackout'].includes(state.action));
    // New deliveries spawn at IN; they must not visually fly backward across the factory.
    crate.style.transitionDuration = state.action === 'spawn' ? '0ms' : `${Math.min(220, Number(q('speed').value))}ms`;
    const status = q('status'); status.dataset.outcome = state.done ? state.result.won ? 'won' : 'failed' : '';
    status.textContent = state.done ? state.result.won ? `Shift cleared. Correct warehouse, completed receipts, within every budget. ${levelIndex === FACTORY_LEVELS.length - 1 ? 'Rush hour handled.' : 'The next shift adds a new failure boundary.'}` : `${state.result.reasons.join(' ')} Edit the floor and try again.` : state.message;
    q('trace-count').textContent = `(${state.log.length} steps)`;
    q('log').replaceChildren(...state.log.map(text => { const entry = document.createElement('li'); entry.textContent = text; return entry; }));
    if (state.done && heldExecutionFocus) (q('next').hidden ? q('reset') : q('next')).focus({ preventScroll: true });
  }
  function pauseIfHidden() { if (running && (document.hidden || panel?.hidden)) { stop(); render(); } }
  function tick() {
    if (document.hidden || panel?.hidden) { stop(); render(); return; }
    factory.step(); if (factory.state.done) stop(); render();
    if (running) timer = setTimeout(tick, Number(q('speed').value));
  }
  q('run').addEventListener('click', () => { if (running) { stop(); render(); } else { running = true; tick(); } });
  q('step').addEventListener('click', () => { factory.step(); render(); });
  q('reset').addEventListener('click', resetRun);
  q('undo').addEventListener('click', () => { if (history.length) { board = history.pop(); rebuild('Last floor edit undone.'); } });
  q('clear').addEventListener('click', () => { remember(); board = Array(WIDTH * HEIGHT).fill(null); rebuild('Floor cleared. Build a route from IN to OUT, with a separate duplicate return lane.'); });
  q('restore').addEventListener('click', () => { remember(); board = cloneBoard(FACTORY_LEVELS[levelIndex].initial); rebuild('Starting floor restored.'); });
  q('direction').addEventListener('change', () => { direction = Number(q('direction').value); });
  q('level').addEventListener('change', () => loadLevel(Number(q('level').value)));
  q('next').addEventListener('click', () => { loadLevel(levelIndex + 1); q('level').focus({ preventScroll: true }); });
  document.addEventListener('visibilitychange', pauseIfHidden);
  if (panel) new MutationObserver(pauseIfHidden).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  loadLevel(0); root.hidden = false;
}
