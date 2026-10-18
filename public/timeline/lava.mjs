export const LAVA = Object.freeze({ grace: 6, initialFront: 8, initialHeight: 12, growth: 1.8, maxHeight: 240, initialSpeed: 26, acceleration: .6, maxSpeed: 96, edge: 48, retryGap: 144 });

// A shallow flow advances in world coordinates from the left. Only game time
// grows it, so pausing or switching tabs cannot let it catch up off-screen.
export function createLava() {
  let elapsed = 0, origin = LAVA.initialFront;
  function snapshot() {
    const age = Math.max(0, elapsed - LAVA.grace);
    const accelerating = Math.min(age, (LAVA.maxSpeed - LAVA.initialSpeed) / LAVA.acceleration);
    const distance = LAVA.initialSpeed * accelerating + .5 * LAVA.acceleration * accelerating ** 2 + LAVA.maxSpeed * (age - accelerating);
    return { elapsed, front: origin + distance, height: Math.min(LAVA.maxHeight, LAVA.initialHeight + age * LAVA.growth),
      speed: Math.min(LAVA.maxSpeed, LAVA.initialSpeed + age * LAVA.acceleration), remaining: Math.max(0, LAVA.grace - elapsed),
      phase: elapsed < LAVA.grace - 3 ? 'ready' : elapsed < LAVA.grace ? 'warning' : 'flowing' };
  }
  return {
    snapshot,
    reset(front = LAVA.initialFront) { elapsed = 0; origin = front; },
    step(seconds) { if (Number.isFinite(seconds) && seconds > 0) elapsed += Math.min(seconds, .05); },
  };
}

// The leading 48 pixels taper down to ground level. Rendering and collision use
// this same slope, so jumping over the thin tip is a real escape route.
export function lavaSurface(lava, x) {
  return lava.height * Math.max(0, Math.min(1, (lava.front - x) / LAVA.edge));
}
