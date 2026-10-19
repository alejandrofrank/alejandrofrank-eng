import { createAimRound, ROUND_SECONDS, STAGES } from './aim-engine.mjs';

export function initAimRange(root = document.querySelector('[data-aim-range]'), options = {}) {
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const doc = root.ownerDocument, win = doc.defaultView;
  const engine = createAimRound(options);
  const find = selector => root.querySelector(selector);
  const board = find('[data-range-board]'), layer = find('[data-targets]');
  const overlay = find('[data-overlay]'), start = find('[data-start]');
  const pauseButton = find('[data-pause]'), stop = find('[data-stop]');
  const select = find('#aim-input');
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  const frames = options.frames || { request: callback => win.requestAnimationFrame(callback), cancel: id => win.cancelAnimationFrame(id) };
  const nodes = new Map(), marks = [];
  const listeners = [];
  let frame = null, previousTime = null, lastStage = -1, lastStatus = '', lastScore = -1;
  const on = (target, type, callback) => { target.addEventListener(type, callback); listeners.push(() => target.removeEventListener(type, callback)); };
  const say = text => { find('[data-announcement]').textContent = text; };
  function clearFrame() { if (frame !== null) frames.cancel(frame); frame = null; previousTime = null; }
  function bestKey(mode) { return 'portfolio-aim-best-v1-' + mode; }
  function saveBest(state) {
    try {
      const stored = Number(win.localStorage.getItem(bestKey(state.mode))) || 0;
      const best = Math.max(stored, state.score);
      win.localStorage.setItem(bestKey(state.mode), String(best)); return best;
    } catch { return state.score; }
  }
  function clearMarks() { for (const mark of marks) mark.node.remove(); marks.length = 0; }
  function render() {
    const state = engine.snapshot();
    board.dataset.status = state.status;
    find('[data-stat=time]').textContent = state.remaining.toFixed(1);
    if (state.score !== lastScore) find('[data-stat=score]').textContent = String(state.score).padStart(5, '0');
    lastScore = state.score;
    find('[data-stat=accuracy]').textContent = state.accuracy === null ? '—' : state.accuracy + '%';
    find('[data-stat=combo]').textContent = '×' + state.combo;
    find('[data-progress]').style.setProperty('--remaining', state.remaining / ROUND_SECONDS);
    const active = state.status === 'running';
    const inRound = active || state.status === 'paused';
    layer.hidden = !active;
    overlay.hidden = active;
    pauseButton.hidden = !inRound;
    pauseButton.textContent = state.status === 'paused' ? 'Resume' : 'Pause';
    stop.hidden = state.status === 'ready';
    if (active && state.stage !== lastStage) {
      find('[data-stage]').textContent = STAGES[state.stage].name;
      find('[data-stage-hint]').textContent = state.mode === 'keyboard' ? 'PRESS 1 · 2 · 3' : state.stage === 2 && reduced.matches ? 'STEADY / REDUCED MOTION' : STAGES[state.stage].hint;
      say(state.mode === 'keyboard' ? 'Keyboard practice. Press 1, 2 or 3 for the matching target.' : STAGES[state.stage].name + '. ' + STAGES[state.stage].hint);
    }
    lastStage = state.stage;
    for (const [id, node] of nodes) {
      if (!state.targets.some(target => target.id === id)) { node.remove(); nodes.delete(id); }
    }
    for (const target of state.targets) {
      let node = nodes.get(target.id);
      if (!node) {
        node = doc.createElement('button'); node.type = 'button'; node.className = 'aim-target';
        node.dataset.targetId = String(target.id); node.dataset.slot = String(target.slot);
        node.setAttribute('aria-label', 'Shoot target ' + (target.slot + 1));
        node.innerHTML = '<span class="aim-orb"></span><svg class="aim-life" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" pathLength="100"/></svg><span class="target-key" aria-hidden="true"></span>';
        node.querySelector('.target-key').textContent = state.mode === 'keyboard' ? String(target.slot + 1) : '';
        layer.append(node); nodes.set(target.id, node);
      }
      node.style.left = (target.x * 100) + '%'; node.style.top = (target.y * 100) + '%';
      node.style.setProperty('--size', target.size + 'px');
      node.style.setProperty('--elapsed', Math.min(100, 100 * target.age / target.lifetime));
      node.dataset.urgent = String(target.age / target.lifetime > .7);
    }
    if (state.status !== lastStatus) {
      const title = find('[data-overlay-title]'), copy = find('[data-overlay-copy]'), kicker = find('[data-overlay-kicker]');
      find('[data-options]').hidden = state.status === 'paused';
      if (state.status === 'paused') {
        kicker.textContent = 'PAUSED'; title.textContent = 'Take your time.';
        copy.textContent = 'The clock and targets are frozen. Resume when you’re ready.';
        start.textContent = 'Resume round →'; say('Range paused. Resume or exit.');
      } else if (state.status === 'finished') {
        const best = saveBest(state);
        kicker.textContent = state.mode === 'keyboard' ? 'KEYBOARD PRACTICE / COMPLETE' : 'ROUND COMPLETE';
        title.textContent = state.hits + ' hits. ' + state.score.toLocaleString() + ' points.';
        copy.textContent = `${state.accuracy ?? 0}% accuracy · ${state.escaped} escaped · best streak ${state.bestCombo}${state.reaction === null ? '' : ' · ' + state.reaction + ' ms average to hit'}. Personal best: ${best.toLocaleString()}.`;
        start.textContent = 'Play again →'; say(title.textContent + ' ' + copy.textContent);
      } else if (state.status === 'ready') {
        kicker.textContent = 'AIM TRAINING'; title.textContent = '30-second warm-up';
        copy.textContent = 'Hit targets before their rings run out. Misses cost 25 points. Every ten seconds, the range gets harder.';
        start.textContent = 'Start round →'; find('[data-stage]').textContent = 'READY';
        find('[data-stage-hint]').textContent = '30 SECOND ROUND';
      }
      lastStatus = state.status;
    }
    return state;
  }
  function tick(time) {
    frame = null;
    const delta = previousTime === null ? 0 : Math.max(0, (time - previousTime) / 1000);
    previousTime = time;
    engine.step(delta);
    for (let index = marks.length - 1; index >= 0; index--) {
      marks[index].age += delta;
      if (marks[index].age > .45) { marks[index].node.remove(); marks.splice(index, 1); }
    }
    if (render().status === 'running') frame = frames.request(tick);
    else { clearFrame(); clearMarks(); start.focus({ preventScroll: true }); }
  }
  function run() {
    clearFrame();
    if (engine.snapshot().status === 'paused') engine.resume({ still: reduced.matches });
    else { engine.start({ mode: select.value, still: reduced.matches }); lastStage = -1; clearMarks(); }
    // Native details are useful even without JS; close them before resuming play.
    doc.querySelectorAll('.lobby-panel[open]').forEach(panel => { panel.open = false; });
    find('[data-instructions]').textContent = select.value === 'keyboard'
      ? 'Practice: 1 / 2 / 3 to hit targets · Esc to pause'
      : 'Click / tap to shoot · Esc to pause · 30 seconds';
    render(); board.focus({ preventScroll: true }); frame = frames.request(tick);
  }
  function pause(focus = false) {
    if (engine.snapshot().status !== 'running') return;
    engine.pause(); clearFrame(); clearMarks(); render();
    if (focus) start.focus({ preventScroll: true });
  }
  function exit() { clearFrame(); clearMarks(); engine.reset(); lastStage = -1; render(); start.focus({ preventScroll: true }); say('Range closed. Choose a destination or start another round.'); }
  function shoot(id, x, y) {
    const shot = engine.shoot(id);
    if (!shot) return;
    const mark = doc.createElement('span'); mark.className = 'shot-mark' + (shot.hit ? '' : ' miss');
    mark.textContent = shot.hit ? '+' + shot.points : '−25';
    mark.style.left = ((shot.hit ? shot.x : x) * 100) + '%'; mark.style.top = ((shot.hit ? shot.y : y) * 100) + '%';
    find('[data-feedback]').append(mark); marks.push({ node: mark, age: 0 });
    render();
  }
  on(start, 'click', run);
  on(pauseButton, 'click', () => engine.snapshot().status === 'paused' ? run() : pause(true));
  on(stop, 'click', exit);
  on(board, 'pointerdown', event => {
    if (engine.snapshot().status !== 'running' || !event.isPrimary || event.button !== 0) return;
    const target = event.target.closest('[data-target-id]');
    const rect = board.getBoundingClientRect();
    event.preventDefault(); // No follow-up focus/scroll jump when the shot removes its target.
    shoot(target ? Number(target.dataset.targetId) : undefined, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  });
  // Native keyboard/assistive-technology activation has no pointerdown.
  on(board, 'click', event => {
    if (event.detail !== 0) return;
    const target = event.target.closest('[data-target-id]');
    if (target) { shoot(Number(target.dataset.targetId)); board.focus({ preventScroll: true }); }
  });
  on(doc, 'keydown', event => {
    if (event.key === 'Escape') {
      const openPanel = doc.querySelector('.lobby-panel[open]');
      if (openPanel) { openPanel.open = false; openPanel.querySelector('summary').focus(); event.preventDefault(); return; }
      if (engine.snapshot().status === 'running') { event.preventDefault(); pause(true); }
      else if (engine.snapshot().status === 'paused' && root.contains(doc.activeElement)) { event.preventDefault(); exit(); }
    }
    const state = engine.snapshot();
    if (state.status !== 'running' || state.mode !== 'keyboard' || !root.contains(doc.activeElement) || event.repeat) return;
    if (/^[123]$/.test(event.key)) {
      event.preventDefault(); const target = state.targets.find(item => item.slot === Number(event.key) - 1);
      if (target) shoot(target.id);
    }
  });
  on(doc, 'visibilitychange', () => { if (doc.hidden) pause(); });
  on(win, 'blur', () => pause());
  on(win, 'pagehide', () => pause());
  on(win, 'resize', () => pause());
  on(reduced, 'change', () => pause());
  doc.querySelectorAll('.lobby-panel').forEach(panel => on(panel, 'toggle', () => { if (panel.open) pause(); }));
  on(doc, 'focusin', event => { if (!root.contains(event.target)) pause(); });
  function openSection() {
    if (win.location.hash === '#projects') { win.location.replace('/play'); return; }
    const section = ['#about', '#contact'].includes(win.location.hash) ? doc.querySelector(win.location.hash) : null;
    if (section) { section.open = true; pause(); }
  }
  on(win, 'hashchange', openSection); openSection();
  start.disabled = false; find('[data-loading]').hidden = true;
  render();
  return { snapshot: engine.snapshot, destroy() { clearFrame(); clearMarks(); listeners.forEach(remove => remove()); nodes.forEach(node => node.remove()); delete root.dataset.initialized; } };
}
