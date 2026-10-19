// Input-independent round state. No timers, DOM or storage: elapsed time is explicit.
export const ROUND_SECONDS = 30;
export const STAGES = [
  { name: '01 / FLICK', hint: 'BUILD A STREAK', lifetime: 2.8, size: 58 },
  { name: '02 / QUICK', hint: 'SHORTER WINDOWS', lifetime: 1.9, size: 50 },
  { name: '03 / DRIFT', hint: 'LEAD YOUR SHOTS', lifetime: 2.1, size: 46 },
];

export function createAimRound({ random = Math.random } = {}) {
  let state, nextId = 0;
  const rand = () => Math.max(0, Math.min(.999999, random()));
  const stageIndex = () => Math.min(2, Math.floor(state.elapsed / 10));
  function reset() {
    state = { status: 'ready', elapsed: 0, score: 0, hits: 0, shots: 0, escaped: 0,
      combo: 0, bestCombo: 0, reactionTotal: 0, mode: 'pointer', still: false,
      targets: [], cooldowns: [0, 0, 0], previousY: [0, 0, 0] };
    return snapshot();
  }
  function spawn(slot) {
    const stage = stageIndex();
    let y = .34 + rand() * .37;
    if (Math.abs(y - state.previousY[slot]) < .12) y = y < .52 ? y + .17 : y - .17;
    state.previousY[slot] = y;
    const x = .2 + slot * .3 + (rand() - .5) * .12;
    state.targets.push({ id: ++nextId, slot, x, y, baseX: x, baseY: y, age: 0,
      lifetime: state.mode === 'keyboard' ? 3.5 : STAGES[stage].lifetime,
      size: STAGES[stage].size, direction: rand() < .5 ? -1 : 1, drift: stage === 2 && !state.still && state.mode !== 'keyboard' });
  }
  function snapshot() {
    return { status: state.status, elapsed: state.elapsed, remaining: ROUND_SECONDS - state.elapsed,
      score: state.score, hits: state.hits, shots: state.shots, escaped: state.escaped,
      combo: state.combo, bestCombo: state.bestCombo, mode: state.mode, stage: stageIndex(),
      accuracy: state.shots ? Math.round(100 * state.hits / state.shots) : null,
      reaction: state.hits ? Math.round(1000 * state.reactionTotal / state.hits) : null,
      targets: state.targets.map(target => ({ ...target })) };
  }
  function start({ mode = 'pointer', still = false } = {}) {
    reset(); state.mode = mode === 'keyboard' ? 'keyboard' : 'pointer';
    state.still = still; state.status = 'running';
    for (let slot = 0; slot < 3; slot++) spawn(slot);
    return snapshot();
  }
  function step(seconds) {
    if (state.status !== 'running' || !Number.isFinite(seconds) || seconds <= 0) return snapshot();
    const previousStage = stageIndex();
    state.elapsed = Math.min(ROUND_SECONDS, state.elapsed + seconds);
    if (state.elapsed >= ROUND_SECONDS) {
      state.status = 'finished'; state.targets = []; return snapshot();
    }
    if (stageIndex() !== previousStage) {
      state.targets = []; state.cooldowns.fill(0);
      for (let slot = 0; slot < 3; slot++) spawn(slot);
      return snapshot();
    }
    for (const target of state.targets) {
      target.age += seconds;
      if (target.drift) {
        target.x = target.baseX + Math.sin(target.age * 2.8) * .045 * target.direction;
        target.y = target.baseY + Math.sin(target.age * 2) * .035;
      }
      if (target.age >= target.lifetime) {
        state.escaped++; state.combo = 0; state.cooldowns[target.slot] = .15;
      }
    }
    state.targets = state.targets.filter(target => target.age < target.lifetime);
    for (let slot = 0; slot < 3; slot++) {
      if (state.targets.some(target => target.slot === slot)) continue;
      state.cooldowns[slot] -= seconds;
      if (state.cooldowns[slot] <= 0) spawn(slot);
    }
    return snapshot();
  }
  function shoot(id) {
    if (state.status !== 'running') return null;
    const target = state.targets.find(item => item.id === id);
    // A removed target's queued click must not count as an extra miss or hit.
    if (id !== undefined && !target) return null;
    state.shots++;
    if (!target) {
      state.combo = 0; state.score = Math.max(0, state.score - 25);
      return { hit: false, points: -25 };
    }
    state.hits++; state.combo++; state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.reactionTotal += target.age;
    const points = 100 + Math.min(10, state.combo - 1) * 15 + Math.round(50 * (1 - target.age / target.lifetime));
    state.score += points;
    state.targets = state.targets.filter(item => item.id !== id);
    state.cooldowns[target.slot] = .12;
    return { hit: true, points, x: target.x, y: target.y };
  }
  reset();
  return { start, step, shoot, snapshot, reset,
    pause() { if (state.status === 'running') state.status = 'paused'; return snapshot(); },
    resume({ still = state.still } = {}) {
      if (state.status === 'paused') {
        state.still = still;
        if (still) state.targets.forEach(target => { target.drift = false; });
        state.status = 'running';
      }
      return snapshot();
    },
  };
}
