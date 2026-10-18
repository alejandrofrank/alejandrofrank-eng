export const FLOOD = Object.freeze({ grace: 8, snooze: 5, recharge: 24, floor: -12, maxHeight: 164 });

// Game time only: pausing the platformer also pauses warnings, waves and cooldowns.
export function createNotificationFlood() {
  let time, elapsed, height, muted, cooldown;
  function reset() { time = 0; elapsed = 0; height = FLOOD.floor; muted = 0; cooldown = 0; }
  function tide() {
    if (time < FLOOD.grace) return { phase: time < FLOOD.grace - 3 ? 'quiet' : 'warning', remaining: FLOOD.grace - time, wave: 1, target: FLOOD.floor };
    const cycle = Math.floor((time - FLOOD.grace) / 19), position = (time - FLOOD.grace) % 19;
    const peak = Math.min(FLOOD.maxHeight, 60 + cycle * 36);
    const common = { wave: cycle + 1 };
    if (position < 5) return { ...common, phase: 'rising', remaining: 5 - position, target: FLOOD.floor + (peak - FLOOD.floor) * position / 5 };
    if (position < 9) return { ...common, phase: 'high', remaining: 9 - position, target: peak };
    if (position < 13) return { ...common, phase: 'falling', remaining: 13 - position, target: peak + (FLOOD.floor - peak) * (position - 9) / 4 };
    return { ...common, phase: position < 16 ? 'quiet' : 'warning', remaining: 19 - position, target: FLOOD.floor };
  }
  function snapshot() {
    const { phase, remaining, wave } = tide();
    return { phase: muted > 0 ? 'muted' : phase, remaining: muted > 0 ? muted : remaining, wave, height, elapsed,
      cooldown, unread: Math.floor(Math.max(0, time - FLOOD.grace) * 6) };
  }
  reset();
  return {
    reset, snapshot,
    step(seconds) {
      if (!Number.isFinite(seconds) || seconds <= 0) return;
      const dt = Math.min(seconds, .05), wasMuted = muted > 0;
      elapsed += dt; cooldown = Math.max(0, cooldown - dt); muted = Math.max(0, muted - dt);
      if (!wasMuted) time += dt;
      const target = wasMuted ? FLOOD.floor : tide().target;
      // Drain quickly when snoozed; resume gently, even if a crest was paused.
      height += Math.max(-180 * dt, Math.min(32 * dt, target - height));
    },
    snooze() {
      if (cooldown > 0) return false;
      muted = FLOOD.snooze; cooldown = FLOOD.recharge; return true;
    },
  };
}
