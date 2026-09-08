// ----------------------------------------------------------------------------
// Hero line art: a Möbius strip as thin strokes, drawn on at load.
//
// Computed here at render time (it's just geometry) and emitted as SVG paths
// with pathLength="1", so the draw-on is a CSS stroke-dashoffset animation —
// no client script, no length measuring.
// ----------------------------------------------------------------------------

type Pt = [number, number];

const R = 56; // ring radius in a 200×200 box
const CX = 100;
const CY = 102;
const TILT = 0.95; // rotation about x, radians
const YAW = 0.9; // rotation about z, radians
const HALF_W = 0.62; // ribbon half-width relative to R
const STEPS = 160;
const RUNGS = 28;

function point(u: number, v: number): Pt {
  const w = v * HALF_W;
  const x = (1 + w * Math.cos(u / 2)) * Math.cos(u);
  const y = (1 + w * Math.cos(u / 2)) * Math.sin(u);
  const z = w * Math.sin(u / 2);
  const x1 = x * Math.cos(YAW) - y * Math.sin(YAW);
  const y1 = x * Math.sin(YAW) + y * Math.cos(YAW);
  const y2 = y1 * Math.cos(TILT) - z * Math.sin(TILT);
  return [CX + x1 * R, CY - y2 * R];
}

const f = (n: number) => n.toFixed(1);
const poly = (pts: Pt[]) => "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L");

/** One full turn along the strip at offset v. */
function turn(v: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= STEPS; i++) pts.push(point((2 * Math.PI * i) / STEPS, v));
  return pts;
}

export function mobiusArt(): string {
  // On a Möbius strip the line at +v continues as the line at −v after one
  // turn, so the two together close into a single loop.
  const loops: { d: string; width: number; delay: number }[] = [
    { d: poly([...turn(1), ...turn(-1)]) + "Z", width: 1.35, delay: 0.15 },
    { d: poly([...turn(0.5), ...turn(-0.5)]) + "Z", width: 1.1, delay: 0.3 },
    { d: poly(turn(0)) + "Z", width: 0.9, delay: 0.45 },
  ];

  const rungs: string[] = [];
  for (let k = 0; k < RUNGS; k++) {
    const u = (2 * Math.PI * k) / RUNGS;
    const [x1, y1] = point(u, -1);
    const [x2, y2] = point(u, 1);
    rungs.push(
      `<line class="fade" style="--k:${k}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`
    );
  }

  return `<svg id="mobius" class="art-svg" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g stroke-width=".7" opacity=".65">${rungs.join("")}</g>
    ${loops
      .map(
        (l) =>
          `<path class="draw" pathLength="1" style="--d:${l.delay}s" stroke-width="${l.width}" d="${l.d}"/>`
      )
      .join("\n    ")}
  </svg>`;
}

// ----------------------------------------------------------------------------
// Client side: the same strip, turning. The server-rendered frame above is
// what you see first (and all you see with JS off or reduced motion); this
// script then re-projects the same points every frame with a slowly
// advancing yaw and a gentle tilt wobble. Same constants, same maths as
// point() — keep the two in step. Paused while the card is off screen.
// ----------------------------------------------------------------------------

export const MOBIUS_SCRIPT = `<script>
(function () {
  var svg = document.getElementById('mobius');
  if (!svg) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var R = ${R}, CX = ${CX}, CY = ${CY}, TILT = ${TILT}, YAW = ${YAW}, HALF = ${HALF_W}, STEPS = ${STEPS}, RUNGS = ${RUNGS};
  var SPIN = 0.00032, WOBBLE = 0.14, WOBBLE_RATE = 0.00045;
  var loops = svg.querySelectorAll('path'), rungs = svg.querySelectorAll('line');
  var VS = [1, 0.5, 0];
  if (loops.length !== VS.length || rungs.length !== RUNGS) return;

  function pt(u, v, yaw, tilt) {
    var w = v * HALF;
    var x = (1 + w * Math.cos(u / 2)) * Math.cos(u);
    var y = (1 + w * Math.cos(u / 2)) * Math.sin(u);
    var z = w * Math.sin(u / 2);
    var x1 = x * Math.cos(yaw) - y * Math.sin(yaw);
    var y1 = x * Math.sin(yaw) + y * Math.cos(yaw);
    var y2 = y1 * Math.cos(tilt) - z * Math.sin(tilt);
    return (CX + x1 * R).toFixed(1) + ' ' + (CY - y2 * R).toFixed(1);
  }
  function turn(v, yaw, tilt, out) {
    for (var i = 0; i <= STEPS; i++) out.push(pt(2 * Math.PI * i / STEPS, v, yaw, tilt));
  }

  var raf = null, visible = true;
  function frame(t) {
    var yaw = YAW + t * SPIN;
    var tilt = TILT + WOBBLE * Math.sin(t * WOBBLE_RATE);
    for (var k = 0; k < VS.length; k++) {
      var pts = [];
      turn(VS[k], yaw, tilt, pts);
      if (VS[k]) turn(-VS[k], yaw, tilt, pts);
      loops[k].setAttribute('d', 'M' + pts.join('L') + 'Z');
    }
    for (var r = 0; r < RUNGS; r++) {
      var u = 2 * Math.PI * r / RUNGS;
      var a = pt(u, -1, yaw, tilt).split(' '), b = pt(u, 1, yaw, tilt).split(' ');
      rungs[r].setAttribute('x1', a[0]); rungs[r].setAttribute('y1', a[1]);
      rungs[r].setAttribute('x2', b[0]); rungs[r].setAttribute('y2', b[1]);
    }
    raf = visible ? requestAnimationFrame(frame) : null;
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && raf === null) raf = requestAnimationFrame(frame);
    }).observe(svg);
  }
  raf = requestAnimationFrame(frame);
})();
</script>`;
