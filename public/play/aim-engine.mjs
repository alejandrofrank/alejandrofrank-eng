// The play field is the calendar: every target occupies four existing day cells.
export const ROUND_SECONDS = 30;
export const INTRO_SECONDS = 1.2;
export const STAGES = [
  { name: '01 / WARM UP', lifetime: 2.8 },
  { name: '02 / QUICK', lifetime: 1.9 },
  { name: '03 / RAPID', lifetime: 1.3 },
];

export function createAimRound({ random = Math.random, columns = 53, cells } = {}) {
  const available = new Set((cells ?? Array.from({ length: columns * 7 }, (_, i) => ({ column: Math.floor(i / 7), row: i % 7 })))
    .map(cell => `${cell.column}:${cell.row}`));
  const groups = [];
  for (let column = 0; column < columns - 1; column++) {
    for (let row = 0; row < 6; row++) {
      if ([`${column}:${row}`, `${column + 1}:${row}`, `${column}:${row + 1}`, `${column + 1}:${row + 1}`].every(cell => available.has(cell))) groups.push({ column, row });
    }
  }
  let state, nextId = 0;
  const stageIndex = () => Math.min(2, Math.floor(state.elapsed / 10));
  const inWindow = group => group.column >= state.window.first && group.column + 1 <= state.window.last;
  const overlaps = (a, b) => Math.abs(a.column - b.column) < 2 && Math.abs(a.row - b.row) < 2;
  function setWindow(window = { first: 0, last: columns - 1 }) {
    state.window = { first: Math.max(0, Math.floor(window.first)), last: Math.min(columns - 1, Math.floor(window.last)) };
  }
  function reset() {
    state = { status: 'ready', elapsed: 0, intro: 0, score: 0, hits: 0, shots: 0, escaped: 0,
      combo: 0, bestCombo: 0, reactionTotal: 0, mode: 'pointer', targets: [],
      cooldowns: [0, 0, 0], previous: [null, null, null], window: { first: 0, last: columns - 1 }, resumeStatus: 'running' };
    return snapshot();
  }
  function spawn(slot) {
    // Leave at least one dark row or column between groups so four-square
    // targets cannot visually merge into an ambiguous strip of eight squares.
    const choices = groups.filter(group => inWindow(group) && !state.targets.some(target =>
      Math.abs(group.column - target.column) < 3 && Math.abs(group.row - target.row) < 3));
    if (!choices.length) return;
    const previous = state.previous[slot];
    const different = previous ? choices.filter(group => !overlaps(group, previous)) : choices;
    const candidates = different.length ? different : choices;
    const selected = candidates[Math.floor(Math.max(0, Math.min(.999999, random())) * candidates.length)];
    state.previous[slot] = selected;
    state.targets.push({ ...selected, id: ++nextId, slot, age: 0,
      lifetime: state.mode === 'keyboard' ? 3.5 : STAGES[stageIndex()].lifetime,
      x: (selected.column + 1) / columns, y: (selected.row + 1) / 7 });
  }
  function fill() {
    for (let slot = 0; slot < 3; slot++) if (state.cooldowns[slot] <= 0 && !state.targets.some(target => target.slot === slot)) spawn(slot);
  }
  function snapshot() {
    return { status: state.status, elapsed: state.elapsed, remaining: ROUND_SECONDS - state.elapsed,
      boot: state.status === 'starting' ? state.intro < .55 ? 'lit' : 'dark' : '',
      score: state.score, hits: state.hits, shots: state.shots, escaped: state.escaped,
      combo: state.combo, bestCombo: state.bestCombo, mode: state.mode, stage: stageIndex(),
      canPlay: groups.some(inWindow), window: { ...state.window },
      accuracy: state.shots ? Math.round(100 * state.hits / state.shots) : null,
      reaction: state.hits ? Math.round(1000 * state.reactionTotal / state.hits) : null,
      targets: state.targets.map(target => ({ ...target })) };
  }
  function start({ mode = 'pointer', skipIntro = false, window } = {}) {
    reset(); state.mode = mode === 'keyboard' ? 'keyboard' : 'pointer'; setWindow(window);
    if (!groups.some(inWindow)) return snapshot();
    state.status = skipIntro ? 'running' : 'starting';
    if (skipIntro) { state.intro = INTRO_SECONDS; fill(); }
    return snapshot();
  }
  function step(seconds) {
    if (!['starting', 'running'].includes(state.status) || !Number.isFinite(seconds) || seconds <= 0) return snapshot();
    if (state.status === 'starting') {
      const used = Math.min(seconds, INTRO_SECONDS - state.intro);
      state.intro += used; seconds -= used;
      if (state.intro < INTRO_SECONDS) return snapshot();
      state.status = 'running'; fill();
    }
    const previousStage = stageIndex();
    state.elapsed = Math.min(ROUND_SECONDS, state.elapsed + seconds);
    if (state.elapsed >= ROUND_SECONDS) { state.status = 'finished'; state.targets = []; return snapshot(); }
    if (stageIndex() !== previousStage) { state.targets = []; state.cooldowns.fill(0); fill(); return snapshot(); }
    state.cooldowns = state.cooldowns.map(value => Math.max(0, value - seconds));
    for (const target of state.targets) {
      target.age += seconds;
      if (target.age >= target.lifetime) { state.escaped++; state.combo = 0; state.cooldowns[target.slot] = .15; }
    }
    state.targets = state.targets.filter(target => target.age < target.lifetime);
    fill(); return snapshot();
  }
  function shoot(id) {
    if (state.status !== 'running') return null;
    const target = state.targets.find(item => item.id === id);
    if (id !== undefined && !target) return null;
    state.shots++;
    if (!target) { state.combo = 0; state.score = Math.max(0, state.score - 25); return { hit: false, points: -25 }; }
    state.hits++; state.combo++; state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.reactionTotal += target.age;
    const points = 100 + Math.min(10, state.combo - 1) * 15 + Math.round(50 * (1 - target.age / target.lifetime));
    state.score += points;
    state.targets = state.targets.filter(item => item.id !== id); state.cooldowns[target.slot] = .12;
    return { hit: true, points, x: target.x, y: target.y };
  }
  reset();
  return { start, step, shoot, snapshot, reset,
    pause() { if (['starting', 'running'].includes(state.status)) { state.resumeStatus = state.status; state.status = 'paused'; } return snapshot(); },
    resume({ window = state.window, skipIntro = false } = {}) {
      if (state.status === 'paused') {
        setWindow(window);
        if (!groups.some(inWindow)) return snapshot();
        state.targets = state.targets.filter(inWindow);
        state.status = state.resumeStatus;
        if (skipIntro && state.status === 'starting') { state.intro = INTRO_SECONDS; state.status = 'running'; }
        if (state.status === 'running') fill();
      }
      return snapshot();
    },
  };
}
