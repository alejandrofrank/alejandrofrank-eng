import { createLava, lavaSurface, LAVA } from './lava.mjs';

export const RUNNER = Object.freeze({ width: 20, height: 38, duckHeight: 18, gravity: 1200, jump: 520, speed: 220, startX: 12 });

// One-way platforms: rising through a bar is safe; descending onto its top lands.
// Real role geometry remains untouched. Bonus ledges and spikes are separate data.
export function createRunner(bars, { openingWidth = 0 } = {}) {
  const real = bars.map(bar => ({ ...bar, real: true }));
  if (!real.length || real.some(b => ![b.x, b.width, b.bottom, b.height].every(Number.isFinite) || b.width <= 0 || b.height <= 0)) throw new Error('Visible experience bars are required.');
  const realEnd = Math.max(...real.map(bar => bar.x + bar.width));
  if (!Number.isFinite(openingWidth) || openingWidth < 0) throw new Error('Opening width must be a non-negative number.');
  // Keep the entire career chart clear. The bonus course begins off its right
  // edge, with enough space to preserve the last company's bar and label.
  const bonusStart = Math.max(realEnd + 80, openingWidth + 32);
  const lava = createLava();
  let state, platforms, hazards, coins, visited, collected, direction, jumpBuffer, coyote, dropTime, checkpoint, chunk;
  const top = bar => bar.bottom + bar.height;
  const overlaps = (x, width, b) => x + width > b.x + 1 && x < b.x + b.width - 1;

  function buildWorld() {
    const region = Math.max(0, Math.floor((state.x - bonusStart) / 155));
    if (region === chunk) return;
    chunk = region;
    platforms = real.map(bar => ({ ...bar })); hazards = []; coins = [];
    for (let i = Math.max(0, region - 9); i <= region + 13; i++) {
      const x = bonusStart + i * 155, height = [88, 148, 208, 148][i % 4];
      const ledge = { id: `ledge-${i}`, label: 'Bonus ledge', category: 'bonus', x, width: 104, bottom: height - 10, height: 10, real: false };
      platforms.push(ledge);
      coins.push({ id: `gem-${i}`, x: x + 44, y: height + 27 });
      // Leave most of each upper ledge safe to land on.
      if (i % 4 === 3) hazards.push({ id: `spike-top-${i}`, x: x + 82, bottom: height, width: 18, height: 13 });
      if (i % 2 === 0) {
        platforms.push({ id: `step-${i}`, label: 'Lower route', category: 'bonus', x: x + 112, width: 100, bottom: 44, height: 10, real: false });
        hazards.push({ id: `spike-floor-${i}`, x: x + 152, bottom: 0, width: 32, height: 16 });
      }
    }
    hazards = hazards.filter(hazard => !real.some(bar => overlaps(hazard.x, hazard.width, bar) && hazard.bottom < top(bar) + RUNNER.height + 8 && hazard.bottom + hazard.height > top(bar) - 2));
  }
  function reset() {
    lava.reset();
    visited = new Set(); collected = new Set(); direction = 0; jumpBuffer = 0; coyote = .1; dropTime = 0; chunk = null;
    checkpoint = { x: RUNNER.startX, y: 0, platform: null, label: 'Start' };
    state = { status: 'ready', x: RUNNER.startX, y: 0, vx: 0, vy: 0, grounded: true, support: null, duck: false, facing: 1, phase: 'experience', hit: null, landings: 0 };
    buildWorld();
  }
  function snapshot() {
    const realVisited = real.filter(bar => visited.has(bar.id)).length;
    return { ...state, score: realVisited * 100 + (visited.size - realVisited) * 10 + collected.size * 25,
      realVisited, totalRoles: real.length, gems: collected.size, bonusStart, checkpoint: { ...checkpoint }, lava: lava.snapshot(),
      platforms: platforms.map(bar => ({ ...bar, visited: visited.has(bar.id) })),
      hazards: hazards.map(hazard => ({ ...hazard })), coins: coins.filter(coin => !collected.has(coin.id)).map(coin => ({ ...coin })) };
  }
  function land(platform) {
    state.y = platform ? top(platform) : 0; state.vy = 0; state.grounded = true; state.support = platform?.id ?? null;
    if (platform && !visited.has(platform.id)) {
      visited.add(platform.id); state.landings++;
    }
    if (platform?.real) checkpoint = { x: platform.x + Math.max(0, (platform.width - RUNNER.width) / 2), y: top(platform), platform: platform.id, label: platform.label };
  }
  function step(seconds) {
    if (state.status !== 'running' || !Number.isFinite(seconds) || seconds <= 0) return snapshot();
    let remaining = Math.min(seconds, .05);
    while (remaining > 0 && state.status === 'running') {
      const dt = Math.min(remaining, 1 / 120); remaining -= dt;
      jumpBuffer = Math.max(0, jumpBuffer - dt); dropTime = Math.max(0, dropTime - dt);
      if (state.grounded) coyote = .1; else coyote = Math.max(0, coyote - dt);
      if (jumpBuffer > 0 && coyote > 0) {
        if (state.duck && state.support) { dropTime = .23; state.y -= 2; state.vy = -65; }
        else { state.vy = RUNNER.jump; state.duck = false; }
        state.grounded = false; state.support = null; coyote = 0; jumpBuffer = 0;
      }
      const target = direction * (state.duck && state.grounded ? 95 : RUNNER.speed);
      const acceleration = state.grounded ? 2200 : 1500;
      state.vx += Math.max(-acceleration * dt, Math.min(acceleration * dt, target - state.vx));
      state.x = Math.max(0, state.x + state.vx * dt);
      if (direction) state.facing = direction;
      buildWorld();
      if (state.grounded && state.support) {
        const support = platforms.find(bar => bar.id === state.support);
        if (!support || !overlaps(state.x, RUNNER.width, support)) { state.grounded = false; state.support = null; }
      }
      if (!state.grounded) {
        const previousY = state.y;
        state.vy -= RUNNER.gravity * dt; state.y += state.vy * dt;
        if (state.vy <= 0) {
          let landing = null;
          if (dropTime === 0) for (const bar of platforms) {
            if (previousY >= top(bar) - .01 && state.y <= top(bar) && overlaps(state.x, RUNNER.width, bar) && (!landing || top(bar) > top(landing))) landing = bar;
          }
          if (landing) land(landing);
          else if (state.y <= 0) land(null);
        }
      }
      const height = state.duck && state.grounded ? RUNNER.duckHeight : RUNNER.height;
      for (const hazard of hazards) {
        // A forgiving inset follows the narrow triangular tips, not their full box.
        if (state.x + RUNNER.width - 3 > hazard.x + 4 && state.x + 3 < hazard.x + hazard.width - 4 && state.y + 3 < hazard.bottom + hazard.height - 3 && state.y + height > hazard.bottom + 3) {
          state.status = 'over'; state.hit = { ...hazard }; direction = 0; state.vx = 0; break;
        }
      }
      lava.step(dt);
      const flow = lava.snapshot();
      if (state.status === 'running' && flow.phase === 'flowing' && state.y + 3 < lavaSurface(flow, state.x + 3)) {
        state.status = 'over'; state.hit = { id: 'lava', type: 'lava' }; direction = 0; state.vx = 0;
      }
      for (const coin of coins) if (Math.abs(state.x + RUNNER.width / 2 - coin.x) < 20 && coin.y > state.y - 6 && coin.y < state.y + height + 8) collected.add(coin.id);
      state.phase = state.x + RUNNER.width > bonusStart ? 'bonus' : 'experience';
    }
    return snapshot();
  }
  reset();
  return {
    snapshot, step,
    start() { reset(); state.status = 'running'; return snapshot(); },
    move(value) { if (state.status === 'running') direction = Math.sign(value) || 0; },
    jump() { if (state.status === 'running') jumpBuffer = .12; },
    crouch(value) { if (state.status === 'running') state.duck = Boolean(value); },
    pause() { if (state.status === 'running') { state.status = 'paused'; direction = 0; state.vx = 0; state.duck = false; jumpBuffer = 0; } },
    resume() { if (state.status === 'paused') state.status = 'running'; },
    respawn() {
      if (state.status !== 'over') return snapshot();
      Object.assign(state, { status: 'running', x: checkpoint.x, y: checkpoint.y, vx: 0, vy: 0, grounded: true, support: checkpoint.platform, duck: false, hit: null });
      lava.reset(checkpoint.x - LAVA.retryGap);
      direction = 0; jumpBuffer = 0; dropTime = 0; coyote = .1; chunk = null; buildWorld(); return snapshot();
    },
  };
}
