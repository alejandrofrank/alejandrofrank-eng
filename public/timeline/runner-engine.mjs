export const RUNNER = Object.freeze({ width: 20, height: 38, duckHeight: 18, gravity: 1100, jump: 440, startX: -240 });

// Coordinates use the actual chart's baseline: y=0 is the floor, positive is up.
// The opening geometry is copied unchanged from the rendered experience bars.
export function createRunner(bars, seed = 17) {
  const opening = bars.map(bar => ({ ...bar, real: true }));
  if (!opening.length || opening.some(b => ![b.x, b.width, b.bottom, b.height].every(Number.isFinite) || b.width <= 0 || b.height <= 0)) {
    throw new Error('A runner needs the visible experience bars.');
  }
  let obstacles, nextX, serial, randomSeed, state;
  const realEnd = Math.max(...opening.map(b => b.x + b.width));
  const random = () => ((randomSeed = (Math.imul(randomSeed, 1664525) + 1013904223) >>> 0) / 4294967296);

  function reset() {
    obstacles = opening.map(bar => ({ ...bar, passed: false }));
    nextX = realEnd + 420; serial = 0; randomSeed = seed >>> 0;
    state = { status: 'ready', x: RUNNER.startX, y: 0, vy: 0, duck: false, speed: 155, distance: 0, cleared: 0, realCleared: 0, phase: 'experience', hit: null };
  }
  function extend(ahead) {
    while (nextX < ahead) {
      // Every trio asks for a jump, a crouch, and restraint, in rotating order.
      const kind = (serial + Math.floor(serial / 3)) % 3;
      const width = kind === 0 ? 38 + Math.floor(random() * 32) : 86 + Math.floor(random() * 65);
      obstacles.push({ id: `generated-${serial++}`, label: ['Low block', 'Low ceiling', 'High beam'][kind],
        category: ['job', 'contract', 'project'][kind], x: nextX, width,
        bottom: [0, 26, 62][kind], height: kind === 0 ? 20 + Math.floor(random() * 10) : 12,
        real: false, passed: false });
      // At maximum speed there is still over a second to recover between bars.
      nextX += width + 360 + Math.floor(random() * 190);
    }
    obstacles = obstacles.filter(bar => bar.real || bar.x + bar.width > state.x - 500);
  }
  function snapshot() {
    return { ...state, score: Math.floor(state.distance / 10) + state.cleared * 10,
      totalRoles: opening.length, obstacles: obstacles.map(bar => ({ ...bar })) };
  }
  function step(seconds, visibleWidth = 1200) {
    if (state.status !== 'running' || !Number.isFinite(seconds) || seconds <= 0) return snapshot();
    // Small physics steps avoid tunnelling. A stalled frame never fast-forwards a run.
    let remaining = Math.min(seconds, 0.05);
    while (remaining > 0 && state.status === 'running') {
      const dt = Math.min(remaining, 1 / 120); remaining -= dt;
      state.speed = Math.min(310, 155 + state.distance / 180);
      state.x += state.speed * dt;
      state.distance = state.x - RUNNER.startX;
      if (state.y > 0 || state.vy > 0) {
        state.vy -= RUNNER.gravity * dt * (state.duck ? 1.7 : 1);
        state.y = Math.max(0, state.y + state.vy * dt);
        if (state.y === 0) state.vy = 0;
      }
      const height = state.duck && state.y === 0 ? RUNNER.duckHeight : RUNNER.height;
      for (const bar of obstacles) {
        const horizontal = state.x + RUNNER.width > bar.x + 1 && state.x < bar.x + bar.width - 1;
        const vertical = state.y + height > bar.bottom + 1 && state.y + 2 < bar.bottom + bar.height;
        if (horizontal && vertical) {
          state.status = 'over'; state.hit = { ...bar }; break;
        }
        if (!bar.passed && state.x >= bar.x + bar.width) {
          bar.passed = true; state.cleared++;
          if (bar.real) state.realCleared++;
        }
      }
      if (state.x > realEnd + 80) state.phase = 'endless';
      extend(state.x + Math.max(400, Math.min(2000, visibleWidth)) + 800);
    }
    return snapshot();
  }
  reset();
  return {
    snapshot, step,
    start() { reset(); state.status = 'running'; extend(1800); return snapshot(); },
    jump() { if (state.status === 'running' && state.y === 0 && !state.duck) state.vy = RUNNER.jump; },
    crouch(value) { if (state.status === 'running') state.duck = Boolean(value); },
    pause() { if (state.status === 'running') { state.status = 'paused'; state.duck = false; } },
    resume() { if (state.status === 'paused') state.status = 'running'; },
  };
}
