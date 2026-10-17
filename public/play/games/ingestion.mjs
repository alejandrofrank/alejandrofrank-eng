import { createFactory, LEVELS, OPERATIONS } from './ingestion-core.mjs';

export function initIngestionGame() {
  const root = document.getElementById('ingestion-game');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const panel = root.closest('[data-station-panel]');
  const find = id => root.querySelector(`#pf-${id}`);
  let levelIndex = 0, order = [...LEVELS[0].initial], enabled = new Set(order), mergeMode = LEVELS[0].mergeMode;
  let factory, timer = null, running = false;
  const commandNodes = new Map();
  function stop() { clearTimeout(timer); timer = null; running = false; }
  function program() { return order.filter(operation => enabled.has(operation)); }
  function makeCommands(focusOperation, focusDirection) {
    commandNodes.clear();
    find('commands').replaceChildren(...order.map((operation, index) => {
      const item = document.createElement('li'); item.className = 'pf-command'; item.dataset.operation = operation;
      item.dataset.disabled = String(!enabled.has(operation));
      const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0'); number.setAttribute('aria-hidden', 'true');
      const label = document.createElement('label'); label.title = OPERATIONS[operation].hint;
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = enabled.has(operation);
      checkbox.addEventListener('change', () => { checkbox.checked ? enabled.add(operation) : enabled.delete(operation); resetRun(operation); });
      label.append(checkbox, document.createTextNode(OPERATIONS[operation].name));
      item.append(number, label);
      for (const [direction, text] of [[-1, '↑'], [1, '↓']]) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = text;
        button.dataset.direction = String(direction); button.disabled = index + direction < 0 || index + direction >= order.length;
        button.setAttribute('aria-label', `Move ${OPERATIONS[operation].name} ${direction < 0 ? 'up' : 'down'}`);
        button.addEventListener('click', () => {
          const nextIndex = order.indexOf(operation) + direction;
          [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
          resetRun(operation, direction);
        });
        item.append(button);
      }
      commandNodes.set(operation, item); return item;
    }));
    const track = find('track');
    track.replaceChildren(...program().map(operation => {
      const station = document.createElement('div'); station.className = 'pf-station'; station.dataset.operation = operation;
      station.textContent = OPERATIONS[operation].name; return station;
    }));
    if (!program().length) { const empty = document.createElement('p'); empty.className = 'pf-small'; empty.textContent = 'No commands enabled'; track.append(empty); }
    if (focusOperation) {
      const item = commandNodes.get(focusOperation);
      const focus = item.querySelector(`button[data-direction="${focusDirection}"]:not(:disabled)`) || item.querySelector('input');
      focus.focus({ preventScroll: true });
    }
  }
  function resetRun(focusOperation, focusDirection) {
    stop(); factory = createFactory(levelIndex, program(), mergeMode); makeCommands(focusOperation, focusDirection); render();
  }
  function loadLevel(index) {
    levelIndex = index;
    const level = LEVELS[index]; order = [...level.initial]; enabled = new Set(order); mergeMode = level.mergeMode;
    find('level').value = String(index); find('rule').value = mergeMode;
    find('level-count').textContent = `LEVEL ${index + 1} / ${LEVELS.length}`;
    find('title').textContent = level.title; find('brief').textContent = level.brief; find('hint').textContent = level.hint;
    find('target').textContent = `1 row · ${level.expected.price} USD · observed ${level.expected.time}`;
    find('budget').textContent = `≤ ${level.budget.reads} reads + ${level.budget.merges} merge attempts`;
    root.querySelector('.pf-help').open = false;
    resetRun();
  }
  function render() {
    const state = factory.state, level = LEVELS[levelIndex];
    const focusedExecutionControl = document.activeElement === find('run') || document.activeElement === find('step');
    find('inbox').replaceChildren(...level.events.map((event, index) => {
      const envelope = document.createElement('div'); envelope.className = 'pf-envelope';
      envelope.dataset.used = String(index < state.eventIndex); envelope.dataset.current = String(index === state.eventIndex && !state.done);
      const label = document.createElement('b'); label.textContent = event.tag;
      const generation = document.createElement('span'); generation.textContent = `#${event.generation}`;
      const time = document.createElement('span'); time.textContent = event.time;
      envelope.append(label, generation, time); return envelope;
    }));
    const activeOperation = state.program[state.position];
    commandNodes.forEach((item, operation) => {
      item.dataset.active = String(operation === activeOperation);
      item.querySelector('input').disabled = running;
      item.querySelectorAll('button').forEach(button => {
        const next = order.indexOf(operation) + Number(button.dataset.direction);
        button.disabled = running || next < 0 || next >= order.length;
      });
    });
    find('track').querySelectorAll('[data-operation]').forEach(item => { item.dataset.active = String(item.dataset.operation === activeOperation); });
    find('packet').style.transform = `translateY(${Math.max(0, state.position) * 51}px)`;
    find('packet').textContent = state.lastEvent || level.events[0].tag;
    find('row').textContent = state.row ? `${state.row.price} USD / ${state.row.time}` : 'Empty';
    find('receipts').textContent = state.receipts.length ? `Receipts: ${state.receipts.map(value => '#' + value).join(', ')}` : 'No receipts yet';
    for (const metric of ['reads', 'merges']) {
      find(metric).textContent = `${state[metric]} / ${level.budget[metric]}`;
      find(metric).dataset.over = String(state[metric] > level.budget[metric]);
    }
    find('run').textContent = running ? 'Pause ■' : state.started && !state.done ? 'Resume ▶' : 'Run line ▶';
    find('run').disabled = state.done; find('step').disabled = running || state.done;
    find('rule').disabled = running; find('level').disabled = running;
    find('next').hidden = !state.result?.won || levelIndex === LEVELS.length - 1;
    const status = find('status'); status.dataset.outcome = state.done ? state.result.won ? 'won' : 'failed' : 'running';
    status.textContent = state.done ? state.result.won
      ? `Line accepted. Target reached within budget.${levelIndex === LEVELS.length - 1 ? ' Final delivery challenge solved.' : ' Move to the next delivery challenge.'}`
      : `Line needs a change. ${state.result.reasons.join(' ')} Edit a command or rule to try again.`
      : state.message;
    find('trace-count').textContent = `(${state.log.length} steps)`;
    find('log').replaceChildren(...state.log.map(text => { const entry = document.createElement('li'); entry.textContent = text; return entry; }));
    if (state.done && focusedExecutionControl) (find('next').hidden ? find('reset') : find('next')).focus({ preventScroll: true });
  }
  function pauseIfHidden() {
    if (running && (document.hidden || panel?.hidden)) { stop(); render(); }
  }
  function tick() {
    if (document.hidden || panel?.hidden) { stop(); render(); return; }
    factory.step();
    if (factory.state.done) stop();
    render();
    if (running) timer = setTimeout(tick, 520);
  }
  find('run').addEventListener('click', () => { if (running) { stop(); render(); } else { running = true; tick(); } });
  find('step').addEventListener('click', () => { factory.step(); render(); });
  find('reset').addEventListener('click', () => resetRun());
  find('rule').addEventListener('change', event => { mergeMode = event.target.value; resetRun(); });
  find('level').addEventListener('change', event => loadLevel(Number(event.target.value)));
  find('next').addEventListener('click', () => {
    loadLevel(levelIndex + 1); find('level').focus({ preventScroll: true });
  });
  document.addEventListener('visibilitychange', pauseIfHidden);
  // Switching project stations must pause the simulation at its current command.
  if (panel) new MutationObserver(pauseIfHidden).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  loadLevel(0); root.hidden = false;
}
